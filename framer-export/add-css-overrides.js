const fs = require('fs');
let css = fs.readFileSync('src/app/framer.css', 'utf8');

// Add overrides at the END of the CSS file to force visibility
const overrides = `

/* === OVERRIDE: Force all Framer animation states to be visible === */
[data-framer-appear-id] {
  opacity: 1 !important;
  filter: none !important;
  transform: none !important;
  visibility: visible !important;
}

.ssr-variant {
  display: contents !important;
}

/* Hide mobile-only SSR variants on desktop */
.hidden-g34ahf.hidden-1hn01op.hidden-72rtr7 {
  display: none !important;
}

/* Ensure video/image containers are visible */
[data-framer-background-image-wrapper] {
  opacity: 1 !important;
}

/* Force framer page containers to be visible */
[data-framer-name] {
  opacity: 1 !important;
  visibility: visible !important;
}
`;

css += overrides;
fs.writeFileSync('src/app/framer.css', css);
console.log('Added CSS visibility overrides');
