const fs = require('fs');
let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// Framer uses "ssr-variant" divs with "hidden-*" classes to show/hide content
// for different screen sizes. The "hidden-1dp0tct" class is for desktop.
// We want to show the desktop variant and hide mobile variants.
// Remove the "hidden-*" classes from the desktop variant divs
code = code.replace(/className="ssr-variant hidden-1dp0tct"/g, 'className="ssr-variant"');

// Also fix opacity:0 on the logo marquee section
code = code.replace(/"opacity":"0","WebkitMaskImage"/g, '"opacity":"1","WebkitMaskImage"');
code = code.replace(/"opacity":"0","maskImage"/g, '"opacity":"1","maskImage"');

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Fixed SSR variant visibility and marquee opacity');
