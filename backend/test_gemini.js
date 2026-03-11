const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GOOGLE_AI_API_KEY;
console.log('Testing Gemini API...');
console.log('API Key exists:', !!apiKey);

if (!apiKey) {
  console.error('No API key found!');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);
const MODELS_TO_TEST = [
  { id: 'gemini-2.5-flash', label: 'flash (recommended)' },
  { id: 'gemini-2.5-flash-lite', label: 'flash-lite (simplified candidate)' },
];

async function testGemini() {
  for (const m of MODELS_TO_TEST) {
    try {
      console.log(`\nCalling Gemini with model: ${m.id} (${m.label})`);
      const model = genAI.getGenerativeModel({ model: m.id });
      const result = await model.generateContent('Say hello in Hindi');
      const response = await result.response;
      console.log('Success! Response:', response.text());
    } catch (error) {
      console.error('Gemini Error Details:');
      console.error('Model:', m.id);
      console.error('Message:', error.message);
      console.error('Status:', error.status);
    }
  }
}

testGemini();
