const fs = require('fs');

// Fix the CSS approach completely
let css = fs.readFileSync('src/app/framer.css', 'utf8');

// Remove ALL old ssr-variant overrides
css = css.replace(/\/\* === OVERRIDE[\s\S]*$/, '');
css = css.replace(/\/\* Show only desktop[\s\S]*$/, '');

// Add clean, correct overrides
css += `

/* === Framer SSR Variant Overrides (Desktop Only) === */

/* 
 * Framer renders multiple copies of sections for different breakpoints.
 * hidden-1dp0tct means "hidden on desktop" = this is a mobile/tablet variant
 * We HIDE anything with hidden-1dp0tct (mobile variants)
 * We SHOW anything WITHOUT hidden-1dp0tct (desktop variants)
 */

/* Default: show all ssr-variant */
.ssr-variant {
  display: block !important;
}

/* HIDE all variants that contain hidden-1dp0tct (these are non-desktop) */
.ssr-variant[class*="hidden-1dp0tct"] {
  display: none !important;
}

/* Force all Framer animation states to be visible (no JS runtime) */
[data-framer-appear-id] {
  opacity: 1 !important;
  filter: none !important;
  transform: none !important;
  visibility: visible !important;
}

[data-framer-background-image-wrapper] {
  opacity: 1 !important;
}

[data-framer-name] {
  opacity: 1 !important;
  visibility: visible !important;
}
`;

fs.writeFileSync('src/app/framer.css', css);
console.log('Applied correct SSR variant CSS overrides');
