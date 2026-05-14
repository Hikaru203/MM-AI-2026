const { google } = require('googleapis');
const http = require('http');
const url = require('url');
const dotenv = require('dotenv');
const path = require('path');

// Load env from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const CLIENT_ID = process.env.AUTH_GOOGLE_ID;
const CLIENT_SECRET = process.env.AUTH_GOOGLE_SECRET;
const REDIRECT_URI = 'http://localhost:3001/oauth2callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Lỗi: Bạn chưa cấu hình AUTH_GOOGLE_ID và AUTH_GOOGLE_SECRET trong file .env.local');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const scopes = ['https://www.googleapis.com/auth/drive.file'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent'
});

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/oauth2callback')) {
    const q = url.parse(req.url, true).query;
    res.end('Xac thuc thanh cong! Ban hay quay lai Terminal de xem Refresh Token.');
    
    try {
      const { tokens } = await oauth2Client.getToken(q.code);
      console.log('\n--- KET QUA ---');
      console.log('GOOGLE_DRIVE_REFRESH_TOKEN=' + tokens.refresh_token);
      console.log('---------------\n');
      console.log('Hãy copy dòng trên và dán vào file .env.local của bạn.');
    } catch (e) {
      console.error('Loi lay token:', e.message);
    }
    
    server.close();
    process.exit();
  }
}).listen(3001, () => {
  console.log('\n=========================================================');
  console.log('BƯỚC 1: Hãy copy link dưới đây dán vào trình duyệt:');
  console.log('\n' + authUrl);
  console.log('\nBƯỚC 2: Đăng nhập và nhấn Cho phép.');
  console.log('=========================================================\n');
});
