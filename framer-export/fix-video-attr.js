const fs = require('fs');
let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

code = code.replace(/ loop=""/g, ' loop={true}');
code = code.replace(/ muted=""/g, ' muted={true}');
code = code.replace(/ playsinline=""/g, ' playsInline={true}');
code = code.replace(/ playsInline=""/g, ' playsInline={true}');
code = code.replace(/ autoplay=""/g, ' autoPlay={true}');
code = code.replace(/ controls=""/g, ' controls={true}');

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Fixed media boolean attributes');
