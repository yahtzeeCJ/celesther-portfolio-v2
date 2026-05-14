const fs = require('fs');

let css = fs.readFileSync('src/app/framer.css', 'utf8');

// Find the start of the SSR variant overrides block and remove it
const overrideStart = css.indexOf('/* === Framer SSR Variant Overrides (Desktop Only) === */');
if (overrideStart !== -1) {
  css = css.substring(0, overrideStart);
  fs.writeFileSync('src/app/framer.css', css);
  console.log('Removed buggy SSR variant overrides from framer.css');
} else {
  console.log('Overrides not found in framer.css');
}
