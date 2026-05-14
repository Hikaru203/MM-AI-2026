import { NextResponse } from 'next/server';
import { uploadToGoogleDrive } from '@/lib/google-drive';
import { auth } from '@/auth';

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const { messages, chatId } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    // Generate Chat Markdown
    let markdown = `# Nhật ký trò chuyện MoneyMemory\n\n`;
    markdown += `*ID: ${chatId || Date.now()}*\n`;
    markdown += `*Ngày tạo: ${new Date().toLocaleString('vi-VN')}*\n\n`;
    markdown += `---\n\n`;

    messages.forEach((msg: any) => {
      const role = msg.role === 'user' ? '👤 Bạn' : '🤖 MoneyMemory AI';
      markdown += `### ${role}\n${msg.text}\n\n`;
    });

    // Upload to Google Drive
    const fileName = `chat_${chatId || Date.now()}.md`;
    await uploadToGoogleDrive(fileName, markdown, 'text/markdown', userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Chat Sync Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
