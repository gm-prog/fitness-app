require("dotenv").config();
const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
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
    const trimmed = input.trim();
    return trimmed;
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

    return `**${title}**\n\n${responseText}`;
  } catch (error) {
    console.error(`Detailed error generating content for "${title}":`, {
      message: error.message,
      stack: error.stack,
      title,
      userInput,
    });

    return `**${title}**\n\nUnable to generate content for this section. Possible reasons:\n- Network issues\n- API limitations\n- Temporary service unavailability\n\nPlease try again later.`;
  }
}

router.post("/generate", async (req, res) => {
  const rawPrompt = req.body?.prompt;
  const prompt = normalizePrompt(rawPrompt);

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
    const sectionResults = [];

    for (const title of sectionTitles) {
      try {
        const sectionContent = await generateSectionContent(title, prompt);
        sectionResults.push(sectionContent);
      } catch (sectionError) {
        console.error(`Error processing section "${title}":`, sectionError);
        sectionResults.push(`**${title}**\n\nSection generation failed. Please retry.`);
      }
    }

    const fullResponse = sectionResults.join("\n\n");

    return res.status(200).json({
      content: fullResponse,
      sections: sectionTitles.length,
      generatedSections: sectionResults.length,
    });
  } catch (error) {
    console.error("Comprehensive error in generate endpoint:", {
      message: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      error: "Comprehensive content generation failed.",
      details: error.message,
    });
  }
});

module.exports = router;
