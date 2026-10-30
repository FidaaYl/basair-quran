const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appCssPath = path.join(rootDir, 'src', 'App.css');

let css = fs.readFileSync(appCssPath, 'utf8').replace(/\r\n/g, '\n');

// Update navbar-inner
const targetInner = `.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  direction: ltr;
  width: 100%;
  min-width: 0;
}`;

const newInner = `.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  direction: ltr;
  width: 100%;
  min-width: 0;
}`;
if (css.includes(targetInner)) {
  css = css.replace(targetInner, newInner);
}

// Update navbar-search-wrapper
const targetSearch = `.navbar-search-wrapper {
  position: relative;
  width: auto;
  min-width: 140px;
  max-width: 190px;
  display: flex;
  align-items: center;
  background-color: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 5px 10px;
  cursor: pointer;
  transition: all var(--transition-fast);
  direction: rtl;
  flex-shrink: 0;
}`;

const newSearch = `.navbar-search-wrapper {
  position: relative;
  width: auto;
  min-width: 120px;
  max-width: 160px;
  display: flex;
  align-items: center;
  background-color: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 5px 9px;
  cursor: pointer;
  transition: all var(--transition-fast);
  direction: rtl;
  flex-shrink: 0;
}`;
if (css.includes(targetSearch)) {
  css = css.replace(targetSearch, newSearch);
}

// Update nav-pill-btn
const targetNavPill = `.nav-pill-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all var(--transition-fast);
  white-space: nowrap;
  flex-shrink: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}`;

const newNavPill = `.nav-pill-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 8px;
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all var(--transition-fast);
  white-space: nowrap;
  flex-shrink: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}`;
if (css.includes(targetNavPill)) {
  css = css.replace(targetNavPill, newNavPill);
}

// Update navbar-right-tools
const targetTools = `.navbar-right-tools {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}`;

const newTools = `.navbar-right-tools {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}`;
if (css.includes(targetTools)) {
  css = css.replace(targetTools, newTools);
}

fs.writeFileSync(appCssPath, css, 'utf8');
console.log('App.css navbar spacing tightened successfully');

