const express = require('express');
const { GoogleGenAI } = require('@google/genai');

module.exports = () => {
  const router = express.Router();

  // Initialize Gemini API
  // We don't initialize it globally to allow users to add their key later without restarting
  const getGeminiClient = () => {
    if (!process.env.GEMINI_API_KEY) {
       throw new Error("GEMINI_API_KEY is missing in backend/.env!");
    }
    return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  };

  // POST /api/ai/syllabus
  // Body: { teachingSkill: "Python", learningSkill: "Spanish" }
  router.post('/syllabus', async (req, res) => {
    try {
      const { teachingSkill, learningSkill } = req.body;

      if (!teachingSkill || !learningSkill) {
         return res.status(400).json({ error: "Missing teachingSkill or learningSkill" });
      }

      const ai = getGeminiClient();

      const prompt = `
You are an expert peer-to-peer learning coordinator.
Two users have just matched on a skill-swapping platform.
User A is going to teach User B: ${teachingSkill}
User B is going to teach User A: ${learningSkill}

Create a structured 4-week learning roadmap (syllabus) for them to follow together.
Return ONLY a valid JSON object strictly matching this exact schema:
{
  "title": "A catchy title for their skill swap",
  "introduction": "A short engaging welcome message giving them advice on how to start",
  "weeks": [
    {
      "week": 1,
      "theme": "Theme for the week",
      "userA_teaching": "What User A teaches User B (about ${teachingSkill})",
      "userB_teaching": "What User B teaches User A (about ${learningSkill})",
      "homework": "A joint assignment or homework for both"
    }
  ]
}
Make sure the "weeks" array contains exactly 4 week objects.
No markdown formatting, no \`\`\`json wrappers. Just the JSON object text exactly so it can be parsed.
`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      let responseText = response.text;
      
      // Attempt to clean off hidden markdown backticks if the model ignores the instruction
      if (responseText.startsWith('\`\`\`')) {
         responseText = responseText.replace(/^\`\`\`(json)?/gi, '').replace(/\`\`\`$/g, '').trim();
      }

      const syllabusObj = JSON.parse(responseText);

      res.status(200).json(syllabusObj);
    } catch (error) {
       console.error("[v0] AI Generation Error:", error.message);
       if (error.message.includes('GEMINI_API_KEY')) {
          return res.status(500).json({ error: "API Key Missing", details: "Please add GEMINI_API_KEY to your backend .env file" });
       }
       res.status(500).json({ error: "Failed to generate syllabus", details: error.message });
    }
  });

  return router;
};
