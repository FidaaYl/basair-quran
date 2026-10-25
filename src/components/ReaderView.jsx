import React, { useState, useRef, useEffect } from 'react';
import { 
  Pause, 
  BookOpenText, 
  Share2, 
  Copy, 
  Check, 
  Bookmark, 
  Languages, 
  ChevronRight,
  ChevronLeft,
  Search,
  Moon,
  Sun,
  Brain,
  GitCompare,
  Lightbulb,
  Type,
  AudioLines,
  Sparkles
} from 'lucide-react';
import { getSurahWordByWord } from '../services/quranApi';

export default function ReaderView({
  surahData,
  isLoading,
  error,
  currentAyahIndex,
  isPlaying,
  onPlayAyah,
  onOpenTafsir,
  onOpenCardModal,
  onSelectPrevSurah,
  onSelectNextSurah,
  onTriggerMemorize,
  onTriggerTadabbur,
  onTriggerMutashabihat,
  theme,
  setTheme,
  onOpenSurahSearch,
}) {
  const [fontSize, setFontSize] = useState(28);
  const [activeLangMode, setActiveLangMode] = useState('ar-en');
  const [copiedAyahNum, setCopiedAyahNum] = useState(null);
  const [isWbwActive, setIsWbwActive] = useState(false);
  const [wbwData, setWbwData] = useState({});

  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('basair_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  const ayahRefs = useRef([]);
  const wordAudioRef = useRef(new Audio());

  useEffect(() => {
    if (isWbwActive && surahData?.number) {
      getSurahWordByWord(surahData.number).then((data) => {
        setWbwData(data);
      });
    }
  }, [isWbwActive, surahData?.number]);

  useEffect(() => {
    if (isPlaying && ayahRefs.current[currentAyahIndex]) {
      ayahRefs.current[currentAyahIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [currentAyahIndex, isPlaying]);

  const handleCopyAyah = (ayah) => {
    const textToCopy = `${ayah.textAr} [سورة ${surahData.name}: آية ${ayah.numberInSurah}]`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAyahNum(ayah.numberInSurah);
    setTimeout(() => setCopiedAyahNum(null), 2000);
  };

  const toggleBookmark = (ayah) => {
    const key = `${surahData.number}:${ayah.numberInSurah}`;
    let updated;
    if (bookmarks.includes(key)) {
      updated = bookmarks.filter((k) => k !== key);
    } else {
      updated = [...bookmarks, key];
    }
    setBookmarks(updated);
    localStorage.setItem('basair_bookmarks', JSON.stringify(updated));
  };

  const handlePlayWordAudio = (audioUrl) => {
    if (!audioUrl) return;
    const a = wordAudioRef.current;
    a.src = audioUrl;
    a.play().catch(console.error);
  };

  if (isLoading) {
    return (
      <div className="reader-loading-state">
        <div className="loading-spinner-ornament">
          <span className="spinner-star">✦</span>
        </div>
        <p className="loading-text">جاري استرجاع السورة الكريمة من المصحف الشريف...</p>
      </div>
    );
  }

  if (error || !surahData) {
    return (
      <div className="reader-error-state">
        <p className="error-title">تعذر تحميل بيانات السورة</p>
        <p className="error-desc">يرجى التأكد من اتصالك بالإنترنت والمحاولة مجدداً.</p>
      </div>
    );
  }

  const isAtTawbah = surahData.number === 9;
  const isAlFatihah = surahData.number === 1;

  return (
    <div className="reader-container-modern">
      {/* 1. Surah Header Banner Card matching screenshot */}
      <div className="surah-header-card-screenshot">
        {/* Diamond Header & Nav */}
        <div className="header-diamond-row">
          <button
            onClick={onSelectPrevSurah}
            disabled={surahData.number <= 1}
            className="surah-prev-next-btn"
            title="السورة السابقة"
          >
            <ChevronRight size={16} />
            <span>السورة السابقة</span>
          </button>

          <div className="surah-diamond-title-wrap">
            <span className="diamond-star text-gold">❖</span>
            <h1 className="surah-diamond-name font-calligraphy">{surahData.name}</h1>
            <span className="diamond-star text-gold">❖</span>
          </div>

          <button
            onClick={onSelectNextSurah}
            disabled={surahData.number >= 114}
            className="surah-prev-next-btn"
            title="السورة التالية"
          >
            <span>السورة التالية</span>
            <ChevronLeft size={16} />
          </button>
        </div>

        {/* Metadata Badges (مكية / مدنية، آيات، ترتيبها) */}
        <div className="surah-badges-row-screenshot">
          <span className="badge-pill revelation">
            {surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
          </span>
          <span className="badge-pill count">{surahData.numberOfAyahs} آيات</span>
          <span className="badge-pill order">ترتيبها {surahData.number}</span>
        </div>

        <div className="diamond-bottom-divider">
          <span className="diamond-divider-point">❖</span>
        </div>

        {/* Toolbar matching user screenshot */}
        <div className="reader-toolbar-screenshot">
          {/* Search Trigger */}
          <button onClick={onOpenSurahSearch} className="tb-tool-btn search" title="بحث في السور">
            <Search size={16} />
          </button>

          {/* Theme Segmented Switch */}
          <div className="tb-segmented-theme">
            <button 
              onClick={() => setTheme?.('dark')} 
              className={`tb-theme-btn ${theme === 'dark' ? 'active' : ''}`}
              title="النمط الليلي"
            >
              <Moon size={14} />
            </button>
            <button 
              onClick={() => setTheme?.('light')} 
              className={`tb-theme-btn ${theme === 'light' ? 'active' : ''}`}
              title="النمط النهاري"
            >
              <Sun size={14} />
            </button>
            <span className="tb-theme-label">المظهر</span>
          </div>

          {/* Font Scale Pill */}
          <div className="tb-tool-dropdown font-scale">
            <button 
              onClick={() => setFontSize((s) => (s >= 36 ? 24 : s + 4))}
              className="tb-tool-pill" 
              title="تغيير حجم خط المصحف"
            >
              <Type size={14} />
              <span>{fontSize}px</span>
              <span className="tb-sublabel">حجم الخط</span>
            </button>
          </div>

          {/* Translation Dropdown */}
          <div className="tb-tool-dropdown translation">
            <Languages size={15} className="lang-icon-prefix" />
            <select
              value={activeLangMode}
              onChange={(e) => setActiveLangMode(e.target.value)}
              className="tb-translation-select"
            >
              <option value="ar-en">عربي + (English - Sahih)</option>
              <option value="ar-fr">عربي + (Français - Hamidullah)</option>
              <option value="ar">العربية فقط (المصحف الشريف)</option>
              <option value="all">الكل (English + French)</option>
            </select>
            <span className="tb-sublabel">الترجمة</span>
          </div>

          {/* Word by Word Mode */}
          <button
            onClick={() => setIsWbwActive(!isWbwActive)}
            className={`tb-tool-pill wbw ${isWbwActive ? 'active' : ''}`}
            title="تفعيل الترجمة كلمة بكلمة ونطق المفردات"
          >
            <Sparkles size={14} />
            <span>كلمة بكلمة</span>
          </button>
        </div>
      </div>

      {/* Basmala Banner */}
      {!isAtTawbah && !isAlFatihah && (
        <div className="basmala-banner-screenshot">
          <p className="basmala-text-screenshot font-quran">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        </div>
      )}

      {/* 2. Ayahs Cards Stream matching screenshot */}
      <div className="ayahs-stream-screenshot">
        {surahData.ayahs.map((ayah, index) => {
          const isCurrentActive = index === currentAyahIndex;
          const isBookmarked = bookmarks.includes(`${surahData.number}:${ayah.numberInSurah}`);
          const isCopied = copiedAyahNum === ayah.numberInSurah;
          const ayahWords = wbwData[ayah.numberInSurah] || null;

          return (
            <article
              key={ayah.number}
              ref={(el) => (ayahRefs.current[index] = el)}
              className={`ayah-card-screenshot ${isCurrentActive ? 'active-highlight' : ''}`}
              id={`ayah-${ayah.numberInSurah}`}
            >
              {/* Header: Ayah Index (Left) & Actions (Right) */}
              <div className="ayah-card-top-header">
                <span className="ayah-count-caption">
                  الآية {ayah.numberInSurah} من {surahData.numberOfAyahs}
                </span>

                <div className="ayah-action-icons-row">
                  <button
                    onClick={() => toggleBookmark(ayah)}
                    className={`card-tool-btn bookmark ${isBookmarked ? 'active' : ''}`}
                    title="حفظ علامة مرجعية"
                  >
                    <Bookmark size={15} />
                  </button>

                  <button
                    onClick={() => handleCopyAyah(ayah)}
                    className="card-tool-btn copy"
                    title="نسخ الآية"
                  >
                    {isCopied ? <Check size={15} className="text-emerald" /> : <Copy size={15} />}
                  </button>

                  <button
                    onClick={() => onPlayAyah(index)}
                    className={`card-tool-btn listen-btn ${isCurrentActive && isPlaying ? 'active' : ''}`}
                    title="استماع لهذه الآية"
                  >
                    {isCurrentActive && isPlaying ? <Pause size={14} /> : <AudioLines size={14} />}
                    <span>استماع</span>
                  </button>

                  <button
                    onClick={() => onOpenTafsir(surahData.number, ayah.numberInSurah, ayah.textAr)}
                    className="card-tool-btn tafsir-btn"
                    title="تفسير الميسر"
                  >
                    <BookOpenText size={14} />
                    <span>التفسير</span>
                  </button>

                  <button
                    onClick={() => onOpenCardModal(ayah, surahData)}
                    className="card-tool-btn share-btn"
                    title="مشاركة وتصميم بطاقة"
                  >
                    <Share2 size={14} />
                    <span>مشاركة</span>
                  </button>
                </div>
              </div>

              {/* Arabic Quranic Text */}
              <div className="ayah-body-arabic" style={{ fontSize: `${fontSize}px` }}>
                {isWbwActive && ayahWords ? (
                  <div className="wbw-words-container font-quran">
                    {ayahWords.map((word) => (
                      <span
                        key={word.id}
                        onClick={() => handlePlayWordAudio(word.audioUrl)}
                        className="wbw-word-interactive-unit"
                        title={`${word.translationEn} (${word.transliteration}) — اضغط للاستماع`}
                      >
                        <span className="wbw-word-arabic">{word.textUthmani}</span>
                        <span className="wbw-word-subtext">{word.translationEn}</span>
                      </span>
                    ))}
                    <span className="ayah-symbol-screenshot">
                      ۝ {ayah.numberInSurah.toLocaleString('ar-EG')}
                    </span>
                  </div>
                ) : (
                  <p className="ayah-arabic-text-flow font-quran">
                    {ayah.textAr}
                    <span className="ayah-symbol-screenshot" title={`آية ${ayah.numberInSurah}`}>
                      ۝ {ayah.numberInSurah.toLocaleString('ar-EG')}
                    </span>
                  </p>
                )}
              </div>

              {/* Translation */}
              {(activeLangMode === 'ar-en' || activeLangMode === 'all') && ayah.textEn && (
                <div className="ayah-translation-row-screenshot">
                  <span className="trans-tag">ENGLISH (SAHIH)</span>
                  <p className="trans-text">{ayah.textEn}</p>
                </div>
              )}

              {(activeLangMode === 'ar-fr' || activeLangMode === 'all') && ayah.textFr && (
                <div className="ayah-translation-row-screenshot fr">
                  <span className="trans-tag">FRANÇAIS (HAMIDULLAH)</span>
                  <p className="trans-text">{ayah.textFr}</p>
                </div>
              )}

              {/* Interactive Bottom Actions Bar on Active Ayah (matching screenshot) */}
              {isCurrentActive && (
                <div className="active-ayah-bottom-tools animate-fade-in">
                  <div className="active-pills-row">
                    <button onClick={onTriggerMemorize} className="active-action-pill memorize">
                      <Brain size={15} />
                      <span>احفظ</span>
                    </button>

                    <button onClick={onTriggerTadabbur} className="active-action-pill tadabbur">
                      <Lightbulb size={15} />
                      <span>التدبر</span>
                    </button>

                    <button onClick={onTriggerMutashabihat} className="active-action-pill mutashabihat">
                      <GitCompare size={15} />
                      <span>المتشابهات</span>
                    </button>
                  </div>

                  <div className="active-progress-wrap">
                    <span className="progress-fraction-badge">{ayah.numberInSurah} / {surahData.numberOfAyahs}</span>
                    <div className="ayah-mini-progress-track">
                      <div 
                        className="ayah-mini-progress-fill" 
                        style={{ width: `${(ayah.numberInSurah / surahData.numberOfAyahs) * 100}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
