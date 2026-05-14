const fs = require('fs');
const credentials = JSON.parse(fs.readFileSync('gen-lang-client-0972253868-6adda3a07108.json', 'utf8'));
const base64Key = Buffer.from(credentials.private_key).toString('base64');
console.log("--- COPY MÃ NÀY DÁN VÀO ENV ---");
console.log(base64Key);
