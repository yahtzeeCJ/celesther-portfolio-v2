const https = require('https');
https.get('https://persistent-areas-651376.framer.app/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const matches = data.match(/data-framer-name="[^"]+"/g) || [];
    console.log(Array.from(new Set(matches)).slice(0, 30));
  });
});
