const fs = require('fs');
let code = fs.readFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/src/components/sections/hero-section.tsx', 'utf8');

code = code.replace(/ alt /g, ' alt="" ');

fs.writeFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/src/components/sections/hero-section.tsx', code);
console.log("Fixed alt attributes");
