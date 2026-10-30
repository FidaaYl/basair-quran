const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appCssPath = path.join(rootDir, 'src', 'App.css');

let css = fs.readFileSync(appCssPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Replace .navbar-inner
const targetInner = `.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  direction: ltr;
  width: 100%;
  min-width: 0;
}`;

const newInner = `.navbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  direction: ltr;
  width: 100%;
  min-width: 0;
}`;
if (css.includes(targetInner)) {
  css = css.replace(targetInner, newInner);
}

// 2. Replace .navbar-search-wrapper
const targetSearch = `.navbar-search-wrapper {
  position: relative;
  width: 100%;
  max-width: 200px;
  min-width: 130px;
  display: flex;
  align-items: center;
  background-color: var(--bg-surface-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  padding: 5px 12px;
  cursor: pointer;
  transition: all var(--transition-fast);
  direction: rtl;
  flex-shrink: 1;
}`;

const newSearch = `.navbar-search-wrapper {
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
if (css.includes(targetSearch)) {
  css = css.replace(targetSearch, newSearch);
}

// 3. Replace .navbar-nav-pills and .nav-pill-btn
const targetNavPills = `.navbar-nav-pills {
  display: flex;
  align-items: center;
  gap: 3px;
  background-color: var(--bg-surface-elevated);
  padding: 3px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  flex-shrink: 1;
  overflow-x: auto;
  scrollbar-width: none;
  max-width: calc(100vw - 420px);
}

.navbar-nav-pills::-webkit-scrollbar {
  display: none;
}

.nav-pill-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: var(--radius-full);
  font-size: 12px;
  color: var(--text-secondary);
  font-weight: 500;
  transition: all var(--transition-fast);
  white-space: nowrap;
  flex-shrink: 0;
}`;

const newNavPills = `.navbar-nav-pills {
  display: flex;
  align-items: center;
  gap: 2px;
  background-color: var(--bg-surface-elevated);
  padding: 3px 4px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  flex-shrink: 0;
  overflow: visible;
}

.navbar-nav-pills::-webkit-scrollbar {
  display: none;
}

.nav-pill-btn {
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
if (css.includes(targetNavPills)) {
  css = css.replace(targetNavPills, newNavPills);
}

fs.writeFileSync(appCssPath, css, 'utf8');
console.log('Successfully updated App.css navbar layout!');

