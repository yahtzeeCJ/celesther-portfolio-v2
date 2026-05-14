const fs = require('fs');
const { parse } = require('node-html-parser');

const html = fs.readFileSync('public/framer.html', 'utf8');
const root = parse(html);

const textNodes = root.querySelectorAll('.framer-text');
console.log('Found .framer-text nodes:', textNodes.length);

let idCounter = 1;
for (const node of textNodes) {
  // Add a stable ID based on its text content hash or index
  node.setAttribute('data-admin-id', `text-${idCounter++}`);
}

// Append our bridge script
const body = root.querySelector('body');
if (body) {
  body.insertAdjacentHTML('beforeend', '<script src="/admin-bridge.js"></script>');
}

fs.writeFileSync('public/framer-editable.html', root.toString());
console.log('Saved to framer-editable.html. Total text nodes tagged:', idCounter - 1);
