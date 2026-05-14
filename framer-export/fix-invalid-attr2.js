const fs = require('fs');
let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

code = code.replace(/ background="[^"]*"/g, '');
code = code.replace(/ font="[^"]*"/g, '');
code = code.replace(/ [a-zA-Z-]+="\[object Object\]"/g, '');

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Removed invalid background/font attributes');
