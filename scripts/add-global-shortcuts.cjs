const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const appPath = path.join(rootDir, 'src', 'App.jsx');

let code = fs.readFileSync(appPath, 'utf8').replace(/\r\n/g, '\n');

// 1. Add MihrabFocusMode & ShortcutsHelp import if not present
if (!code.includes('KeyboardShortcutsHelpModal')) {
  code = code.replace(
    "import CommandPalette from './components/CommandPalette';",
    "import CommandPalette from './components/CommandPalette';\nimport KeyboardShortcutsHelpModal from './components/KeyboardShortcutsHelpModal';\nimport MihrabFocusMode from './components/MihrabFocusMode';"
  );
}

// 2. Add state for shortcuts modal & mihrab mode
if (!code.includes('isShortcutsModalOpen')) {
  code = code.replace(
    "const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);",
    "const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);\n  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);\n  const [isMihrabModeOpen, setIsMihrabModeOpen] = useState(false);"
  );
}

// 3. Global shortcuts listener
const oldHook = `  // Global shortcut: Ctrl+K / Cmd+K opens unified Command Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);`;

const newHook = `  // Global shortcuts listener (Space, Arrows, F, T, S, ?, Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Ignore if user is currently typing inside an input or textarea
      const tag = e.target?.tagName?.toLowerCase();
      const isInput = tag === 'input' || tag === 'textarea' || e.target?.isContentEditable;

      // 1. Command Palette (Ctrl+K / Cmd+K)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
        return;
      }

      if (isInput) return;

      // 2. Space = Play / Pause audio
      if (e.key === ' ') {
        e.preventDefault();
        handleTogglePlay();
      }
      // 3. ArrowLeft / ArrowRight = Next / Previous Ayah
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handleNextAyah();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handlePrevAyah();
      }
      // 4. 'F' or 'f' = Mihrab Focus Mode
      else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsMihrabModeOpen((prev) => !prev);
      }
      // 5. 'T' or 't' = Tafsir Al-Muyassar for current Ayah
      else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        if (surahData && surahData.ayahs && surahData.ayahs[currentAyahIndex]) {
          const ayah = surahData.ayahs[currentAyahIndex];
          handleOpenTafsir(currentSurahNumber, ayah.numberInSurah, surahData.name, ayah.textAr);
        }
      }
      // 6. 'S' or 's' = Ayah Card Studio
      else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (surahData && surahData.ayahs && surahData.ayahs[currentAyahIndex]) {
          handleOpenCardModal(surahData.ayahs[currentAyahIndex], surahData);
        }
      }
      // 7. '?' = Shortcuts Cheat Sheet
      else if (e.key === '?') {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [surahData, currentAyahIndex, currentSurahNumber, isPlaying]);`;

if (code.includes(oldHook)) {
  code = code.replace(oldHook, newHook);
}

// 4. Render MihrabFocusMode & ShortcutsHelpModal
const modalRender = `{/* Shortcuts Help Modal */}
      <KeyboardShortcutsHelpModal
        isOpen={isShortcutsModalOpen}
        onClose={() => setIsShortcutsModalOpen(false)}
      />

      {/* Mihrab Focus Mode Fullscreen */}
      <MihrabFocusMode
        isOpen={isMihrabModeOpen}
        onClose={() => setIsMihrabModeOpen(false)}
        surahData={surahData}
        currentAyahIndex={currentAyahIndex}
        onSelectAyah={(idx) => setCurrentAyahIndex(idx)}
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        selectedReciter={selectedReciter}
      />\n\n      {/* Unified Command Palette (Ctrl+K) */}`;

if (!code.includes('<KeyboardShortcutsHelpModal')) {
  code = code.replace('{/* Unified Command Palette (Ctrl+K) */}', modalRender);
}

fs.writeFileSync(appPath, code, 'utf8');
console.log('App.jsx updated with all power-user keyboard shortcuts and Mihrab mode!');

