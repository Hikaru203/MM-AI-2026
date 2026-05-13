import { google } from 'googleapis';
import { auth } from '@/auth';
import { Readable } from 'stream';

export async function uploadToGoogleDrive(fileName: string, content: any, mimeType: string = 'text/markdown') {
  const session: any = await auth();
  
  if (!session?.accessToken) {
    throw new Error('Not authenticated with Google');
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: session.accessToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    // Check if "MoneyMemory" folder exists
    let folderId = '';
    const folderRes = await drive.files.list({
      q: "name = 'MoneyMemory' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id)',
    });

    if (folderRes.data.files && folderRes.data.files.length > 0) {
      folderId = folderRes.data.files[0].id!;
    } else {
      // Create folder
      const folder = await drive.files.create({
        requestBody: {
          name: 'MoneyMemory',
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      folderId = folder.data.id!;
    }

    // Prepare body
    let body = content;
    if (content instanceof Buffer) {
      body = Readable.from(content);
    }

    // Upload file
    const fileMetadata = {
      name: fileName,
      parents: [folderId],
    };
    
    const media = {
      mimeType: mimeType,
      body: body,
    };

    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, webViewLink',
    });

    // Make file readable by link (needed for the img tag to work reliably)
    await drive.permissions.create({
      fileId: file.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });


    return {
      id: file.data.id,
      link: file.data.webViewLink
    };
  } catch (error) {
    console.error('Google Drive Upload Error:', error);
    throw error;
  }
}
