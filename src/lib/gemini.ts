import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function processReceipt(imageBuffer: Buffer, mimeType: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  const prompt = `
    Analyze this receipt/photo. Extract:
    1. Total Amount (number only).
    2. Location/Merchant name.
    3. Category (Food, Cafe, Shopping, Transport, Entertainment, Other).
    4. A catchy Instagram-style caption in Vietnamese.
    5. A mood based on the photo.

    Return the result in JSON format:
    {
      "amount": number,
      "location": string,
      "category": string,
      "caption": string,
      "mood": string
    }
  `;

  const result = await model.generateContent([
    prompt,
    {
      inlineData: {
        data: imageBuffer.toString("base64"),
        mimeType,
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();

  // Clean up potential markdown formatting from AI response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}

export async function getChatResponse(history: { role: string; text: string }[], userInput: string, expenses: any[] = []) {
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

  // Create a context prompt with expense data
  const contextPrompt = `
    You are MoneyMemory AI, a concise and helpful personal finance assistant.
    Current Date: ${new Date().toLocaleDateString('vi-VN')}
    
    GUIDELINES:
    1. Be concise and direct. Avoid long poetic intros or redundant greetings.
    2. Use the provided spending data to answer specifically.
    3. Use a friendly but professional tone. A small poetic touch (Instagram style) is okay but keep it under 2-3 lines.
    4. If asked about today's spending, list the items and total clearly.
    
    USER SPENDING DATA (JSON): ${JSON.stringify(expenses)}
    
    USER QUESTION: ${userInput}
  `;


  // Gemini requires the first message in history to be from 'user'
  const validHistory = [];
  let foundFirstUser = false;
  
  for (const h of history) {
    if (h.role === 'user') foundFirstUser = true;
    if (foundFirstUser) {
      validHistory.push({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.text }],
      });
    }
  }

  const chat = model.startChat({
    history: validHistory,
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });

  const result = await chat.sendMessage(contextPrompt);
  const response = await result.response;
  return response.text();
}
