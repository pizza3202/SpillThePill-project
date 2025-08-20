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
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

async function testGemini() {
  try {
    console.log('Calling Gemini...');
    const result = await model.generateContent('Say hello in Hindi');
    const response = await result.response;
    console.log('Success! Response:', response.text());
  } catch (error) {
    console.error('Gemini Error Details:');
    console.error('Message:', error.message);
    console.error('Status:', error.status);
    console.error('Full error:', error);
  }
}

testGemini();
