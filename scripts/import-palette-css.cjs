const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const palettePath = path.join(
  rootDir,
  "src",
  "components",
  "CommandPalette.jsx",
);

let code = fs.readFileSync(palettePath, "utf8").replace(/\r\n/g, "\n");

if (!code.includes("./CommandPalette.css")) {
  code = code.replace(
    "import { SCHOLARS_BOOKS } from '../data/scholarsBooks';",
    "import { SCHOLARS_BOOKS } from '../data/scholarsBooks';\nimport './CommandPalette.css';",
  );
  fs.writeFileSync(palettePath, code, "utf8");
  console.log("CommandPalette.css import added");
} else {
  console.log("Already imported");
}
