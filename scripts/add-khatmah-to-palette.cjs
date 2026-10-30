const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const palettePath = path.join(rootDir, 'src', 'components', 'CommandPalette.jsx');

let code = fs.readFileSync(palettePath, 'utf8').replace(/\r\n/g, '\n');

const actionTarget = `{
        id: 'action-scholars',
        type: 'action',
        title: 'مكتبة كتب العلماء',
        subtitle: 'أمهات كتب التفسير والحديث والمخطوطات',
        badge: 'قسم',
        icon: ICONS.scholars,
        run: () => onNavigateTab('scholars')
      },`;

const newAction = actionTarget + `\n      {
        id: 'action-khatmah',
        type: 'action',
        title: 'مخطط الختمات والأوراد',
        subtitle: 'متابعة أوراد التلاوة، نسبة إنجاز الأجزاء، وأيام المواظبة',
        badge: 'قسم',
        icon: ICONS.streak,
        run: () => onNavigateTab('khatmah')
      },`;

if (!code.includes('action-khatmah')) {
  code = code.replace(actionTarget, newAction);
  fs.writeFileSync(palettePath, code, 'utf8');
  console.log('CommandPalette updated with Khatmah action');
} else {
  console.log('Already in CommandPalette');
}

