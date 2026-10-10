require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const HealthPlan = require("../models/HealthPlan");
const { authMiddleware } = require("../middleware/auth");
const router = express.Router();

const googleApiKey = process.env.GOOGLE_API_KEY;

if (!googleApiKey) {
  throw new Error("GOOGLE_API_KEY is required. Add it to your backend .env file.");
}

const genAI = new GoogleGenerativeAI(googleApiKey);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const sectionTitles = [
  "Introduction",
  "Dietary Plan",
  "Exercise Plan",
  "Sleep Cycle",
  "Monitoring",
];

const MAX_PROMPT_LENGTH = 20000;

const normalizePrompt = (input) => {
  if (typeof input === "string") {
    return input.trim();
  }

  if (input && typeof input === "object") {
    return JSON.stringify(input);
  }

  return "";
};

async function generateSectionContent(title, userInput) {
  console.log(`Generating content for section: ${title}`);

  const sectionPrompts = {
    Introduction: `Provide a comprehensive overview and context for the health plan based on the user's profile: ${userInput}`,
    "Dietary Plan": `Create a detailed, personalized dietary recommendation based on the user's nutritional needs and preferences: ${userInput}`,
    "Exercise Plan": `Develop a tailored exercise program considering the user's fitness goals, current fitness level, and any health constraints: ${userInput}`,
    "Sleep Cycle": `Design a comprehensive sleep and recovery strategy that addresses the user's current sleep patterns, lifestyle, and health goals: ${userInput}`,
    Monitoring: `Create a systematic approach for tracking progress, making adjustments, and ensuring long-term success of the health plan: ${userInput}`,
  };

  const prompt = sectionPrompts[title] || `Generate a detailed health plan section for "${title}" based on the following user input: ${userInput}`;

  try {
    const generationConfig = {
      maxOutputTokens: 2000,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    };

    const safetySettings = [
      { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
      { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" },
    ];

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const responseText = result.response?.text?.() || "";

    if (!responseText) {
      throw new Error(`No response generated for "${title}"`);
    }

    return responseText;
  } catch (error) {
    console.error(`Error generating content for "${title}":`, {
      message: error.message,
      title,
    });
    throw error;
  }
}

router.post("/generate", authMiddleware, async (req, res) => {
  const rawPrompt = req.body?.prompt;
  const prompt = normalizePrompt(rawPrompt);
  const profileId = req.body?.profileId || null;

  if (!prompt) {
    return res.status(400).json({
      error: "A user profile prompt is required.",
    });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(413).json({
      error: "Prompt is too large. Please reduce the length of the profile data.",
    });
  }

  try {
    const sectionContents = {};
    const sectionResults = [];

    for (const title of sectionTitles) {
      try {
        const sectionContent = await generateSectionContent(title, prompt);
        const normalizedTitle = title.toLowerCase().replace(/\s+/g, "");
        sectionContents[normalizedTitle] = sectionContent;
        sectionResults.push(`**${title}**\n\n${sectionContent}`);
      } catch (sectionError) {
        console.error(`Error processing section "${title}":`, sectionError);
        sectionResults.push(`**${title}**\n\nSection generation failed. Please retry.`);
      }
    }

    const fullResponse = sectionResults.join("\n\n");

    const healthPlan = new HealthPlan({
      userId: req.userId,
      profileId,
      content: fullResponse,
      sections: {
        introduction: sectionContents.introduction || null,
        dietaryPlan: sectionContents.dietaryplan || null,
        exercisePlan: sectionContents.exerciseplan || null,
        sleepCycle: sectionContents.sleepcycle || null,
        monitoring: sectionContents.monitoring || null,
      },
    });

    await healthPlan.save();

    return res.status(200).json({
      message: "Health plan generated and saved successfully",
      plan: {
        id: healthPlan._id,
        content: fullResponse,
        sections: sectionTitles.length,
        generatedSections: sectionResults.length,
        generatedAt: healthPlan.generatedAt,
      },
    });
  } catch (error) {
    console.error("Error in generate endpoint:", error);
    return res.status(500).json({
      error: "Content generation failed.",
      details: error.message,
    });
  }
});

router.get("/plans", authMiddleware, async (req, res) => {
  try {
    const plans = await HealthPlan.find({ userId: req.userId, isActive: true })
      .sort({ generatedAt: -1 })
      .limit(50);

    return res.status(200).json({
      plans,
      total: plans.length,
    });
  } catch (error) {
    console.error("Get plans error:", error);
    return res.status(500).json({
      error: "Failed to fetch health plans",
      details: error.message,
    });
  }
});

router.get("/plans/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await HealthPlan.findOne({ _id: req.params.id, userId: req.userId });

    if (!plan) {
      return res.status(404).json({ error: "Health plan not found" });
    }

    return res.status(200).json({ plan });
  } catch (error) {
    console.error("Get plan error:", error);
    return res.status(500).json({
      error: "Failed to fetch health plan",
      details: error.message,
    });
  }
});

router.delete("/plans/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await HealthPlan.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isActive: false },
      { new: true }
    );

    if (!plan) {
      return res.status(404).json({ error: "Health plan not found" });
    }

    return res.status(200).json({ message: "Health plan deleted successfully" });
  } catch (error) {
    console.error("Delete plan error:", error);
    return res.status(500).json({
      error: "Failed to delete health plan",
      details: error.message,
    });
  }
});

module.exports = router;
