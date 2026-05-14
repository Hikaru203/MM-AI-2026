import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Uploads a file to a central Google Drive account using a Service Account.
 */
export async function uploadToGoogleDrive(
  fileName: string, 
  content: any, 
  mimeType: string = 'text/markdown',
  userId?: string
) {
  // Use Service Account credentials from ENV
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n');

  if (!clientEmail || !privateKey) {
    throw new Error('Google Service Account credentials missing in environment variables');
  }

  const auth = new google.auth.JWT(
    clientEmail,
    undefined,
    privateKey,
    ['https://www.googleapis.com/auth/drive.file']
  );

  const drive = google.drive({ version: 'v3', auth });

  try {
    // 1. Get or Create main "MoneyMemory" folder
    // Note: The Service Account can only see folders shared with it.
    // We assume the user has shared a folder named "MoneyMemory" with the Service Account email.
    
    let rootFolderId = '';
    const rootFolderRes = await drive.files.list({
      q: "name = 'MoneyMemory' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
      fields: 'files(id)',
    });

    if (rootFolderRes.data.files && rootFolderRes.data.files.length > 0) {
      rootFolderId = rootFolderRes.data.files[0].id!;
    } else {
      // If not found, try to create it (but it's better if the user shares an existing one)
      const folder = await drive.files.create({
        requestBody: {
          name: 'MoneyMemory',
          mimeType: 'application/vnd.google-apps.folder',
        },
        fields: 'id',
      });
      rootFolderId = folder.data.id!;
    }

    // 2. Get or Create User-specific subfolder
    let parentFolderId = rootFolderId;
    if (userId) {
      const userFolderRes = await drive.files.list({
        q: `name = 'user_${userId}' and '${rootFolderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`,
        fields: 'files(id)',
      });

      if (userFolderRes.data.files && userFolderRes.data.files.length > 0) {
        parentFolderId = userFolderRes.data.files[0].id!;
      } else {
        const userFolder = await drive.files.create({
          requestBody: {
            name: `user_${userId}`,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [rootFolderId],
          },
          fields: 'id',
        });
        parentFolderId = userFolder.data.id!;
      }
    }

    // 3. Prepare body
    let body = content;
    if (content instanceof Buffer) {
      body = Readable.from(content);
    }

    // 4. Upload file
    const fileMetadata = {
      name: fileName,
      parents: [parentFolderId],
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

    // 5. Make file readable by link
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
    console.error('Google Drive Service Account Upload Error:', error);
    throw error;
  }
}
