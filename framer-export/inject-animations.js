const fs = require('fs');

let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// Ensure ScrollAnimationWrapper is imported
if (!code.includes('import ScrollAnimationWrapper')) {
  code = code.replace(
    /import EditableTextInline from "@\/components\/editable-text-inline";/,
    'import EditableTextInline from "@/components/editable-text-inline";\nimport ScrollAnimationWrapper from "@/components/scroll-animation-wrapper";'
  );
}

// We will target specific large structural sections that would benefit from scroll reveals.
// For example: <div ... data-framer-name="Middle" ... >
// Or <div ... data-framer-name="Bottom" ... >

// Let's use regex to find <div ... data-framer-name="Middle" ...>...</div> and wrap them.
// But matching nested divs with regex is famously impossible.
// Instead of regex, let's just do a simple string replace for the opening tags of known major containers
// and we'll add <ScrollAnimationWrapper> right inside them, wrapping their children.

// Actually, another way: just wrap the whole Framer root? No, then it animates as one giant block.
// Let's look for `<div className="framer-1hltwlr-container">` which is a top-level child based on our analysis.
// Or we can just use node-html-parser again on the original HTML to inject it!

// Yes, let's modify final-convert.js to inject ScrollAnimationWrapper.
