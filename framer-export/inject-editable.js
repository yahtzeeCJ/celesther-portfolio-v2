const fs = require('fs');
let code = fs.readFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/src/components/sections/hero-section.tsx', 'utf8');

// Replace "HI THERE!"
code = code.replace(
  />HI THERE!<\/span>/,
  `><EditableTextInline contentKey="heroSubtitle" as="span">{siteContent.heroSubtitle || "HI THERE!"}</EditableTextInline></span>`
);

// Replace "CELESTHER JOHN LUTCHE"
code = code.replace(
  />CELESTHER JOHN LUTCHE<\/h1>/,
  `><EditableTextInline contentKey="heroTitle" as="span">{siteContent.heroTitle || "CELESTHER JOHN LUTCHE"}</EditableTextInline></h1>`
);

// We need to replace the body paragraph which contains lots of blurred spans.
// Framer uses multiple spans for the "appear" animation. For now, we will replace the inner text of the parent <p> with our editable text.
code = code.replace(
  /<p className="framer-text framer-styles-preset-x0s9r5" data-styles-preset="QhK6qqT5U" dir="auto">.*?<\/p>/,
  `<p className="framer-text framer-styles-preset-x0s9r5" data-styles-preset="QhK6qqT5U" dir="auto"><EditableTextInline contentKey="heroDescription" as="span" inputClassName="bg-transparent border-none text-center min-w-[300px] text-white">{siteContent.heroDescription || "Welcome to my portfolio! I’m Celesther 😎 Explore my work and see how I can bring your vision to life."}</EditableTextInline></p>`
);

fs.writeFileSync('c:/Users/Celesther John/Downloads/Compressed/port-fix-build-errors/port-fix-build-errors/src/components/sections/hero-section.tsx', code);
console.log("Successfully injected EditableTextInline");
