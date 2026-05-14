const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

async function testDrive() {
  console.log("--- KIỂM TRA BASE64 TỪ ENV.LOCAL ---");
  
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const base64Key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_BASE64;

  if (!clientEmail || !base64Key) {
    console.error("❌ Lỗi: Thiếu GOOGLE_SERVICE_ACCOUNT_EMAIL hoặc KEY_BASE64");
    return;
  }

  // Decode Base64
  const privateKey = Buffer.from(base64Key, 'base64').toString('utf8');

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log("1. Đang thử kết nối...");
    await drive.files.list({ pageSize: 1 });
    console.log("✅ KẾT NỐI BASE64 THÀNH CÔNG!");

  } catch (error) {
    console.error("❌ LỖI BASE64:");
    console.error(error.message);
  }
}

testDrive();
