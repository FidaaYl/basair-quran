import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import SidebarLeft from './components/SidebarLeft';
import SidebarRight from './components/SidebarRight';
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
  const [activeTab, setActiveTab] = useState('reader');
  const [theme, setTheme] = useState(() => localStorage.getItem('basair_theme') || 'light');

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

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('basair_theme', theme);
  }, [theme]);

  // Load Surah details
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

  // Audio event listeners
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

  // Audio source update
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

  // Audio Handlers
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
    const sNum = surahNum || currentSurahNumber;
    const aNum = ayahNum || (currentAyahIndex + 1);
    const text = ayahTxt || (surahData?.ayahs[currentAyahIndex]?.textAr || '');
    setTafsirModal({
      isOpen: true,
      surahNumber: sNum,
      ayahNumber: aNum,
      surahName: surahData ? surahData.name : '',
      ayahText: text,
    });
  };

  // Ayah Card Modal Handler
  const handleOpenCardModal = (ayah, surah) => {
    const a = ayah || (surahData?.ayahs[currentAyahIndex]);
    const s = surah || surahData;
    setCardModal({
      isOpen: true,
      ayah: a,
      surah: s,
    });
  };

  const currentSurahMeta = SURAHS_LIST.find((s) => s.number === currentSurahNumber);

  return (
    <div className="basair-master-app-container">
      {/* 3-Column Master Application Grid */}
      <div className="app-layout-3col">
        {/* Left Navigation Sidebar with Logo & Spiritual Quote */}
        <SidebarLeft
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenBookmarks={() => setIsSurahModalOpen(true)}
          onOpenSurahModal={() => setIsSurahModalOpen(true)}
        />

        {/* Center Main Stage (Header + Content Views) */}
        <div className="center-stage-column">
          {/* Top Bar matching screenshot */}
          <Navbar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            theme={theme}
            setTheme={setTheme}
            onOpenSurahModal={() => setIsSurahModalOpen(true)}
            onOpenRestModal={() => setIsRestModalOpen(true)}
            currentSurah={currentSurahMeta}
          />

          {/* Active View Router */}
          <main className="center-main-scrollable">
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
                onTriggerMemorize={() => setActiveTab('memorize')}
                onTriggerTadabbur={() => setActiveTab('tadabbur')}
                onTriggerMutashabihat={() => setActiveTab('mutashabihat')}
                theme={theme}
                setTheme={setTheme}
                onOpenSurahSearch={() => setIsSurahModalOpen(true)}
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
          </main>
        </div>

        {/* Right Sidebar (Daily Wird, Quick Tools, Favorite Reciters) */}
        <SidebarRight
          currentSurah={currentSurahMeta}
          currentAyahIndex={currentAyahIndex}
          totalAyahs={surahData ? surahData.numberOfAyahs : 7}
          selectedReciter={selectedReciter}
          onSelectReciter={handleSelectReciter}
          setActiveTab={setActiveTab}
          onOpenCardModal={() => handleOpenCardModal()}
          onOpenTafsir={() => handleOpenTafsir()}
          isPlaying={isPlaying}
          onTogglePlay={handleTogglePlay}
        />
      </div>

      {/* Modern Bottom Audio Dock matching screenshot */}
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

      {/* REST API Explorer & Diagnostics Modal */}
      <RestApiExplorerModal
        isOpen={isRestModalOpen}
        onClose={() => setIsRestModalOpen(false)}
      />
    </div>
  );
}
