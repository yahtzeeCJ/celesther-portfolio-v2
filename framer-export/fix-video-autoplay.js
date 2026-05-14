const fs = require('fs');

let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// The regex matches any <video tag and injects autoPlay={true} if it doesn't have it
code = code.replace(/<video(?!.*autoPlay)([^>]*)>/g, '<video autoPlay={true}$1>');

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Injected autoPlay into videos');
