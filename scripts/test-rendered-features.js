const http = require('http');

http.get('http://127.0.0.1:9292/', (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const parts = data.split('class="sale-features-row"');
    console.log('Parts found:', parts.length - 1);
    for (let i = 1; i < parts.length; i++) {
      console.log(`=== Slide ${i-1} ===`);
      console.log(parts[i].substring(0, 500));
    }
  });
}).on('error', err => console.error(err));
