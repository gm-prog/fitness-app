// backend/routers/ai.js
//
// AI generation router — Hugging Face Inference Providers
// (@huggingface/inference, InferenceClient) using HUGGINGFACE_API_KEY.
//
// Architecture preserved from feature/auth-and-persistence:
//   authMiddleware + HealthPlan persistence + POST /ai/generate,
//   GET /ai/plans, GET /ai/plans/:id, DELETE /ai/plans/:id

// Load .env from an explicit absolute path (the backend directory) so the
// configuration is found regardless of the working directory the process was
// started from.
require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const express = require("express");
const { InferenceClient } = require("@huggingface/inference");
const HealthPlan = require("../models/HealthPlan");
const { authMiddleware } = require("../middleware/auth");
const logger = require("../utils/logger");

const router = express.Router();

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Model is configurable so you can switch to any model your token can access
// and that the selected provider supports. Non-gated, broadly supported
// alternatives: Qwen/Qwen2.5-72B-Instruct, Qwen/Qwen2.5-7B-Instruct,
// mistralai/Mistral-7B-Instruct-v0.3, HuggingFaceH4/zephyr-7b-beta
const HF_MODEL = (process.env.HF_MODEL || "mistralai/Mistral-7B-Instruct-v0.3").trim();

// "auto" lets Hugging Face pick the best available provider for the model.
// You can pin one instead, e.g. together, fal-ai, nebius, groq, hf-inference.
const HF_PROVIDER = (process.env.HF_PROVIDER || "auto").trim();

const HF_MAX_TOKENS = Number.parseInt(process.env.HF_MAX_TOKENS || "2000", 10);
const HF_TEMPERATURE = Number.parseFloat(process.env.HF_TEMPERATURE || "0.7");

const MAX_PROMPT_LENGTH = 20000;

// Never log or return the key itself.
if (!HF_API_KEY) {
  throw new Error(
    "HUGGINGFACE_API_KEY is required. Add it to backend/.env (e.g. HUGGINGFACE_API_KEY=hf_your_token) and restart the server."
  );
}

const client = new InferenceClient(HF_API_KEY);

logger.info("Hugging Face inference configured", {
  model: HF_MODEL,
  provider: HF_PROVIDER,
  maxTokens: HF_MAX_TOKENS,
});

const sectionTitles = [
  "Introduction",
  "Dietary Plan",
  "Exercise Plan",
  "Sleep Cycle",
  "Monitoring",
];

const SECTION_KEYS = {
  Introduction: "introduction",
  "Dietary Plan": "dietaryPlan",
  "Exercise Plan": "exercisePlan",
  "Sleep Cycle": "sleepCycle",
  Monitoring: "monitoring",
};

const sectionPrompts = {
  Introduction: (userInput) =>
    `Provide a comprehensive overview and context for the health plan based on the user's profile: ${userInput}`,
  "Dietary Plan": (userInput) =>
    `Create a detailed, personalized dietary recommendation based on the user's nutritional needs and preferences: ${userInput}`,
  "Exercise Plan": (userInput) =>
    `Develop a tailored exercise program considering the user's fitness goals, current fitness level, and any health constraints: ${userInput}`,
  "Sleep Cycle": (userInput) =>
    `Design a comprehensive sleep and recovery strategy that addresses the user's current sleep patterns, lifestyle, and health goals: ${userInput}`,
  Monitoring: (userInput) =>
    `Create a systematic approach for tracking progress, making adjustments, and ensuring long-term success of the health plan: ${userInput}`,
};

const normalizePrompt = (input) => {
  if (typeof input === "string") {
    return input.trim();
  }

  if (input && typeof input === "object") {
    return JSON.stringify(input);
  }

  return "";
};

// Pull the assistant text out of a chat-completion response without assuming
// any single provider's response shape.
function extractContent(chatCompletion) {
  const content = chatCompletion?.choices?.[0]?.message?.content;

  if (typeof content !== "string") {
    return "";
  }

  return content.trim();
}

