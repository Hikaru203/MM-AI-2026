const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
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
  console.log("--- KIỂM TRA TỪ ENV.LOCAL ---");
  
  const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!clientEmail || !privateKey) {
    console.error("❌ Lỗi: Thiếu ENV");
    return;
  }

  // Sanitize key as we do in the app
  privateKey = privateKey.replace(/^"|"$/g, '').replace(/\\n/g, '\n');

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log("1. Đang thử kết nối...");
    await drive.files.list({ pageSize: 1 });
    console.log("✅ KẾT NỐI ENV THÀNH CÔNG!");

  } catch (error) {
    console.error("❌ LỖI ENV:");
    console.error(error.message);
  }
}

testDrive();
