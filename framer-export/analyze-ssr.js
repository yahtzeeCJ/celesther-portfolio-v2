const fs = require('fs');
const { parse } = require('node-html-parser');

// Re-read the original HTML and understand the SSR variant structure
const htmlPath = 'framer-export/persistent-areas-651376.framer.app_tostatic/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');
const root = parse(html);

// Find all elements with class "ssr-variant"
const ssrVariants = root.querySelectorAll('.ssr-variant');
console.log('Total SSR variant elements:', ssrVariants.length);

ssrVariants.forEach((el, i) => {
  const classes = el.getAttribute('class') || '';
  const parent = el.parentNode;
  const parentName = parent ? (parent.getAttribute('data-framer-name') || parent.getAttribute('class') || 'unknown') : 'none';
  console.log(`  ${i}: classes="${classes}" parent="${parentName}"`);
});
