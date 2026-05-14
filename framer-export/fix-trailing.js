const fs = require('fs');

let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// The framer root div is followed by stray elements like <div id="overlay">
// Find and remove everything after the framer root closes
// The root starts with <div data-framer-root
// We need to find its matching closing </div>

const lines = code.split('\n');
// The JSX is on line index 14 (line 15)
let jsxLine = lines[14];

// Find <div id="overlay"> and remove it and everything after
const overlayIdx = jsxLine.indexOf('<div id="overlay">');
if (overlayIdx !== -1) {
  // Walk backwards to find the right cutoff - remove the overlay div and its parent closing div
  jsxLine = jsxLine.substring(0, overlayIdx) + '</div>';
}

// Also remove any stray </div> that may be unbalanced at the very end
// Count opening and closing div tags to find balance
let openCount = 0;
let closeCount = 0;
const openRegex = /<div[\s>]/g;
const closeRegex = /<\/div>/g;
let m;
while ((m = openRegex.exec(jsxLine)) !== null) openCount++;
while ((m = closeRegex.exec(jsxLine)) !== null) closeCount++;

console.log('Open divs:', openCount, 'Close divs:', closeCount);

// If there are extra closing divs, trim them
while (closeCount > openCount) {
  const lastClose = jsxLine.lastIndexOf('</div>');
  if (lastClose !== -1) {
    jsxLine = jsxLine.substring(0, lastClose);
    closeCount--;
  } else break;
}

lines[14] = jsxLine;
code = lines.join('\n');

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Fixed trailing HTML. Final open:', openCount, 'close:', closeCount);
