const fs = require('fs');
const html = fs.readFileSync('public/framer.html', 'utf8');

// Find all elements with data-framer-name
const nameRegex = /data-framer-name="([^"]+)"/g;
const names = new Set();
let match;
while ((match = nameRegex.exec(html)) !== null) {
  names.add(match[1]);
}

console.log('Unique data-framer-names:', Array.from(names).slice(0, 30));

// Let's also check for specific text nodes or text modules
// Framer usually uses class="framer-text" or similar
const textModuleRegex = /class="[^"]*framer-text[^"]*"/g;
const textModules = html.match(textModuleRegex);
console.log('Text modules found:', textModules ? textModules.length : 0);
