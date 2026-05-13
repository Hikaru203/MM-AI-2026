import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@/auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get('id');

  if (!fileId) {
    return new NextResponse('Missing file ID', { status: 400 });
  }

  try {
    const session: any = await auth();
    if (!session?.accessToken) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const response = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'stream' }
    );

    const contentType = response.headers['content-type'] || 'image/jpeg';
    
    // We cast to any because the response.data stream is compatible with NextResponse
    return new NextResponse(response.data as any, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Drive Image Proxy Error:', error);
    return new NextResponse('Error fetching image', { status: 500 });
  }
}
