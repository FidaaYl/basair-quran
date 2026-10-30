const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Update RestApiExplorerModal.jsx
const restModalPath = path.join(rootDir, 'src', 'components', 'RestApiExplorerModal.jsx');
let restCode = fs.readFileSync(restModalPath, 'utf8').replace(/\r\n/g, '\n');

const targetRest = `          <p className="rest-attribution-text">
            <strong>مساق REST APIs & Microservices</strong> — جامعة البليدة 2 (بإشراف د. صحراوي محمد) | إعداد الطالب: <strong>فداء يعلاوي</strong>
          </p>`;

const newRest = `          <p className="rest-attribution-text">
            <strong>منصة بَصَائِر (Basa'ir)</strong> — استوديو القرآن الكريم والتلاوة والتدبر الذكي
          </p>`;

if (restCode.includes('جامعة البليدة 2 (بإشراف د. صحراوي محمد)')) {
  restCode = restCode.replace(targetRest, newRest);
  fs.writeFileSync(restModalPath, restCode, 'utf8');
  console.log('RestApiExplorerModal.jsx updated successfully');
} else {
  console.log('Target not found in RestApiExplorerModal.jsx');
}

// 2. Update CommandPalette.jsx
const palettePath = path.join(rootDir, 'src', 'components', 'CommandPalette.jsx');
let paletteCode = fs.readFileSync(palettePath, 'utf8').replace(/\r\n/g, '\n');

if (paletteCode.includes('جامعة البليدة 2')) {
  paletteCode = paletteCode.replace(
    "subtitle: 'إعداد الطالب فداء يعلاوي | إشراف د. صحراوي محمد (جامعة البليدة 2)',",
    "subtitle: 'إعدادات المنصة، المظهر وتفضيلات التلاوة والحفظ',"
  );
  fs.writeFileSync(palettePath, paletteCode, 'utf8');
  console.log('CommandPalette.jsx updated successfully');
}

