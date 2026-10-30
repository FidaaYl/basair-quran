const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'KhatmahPlannerView.jsx');
let code = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add import
if (!code.includes('QuranActivityHeatmap')) {
  code = "import QuranActivityHeatmap from './QuranActivityHeatmap';\n" + code;
}

// 2. Render Heatmap between stats-grid and matrix-card
const target = `<div className="khatmah-matrix-card">`;
const heatmapJSX = `<QuranActivityHeatmap
        lastReadDate={khatmah.lastReadDate}
        streakDays={khatmah.streakDays}
      />\n\n      <div className="khatmah-matrix-card">`;

if (!code.includes('<QuranActivityHeatmap') && code.includes(target)) {
  code = code.replace(target, heatmapJSX);
  fs.writeFileSync(filePath, code, 'utf8');
  console.log('KhatmahPlannerView updated with QuranActivityHeatmap');
} else {
  console.log('Already updated or target not found');
}

