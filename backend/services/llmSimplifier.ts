import dotenv from "dotenv";
import path from "path";
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const GOOGLE_AI_API_KEY = process.env.GOOGLE_AI_API_KEY;

if (!GOOGLE_AI_API_KEY) {
  throw new Error('GOOGLE_AI_API_KEY is required in environment variables');
}

const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

const MODEL_MAP: Record<string, string> = {
  // Use a reliable model for detailed mode to avoid fallback content.
  regular: "gemini-2.5-flash",
  // Try a cheaper/faster model for simplified mode; fall back if unavailable.
  simplified: "gemini-2.5-flash-lite"
};

function getModelWithFallback(requestedModelId: string, fallbackModelId: string) {
  try {
    return genAI.getGenerativeModel({ model: requestedModelId });
  } catch {
    return genAI.getGenerativeModel({ model: fallbackModelId });
  }
}

function buildPrompt(rawData: {
  name: string;
  uses?: string;
  dosage?: string;
  warnings?: string;
  sideEffects?: string;
}, type: string, fromLang?: string, toLang?: string) {
  if (type === 'need translation' && toLang) {
    return `
Simplify this medical info in ${toLang}. The original is in ${fromLang || 'English'}. Add a tip and a common mistake to avoid.

Name: ${rawData.name}
Use: ${rawData.uses || 'N/A'}
Dose: ${rawData.dosage || 'N/A'}
Side Effects: ${rawData.sideEffects || 'N/A'}
Warnings: ${rawData.warnings || 'N/A'}
`;
  }
  return `
Simplify this medical info in friendly, non-technical English. Add a tip and a common mistake to avoid.

Name: ${rawData.name}
Use: ${rawData.uses || 'N/A'}
Dose: ${rawData.dosage || 'N/A'}
Side Effects: ${rawData.sideEffects || 'N/A'}
Warnings: ${rawData.warnings || 'N/A'}
`;
}

export async function simplifyMedicineInfo(
  rawInfo: any,
  language: string = 'en',
  model: string = 'regular'
): Promise<{ simplified: string }> {
  try {
    const modelId = MODEL_MAP[model];
    if (!modelId) {
      throw new Error(`Unknown model: ${model}`);
    }

    let prompt: string;
    
    if (model === 'regular') {
      // Detailed model - comprehensive information for healthcare professionals
      prompt = `You are a medical information assistant. Provide comprehensive, detailed information about "${rawInfo.name}" medication. This is for healthcare professionals or detailed research.

Please provide a comprehensive overview including:

**What is ${rawInfo.name}?**
- Drug class and mechanism of action
- How it works in the body
- What conditions it treats

**Dosage Information:**
- Standard dosages for different conditions
- Timing and administration instructions
- Special considerations (age, weight, kidney function)
- Maximum daily limits

**Important Warnings & Precautions:**
- Contraindications (when NOT to use)
- Drug interactions
- Special populations (pregnancy, breastfeeding, elderly)
- Pre-existing conditions to consider

**Side Effects:**
- Common side effects and their frequency
- Serious side effects and warning signs
- What to do if side effects occur
- When to seek immediate medical attention

**Drug Interactions:**
- Medications that should not be taken together
- Food interactions
- Alcohol and other substances

**Monitoring & Follow-up:**
- What to monitor while taking this medication
- When to contact healthcare provider
- Signs of overdose or adverse reactions

Format the response in clear sections with headings. Include specific medical terminology and detailed information.`;
    } else {
      // Simplified model - casual, everyday language style
      prompt = `You're explaining "${rawInfo.name}" to a friend in casual, everyday language. Use simple words and natural speech patterns - like how you'd actually talk to someone, not like a textbook.

IMPORTANT: You MUST follow this EXACT structure with these EXACT headings and emojis:

💊 **What it is**
- A basic description and drug type
- Give it a casual nickname or describe it simply

🎯 **What it does**
- Purpose and conditions it treats
- What problems does it solve?

⚙️ **How it works**
- Simple explanation of its mechanism
- Explain the basic mechanism in everyday language

✨ **Result**
- What you may feel or experience
- What changes you can expect

🧪 **Uses**
- Common applications or medical scenarios
- List the main uses in everyday language

🚫 **When not to take**
- Warnings and contraindications
- What to avoid and why

😵 **Side effects**
- What to watch out for
- Most common side effects in plain language

🧠 **Fun facts**
- Cool tips or surprising info
- Add something interesting or memorable

CRITICAL: Use casual, conversational language throughout but ALWAYS follow this exact structure with these exact emoji headings. Do not write in paragraphs - use the bullet point format shown above.`;
    }

    console.log('Making Google Gemini API call with model:', modelId);
    console.log('Google AI API Key exists:', !!GOOGLE_AI_API_KEY);
    
    // Get the Gemini model (simplified mode uses a lightweight model with fallback)
    const geminiModel =
      model === 'simplified'
        ? getModelWithFallback(modelId, MODEL_MAP.regular)
        : genAI.getGenerativeModel({ model: modelId });
    
    // Generate content using Gemini
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    const simplified = response.text() || "Unable to simplify drug information.";
    
    console.log('Google Gemini response generated successfully');
    return { simplified };
  } catch (error: any) {
    console.error("Google Gemini error:", error.message);
    throw new Error(`Google Gemini error: ${error.message}`);
  }
} 