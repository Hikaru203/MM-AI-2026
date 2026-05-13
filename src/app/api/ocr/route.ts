import { NextResponse } from 'next/server';
import { uploadToGoogleDrive } from '@/lib/google-drive';
import { generateExpenseMarkdown } from '@/lib/sync';
import { processReceiptWithOpenRouter } from '@/lib/ai';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await imageFile.arrayBuffer());
    const aiData = await processReceiptWithOpenRouter(buffer, imageFile.type);


    if (!aiData) {
      return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
    }

    const newExpense: any = {
      id: Math.random().toString(36).substring(7),
      amount: aiData.amount,
      category: aiData.category,
      location: aiData.location,
      mood: aiData.mood,
      caption: aiData.caption,
      aiSummary: aiData.caption,
      createdAt: new Date().toISOString(),
      walletId: '1'
    };

    return NextResponse.json(newExpense);


  } catch (error) {
    console.error('OCR Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


