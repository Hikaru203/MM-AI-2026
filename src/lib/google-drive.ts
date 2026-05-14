import { google } from 'googleapis';
import { Readable } from 'stream';

/**
 * Uploads a file to a central Google Drive account using OAuth2 Refresh Token.
 */
export async function uploadToGoogleDrive(
  fileName: string, 
  content: any, 
  mimeType: string = 'text/markdown',
  userId?: string
) {
  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;
  const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Google Drive OAuth2 credentials missing in environment variables');
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  try {
    // 1. Get or Use main "MoneyMemory" folder
    let rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    
    if (!rootFolderId) {
      const rootFolderRes = await drive.files.list({
        q: "name = 'MoneyMemory' and mimeType = 'application/vnd.google-apps.folder' and trashed = false",
        fields: 'files(id)',
      });

      if (rootFolderRes.data.files && rootFolderRes.data.files.length > 0) {
        rootFolderId = rootFolderRes.data.files[0].id!;
      } else {
        const folder = await drive.files.create({
          requestBody: {
            name: 'MoneyMemory',
            mimeType: 'application/vnd.google-apps.folder',
          },
          fields: 'id',
        });
        rootFolderId = folder.data.id!;
      }
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
    console.error('Google Drive OAuth2 Upload Error:', error);
    throw error;
  }
}
