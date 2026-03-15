// Netlify build script — injects Firebase config from environment variables
// so credentials never live in the git repo

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'health-app', 'firebase', 'firebase.js');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = {
  '%%FIREBASE_API_KEY%%':            process.env.FIREBASE_API_KEY            || '',
  '%%FIREBASE_AUTH_DOMAIN%%':        process.env.FIREBASE_AUTH_DOMAIN        || '',
  '%%FIREBASE_PROJECT_ID%%':         process.env.FIREBASE_PROJECT_ID         || '',
  '%%FIREBASE_STORAGE_BUCKET%%':     process.env.FIREBASE_STORAGE_BUCKET     || '',
  '%%FIREBASE_MESSAGING_SENDER_ID%%':process.env.FIREBASE_MESSAGING_SENDER_ID|| '',
  '%%FIREBASE_APP_ID%%':             process.env.FIREBASE_APP_ID             || '',
};

for (const [placeholder, value] of Object.entries(replacements)) {
  content = content.split(placeholder).join(value);
}

fs.writeFileSync(filePath, content);
console.log('[inject-config] Firebase config injected from environment variables ✅');
