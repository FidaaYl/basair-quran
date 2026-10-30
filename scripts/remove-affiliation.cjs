const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'UserProfileModal.jsx');
let content = fs.readFileSync(filePath, 'utf8').replace(/\r\n/g, '\n');

// Replace the affiliation line
const target = `<p className="profile-affiliation">
                جامعة البليدة 2 (علي لونيسي) — كلية العلوم الإنسانية والإسلامية
              </p>`;

// Keep it clean and elegant
const replacement = `<p className="profile-affiliation">
                منصة بَصَائِر القرآنية الذكية — Basa'ir Studio
              </p>`;

if (content.includes('جامعة البليدة 2 (علي لونيسي) — كلية العلوم الإنسانية والإسلامية')) {
  content = content.replace(
    'جامعة البليدة 2 (علي لونيسي) — كلية العلوم الإنسانية والإسلامية',
    'منصة بَصَائِر القرآنية الذكية — Basa\'ir Studio'
  );
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated UserProfileModal.jsx');
} else {
  console.log('Target string not found');
}

