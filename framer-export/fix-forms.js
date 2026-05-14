const fs = require('fs');

let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// Framer uses divs with "value" as attribute for form inputs — not valid in React
// Replace value="..." on non-input elements by converting to data-value
// But actually the real issue is the closing </div> after a self-closing-like pattern
// Let's find what's happening around these form input divs

// The pattern is: <div ... className="framer-form-input ..." value="">...</div>
// React doesn't allow "value" on a div. Convert to data-value
code = code.replace(/className="([^"]*framer-form-input[^"]*)" value=""/g, 
  'className="$1" data-value=""');

// Also fix any input-like elements that might have unclosed tags  
// Fix <input> tags that might not be self-closed
code = code.replace(/<input([^>]*?)(?<!\/)>/g, '<input$1 />');

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Fixed form input attributes');
