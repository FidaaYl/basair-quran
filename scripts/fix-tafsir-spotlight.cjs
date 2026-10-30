const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appCssPath = path.join(rootDir, 'src', 'App.css');

let css = fs.readFileSync(appCssPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Replace .tafsir-verse-spotlight-card
const targetCard = `.tafsir-verse-spotlight-card {
  background: linear-gradient(135deg, rgba(16, 42, 36, 0.95) 0%, rgba(11, 30, 26, 0.98) 100%);
  border: 1px solid rgba(210, 170, 96, 0.35);
  border-radius: var(--radius-lg, 12px);
  padding: 20px 24px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}`;

const newCard = `.tafsir-verse-spotlight-card {
  position: relative;
  background-color: #0b231e;
  border: 1px solid rgba(210, 170, 96, 0.45);
  border-radius: var(--radius-lg, 12px);
  padding: 22px 26px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  overflow: hidden;
}

[data-theme='light'] .tafsir-verse-spotlight-card {
  background-color: #f7f3e8;
  border: 1px solid rgba(181, 138, 67, 0.4);
}

.tafsir-verse-spotlight-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('./assets/pattern-bg.jpg');
  background-repeat: repeat;
  background-size: 240px;
  pointer-events: none;
  z-index: 0;
  transition: opacity var(--transition-normal);
}

[data-theme='dark'] .tafsir-verse-spotlight-card::before {
  mix-blend-mode: screen;
  opacity: 0.14;
}

[data-theme='light'] .tafsir-verse-spotlight-card::before {
  mix-blend-mode: multiply;
  opacity: 0.16;
}

.spotlight-verse-header,
.spotlight-arabic-text {
  position: relative;
  z-index: 1;
}`;

if (css.includes(targetCard)) {
  css = css.replace(targetCard, newCard);
}

// 2. Fix .spotlight-arabic-text color
const targetText = `.spotlight-arabic-text {
  font-size: 26px;
  line-height: 2.2;
  color: var(--text-primary, #f8fafc);
  margin: 0;
  text-align: center;
}`;

const newText = `.spotlight-arabic-text {
  font-size: 27px;
  line-height: 2.3;
  color: #ffffff;
  margin: 0;
  text-align: center;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

[data-theme='light'] .spotlight-arabic-text {
  color: #142820;
  text-shadow: none;
  font-weight: 600;
}`;

if (css.includes(targetText)) {
  css = css.replace(targetText, newText);
}

fs.writeFileSync(appCssPath, css, 'utf8');
console.log('App.css updated: tafsir spotlight card now uses solid leather/parchment with pattern overlay and high-contrast text');

