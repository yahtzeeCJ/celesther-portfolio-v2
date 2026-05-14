const fs = require('fs');
let code = fs.readFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/src/components/sections/hero-section.tsx', 'utf8');

// Replace style={{ ... }} with style={{ ... } as React.CSSProperties}
// It finds style={{...}} by matching everything up to the matching double brace, being careful about nested braces if any. 
// However, the JSON.stringify we used doesn't produce nested objects, so it's a flat object.
code = code.replace(/style=\{({[^}]+})\}/g, 'style={$1 as React.CSSProperties}');

fs.writeFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/src/components/sections/hero-section.tsx', code);
console.log("Successfully added React.CSSProperties cast");
