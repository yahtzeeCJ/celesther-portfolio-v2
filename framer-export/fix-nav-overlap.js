const fs = require('fs');
let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// Framer renders multiple ssr-variant divs for responsive breakpoints.
// Each contains a full copy of the nav/content for that breakpoint.
// We need to hide the mobile/tablet variants and only show the desktop one.

// The pattern is: <div className="ssr-variant"> followed by content
// The FIRST ssr-variant in each group is typically desktop, rest are mobile/tablet

// Find all ssr-variant divs and add display:none to non-desktop ones
// The hidden-* classes tell which breakpoints they're hidden at in the original:
// hidden-1dp0tct = hidden on desktop (so this IS the mobile variant)
// hidden-g34ahf = hidden on some breakpoint
// The ones WITHOUT hidden-* are the "all breakpoints" variants

// Actually the simplest approach: hide ALL duplicate ssr-variant siblings except the first
// Let's replace the .ssr-variant CSS rule to only show first-child

// Remove the old CSS override and add a better one
let css = fs.readFileSync('src/app/framer.css', 'utf8');

// Remove the old ssr-variant override
css = css.replace(/\.ssr-variant \{[^}]*display: contents !important;[^}]*\}/g, '');

// Add better ssr-variant handling
css += `

/* Show only desktop SSR variants, hide mobile duplicates */
.ssr-variant {
  display: block !important;
}

/* Hide mobile-only SSR variant groups */
.ssr-variant.hidden-g34ahf,
.ssr-variant.hidden-g34ahf.hidden-1hn01op,
.ssr-variant.hidden-g34ahf.hidden-1hn01op.hidden-72rtr7 {
  display: none !important;
}

/* Ensure desktop SSR variants are visible */
.ssr-variant.hidden-1dp0tct {
  display: none !important;
}

/* Show the variant without hidden classes (the desktop default) */
.ssr-variant:not([class*="hidden-"]) {
  display: block !important;
}
`;

fs.writeFileSync('src/app/framer.css', css);
console.log('Fixed SSR variant CSS - mobile navbars hidden');
