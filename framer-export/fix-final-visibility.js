const fs = require('fs');
let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// 1. Fix ALL remaining blur filters
code = code.replace(/"filter":"blur\([^"]*\)"/g, '"filter":"none"');

// 2. Fix ALL remaining opacity:0 patterns (some may use different formats)
code = code.replace(/"opacity":"0"/g, '"opacity":"1"');

// 3. Fix transform states that hide elements (translateY, scale, etc.)
code = code.replace(/"transform":"translateX\([^"]*\)[^"]*"/g, '"transform":"none"');
code = code.replace(/"transform":"translateY\([^"]*\)"/g, '"transform":"none"');

// 4. Fix visibility:hidden
code = code.replace(/"visibility":"hidden"/g, '"visibility":"visible"');

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Applied final visibility fixes');
