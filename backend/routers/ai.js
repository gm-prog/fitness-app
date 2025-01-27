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
  // Enhanced logging and error handling
  console.log(`Generating content for section: ${title}`);
  
  // Specific, detailed prompts for each section
  const sectionPrompts = {
    "Introduction": `Provide a comprehensive overview and context for the health plan based on the user's profile: ${userInput}`,
    "Dietary Plan": `Create a detailed, personalized dietary recommendation based on the user's nutritional needs and preferences: ${userInput}`,
    "Exercise Plan": `Develop a tailored exercise program considering the user's fitness goals, current fitness level, and any health constraints: ${userInput}`,
    "Sleep and Recovery": `Design a comprehensive sleep and recovery strategy that addresses the user's current sleep patterns, lifestyle, and health goals: ${userInput}`,
    "Monitoring and Follow-Up": `Create a systematic approach for tracking progress, making adjustments, and ensuring long-term success of the health plan: ${userInput}`
  }

  const prompt = sectionPrompts[title] || `Generate a detailed health plan section for "${title}" based on the following user input: ${userInput}`

  try {
    // Increased timeout and safety settings
    const generationConfig = {
      maxOutputTokens: 2000,
      temperature: 0.7,
      topP: 0.9,
      topK: 40,
    }

    const safetySettings = [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE'
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE'
      }
    ]

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings
    })

    // Detailed logging and validation
    const responseText = result.response?.text() || ''
    console.log(`Generated content for ${title}:`, responseText.slice(0, 200) + '...') // Log first 200 chars

    if (!responseText) {
      throw new Error(`No response generated for "${title}"`)
    }

    return `**${title}**\n\n${responseText}`
  } catch (error) {
    // Enhanced error logging
    console.error(`Detailed error generating content for "${title}":`, {
      message: error.message,
      stack: error.stack,
      title: title,
      userInput: userInput
    })

    // Provide a meaningful fallback
    return `**${title}**\n\nUnable to generate content for this section. Possible reasons:\n- Network issues\n- API limitations\n- Temporary service unavailability\n\nPlease try again later or contact support.`
  }
}

router.post("/generate", async (req, res) => {
  const { prompt } = req.body
  console.log("Full request received:", JSON.stringify(prompt).slice(0, 500)) // Log first 500 chars of prompt

  if (!prompt) {
    return res.status(400).json({ error: "Comprehensive user profile prompt is required" })
  }

  try {
    // Sequential processing with timeout to handle potential API constraints
    const sectionResults = []
    for (const title of sectionTitles) {
      try {
        const sectionContent = await generateSectionContent(title, prompt)
        sectionResults.push(sectionContent)
      } catch (sectionError) {
        console.error(`Error processing section "${title}":`, sectionError)
        sectionResults.push(`**${title}**\n\nSection generation failed. Please retry.`)
      }
    }

    // Validate response before sending
    const fullResponse = sectionResults.join("\n\n")
    console.log("Final response sections count:", sectionResults.length)

    if (sectionResults.length !== sectionTitles.length) {
      console.warn("Not all sections were generated successfully")
    }

    res.json({ 
      content: fullResponse,
      sections: sectionTitles.length,
      generatedSections: sectionResults.length
    })
  } catch (error) {
    console.error("Comprehensive error in generate endpoint:", {
      message: error.message,
      stack: error.stack
    })
    res.status(500).json({ 
      error: "Comprehensive content generation failed", 
      details: error.message 
    })
  }
})

module.exports = router