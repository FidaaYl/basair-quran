const fs = require('fs');
const path = require('path');

function cleanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.git' && entry.name !== 'dist') {
        cleanDirectory(fullPath);
      }
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      cleanSourceFile(fullPath);
    }
  }
}

function cleanSourceFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const filtered = [];

  let inBlockComment = false;

  for (let line of lines) {
    const trimmed = line.trim();

    if (inBlockComment) {
      if (trimmed.includes('*/')) {
        inBlockComment = false;
      }
      continue;
    }

    if (trimmed.startsWith('/*')) {
      if (!trimmed.includes('*/')) {
        inBlockComment = true;
      }
      continue;
    }

    // Skip full-line // comments (making sure it's not a URL or regex)
    if (trimmed.startsWith('//')) {
      continue;
    }

    // Clean inline trailing comments safely
    const idx = line.indexOf(' // ');
    if (idx !== -1) {
      const before = line.substring(0, idx);
      // Ensure we don't accidentally split inside a string
      const quoteCount = (before.match(/'/g) || []).length + (before.match(/"/g) || []).length;
      if (quoteCount % 2 === 0) {
        line = before;
      }
    }

    filtered.push(line);
  }

  fs.writeFileSync(filePath, filtered.join('\n'), 'utf8');
}

const targetDir = path.resolve(__dirname, '..', 'src');
cleanDirectory(targetDir);
console.log('Successfully cleaned comments from all source files in src/');
