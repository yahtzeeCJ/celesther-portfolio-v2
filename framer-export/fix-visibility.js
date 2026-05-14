const fs = require('fs');
const path = require('path');

// 1. Extract ALL <style> content from the Framer HTML
const htmlPath = path.join(__dirname, 'persistent-areas-651376.framer.app_tostatic', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const styleBlocks = [];
const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
let match;
while ((match = styleRegex.exec(html)) !== null) {
  styleBlocks.push(match[1]);
}

const allCSS = styleBlocks.join('\n\n/* === Next Style Block === */\n\n');
fs.writeFileSync(path.join('src', 'app', 'framer.css'), allCSS);
console.log('Extracted ' + styleBlocks.length + ' style blocks (' + allCSS.length + ' bytes) into framer.css');

// 2. Fix opacity:0.001 in framer-page.tsx so elements are visible without Framer's JS animation runtime
let component = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// Remove all opacity: 0.001 (these are Framer entrance animation initial states)
component = component.replace(/"opacity":"0\.001"/g, '"opacity":"1"');

// Remove blur(10px) animation initial states
component = component.replace(/"filter":"blur\(10px\)"/g, '"filter":"none"');

// Fix transform initial states that hide elements
component = component.replace(/"transform":"translateX\(0px\) translateY\(10px\) scale\(1\) rotate\(0deg\) skewX\(0deg\) skewY\(0deg\)"/g, '"transform":"none"');

fs.writeFileSync('src/components/framer-page.tsx', component);
console.log('Fixed animation initial states (opacity, blur, transform)');
