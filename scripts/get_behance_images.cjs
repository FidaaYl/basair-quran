const https = require('https');

const url = 'https://www.behance.net/gallery/257280479/Mushaf-eqraa-Quran-platform-UIUX-Case-study?tracking_source=search_projects|quran+web+design&l=1';

https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' } }, res => {
  let html = '';
  res.on('data', c => html += c);
  res.on('end', () => {
    const imgRegex = /https:\/\/mir-s3-cdn-cf\.behance\.net\/project_modules\/[^\s\"'\\]+/g;
    const matches = [...new Set(html.match(imgRegex) || [])];
    console.log('Found Behance project image modules count:', matches.length);
    matches.forEach((m, i) => console.log(`${i + 1}: ${m}`));
  });
}).on('error', e => console.log('Err:', e.message));
