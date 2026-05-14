const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, 'persistent-areas-651376.framer.app_tostatic', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
let body = bodyMatch[1];

body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
body = body.replace(/<!--[\s\S]*?-->/g, '');
body = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, '');

const rootMatch = body.match(/<div data-framer-root[\s\S]*/);
body = rootMatch[0];

body = body.replace(/\bclass=/g, 'className=');
body = body.replace(/\bfor=/g, 'htmlFor=');

body = body.replace(/style="([^"]*)"/g, (match, s) => {
  const p = [];
  s.split(';').forEach(r => {
    r = r.trim();
    if (!r) return;
    const i = r.indexOf(':');
    if (i === -1) return;
    let k = r.substring(0, i).trim();
    const v = r.substring(i + 1).trim().replace(/"/g, '\\"');
    if (!k.startsWith('--')) {
      k = k.replace(/-([a-z])/g, g => g[1].toUpperCase());
      if (k.startsWith('webkit')) k = 'W' + k.substring(1);
    }
    p.push('"' + k + '":"' + v + '"');
  });
  return 'style={{' + p.join(',') + ' } as React.CSSProperties}';
});

body = body.replace(/<img([^>]*?)(?<!\/)>/g, '<img$1 />');
body = body.replace(/<br([^>]*?)(?<!\/)>/g, '<br$1 />');
body = body.replace(/ alt /g, ' alt="" ');
body = body.replace(/ alt>/g, ' alt="">');
body = body.replace(/ alt\/>/g, ' alt="" />');
body = body.replace(/\bsrcset=/g, 'srcSet=');
body = body.replace(/\btabindex=/g, 'tabIndex=');
body = body.replace(/\bautocomplete=/g, 'autoComplete=');
body = body.replace(/\bcrossorigin=/g, 'crossOrigin=');
body = body.replace(/"cornerShape":"inherit",?/g, '');
body = body.replace(/,,/g, ',');
body = body.replace(/\{,/g, '{');
body = body.replace(/,\s*}/g, '}');

fs.writeFileSync(path.join(__dirname, 'framer-body.jsx'), body);
console.log('Done: ' + body.length + ' bytes');
