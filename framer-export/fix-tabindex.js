const fs = require('fs');
let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

code = code.replace(/tabIndex="(-?\d+)"/g, 'tabIndex={$1}');

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Fixed tabIndex types');
