const https = require('https');

function search(q) {
  return new Promise((resolve) => {
    const url = 'https://archive.org/advancedsearch.php?q=' + encodeURIComponent(q) + '&fl[]=identifier,title,downloads&sort[]=downloads+desc&rows=4&page=1&output=json';
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const docs = JSON.parse(d).response.docs;
          resolve({ q, docs });
        } catch(e) {
          resolve({ q, err: e.message });
        }
      });
    }).on('error', e => resolve({ q, err: e.message }));
  });
}

async function getMp3s(identifier) {
  return new Promise((resolve) => {
    https.get('https://archive.org/metadata/' + identifier + '/files', { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try {
          const j = JSON.parse(d);
          const files = (j.result || []).filter(f => f.name && f.name.endsWith('.mp3') && !f.name.includes('_vbr'));
          resolve({ identifier, server: j.server, dir: j.dir, files: files.slice(0, 3) });
        } catch(e) {
          resolve({ identifier, err: e.message });
        }
      });
    }).on('error', e => resolve({ identifier, err: e.message }));
  });
}

async function main() {
  const items = [
    'title:("الأربعين النووية") AND mediatype:(audio)',
    'title:("رياض الصالحين") AND mediatype:(audio)',
    'title:("زاد المعاد") AND mediatype:(audio)',
    'title:("الشمائل المحمدية") AND mediatype:(audio)'
  ];

  for (const item of items) {
    const res = await search(item);
    console.log('\n=== Search:', res.q);
    for (const doc of (res.docs || [])) {
      console.log('Doc:', doc.identifier, '|', doc.title);
      const mp3Info = await getMp3s(doc.identifier);
      if (mp3Info.files && mp3Info.files.length) {
        console.log('   Direct MP3s:');
        mp3Info.files.forEach(f => {
          console.log('    -> https://archive.org/download/' + doc.identifier + '/' + encodeURIComponent(f.name));
        });
      }
    }
  }
}

main();
