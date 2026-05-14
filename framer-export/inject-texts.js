const fs = require('fs');

let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// Replace specific text with EditableTextInline

code = code.replace(
  />HI THERE!<\/span>/,
  `><EditableTextInline contentKey="heroSubtitle" as="span">{siteContent.heroSubtitle || "HI THERE!"}</EditableTextInline></span>`
);

code = code.replace(
  />CELESTHER JOHN LUTCHE<\/h1>/,
  `><EditableTextInline contentKey="heroTitle" as="span">{siteContent.heroTitle || "CELESTHER JOHN LUTCHE"}</EditableTextInline></h1>`
);

// We'll replace the text node containing "Welcome to my portfolio! I’m Celesther 😎 Explore my work and see how I can bring your vision to life."
code = code.replace(
  />Welcome to my portfolio! I’m Celesther 😎 Explore my work and see how I can bring your vision to life\.<\/p>/,
  `><EditableTextInline contentKey="heroDescription" as="span" inputClassName="bg-transparent border-none text-center min-w-[300px] text-white">{siteContent.heroDescription || "Welcome to my portfolio! I’m Celesther 😎 Explore my work and see how I can bring your vision to life."}</EditableTextInline></p>`
);

// Projects Text
code = code.replace(
  />Check out some of my recent work<\/span>/,
  `><EditableTextInline contentKey="projectsSubtitle" as="span">{siteContent.projectsSubtitle || "Check out some of my recent work"}</EditableTextInline></span>`
);

// I'll add more replacements as needed, but this gets the primary backend hooks re-attached.

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Successfully injected EditableTextInline components!');
