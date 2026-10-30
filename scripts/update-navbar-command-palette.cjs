const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const navbarPath = path.join(rootDir, "src", "components", "Navbar.jsx");

let code = fs.readFileSync(navbarPath, "utf8").replace(/\r\n/g, "\n");

// Update props
const propsTarget = "onOpenSurahModal,\n  onOpenRestModal,";
const newProps =
  "onOpenSurahModal,\n  onOpenCommandPalette,\n  onOpenRestModal,";
if (!code.includes("onOpenCommandPalette")) {
  code = code.replace(propsTarget, newProps);
}

// Update search click handler to prioritize onOpenCommandPalette
const clickTarget = "onClick={onOpenSurahModal}";
const newClick =
  "onClick={() => onOpenCommandPalette ? onOpenCommandPalette() : onOpenSurahModal()}";
code = code.replace(clickTarget, newClick);

const keyTarget =
  "onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenSurahModal?.(); }}";
const newKey =
  "onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (onOpenCommandPalette) onOpenCommandPalette(); else onOpenSurahModal?.(); } }}";
code = code.replace(keyTarget, newKey);

fs.writeFileSync(navbarPath, code, "utf8");
console.log("Navbar.jsx updated successfully");
