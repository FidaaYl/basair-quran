const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const appCssPath = path.join(rootDir, "src", "App.css");

let code = fs.readFileSync(appCssPath, "utf8").replace(/\r\n/g, "\n");

// 1. Give navbar-nav-pills better flex breathing room
const targetPills = `.navbar-nav-pills {
  display: flex;
  align-items: center;
  gap: 4px;
  background-color: var(--bg-surface-elevated);
  padding: 3px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-subtle);
  flex-shrink: 1;
  overflow-x: auto;
  scrollbar-width: none;
}`;

const newPills = `.navbar-nav-pills {
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
}`;

if (code.includes(targetPills)) {
  code = code.replace(targetPills, newPills);
}

// 2. Adjust nav-pill-btn padding from 6px 11px to 5px 9px so 6 items fit comfortably without clipping
const targetBtn = `.nav-pill-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 11px;
  border-radius: var(--radius-full);
  font-size: 12px;`;

const newBtn = `.nav-pill-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: var(--radius-full);
  font-size: 12px;`;

if (code.includes(targetBtn)) {
  code = code.replace(targetBtn, newBtn);
}

fs.writeFileSync(appCssPath, code, "utf8");
console.log("App.css navbar spacing adjusted");
