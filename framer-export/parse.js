const fs = require('fs');
const html = fs.readFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/framer-export/body-raw.html', 'utf8');

const startIndex = html.indexOf('<div class="framer-1xmfp64"');
let count = 0;
let endIndex = startIndex;

for (let i = startIndex; i < html.length; i++) {
  if (html.substring(i, i + 4) === '<div') {
    count++;
  } else if (html.substring(i, i + 5) === '</div') {
    count--;
    if (count === 0) {
      endIndex = i + 6;
      break;
    }
  }
}

fs.writeFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/framer-export/hero-raw.html', html.substring(startIndex, endIndex));
console.log('Wrote hero-raw.html');