// Throws on failure — never returns placeholder text that could later be
// mistaken for a successfully generated section.
async function generateSectionContent(title, userInput) {
  logger.info(`Generating health plan section`, { section: title, model: HF_MODEL });

  const buildPrompt = sectionPrompts[title];
  const prompt = buildPrompt
    ? buildPrompt(userInput)
    : `Generate a detailed health plan section for "${title}" based on the following user input: ${userInput}`;

  try {
    const chatCompletion = await client.chatCompletion({
      model: HF_MODEL,
      provider: HF_PROVIDER,
      messages: [
        {
          role: "system",
          content:
            "You are a certified fitness and nutrition planner. Write clear, actionable, well-structured markdown. Always recommend consulting a qualified medical professional before starting a new program.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: HF_MAX_TOKENS,
      temperature: HF_TEMPERATURE,
      top_p: 0.9,
    });

    const content = extractContent(chatCompletion);

    if (!content) {
      throw new Error("Inference returned an empty response");
    }

    return content;
  } catch (error) {
    // Logs the section, model and reason only. Never the API key and never the
    // personal-profile payload that was sent as the prompt.
    logger.error("Hugging Face inference failed for section", {
      section: title,
      model: HF_MODEL,
      provider: HF_PROVIDER,
      reason: error.message,
    });
    throw error;
  }
}

// POST /ai/generate — generate a health plan and persist it for the user.
router.post("/generate", authMiddleware, async (req, res) => {
  const prompt = normalizePrompt(req.body?.prompt);
  const profileId = req.body?.profileId || null;

  if (!prompt) {
    return res.status(400).json({ error: "A user profile prompt is required." });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(413).json({
      error: "Prompt is too large. Please reduce the length of the profile data.",
    });
  }

  const sectionContents = {};
  const sectionResults = [];
  const failures = [];

  for (const title of sectionTitles) {
    try {
      const content = await generateSectionContent(title, prompt);
      sectionContents[SECTION_KEYS[title]] = content;
      sectionResults.push(`**${title}**\n\n${content}`);
    } catch (error) {
      failures.push({ section: title, reason: error.message });
    }
  }

  // A partial or failed generation must never be reported as a successful
  // plan, and must never be persisted.
  if (failures.length > 0) {
    logger.error("Health plan generation failed", {
      requested: sectionTitles.length,
      generated: sectionResults.length,
      failedSections: failures.map((failure) => failure.section),
    });

    return res.status(502).json({
      error: "AI generation failed. No health plan was saved. Please try again.",
      sectionsRequested: sectionTitles.length,
      sectionsGenerated: sectionResults.length,
      failedSections: failures.map((failure) => failure.section),
      details: failures[0].reason,
    });
  }

  const fullResponse = sectionResults.join("\n\n");

  try {
    const healthPlan = new HealthPlan({
      userId: req.userId,
      profileId,
      content: fullResponse,
      sections: {
        introduction: sectionContents.introduction,
        dietaryPlan: sectionContents.dietaryPlan,
        exercisePlan: sectionContents.exercisePlan,
        sleepCycle: sectionContents.sleepCycle,
        monitoring: sectionContents.monitoring,
      },
    });

    await healthPlan.save();

    // Response contract expected by src/components/InfoPage.jsx:
    // response.plan.content and response.plan.id
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
    logger.error("Failed to save health plan", {
      message: error.message,
      userId: req.userId,
    });

    return res.status(500).json({
      error: "The plan was generated but could not be saved. Please try again.",
      details: error.message,
    });
  }
});

// GET /ai/plans — list the authenticated user's active plans.
router.get("/plans", authMiddleware, async (req, res) => {
  try {
    const plans = await HealthPlan.find({ userId: req.userId, isActive: true })
      .sort({ generatedAt: -1 })
      .limit(50);

    return res.status(200).json({ plans, total: plans.length });
  } catch (error) {
    logger.error("Failed to fetch health plans", { message: error.message });
    return res
      .status(500)
      .json({ error: "Failed to fetch health plans", details: error.message });
  }
});

// GET /ai/plans/:id — fetch one plan owned by the authenticated user.
router.get("/plans/:id", authMiddleware, async (req, res) => {
  try {
    const plan = await HealthPlan.findOne({ _id: req.params.id, userId: req.userId });

    if (!plan) {
      return res.status(404).json({ error: "Health plan not found" });
    }

    return res.status(200).json({ plan });
  } catch (error) {
    logger.error("Failed to fetch health plan", { message: error.message });
    return res
      .status(500)
      .json({ error: "Failed to fetch health plan", details: error.message });
  }
});

// DELETE /ai/plans/:id — soft delete (deactivate) a plan.
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
    logger.error("Failed to delete health plan", { message: error.message });
    return res
      .status(500)
      .json({ error: "Failed to delete health plan", details: error.message });
  }
});

module.exports = router;
