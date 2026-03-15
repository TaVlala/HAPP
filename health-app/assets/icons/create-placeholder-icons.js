// Run with: node create-placeholder-icons.js
// Creates minimal valid PNG placeholders
const fs = require('fs');

// Minimal 1x1 blue PNG (valid PNG file)
const png1x1Blue = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108020000009001' +
  '2e0000000c49444154789c6260f8cf000001820081558b670000000049454e44ae426082',
  'hex'
);

fs.writeFileSync('icon-192.png', png1x1Blue);
fs.writeFileSync('icon-512.png', png1x1Blue);
console.log('Placeholder icons created.');
