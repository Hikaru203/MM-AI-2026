const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function testDrive() {
  console.log("--- KIỂM TRA TRỰC TIẾP TỪ FILE JSON ---");
  
  const jsonPath = path.join(process.cwd(), 'gen-lang-client-0972253868-6adda3a07108.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error("❌ Không tìm thấy file JSON bí mật trong thư mục gốc.");
    return;
  }

  const credentials = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  try {
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });

    const drive = google.drive({ version: 'v3', auth });

    console.log("1. Đang thử kết nối...");
    await drive.files.list({ pageSize: 1 });
    console.log("✅ KẾT NỐI THÀNH CÔNG!");
    console.log("Tài khoản:", credentials.client_email);

  } catch (error) {
    console.error("❌ LỖI:");
    console.error(error.message);
  }
}

testDrive();
