const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appPath = path.join(rootDir, 'src', 'App.jsx');

let code = fs.readFileSync(appPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add CommandPalette import
const importTarget = "import UserProfileModal from './components/UserProfileModal';";
const newImport = importTarget + "\nimport CommandPalette from './components/CommandPalette';";
if (!code.includes('CommandPalette')) {
  code = code.replace(importTarget, newImport);
}

// 2. Add state
const stateTarget = "const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);";
const newState = stateTarget + "\n  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);";
if (!code.includes('isCommandPaletteOpen')) {
  code = code.replace(stateTarget, newState);
}

// 3. Add keyboard listener for Ctrl+K / Cmd+K
const hookTarget = "localStorage.setItem('basair_theme', theme);\n  }, [theme]);";
const newHook = hookTarget + "\n\n  // Global shortcut: Ctrl+K / Cmd+K opens unified Command Palette\n  useEffect(() => {\n    const handleGlobalKeyDown = (e) => {\n      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {\n        e.preventDefault();\n        setIsCommandPaletteOpen((prev) => !prev);\n      }\n    };\n    window.addEventListener('keydown', handleGlobalKeyDown);\n    return () => window.removeEventListener('keydown', handleGlobalKeyDown);\n  }, []);";
if (!code.includes('handleGlobalKeyDown')) {
  code = code.replace(hookTarget, newHook);
}

// 4. Pass onOpenCommandPalette to Navbar
const navbarTarget = "onOpenSurahModal={() => setIsSurahModalOpen(true)}";
const newNavbar = navbarTarget + "\n          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}";
if (!code.includes('onOpenCommandPalette')) {
  code = code.replace(navbarTarget, newNavbar);
}

// 5. Render CommandPalette modal
const renderTarget = "{/* User Profile Modal for Student Fidaa Yaalaoui */}";
const newRender = "{/* Unified Command Palette (Ctrl+K) */}\n      <CommandPalette\n        isOpen={isCommandPaletteOpen}\n        onClose={() => setIsCommandPaletteOpen(false)}\n        onSelectSurah={handleSelectSurah}\n        onNavigateTab={setActiveTab}\n        onOpenRestModal={() => setIsRestModalOpen(true)}\n        onOpenProfile={() => setIsProfileModalOpen(true)}\n      />\n\n      " + renderTarget;
if (!code.includes('<CommandPalette')) {
  code = code.replace(renderTarget, newRender);
}

fs.writeFileSync(appPath, code, 'utf8');
console.log('App.jsx update successful!');
