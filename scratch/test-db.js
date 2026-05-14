const { Client } = require('pg');

async function testConnection() {
  const connectionString = "postgresql://postgres.iqvxynjlethuaynnwrap:Dangnhpc2026@aws-0-ap-northeast-1.pooler.supabase.co:6543/postgres?pgbouncer=true";
  const client = new Client({ connectionString });

  try {
    console.log("Đang kết nối thử tới Supabase với mật khẩu: Dangnhpc2026...");
    await client.connect();
    console.log("✅ KẾT NỐI THÀNH CÔNG!");
    const res = await client.query('SELECT NOW()');
    console.log("Thời gian trên Server:", res.rows[0].now);
    await client.end();
  } catch (err) {
    console.error("❌ KẾT NỐI THẤT BẠI!");
    console.error("Lỗi:", err.message);
  }
}

testConnection();
