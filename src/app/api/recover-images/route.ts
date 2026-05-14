import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { auth } from '@/auth';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session: any = await auth();
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: session.accessToken });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // 1. Get all files in Drive
    const filesRes = await drive.files.list({
      q: "(name contains 'img_' or name contains 'expense_') and trashed = false",
      fields: 'files(id, name)',
      pageSize: 1000
    });

    const driveFiles = filesRes.data.files || [];
    const imageFiles = driveFiles.filter(f => f.name?.startsWith('img_'));
    const mdFiles = driveFiles.filter(f => f.name?.startsWith('expense_'));

    const mapping: Record<string, { url: string, name: string }> = {};

    // 2. Process MD files to find metadata matches
    for (const mdFile of mdFiles) {
      try {
        const res = await drive.files.get({ fileId: mdFile.id!, alt: 'media' });
        const content = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
        
        // Extract original ID and metadata from Markdown (matching the format in lib/sync.ts)
        const driveIdMatch = mdFile.name?.match(/expense_([^.]+)/);
        const amountMatch = content.match(/Amount: ([\d.,]+)/);
        const locationMatch = content.match(/# Expense Memory: (.*?)(?:\r?\n|$)/);


        if (driveIdMatch) {
          const driveId = driveIdMatch[1];
          const amount = amountMatch ? parseInt(amountMatch[1].replace(/[.,]/g, '')) : 0;
          const location = locationMatch ? locationMatch[1].trim() : '';



          // Find the corresponding image for this Drive ID
          const relatedImage = imageFiles.find(img => img.name?.includes(`img_${driveId}_`));
          
          if (relatedImage) {
            const url = `/api/drive-image?id=${relatedImage.id}`;


            
            // Map by ID (if it exists locally)
            mapping[driveId] = { url, name: relatedImage.name || '' };
            
            // Map by Metadata (to help recovery if local ID changed)
            if (amount > 0) {
              mapping[`meta|${amount}|${location}`] = { url, name: relatedImage.name || '' };
            }
          }
        }


      } catch (e) {
        console.error('Error processing MD file', mdFile.name);
      }
    }

    return NextResponse.json({ mapping, foundFiles: driveFiles.length });





  } catch (error) {
    console.error('Recovery Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
