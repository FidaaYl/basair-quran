const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'KeyboardShortcutsHelpModal.jsx');
let code = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

if (!code.includes('./KeyboardShortcutsHelpModal.css')) {
  code = code.replace(
    "import { ICONS } from './common/IconSystem';",
    "import { ICONS } from './common/IconSystem';\nimport './KeyboardShortcutsHelpModal.css';"
  );
  fs.writeFileSync(filePath, code, 'utf8');
}

