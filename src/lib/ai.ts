export async function callOpenRouter(messages: any[], preferredModel: string = "google/gemini-2.0-flash-lite-preview-02-05:free") {
  const models = [
    preferredModel,
    "google/gemini-2.0-flash-lite-preview-02-05:free",
    "google/gemini-2.0-flash-exp:free",
    "google/gemini-flash-1.5-8b:free",
    "google/gemini-flash-1.5:free",
    "meta-llama/llama-3.2-11b-vision-instruct:free",
    "nvidia/nemotron-nano-12b-v2-vl:free",
    "baidu/qianfan-ocr-fast:free",
    "meta-llama/llama-3.3-70b-instruct:free"
  ];



  let lastError = null;

  for (const model of models) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.NEXTAUTH_URL || "http://localhost:3000",
          "X-Title": "MemoryMoney",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: model,
          messages: messages
        })
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || "OpenRouter Error");
      }
      return data.choices[0].message.content;
    } catch (error: any) {
      console.error(`Model ${model} failed, trying next...`, error.message);
      lastError = error;
      continue;
    }
  }

  throw lastError || new Error("All AI models are currently unavailable");
}


export async function processReceiptWithOpenRouter(imageBuffer: Buffer, mimeType: string) {
  const base64Image = imageBuffer.toString("base64");
  
  const prompt = `
    Analyze this receipt/photo. Extract:
    1. Total Amount (number only).
    2. Location/Merchant name.
    3. Category (Ăn uống, Cafe, Shopping, Di chuyển, Công việc, Giải trí, Khác).
    4. A catchy Instagram-style caption in Vietnamese.
    5. A mood based on the photo (vui vẻ, thư giãn, sang chảnh, tiết kiệm, bận rộn, buồn, hối hận).

    Return ONLY the result in JSON format:
    {
      "amount": number,
      "location": string,
      "category": string,
      "caption": string,
      "mood": string
    }
  `;

  const messages = [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        {
          type: "image_url",
          image_url: {
            url: `data:${mimeType};base64,${base64Image}`
          }
        }
      ]
    }
  ];

  const text = await callOpenRouter(messages);
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
}

export async function getChatResponseWithOpenRouter(history: { role: string; text: string }[], userInput: string, expenses: any[] = []) {
  const contextPrompt = `
    You are MoneyMemory AI, a concise and helpful personal finance assistant.
    Current Date: ${new Date().toLocaleDateString('vi-VN')}
    
    GUIDELINES:
    1. Be concise and direct.
    2. Use the provided spending data: ${JSON.stringify(expenses)}
    3. Friendly tone, small poetic touch (2-3 lines).
    
    USER QUESTION: ${userInput}
  `;

  const messages = history.map(h => ({
    role: h.role === 'assistant' ? 'assistant' : 'user',
    content: h.text
  }));
  
  messages.push({ role: "user", content: contextPrompt });

  return await callOpenRouter(messages, "google/gemini-2.0-flash-exp:free");
}
