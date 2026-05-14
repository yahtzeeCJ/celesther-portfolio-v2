const fs = require('fs');
let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

code = code.replace(/parentsize="[^"]*"/g, '');
code = code.replace(/constraints="[^"]*"/g, '');
code = code.replace(/rotation="[^"]*"/g, '');
code = code.replace(/shadows="[^"]*"/g, '');
code = code.replace(/intrinsicwidth="[^"]*"/g, '');
code = code.replace(/intrinsicheight="[^"]*"/g, '');

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Removed invalid attributes');
