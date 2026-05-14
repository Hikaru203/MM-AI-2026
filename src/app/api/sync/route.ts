import { NextResponse } from 'next/server';
import { uploadToGoogleDrive } from '@/lib/google-drive';
import { generateExpenseMarkdown } from '@/lib/sync';
import { auth } from '@/auth';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const formData = await request.formData();
    const expenseDataStr = formData.get('expense') as string;
    const imageFile = formData.get('image') as File | null;

    if (!expenseDataStr) {
      return NextResponse.json({ error: 'No data provided' }, { status: 400 });
    }

    const expense = JSON.parse(expenseDataStr);
    let imageUrl = '';

    let imageFileId = '';

    // 1. Upload image if exists
    if (imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      const imageRes = await uploadToGoogleDrive(
        `img_${expense.id}_${imageFile.name}`,
        buffer,
        imageFile.type,
        userId
      );
      imageFileId = imageRes.id || '';
      imageUrl = imageRes.link || '';
    }

    // 2. Generate Markdown with image link
    const updatedExpense = { ...expense, driveImageLink: imageUrl };
    const markdown = generateExpenseMarkdown(updatedExpense);

    // 3. Upload Markdown
    await uploadToGoogleDrive(`expense_${expense.id}.md`, markdown, 'text/markdown', userId);

    return NextResponse.json({ success: true, imageUrl, imageFileId });

  } catch (error: any) {
    console.error('Sync Error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      debug: error.stack 
    }, { status: 500 });
  }
}
