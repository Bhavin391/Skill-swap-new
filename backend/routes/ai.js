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

  // Simple in-memory cache to save API quota
  const aiCache = new Map();

  // Simple mutex/queue to prevent concurrent bursts hitting Gemini API limits
  let isGenerating = Promise.resolve();

  const getCachedOrGenerate = async (cacheKey, generateFn) => {
    if (aiCache.has(cacheKey)) {
      console.log(`[v0] Using cached AI response for ${cacheKey.substring(0, 20)}...`);
      return aiCache.get(cacheKey);
    }
    
    // Line up in the queue so we don't burst the API
    const ticket = isGenerating;
    let release;
    isGenerating = new Promise(r => release = r);
    
    await ticket;
    
    try {
      // Check cache again in case another queued request already solved it
      if (aiCache.has(cacheKey)) return aiCache.get(cacheKey);
      
      const result = await generateFn();
      aiCache.set(cacheKey, result);
      
      // Delay before next API call allowed (4.5s guarantees max ~13 requests per minute, safely under the 15 RPM limit)
      await new Promise(resolve => setTimeout(resolve, 4500));
      return result;
    } catch (err) {
      console.error("[v0] AI API Error (Fallback Triggered):", err.message);
      
      // MOCK DATA FALLBACKS so the app doesn't crash during demos when quota is depleted
      if (cacheKey.startsWith('syllabus_')) {
        return {
          title: "The Ultimate Skill Swap Journey",
          introduction: "[MOCK DATA] You have hit your Google Gemini Free Tier daily limit of 20 requests. Enjoy this placeholder sample syllabus to test the UI!",
          weeks: [
            { week: 1, theme: "Fundamentals", userA_teaching: "Introduction and core basics", userB_teaching: "Setup and basic syntax", homework: "Review your initial notes together and share feedback" },
            { week: 2, theme: "Intermediate Concepts", userA_teaching: "Deep dive into core mechanics", userB_teaching: "Understanding workflows and structures", homework: "Build a small mini-project jointly" },
            { week: 3, theme: "Advanced Techniques", userA_teaching: "Optimization and best practices", userB_teaching: "Advanced features and state management", homework: "Review and critique each other's code" },
            { week: 4, theme: "Final Collaboration", userA_teaching: "Applying theory to production", userB_teaching: "Deployment and fine-tuning", homework: "Celebrate your new skills and launch your project!" }
          ]
        };
      } else if (cacheKey.startsWith('quiz_')) {
        return {
          questions: [
            { question: "[MOCK] You've hit your API limit. What is the smartest way to proceed?", options: ["Cry", "Blame the developer", "Use Mock Data", "Give up"], correctIndex: 2 },
            { question: "Which of the following describes a true peer-to-peer learning experience?", options: ["Only one person teaches", "Mutual teaching and learning", "Paying a tutor", "Watching a video"], correctIndex: 1 },
            { question: "When your code fails to work, you should:", options: ["Read the error messages carefully", "Smash the keyboard", "Rewrite the entire app", "Ignore the feature"], correctIndex: 0 }
          ]
        };
      } else if (cacheKey.startsWith('synergy_')) {
        return "[MOCK] You and this user are a fantastic match! Since your daily Google API quota limit has been exceeded, we cannot generate a custom analysis right now, but your listed skills align perfectly for a mutual skill exchange.";
      } else if (cacheKey.startsWith('icebreaker_')) {
        return {
          icebreakers: [
            "Hey! I saw we matched. The AI is out of quota right now, but I'd love to learn from you!",
            "Hi there! Super excited to teach you what I know.",
            "Hello! Let's swap skills, when are you free for our first chat?"
          ]
        };
      } else if (cacheKey.startsWith('duck_')) {
        return "[MOCK] You've hit your API limit. As an AI tutor, I suggest checking the documentation for your current topic!";
      }
      
      throw err;
    } finally {
      release();
    }
  };

  // POST /api/ai/syllabus
  // Body: { teachingSkill: "Python", learningSkill: "Spanish" }
  router.post('/syllabus', async (req, res) => {
    try {
      const { teachingSkill, learningSkill } = req.body;

      if (!teachingSkill || !learningSkill) {
         return res.status(400).json({ error: "Missing teachingSkill or learningSkill" });
      }

      const cacheKey = `syllabus_${teachingSkill}_${learningSkill}`;
      
      const syllabusObj = await getCachedOrGenerate(cacheKey, async () => {
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

        return JSON.parse(responseText);
      });

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

      const cacheKey = `quiz_${skill}`;
      
      const quizObj = await getCachedOrGenerate(cacheKey, async () => {
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

        return JSON.parse(responseText);
      });

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
      const cacheKey = `synergy_${matchName}_${(myOffering || []).join()}_${(myLearning || []).join()}`;
      
      const synergyText = await getCachedOrGenerate(cacheKey, async () => {
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

        return responseText.trim();
      });

      res.status(200).json({ synergy: synergyText });
    } catch (error) {
       console.error("[v0] AI Synergy Generation Error:", error.message);
       if (error.message.includes('GEMINI_API_KEY')) {
          return res.status(500).json({ error: "API Key Missing", details: "Please add GEMINI_API_KEY to your backend .env file" });
       }
       res.status(500).json({ error: "Failed to generate synergy", details: error.message });
    }
  });

  // POST /api/ai/icebreaker
  router.post('/icebreaker', async (req, res) => {
    try {
      const { myOffering, myLearning, matchName, matchOffering, matchLearning } = req.body;
      const cacheKey = `icebreaker_${matchName}_${(myOffering || []).join()}_${(myLearning || []).join()}`;
      
      const parsedObj = await getCachedOrGenerate(cacheKey, async () => {
        const ai = getGeminiClient();
        const prompt = `
I have just matched with ${matchName} on a skill-swapping platform.
My Skills (I can teach): ${(myOffering || []).join(', ')}
My Goals (What I want to learn from them): ${(myLearning || []).join(', ')}

Their Skills (What they can teach me): ${(matchOffering || []).join(', ')}
Their Goals (What they want to learn from me): ${(matchLearning || []).join(', ')}

We haven't messaged each other yet. 
Generate exactly 3 diverse, highly engaging 'icebreaker' conversation starters I can send them. Make them friendly, enthusiastic, and focused on our mutual skill exchange. Keep each one relatively concise (1-2 sentences).
Return ONLY a valid JSON object strictly matching this schema:
{
  "icebreakers": ["Icebreaker 1", "Icebreaker 2", "Icebreaker 3"]
}
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

        return JSON.parse(responseText);
      });

      res.status(200).json(parsedObj);
    } catch (error) {
       console.error("[v0] AI Icebreaker Generation Error:", error.message);
       if (error.message.includes('GEMINI_API_KEY')) {
          return res.status(500).json({ error: "API Key Missing", details: "Please add GEMINI_API_KEY to your backend .env file" });
       }
       res.status(500).json({ error: "Failed to generate icebreakers", details: error.message });
    }
  });

  // POST /api/ai/rubber-duck
  router.post('/rubber-duck', async (req, res) => {
    try {
      const { skill, question } = req.body;
      if (!skill || !question) return res.status(400).json({ error: "Missing skill or question" });

      const cacheKey = `duck_${skill}_${question.substring(0, 50)}`;
      
      const responseText = await getCachedOrGenerate(cacheKey, async () => {
        const ai = getGeminiClient();
        const prompt = `
You are an expert, friendly AI tutor functioning as a "Rubber Duck" learning buddy.
The user is currently learning "\${skill}" from their peer mentor, but their mentor is offline.
The user is stuck and asks: "\${question}"

Explain the concept simply, provide a short example if relevant, and encourage them to keep going. Keep your response helpful, concise, and formatted in clear paragraphs (no markdown JSON wrappers needed).
`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // Strip backticks if any
        let text = response.text.trim();
        if (text.startsWith('\`\`\`')) {
            text = text.replace(/^\`\`\`(json)?/gi, '').replace(/\`\`\`$/g, '').trim();
        }
        return text;
      });

      res.status(200).json({ reply: responseText });
    } catch (error) {
       console.error("[v0] AI Rubber Duck Error:", error.message);
       if (error.message.includes('GEMINI_API_KEY')) {
          return res.status(500).json({ error: "API Key Missing", details: "Please add GEMINI_API_KEY to your backend .env file" });
       }
       res.status(500).json({ error: "Failed to generate rubber duck response", details: error.message });
    }
  });

  return router;
};
