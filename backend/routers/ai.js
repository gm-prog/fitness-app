require("dotenv").config()
const express = require("express")
const { GoogleGenerativeAI } = require("@google/generative-ai")

const router = express.Router()

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY)
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

const sectionTitles = [
  "Introduction",
  "Dietary Plan",
  "Exercise Plan",
  "Sleep and Recovery",
  "Monitoring and Follow-Up",
]

async function generateSectionContent(title, userInput) {
  const prompt = `Generate a detailed health plan section for "${title}" based on the following user input: ${userInput}. The response should be comprehensive and tailored to the user's needs.`

  try {
    const result = await model.generateContent(prompt)
    return `**${title}**\n\n${result.response.text()}`
  } catch (error) {
    console.error(`Error generating content for ${title}:`, error)
    return `**${title}**\n\nUnable to generate content for this section. Please try again later.`
  }
}

router.post("/generate", async (req, res) => {
  const { prompt } = req.body
  console.log("Request received", prompt)

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" })
  }

  try {
    const sectionPromises = sectionTitles.map((title) => generateSectionContent(title, prompt))
    const sectionResults = await Promise.all(sectionPromises)

    const fullResponse = sectionResults.join("\n\n")

    res.json({ content: fullResponse })
  } catch (error) {
    console.error("Error generating content:", error)
    res.status(500).json({ error: "Failed to generate content" })
  }
})

module.exports = router

