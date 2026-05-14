const fs = require('fs');
let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// Fix input/textarea value="" -> defaultValue=""
// Match <input ... value="..." and <textarea ... value="..."
code = code.replace(/(<(?:input|textarea)[^>]*?) value="([^"]*)"/g, '$1 defaultValue="$2"');

// Also fix data-value="" we added earlier on framer-form-input divs (revert to nothing, it's just decorative)
// Those divs are fine with data-value

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Fixed value -> defaultValue on form fields');
