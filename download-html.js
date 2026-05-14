const https = require('https');
const fs = require('fs');

https.get('https://persistent-areas-651376.framer.app/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('framer-agency-dump.html', data);
    console.log('Saved to framer-agency-dump.html');
  });
});
