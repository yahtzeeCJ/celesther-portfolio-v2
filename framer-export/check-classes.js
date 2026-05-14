const html=require('fs').readFileSync('framer-export/persistent-areas-651376.framer.app_tostatic/index.html','utf8');
const match=html.match(/class="[^"]*ssr-variant[^"]*"/g);
console.log(match?match.slice(0, 10).join('\n'):'Not found');
