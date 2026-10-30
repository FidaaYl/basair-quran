const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'QuranActivityHeatmap.jsx');
let code = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

if (!code.includes('./QuranActivityHeatmap.css')) {
  code = "import './QuranActivityHeatmap.css';\n" + code;
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('Heatmap CSS imported');
}

