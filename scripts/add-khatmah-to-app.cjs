const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appPath = path.join(rootDir, 'src', 'App.jsx');

let code = fs.readFileSync(appPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add KhatmahPlannerView import
const importTarget = "import ScholarsLibraryView from './components/ScholarsLibraryView';";
const newImport = importTarget + "\nimport KhatmahPlannerView from './components/KhatmahPlannerView';";
if (!code.includes('KhatmahPlannerView')) {
  code = code.replace(importTarget, newImport);
}

// 2. Add Tab rendering
const tabTarget = `{activeTab === 'scholars' && (
              <ScholarsLibraryView />
            )}`;

const newTab = tabTarget + `\n\n            {activeTab === 'khatmah' && (
              <KhatmahPlannerView
                onNavigateToSurah={(surahNum) => {
                  handleSelectSurah(surahNum);
                  setActiveTab('reader');
                }}
              />
            )}`;

if (!code.includes("activeTab === 'khatmah'")) {
  code = code.replace(tabTarget, newTab);
}

fs.writeFileSync(appPath, code, 'utf8');
console.log('App.jsx updated with KhatmahPlannerView route');

