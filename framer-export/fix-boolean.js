const fs = require('fs');

let code = fs.readFileSync('src/components/framer-page.tsx', 'utf8');

// Fix boolean "value" attributes (value> should be value="">)
code = code.replace(/" value>/g, '" value="">');

// Fix any remaining boolean attributes without values
code = code.replace(/ value>/g, ' value="">');
code = code.replace(/ checked>/g, ' checked={true}>');
code = code.replace(/ disabled>/g, ' disabled={true}>');
code = code.replace(/ selected>/g, ' selected={true}>');
code = code.replace(/ required>/g, ' required={true}>');
code = code.replace(/ readonly>/g, ' readOnly={true}>');
code = code.replace(/ multiple>/g, ' multiple={true}>');
code = code.replace(/ autofocus>/g, ' autoFocus={true}>');

// Fix data-framer-generated-page (boolean attr without value)
code = code.replace(/data-framer-generated-page>/g, 'data-framer-generated-page={true}>');
code = code.replace(/data-framer-generated-page /g, 'data-framer-generated-page={true} ');

fs.writeFileSync('src/components/framer-page.tsx', code);
console.log('Fixed boolean attributes');
