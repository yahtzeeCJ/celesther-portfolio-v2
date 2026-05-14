const fs = require('fs');
let html = fs.readFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/framer-export/hero-raw.html', 'utf8');

html = html.replace(/class=/g, 'className=').replace(/for=/g, 'htmlFor=').replace(/<!--.*?-->/gs, '');

html = html.replace(/style="([^"]*)"/g, (match, p1) => {
  const obj = {};
  p1.split(';').forEach(rule => {
    if (!rule.trim()) return;
    const [key, ...vals] = rule.split(':');
    const val = vals.join(':').trim();
    if (key && val) {
      let camelKey = key.trim();
      if (!camelKey.startsWith('--')) {
        camelKey = camelKey.replace(/-([a-z])/g, g => g[1].toUpperCase());
      }
      obj[camelKey] = val;
    }
  });
  return 'style={' + JSON.stringify(obj) + '}';
});

// React self-closing tags
html = html.replace(/<img(.*?)>/g, '<img$1 />');
html = html.replace(/<br(.*?)>/g, '<br$1 />');

fs.writeFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/framer-export/hero-raw.jsx', html);
console.log('Wrote hero-raw.jsx');
