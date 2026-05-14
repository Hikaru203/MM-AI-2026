import { NextResponse } from 'next/server';
import { getChatResponseWithOpenRouter } from '@/lib/ai';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { messages, expenses } = await request.json();
    const userInput = messages[messages.length - 1].text;

    if (!userInput) {
      return NextResponse.json({ error: 'No input provided' }, { status: 400 });
    }

    const aiResponse = await getChatResponseWithOpenRouter(messages.slice(0, -1), userInput, expenses);


    return NextResponse.json({ text: aiResponse });

  } catch (error) {
    console.error('Chat AI Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
