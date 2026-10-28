const http = require('http');
http.get('http://127.0.0.1:9292/collections/all', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const start = data.indexOf('kalpa-nav-menu');
    if (start !== -1) {
      console.log(data.substring(start, start + 600));
    } else {
      console.log('Not found');
    }
  });
});
