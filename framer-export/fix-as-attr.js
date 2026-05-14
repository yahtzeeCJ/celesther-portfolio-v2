const fs = require('fs');

let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// Replace invalid DOM attributes created by framer
// Remove as="a", as="div", etc. (except for EditableTextInline which might use it, but EditableTextInline uses as="span", so we preserve it by regex negative lookbehind if possible, or just replace as="a" and as="div" etc manually)

code = code.replace(/ as="[a-zA-Z0-9]+"/g, (match) => {
  if (match.includes('span')) return match; // Keep as="span" for EditableTextInline
  return '';
});

// Framer uses data-framer-page-link-current which is a valid data-* attribute, so it's fine.

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Removed invalid as attributes');
