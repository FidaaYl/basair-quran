const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const apiPath = path.join(rootDir, 'src', 'services', 'quranApi.js');

let code = fs.readFileSync(apiPath, 'utf8').replace(/\r\n/g, '\n');

if (code.includes('function logApiCall(') && !code.includes('export function logApiCall(')) {
  code = code.replace('function logApiCall(', 'export function logApiCall(');
  fs.writeFileSync(apiPath, code, 'utf8');
  console.log('quranApi.js: logApiCall exported successfully');
} else {
  console.log('Already exported or not found');
}

