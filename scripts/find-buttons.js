const fs = require('fs');
const html = fs.readFileSync('./public/framer.html', 'utf8');

// Find all <a> tags with their href and surrounding context
const aRegex = /<a\s[^>]*>/gi;
let match;
const links = [];
while ((match = aRegex.exec(html)) !== null) {
  const tag = match[0];
  const hrefMatch = tag.match(/href="([^"]*)"/);
  const nameMatch = tag.match(/data-framer-name="([^"]*)"/);
  const classMatch = tag.match(/class="([^"]*)"/);
  const textAfter = html.substring(match.index, match.index + 300);
  const innerText = textAfter.replace(/<[^>]*>/g, '').substring(0, 80).trim();
  
  links.push({
    name: nameMatch ? nameMatch[1] : '(unnamed)',
    href: hrefMatch ? hrefMatch[1] : '(none)',
    hasFramerName: !!nameMatch,
    snippet: innerText.substring(0, 60)
  });
}

// Find all <button> tags
const btnRegex = /<button\s[^>]*>/gi;
const buttons = [];
while ((match = btnRegex.exec(html)) !== null) {
  const tag = match[0];
  const nameMatch = tag.match(/data-framer-name="([^"]*)"/);
  const textAfter = html.substring(match.index, match.index + 200);
  const innerText = textAfter.replace(/<[^>]*>/g, '').substring(0, 60).trim();
  
  buttons.push({
    name: nameMatch ? nameMatch[1] : '(unnamed)',
    hasFramerName: !!nameMatch,
    snippet: innerText
  });
}

console.log('=== LINKS (<a> tags) ===');
console.log('Total:', links.length);
links.forEach((l, i) => {
  console.log(`  ${i}: [${l.name}] href="${l.href}" text="${l.snippet}"`);
});

console.log('\n=== BUTTONS (<button> tags) ===');
console.log('Total:', buttons.length);
buttons.forEach((b, i) => {
  console.log(`  ${i}: [${b.name}] text="${b.snippet}"`);
});
