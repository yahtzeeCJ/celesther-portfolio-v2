const fs = require('fs');
const code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

const regex = /<div[^>]*data-framer-name="([^"]*)"[^>]*>/g;
let match;
let count = 0;
while ((match = regex.exec(code)) !== null && count < 30) {
  console.log(match[1]);
  count++;
}
