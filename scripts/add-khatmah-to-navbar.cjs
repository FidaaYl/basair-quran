const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const navbarPath = path.join(rootDir, 'src', 'components', 'Navbar.jsx');

let code = fs.readFileSync(navbarPath, 'utf8').replace(/\r\n/g, '\n');

// Add Khatmah item to navItems
const target = "{ id: 'scholars', label: 'كتب العلماء', icon: ICONS.scholars },";
const replacement = target + "\n    { id: 'khatmah', label: 'مخطط الختمات', icon: ICONS.streak },";

if (!code.includes("'khatmah'")) {
  code = code.replace(target, replacement);
  fs.writeFileSync(navbarPath, code, 'utf8');
  console.log('Navbar updated with Khatmah tab');
} else {
  console.log('Khatmah tab already in Navbar');
}

