const fs = require('fs');
let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// 1. Fix ALL remaining opacity:0 instances (not just 0.001)
code = code.replace(/"opacity":"0"/g, '"opacity":"1"');
code = code.replace(/"opacity":"0\.001"/g, '"opacity":"1"');
code = code.replace(/"opacity":"0\.01"/g, '"opacity":"1"');

// 2. Fix ALL blur filters that hide content
code = code.replace(/"filter":"blur\(\d+px\)"/g, '"filter":"none"');

// 3. Fix ALL translateY transforms that push content off-screen
code = code.replace(/"transform":"translateX\([^"]*\) translateY\([^"]*\)[^"]*"/g, '"transform":"none"');
code = code.replace(/"transform":"translateY\([^"]*\)"/g, '"transform":"none"');

// 4. Remove visibility:hidden
code = code.replace(/"visibility":"hidden"/g, '"visibility":"visible"');

// 5. Fix display:none on elements that should be shown
// (only on non-mobile-hidden elements)

// 6. Fix the hidden SSR variants more thoroughly
// Show all ssr-variant divs by removing hidden-* classes
code = code.replace(/className="ssr-variant hidden-[a-z0-9]+"/g, 'className="ssr-variant"');
code = code.replace(/className="ssr-variant hidden-[a-z0-9]+ hidden-[a-z0-9]+ hidden-[a-z0-9]+"/g, 'className="ssr-variant"');

// But HIDE the mobile-only variants (ones with multiple hidden- classes for larger screens)
// The ones with "hidden-g34ahf hidden-1hn01op hidden-72rtr7" are mobile variants - hide those
code = code.replace(/className="ssr-variant hidden-g34ahf hidden-1hn01op hidden-72rtr7"/g, 
  'className="ssr-variant" style={{display:"none"}}');

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Comprehensive visibility fix applied!');
