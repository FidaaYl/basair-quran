import React, { useState, useRef, useEffect } from 'react';
import { 
  ICONS, 
  IslamicRosette, 
  VerseMedallion, 
  OrnamentalDivider, 
  RosetteSpinner 
} from './common/IconSystem';
import { getSurahWordByWord } from '../services/quranApi';
import MihrabFocusMode from './MihrabFocusMode';
import ContinuousMushafView from './ContinuousMushafView';
import ComparativeTafsirView from './ComparativeTafsirView';
import WordMorphologyModal from './WordMorphologyModal';
import { analyzeWordMorphology } from '../services/arabicMorphology';
import AIVoiceReciterModal from './AIVoiceReciterModal';

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
  selectedReciter,
  onTogglePlay,
}) {
  const [readerMode, setReaderMode] = useState('stream');
  const [fontSize, setFontSize] = useState(28);
  const [activeLangMode, setActiveLangMode] = useState('ar-en');
  const [copiedAyahNum, setCopiedAyahNum] = useState(null);
  const [isWbwActive, setIsWbwActive] = useState(false);
  const [wbwData, setWbwData] = useState({});
  const [isMihrabOpen, setIsMihrabOpen] = useState(false);
  const [maskingLevel, setMaskingLevel] = useState(0);
  const [revealedAyahs, setRevealedAyahs] = useState(new Set());
  const [selectedWordMorphology, setSelectedWordMorphology] = useState(null);
  const [isAIReciterOpen, setIsAIReciterOpen] = useState(false);

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

  const handleWordClick = (word) => {
    const analysis = analyzeWordMorphology(word);
    setSelectedWordMorphology(analysis);
    if (word.audioUrl) {
      handlePlayWordAudio(word.audioUrl);
    }
  };

  const toggleRevealAyah = (ayahNum) => {
    setRevealedAyahs((prev) => {
      const next = new Set(prev);
      if (next.has(ayahNum)) {
        next.delete(ayahNum);
      } else {
        next.add(ayahNum);
      }
      return next;
    });
  };

  const handleToggleRevealAll = () => {
    if (!surahData?.ayahs) return;
    if (revealedAyahs.size === surahData.ayahs.length) {
      setRevealedAyahs(new Set());
    } else {
      setRevealedAyahs(new Set(surahData.ayahs.map((a) => a.numberInSurah)));
    }
  };

  if (isLoading) {
    return (
      <div className="reader-loading-state" role="status" aria-live="polite">
        <div className="loading-spinner-ornament">
          <RosetteSpinner size={32} className="text-emerald" />
        </div>
        <p className="loading-text">جاري استرجاع السورة الكريمة من المصحف الشريف...</p>
      </div>
    );
  }

  if (error || !surahData) {
    return (
      <div className="reader-error-state" role="alert">
        <p className="error-title">تعذر تحميل بيانات السورة</p>
        <p className="error-desc">يرجى التأكد من اتصالك بالإنترنت والمحاولة مجدداً.</p>
      </div>
    );
  }

  const isAtTawbah = surahData.number === 9;
  const isAlFatihah = surahData.number === 1;

  const ChevronRightIcon = ICONS.chevronRight;
  const ChevronLeftIcon = ICONS.chevronLeft;
  const SearchIcon = ICONS.search;
  const MoonIcon = ICONS.themeDark;
  const SunIcon = ICONS.themeLight;
  const TypeIcon = ICONS.type;
  const LanguagesIcon = ICONS.translation;
  const BookOpenIcon = ICONS.mushaf;
  const BookmarkIcon = ICONS.bookmarks;
  const CopyIcon = ICONS.copy;
  const CheckIcon = ICONS.check;
  const AudioLinesIcon = ICONS.audio;
  const PauseIcon = ICONS.pause;
  const TafsirIcon = ICONS.tafsir;
  const ShareIcon = ICONS.share;
  const BrainIcon = ICONS.memorize;
  const LightbulbIcon = ICONS.tadabbur;
  const GitCompareIcon = ICONS.mutashabihat;
  const EyeIcon = ICONS.eye;
  const EyeOffIcon = ICONS.eyeOff;
  const SparklesIcon = ICONS.sparkles;

  const renderMaskedAyahContent = (ayah) => {
    const isRevealed = revealedAyahs.has(ayah.numberInSurah);
    const words = ayah.textAr ? ayah.textAr.trim().split(/\s+/) : [];

    if (maskingLevel === 1) {
      if (isRevealed) {
        return (
          <div className="masked-ayah-revealed animate-fade-in" onClick={() => toggleRevealAyah(ayah.numberInSurah)}>
            <span className="masked-success-badge">✓ مكشوفة (انقر لإعادة الحجب)</span>
            <p className="ayah-arabic-text-flow font-quran">{ayah.textAr}</p>
          </div>
        );
      }
      const promptWords = words.slice(0, 2).join(' ');
      return (
        <div 
          className="masked-first-words-wrap" 
          onClick={() => toggleRevealAyah(ayah.numberInSurah)}
          title="انقر لإظهار بقية الآية والتأكد من حفظك"
        >
          <span className="first-words-prompt font-quran">{promptWords}</span>
          <span className="masked-dots-stream font-quran">
            {' ····· '.repeat(Math.max(2, Math.min(6, words.length - 2)))}
          </span>
          <span className="masked-click-hint font-sans">
            <EyeIcon size={13} /> اكشف البقية ({Math.max(0, words.length - 2)} كلمات)
          </span>
        </div>
      );
    }

    if (maskingLevel === 2) {
      if (isRevealed) {
        return (
          <div className="masked-ayah-revealed animate-fade-in" onClick={() => toggleRevealAyah(ayah.numberInSurah)}>
            <span className="masked-success-badge">✓ تم استذكارها (انقر لإعادة الحجب)</span>
            <p className="ayah-arabic-text-flow font-quran">{ayah.textAr}</p>
          </div>
        );
      }
      return (
        <div 
          className="masked-tap-card" 
          onClick={() => toggleRevealAyah(ayah.numberInSurah)}
          role="button"
          tabIndex={0}
          title="انقر لكشف الآية واختبار حفظك"
        >
          <div className="masked-tap-ornament">
            <IslamicRosette size={24} className="text-gold" />
          </div>
          <div className="masked-tap-content">
            <span className="masked-tap-title font-quran">۞ انقر هنا للكشف عن الآية واختبار حفظك ۞</span>
            <span className="masked-tap-desc">({words.length} كلمات — استذكرها في سرّك ثم اكشفها)</span>
          </div>
          <div className="masked-tap-action">
            <EyeIcon size={16} />
            <span>كشف</span>
          </div>
        </div>
      );
    }

    if (maskingLevel === 3) {
      if (isRevealed) {
        return (
          <div className="masked-ayah-revealed animate-fade-in" onClick={() => toggleRevealAyah(ayah.numberInSurah)}>
            <span className="masked-success-badge">✓ مكشوفة</span>
            <p className="ayah-arabic-text-flow font-quran">{ayah.textAr}</p>
          </div>
        );
      }
      return (
        <div 
          className="masked-blind-card" 
          onClick={() => toggleRevealAyah(ayah.numberInSurah)}
          title="تسميع غيبي — اضغط للاختبار والتحقق"
        >
          <div className="masked-blind-silhouette font-quran">
            {ayah.textAr}
          </div>
          <div className="masked-blind-overlay">
            <EyeOffIcon size={18} />
            <span>تسميع غيبي • اضغط للكشف والتحقق</span>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="reader-container-modern">
      {/* Feature 3: One Bar • Three Modes Segmented Control (Mushaf Eqraa paradigm) */}
      <div className="reader-mode-segmented-bar" role="tablist" aria-label="أنماط عرض المصحف">
        <button
          role="tab"
          aria-selected={readerMode === 'stream'}
          onClick={() => setReaderMode('stream')}
          className={`reader-mode-btn ${readerMode === 'stream' ? 'active' : ''}`}
        >
          <BookOpenIcon size={16} />
          <span>بطاقات الآيات</span>
        </button>

        <button
          role="tab"
          aria-selected={readerMode === 'mushaf'}
          onClick={() => setReaderMode('mushaf')}
          className={`reader-mode-btn ${readerMode === 'mushaf' ? 'active' : ''}`}
        >
          <SparklesIcon size={16} />
          <span>صفحة المصحف</span>
        </button>

        <button
          role="tab"
          aria-selected={readerMode === 'tafsir'}
          onClick={() => setReaderMode('tafsir')}
          className={`reader-mode-btn ${readerMode === 'tafsir' ? 'active' : ''}`}
        >
          <TafsirIcon size={16} />
          <span>التفسير المقارن</span>
        </button>
      </div>

      {/* Mode 2: Continuous Medina Mushaf Page */}
      {readerMode === 'mushaf' && (
        <ContinuousMushafView
          surahData={surahData}
          currentAyahIndex={currentAyahIndex}
          isPlaying={isPlaying}
          onPlayAyah={onPlayAyah}
          onOpenTafsir={onOpenTafsir}
          onOpenCardModal={onOpenCardModal}
          fontSize={fontSize}
        />
      )}

      {/* Mode 3: Split Comparative Classical Tafsir */}
      {readerMode === 'tafsir' && (
        <ComparativeTafsirView
          surahData={surahData}
          currentAyahIndex={currentAyahIndex}
          onPlayAyah={onPlayAyah}
          isPlaying={isPlaying}
        />
      )}

      {/* Mode 1: Verses Cards Stream with Toolbar, Active Recall Masking, and WBW */}
      {readerMode === 'stream' && (
        <>
          {/* 1. Surah Header Banner Card */}
          <div className="surah-header-card-screenshot">
        {/* Header with Navigation and Authentic Islamic Rosette */}
        <div className="header-diamond-row">
          <button
            onClick={onSelectPrevSurah}
            disabled={surahData.number <= 1}
            className="surah-prev-next-btn"
            title="السورة السابقة"
            aria-label="السورة السابقة"
          >
            <ChevronRightIcon size={18} strokeWidth={1.8} />
            <span>السورة السابقة</span>
          </button>

          <div className="surah-diamond-title-wrap">
            <IslamicRosette size={20} className="text-gold" />
            <h1 className="surah-diamond-name font-calligraphy">{surahData.name}</h1>
            <IslamicRosette size={20} className="text-gold" />
          </div>

          <button
            onClick={onSelectNextSurah}
            disabled={surahData.number >= 114}
            className="surah-prev-next-btn"
            title="السورة التالية"
            aria-label="السورة التالية"
          >
            <span>السورة التالية</span>
            <ChevronLeftIcon size={18} strokeWidth={1.8} />
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

        {/* Subtle Islamic Divider */}
        <OrnamentalDivider className="text-gold" />

        {/* Toolbar matching user screenshot */}
        <div className="reader-toolbar-screenshot" role="toolbar" aria-label="أدوات القراءة والترجمة">
          {/* Search Trigger */}
          <button 
            onClick={onOpenSurahSearch} 
            className="tb-tool-btn search" 
            title="بحث في السور (Ctrl + K)"
            aria-label="بحث في سور القرآن الكريم"
          >
            <SearchIcon size={18} strokeWidth={1.8} />
          </button>

          {/* Theme Segmented Switch */}
          <div className="tb-segmented-theme" role="radiogroup" aria-label="مظهر القراءة">
            <button 
              onClick={() => setTheme?.('dark')} 
              className={`tb-theme-btn ${theme === 'dark' ? 'active' : ''}`}
              title="النمط الليلي"
              aria-label="النمط الليلي"
              role="radio"
              aria-checked={theme === 'dark'}
            >
              <MoonIcon size={15} strokeWidth={1.8} />
            </button>
            <button 
              onClick={() => setTheme?.('light')} 
              className={`tb-theme-btn ${theme === 'light' ? 'active' : ''}`}
              title="النمط النهاري"
              aria-label="النمط النهاري"
              role="radio"
              aria-checked={theme === 'light'}
            >
              <SunIcon size={15} strokeWidth={1.8} />
            </button>
            <span className="tb-theme-label">المظهر</span>
          </div>

          {/* Font Scale Pill */}
          <div className="tb-tool-dropdown font-scale">
            <button 
              onClick={() => setFontSize((s) => (s >= 36 ? 24 : s + 4))}
              className="tb-tool-pill" 
              title="تغيير حجم خط المصحف"
              aria-label={`حجم الخط الحالي ${fontSize} بكسل، اضغط للتغيير`}
            >
              <TypeIcon size={16} strokeWidth={1.8} />
              <span>{fontSize}px</span>
              <span className="tb-sublabel">حجم الخط</span>
            </button>
          </div>

          {/* Translation Dropdown */}
          <div className="tb-tool-dropdown translation">
            <LanguagesIcon size={16} strokeWidth={1.8} className="lang-icon-prefix" />
            <select
              value={activeLangMode}
              onChange={(e) => setActiveLangMode(e.target.value)}
              className="tb-translation-select"
              aria-label="اختيار لغة الترجمة المصاحبة"
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
            aria-pressed={isWbwActive}
          >
            <BookOpenIcon size={16} strokeWidth={1.8} />
            <span>كلمة بكلمة</span>
          </button>

          {/* Mihrab Focus & Zen Mode Button (Feature 1) */}
          <button
            onClick={() => setIsMihrabOpen(true)}
            className="tb-tool-btn mihrab-focus-trigger"
            title="تفعيل نمط الخلوة والمحراب للخشوع والتركيز بدون مشتتات"
            aria-label="نمط الخلوة والمحراب"
          >
            <SparklesIcon size={14} strokeWidth={1.8} />
            <span>خلوة المحراب</span>
          </button>

          {/* Feature 5: AI Voice Reciter Trigger Button */}
          <button
            onClick={() => setIsAIReciterOpen(true)}
            className="tb-tool-btn ai-reciter-trigger"
            title="تفعيل مُعِين التسميع الذكي بالصوت والذكاء الاصطناعي (مثل Tarteel.ai)"
            aria-label="تسميع ذكي بالصوت"
          >
            <SparklesIcon size={14} strokeWidth={2} />
            <span>تسميع ذكي بالصوت</span>
          </button>

          {/* Dynamic Verse Masking & Active Recall Segmented Pill (Feature 2) */}
          <div className="tb-masking-control" role="group" aria-label="مستوى حجب الآيات للتسميع">
            <span className="tb-masking-label">
              <EyeOffIcon size={13} /> حجب الحفظ:
            </span>
            <button 
              className={`tb-mask-btn ${maskingLevel === 0 ? 'active' : ''}`}
              onClick={() => setMaskingLevel(0)}
              title="قراءة عادية بدون حجب"
            >
              عادي
            </button>
            <button 
              className={`tb-mask-btn ${maskingLevel === 1 ? 'active' : ''}`}
              onClick={() => setMaskingLevel(1)}
              title="إظهار أول كلمتين فقط من كل آية"
            >
              أوائل
            </button>
            <button 
              className={`tb-mask-btn ${maskingLevel === 2 ? 'active' : ''}`}
              onClick={() => setMaskingLevel(2)}
              title="حجب الآيات مع إمكانية النقر للكشف التدريجي"
            >
              نقر للكشف
            </button>
            <button 
              className={`tb-mask-btn ${maskingLevel === 3 ? 'active' : ''}`}
              onClick={() => setMaskingLevel(3)}
              title="تسميع غيبي كامل"
            >
              غيبي
            </button>
          </div>

          {/* Quick Reveal / Hide All toggle when masking is active */}
          {maskingLevel > 0 && (
            <button
              onClick={handleToggleRevealAll}
              className="tb-reveal-all-btn"
              title={revealedAyahs.size === surahData?.ayahs?.length ? 'حجب جميع الآيات مجدداً' : 'كشف جميع الآيات للمراجعة'}
            >
              {revealedAyahs.size === surahData?.ayahs?.length ? <EyeOffIcon size={13} /> : <EyeIcon size={13} />}
              <span>{revealedAyahs.size === surahData?.ayahs?.length ? 'حجب الكل' : 'كشف الكل'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Basmala Banner */}
      {!isAtTawbah && !isAlFatihah && (
        <div className="basmala-banner-screenshot">
          <p className="basmala-text-screenshot font-quran">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        </div>
      )}

      {/* 2. Ayahs Cards Stream with Standardized 18px Action Icons */}
      <div className="ayahs-stream-screenshot" role="feed" aria-label="آيات السورة">
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
              aria-current={isCurrentActive ? 'true' : undefined}
            >
              {/* Header: Actions (Right) & Ayah Index (Left) matching reference screenshot */}
              <div className="ayah-card-top-header">
                <div className="ayah-action-icons-row" role="group" aria-label={`إجراءات الآية ${ayah.numberInSurah}`}>
                  <button
                    onClick={() => toggleBookmark(ayah)}
                    className={`card-tool-btn bookmark ${isBookmarked ? 'active' : ''}`}
                    title={isBookmarked ? 'إزالة العلامة المرجعية' : 'حفظ علامة مرجعية'}
                    aria-label={`علامة مرجعية للآية ${ayah.numberInSurah}`}
                  >
                    <BookmarkIcon size={18} strokeWidth={1.8} />
                  </button>

                  <button
                    onClick={() => handleCopyAyah(ayah)}
                    className="card-tool-btn copy"
                    title="نسخ الآية الكريمة"
                    aria-label={`نسخ الآية ${ayah.numberInSurah}`}
                  >
                    {isCopied ? (
                      <CheckIcon size={18} strokeWidth={1.8} className="text-emerald" />
                    ) : (
                      <CopyIcon size={18} strokeWidth={1.8} />
                    )}
                  </button>

                  <button
                    onClick={() => onPlayAyah(index)}
                    className={`card-tool-btn listen-btn ${isCurrentActive && isPlaying ? 'active' : ''}`}
                    title={isCurrentActive && isPlaying ? 'إيقاف مؤقت' : 'استماع لهذه الآية'}
                    aria-label={`استماع للآية ${ayah.numberInSurah}`}
                  >
                    {isCurrentActive && isPlaying ? (
                      <PauseIcon size={18} strokeWidth={1.8} />
                    ) : (
                      <AudioLinesIcon size={18} strokeWidth={1.8} />
                    )}
                    <span>استماع</span>
                  </button>

                  <button
                    onClick={() => onOpenTafsir(surahData.number, ayah.numberInSurah, ayah.textAr)}
                    className="card-tool-btn tafsir-btn"
                    title="تفسير الميسر"
                    aria-label={`تفسير الآية ${ayah.numberInSurah}`}
                  >
                    <TafsirIcon size={18} strokeWidth={1.8} />
                    <span>التفسير</span>
                  </button>

                  <button
                    onClick={() => onOpenCardModal(ayah, surahData)}
                    className="card-tool-btn share-btn"
                    title="مشاركة وتصميم بطاقة اقتباس"
                    aria-label={`تصميم بطاقة للآية ${ayah.numberInSurah}`}
                  >
                    <ShareIcon size={18} strokeWidth={1.8} />
                    <span>مشاركة</span>
                  </button>
                </div>

                <span className="ayah-count-caption">
                  الآية {ayah.numberInSurah} من {surahData.numberOfAyahs}
                </span>
              </div>

              {/* Arabic Quranic Text with Authentic Verse Medallion or Masked State */}
              <div className="ayah-body-arabic" style={{ fontSize: `${fontSize}px` }}>
                {maskingLevel > 0 ? (
                  renderMaskedAyahContent(ayah)
                ) : isWbwActive && ayahWords ? (
                  <div className="wbw-words-container font-quran">
                    {ayahWords.map((word) => (
                      <span
                        key={word.id}
                        onClick={() => handleWordClick(word)}
                        className="wbw-word-interactive-unit"
                        title={`${word.translationEn} (${word.transliteration}) — اضغط للاستماع والمعجم الصرفي`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter') handleWordClick(word); }}
                      >
                        <span className="wbw-word-arabic">{word.textUthmani}</span>
                        <span className="wbw-word-subtext">{word.translationEn}</span>
                      </span>
                    ))}
                    <VerseMedallion number={ayah.numberInSurah} size={30} />
                  </div>
                ) : (
                  <p className="ayah-arabic-text-flow font-quran">
                    {ayah.textAr}
                    <VerseMedallion number={ayah.numberInSurah} size={30} />
                  </p>
                )}
              </div>

              {/* Translation (Only shown when not in masking mode to prevent memorization spoilers) */}
              {maskingLevel === 0 && (activeLangMode === 'ar-en' || activeLangMode === 'all') && ayah.textEn && (
                <div className="ayah-translation-row-screenshot">
                  <span className="trans-tag">ENGLISH (SAHIH)</span>
                  <p className="trans-text">{ayah.textEn}</p>
                </div>
              )}

              {maskingLevel === 0 && (activeLangMode === 'ar-fr' || activeLangMode === 'all') && ayah.textFr && (
                <div className="ayah-translation-row-screenshot fr">
                  <span className="trans-tag">FRANÇAIS (HAMIDULLAH)</span>
                  <p className="trans-text">{ayah.textFr}</p>
                </div>
              )}

              {/* Interactive Bottom Actions Bar on Active Ayah */}
              {isCurrentActive && (
                <div className="active-ayah-bottom-tools animate-fade-in">
                  <div className="active-pills-row">
                    <button 
                      onClick={onTriggerMemorize} 
                      className="active-action-pill memorize"
                      title="الانتقال إلى معمل الحفظ لهذه الآية"
                    >
                      <BrainIcon size={16} strokeWidth={1.8} />
                      <span>احفظ</span>
                    </button>

                    <button 
                      onClick={onTriggerTadabbur} 
                      className="active-action-pill tadabbur"
                      title="تأملات وتدبر هذه الآية"
                    >
                      <LightbulbIcon size={16} strokeWidth={1.8} />
                      <span>التدبر</span>
                    </button>

                    <button 
                      onClick={onTriggerMutashabihat} 
                      className="active-action-pill mutashabihat"
                      title="استكشاف المتشابهات اللفظية المرتبطة"
                    >
                      <GitCompareIcon size={16} strokeWidth={1.8} />
                      <span>المتشابهات</span>
                    </button>
                  </div>

                  <div className="active-progress-wrap">
                    <span className="progress-fraction-badge font-calligraphy">
                      {ayah.numberInSurah} / {surahData.numberOfAyahs}
                    </span>
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
      </>
      )}

      {/* Feature 1: Mihrab Focus & Zen Mode Overlay */}
      <MihrabFocusMode
        isOpen={isMihrabOpen}
        onClose={() => setIsMihrabOpen(false)}
        surahData={surahData}
        currentAyahIndex={currentAyahIndex}
        onSelectAyah={onPlayAyah}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        selectedReciter={selectedReciter}
      />

      {/* Feature 4: Word Morphology & Root Explorer Modal */}
      <WordMorphologyModal
        isOpen={Boolean(selectedWordMorphology)}
        onClose={() => setSelectedWordMorphology(null)}
        morphologyData={selectedWordMorphology}
      />

      {/* Feature 5: AI Voice Reciter Modal (Tarteel-inspired Companion) */}
      <AIVoiceReciterModal
        isOpen={isAIReciterOpen}
        onClose={() => setIsAIReciterOpen(false)}
        surahData={surahData}
        initialAyahIndex={currentAyahIndex}
      />
    </div>
  );
}
