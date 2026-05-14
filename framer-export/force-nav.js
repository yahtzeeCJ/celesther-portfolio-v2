const fs = require('fs');
let css = fs.readFileSync('src/app/framer.css', 'utf8');

// The framer nav desktop links might be hidden by CSS media queries or missing
// Add a CSS override to ensure the navigation links (usually data-framer-name="Links" or similar) are visible
// And hide the mobile menu icon on desktop

css += `
/* === OVERRIDE: Force Desktop Nav === */
@media (min-width: 1200px) {
  /* Hide the burger menu wrapper on desktop */
  [data-framer-name="Mobile Menu Icon"],
  [data-framer-name="Menu Button"],
  .framer-1a2b3c /* whatever the burger class is */
  {
    display: none !important;
  }
  
  /* Ensure links container is visible */
  [data-framer-name="Links"],
  [data-framer-name="Navigation Links"],
  [data-framer-name="Desktop Nav"]
  {
    display: flex !important;
    opacity: 1 !important;
    visibility: visible !important;
  }
}
`;

fs.writeFileSync('src/app/framer.css', css);
console.log('Added desktop nav override to framer.css');
