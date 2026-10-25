import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import ReaderView from './components/ReaderView';
import MemorizationStudio from './components/MemorizationStudio';
import MutashabihatView from './components/MutashabihatView';
import TadabburView from './components/TadabburView';
import ScholarsLibraryView from './components/ScholarsLibraryView';
import AudioPlayerBar from './components/AudioPlayerBar';
import SurahListModal from './components/SurahListModal';
import TafsirModal from './components/TafsirModal';
import AyahCardModal from './components/AyahCardModal';
import RestApiExplorerModal from './components/RestApiExplorerModal';

import { getSurahDetails } from './services/quranApi';
import { getAyahAudioUrl } from './data/reciters';
import { SURAHS_LIST } from './data/surahsList';

export default function App() {
  // Navigation & Theme
  const [activeTab, setActiveTab] = useState('reader');
  const [theme, setTheme] = useState(() => localStorage.getItem('basair_theme') || 'dark');

  // Surah & Ayahs state
  const [currentSurahNumber, setCurrentSurahNumber] = useState(1);
  const [surahData, setSurahData] = useState(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState(true);
  const [surahError, setSurahError] = useState(null);

  // Audio Player State
  const audioRef = useRef(new Audio());
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [selectedReciter, setSelectedReciter] = useState(() => localStorage.getItem('basair_reciter') || 'ar.alafasy');
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isRepeatAyah, setIsRepeatAyah] = useState(false);

  // Modals state
  const [isSurahModalOpen, setIsSurahModalOpen] = useState(false);
  const [isRestModalOpen, setIsRestModalOpen] = useState(false);
  const [tafsirModal, setTafsirModal] = useState({ isOpen: false, surahNumber: 1, ayahNumber: 1, surahName: '', ayahText: '' });
  const [cardModal, setCardModal] = useState({ isOpen: false, ayah: null, surah: null });

  // Sync theme with DOM documentElement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('basair_theme', theme);
  }, [theme]);

  // Load Surah details when currentSurahNumber changes
  useEffect(() => {
    let isSubscribed = true;
    setIsLoadingSurah(true);
    setSurahError(null);

    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setCurrentAyahIndex(0);

    getSurahDetails(currentSurahNumber)
      .then((data) => {
        if (isSubscribed) {
          setSurahData(data);
          setIsLoadingSurah(false);
        }
      })
      .catch((err) => {
        if (isSubscribed) {
          setSurahError(err.message || 'Error loading Surah');
          setIsLoadingSurah(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [currentSurahNumber]);

  // Configure HTML5 Audio events
  useEffect(() => {
    const audio = audioRef.current;

    const handleEnded = () => {
      if (isRepeatAyah) {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        if (surahData && currentAyahIndex < surahData.ayahs.length - 1) {
          setCurrentAyahIndex((prev) => prev + 1);
        } else {
          setIsPlaying(false);
        }
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    return () => {
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [isRepeatAyah, surahData, currentAyahIndex]);

  // Handle Audio source updates
  useEffect(() => {
    if (!surahData || !surahData.ayahs || surahData.ayahs.length === 0) return;
    const currentAyah = surahData.ayahs[currentAyahIndex];
    if (!currentAyah) return;

    const audioUrl = getAyahAudioUrl(selectedReciter, currentAyah.number);
    const audio = audioRef.current;

    if (audio.src !== audioUrl) {
      const wasPlaying = isPlaying;
      audio.src = audioUrl;
      audio.playbackRate = playbackRate;
      if (wasPlaying) {
        audio.play().catch((e) => {
          console.warn('Audio play interrupted:', e);
          setIsPlaying(false);
        });
      }
    }
  }, [currentAyahIndex, selectedReciter, surahData]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Audio Control Handlers
  const handleTogglePlay = () => {
    if (!surahData || !surahData.ayahs[currentAyahIndex]) return;
    const audio = audioRef.current;

    if (isPlaying) {
      audio.pause();
    } else {
      const currentAyah = surahData.ayahs[currentAyahIndex];
      const audioUrl = getAyahAudioUrl(selectedReciter, currentAyah.number);
      if (audio.src !== audioUrl) {
        audio.src = audioUrl;
      }
      audio.playbackRate = playbackRate;
      audio.play().catch((e) => {
        console.error('Audio play error:', e);
        setIsPlaying(false);
      });
    }
  };

  const handlePlaySpecificAyah = (index) => {
    setCurrentAyahIndex(index);
    if (!surahData || !surahData.ayahs[index]) return;
    const ayah = surahData.ayahs[index];
    const audio = audioRef.current;
    const audioUrl = getAyahAudioUrl(selectedReciter, ayah.number);

    audio.src = audioUrl;
    audio.playbackRate = playbackRate;
    audio.play()
      .then(() => setIsPlaying(true))
      .catch((e) => {
        console.error('Play specific ayah error:', e);
        setIsPlaying(false);
      });
  };

  const handleNextAyah = () => {
    if (surahData && currentAyahIndex < surahData.ayahs.length - 1) {
      handlePlaySpecificAyah(currentAyahIndex + 1);
    }
  };

  const handlePrevAyah = () => {
    if (currentAyahIndex > 0) {
      handlePlaySpecificAyah(currentAyahIndex - 1);
    }
  };

  const handleSelectReciter = (reciterId) => {
    setSelectedReciter(reciterId);
    localStorage.setItem('basair_reciter', reciterId);
  };

  // Surah Navigation
  const handleSelectSurah = (surahNumber) => {
    setCurrentSurahNumber(surahNumber);
  };

  const handleSelectPrevSurah = () => {
    if (currentSurahNumber > 1) {
      setCurrentSurahNumber((n) => n - 1);
    }
  };

  const handleSelectNextSurah = () => {
    if (currentSurahNumber < 114) {
      setCurrentSurahNumber((n) => n + 1);
    }
  };

  // Tafsir Modal Handler
  const handleOpenTafsir = (surahNum, ayahNum, ayahTxt) => {
    setTafsirModal({
      isOpen: true,
      surahNumber: surahNum,
      ayahNumber: ayahNum,
      surahName: surahData ? surahData.name : '',
      ayahText: ayahTxt,
    });
  };

  // Ayah Card Modal Handler
  const handleOpenCardModal = (ayah, surah) => {
    setCardModal({
      isOpen: true,
      ayah,
      surah,
    });
  };

  const currentSurahMeta = SURAHS_LIST.find((s) => s.number === currentSurahNumber);

  return (
    <div className="app-container">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        onOpenSurahModal={() => setIsSurahModalOpen(true)}
        onOpenRestModal={() => setIsRestModalOpen(true)}
        currentSurah={currentSurahMeta}
      />

      {/* Main View Router */}
      <main className="main-content">
        <div className="content-wrapper">
          {activeTab === 'reader' && (
            <ReaderView
              surahData={surahData}
              isLoading={isLoadingSurah}
              error={surahError}
              currentAyahIndex={currentAyahIndex}
              isPlaying={isPlaying}
              onPlayAyah={handlePlaySpecificAyah}
              onOpenTafsir={handleOpenTafsir}
              onOpenCardModal={handleOpenCardModal}
              onSelectPrevSurah={handleSelectPrevSurah}
              onSelectNextSurah={handleSelectNextSurah}
            />
          )}

          {activeTab === 'memorize' && (
            <MemorizationStudio
              surahData={surahData}
              onSelectSurah={handleSelectSurah}
            />
          )}

          {activeTab === 'mutashabihat' && (
            <MutashabihatView
              onSelectSurah={(surahNum) => {
                handleSelectSurah(surahNum);
                setActiveTab('reader');
              }}
            />
          )}

          {activeTab === 'tadabbur' && (
            <TadabburView
              onSelectSurah={(surahNum) => {
                handleSelectSurah(surahNum);
                setActiveTab('reader');
              }}
              onOpenCardModal={handleOpenCardModal}
            />
          )}

          {activeTab === 'scholars' && (
            <ScholarsLibraryView />
          )}
        </div>
      </main>

      {/* Persistent Audio Dock Bar */}
      <AudioPlayerBar
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        currentSurah={currentSurahMeta}
        currentAyahIndex={currentAyahIndex}
        onNextAyah={handleNextAyah}
        onPrevAyah={handlePrevAyah}
        selectedReciter={selectedReciter}
        onSelectReciter={handleSelectReciter}
        playbackRate={playbackRate}
        onChangePlaybackRate={setPlaybackRate}
        isRepeatAyah={isRepeatAyah}
        onToggleRepeatAyah={() => setIsRepeatAyah((prev) => !prev)}
        totalAyahs={surahData ? surahData.numberOfAyahs : 0}
      />

      {/* Surahs Explorer Modal */}
      <SurahListModal
        isOpen={isSurahModalOpen}
        onClose={() => setIsSurahModalOpen(false)}
        onSelectSurah={handleSelectSurah}
        currentSurahNumber={currentSurahNumber}
      />

      {/* Tafsir Al-Muyassar Drawer */}
      <TafsirModal
        isOpen={tafsirModal.isOpen}
        onClose={() => setTafsirModal((prev) => ({ ...prev, isOpen: false }))}
        surahNumber={tafsirModal.surahNumber}
        ayahNumber={tafsirModal.ayahNumber}
        surahName={tafsirModal.surahName}
        ayahText={tafsirModal.ayahText}
      />

      {/* Ayah Card Studio Modal */}
      <AyahCardModal
        isOpen={cardModal.isOpen}
        onClose={() => setCardModal((prev) => ({ ...prev, isOpen: false }))}
        ayah={cardModal.ayah}
        surah={cardModal.surah}
      />

      {/* REST API Explorer & Diagnostics Modal (TryHackMe REST course demonstration) */}
      <RestApiExplorerModal
        isOpen={isRestModalOpen}
        onClose={() => setIsRestModalOpen(false)}
      />
    </div>
  );
}
