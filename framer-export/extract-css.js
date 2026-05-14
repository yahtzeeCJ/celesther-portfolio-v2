const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'persistent-areas-651376.framer.app_tostatic', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

// Extract ALL <style> block contents
const styleBlockRegex = /<style[^>]*>([\s\S]*?)<\/style>/g;
let match;
let allCss = '';

while ((match = styleBlockRegex.exec(html)) !== null) {
  allCss += match[1] + '\n\n';
}

console.log(`Extracted ${allCss.length} chars of CSS from ${html.match(/<style/g).length} style blocks`);

// Extract font imports from <link> tags in <head>
const fontLinkRegex = /<link[^>]*fonts\.googleapis\.com[^>]*>/g;
let fontLinks = '';
let fmatch;
while ((fmatch = fontLinkRegex.exec(html)) !== null) {
  // Convert <link href="..."> to @import url(...)
  const href = fmatch[0].match(/href="([^"]+)"/);
  if (href) {
    fontLinks += `@import url('${href[1]}');\n`;
  }
}

const finalCss = fontLinks + '\n' + allCss;

const outPath = path.join(__dirname, '..', 'src', 'app', 'framer.css');
fs.writeFileSync(outPath, finalCss);
console.log(`Wrote fresh framer.css (${finalCss.length} bytes)`);
