import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import drugRoutes from "./routes/drugRoutes";
import authRoutes from "./routes/authRoutes";
import { simplifyMedicineInfo } from "./services/llmSimplifier";

dotenv.config({ path: path.resolve(__dirname, '.env') });

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;
if (!GOOGLE_AI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY is required in environment variables');
}
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

app.use("/api/drugs", drugRoutes);
app.use("/api/auth", authRoutes);

// Chat endpoint for PillBot
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Chat request received:', message);
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Create the PillBot prompt with system instructions
    const pillBotPrompt = `You are PillBot, a helpful medical assistant. Provide accurate, easy-to-understand information about medications, health conditions, and medical topics. Always recommend consulting healthcare providers for specific medical advice.

User question: ${message}`;

    // Get the Gemini model
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Generate response using Gemini
    const result = await model.generateContent(pillBotPrompt);
    const response = await result.response;
    const chatResponse = response.text() || "I'm sorry, I couldn't process your question. Please try again.";

    console.log('Chat response generated:', chatResponse);
    res.json({ response: chatResponse });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

