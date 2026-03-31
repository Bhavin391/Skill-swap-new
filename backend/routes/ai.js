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

  // POST /api/ai/quiz
  // Body: { skill: "Python" }
  router.post('/quiz', async (req, res) => {
    try {
      const { skill } = req.body;
      if (!skill) return res.status(400).json({ error: "Missing skill" });

      const ai = getGeminiClient();
      const prompt = `
You are an expert examiner. Generate a 3-question multiple choice quiz to verify an applicant's expertise in "${skill}". 
The questions should be challenging enough to prove they know the topic well, but not overly obscure.
Return ONLY a valid JSON object strictly matching this exact schema:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0
    }
  ]
}
Make sure the "questions" array contains exactly 3 question objects.
No markdown formatting, no \`\`\`json wrappers. Just the JSON object text exactly so it can be parsed.
`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      let responseText = response.text;
      if (responseText.startsWith('\`\`\`')) {
         responseText = responseText.replace(/^\`\`\`(json)?/gi, '').replace(/\`\`\`$/g, '').trim();
      }

      const quizObj = JSON.parse(responseText);
      res.status(200).json(quizObj);
    } catch (error) {
       console.error("[v0] AI Quiz Generation Error:", error.message);
       if (error.message.includes('GEMINI_API_KEY')) {
          return res.status(500).json({ error: "API Key Missing", details: "Please add GEMINI_API_KEY to your backend .env file" });
       }
       res.status(500).json({ error: "Failed to generate quiz", details: error.message });
    }
  });

  // POST /api/ai/synergy
  router.post('/synergy', async (req, res) => {
    try {
      const { myOffering, myLearning, matchName, matchOffering, matchLearning } = req.body;
      const ai = getGeminiClient();
      const prompt = `
I am looking for a peer learning partner. Here are my skills:
My Offering: ${(myOffering || []).join(', ')}
My Learning Goals: ${(myLearning || []).join(', ')}

I just matched with ${matchName}, whose skills are:
Their Offering: ${(matchOffering || []).join(', ')}
Their Learning Goals: ${(matchLearning || []).join(', ')}

Write a punchy, exciting, 3-sentence explanation of WHY we are a perfect match and what our collaborative potential is. Address the user directly (e.g., "You and ${matchName} are an incredible match because...").
Do not include any JSON formatting or markdown wrappers, just return the 3-sentence plain text strictly.
`;

      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });

      let responseText = response.text;
      if (responseText.startsWith('\`\`\`')) {
         responseText = responseText.replace(/^\`\`\`(json)?/gi, '').replace(/\`\`\`$/g, '').trim();
      }

      res.status(200).json({ synergy: responseText.trim() });
    } catch (error) {
       console.error("[v0] AI Synergy Generation Error:", error.message);
       if (error.message.includes('GEMINI_API_KEY')) {
          return res.status(500).json({ error: "API Key Missing", details: "Please add GEMINI_API_KEY to your backend .env file" });
       }
       res.status(500).json({ error: "Failed to generate synergy", details: error.message });
    }
  });

  return router;
};
