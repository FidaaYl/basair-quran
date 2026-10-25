import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  BookOpen, 
  Share2, 
  Copy, 
  Check, 
  Bookmark, 
  Languages, 
  Volume2,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

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
}) {
  const [fontSize, setFontSize] = useState(28); // 24 to 40px
  const [activeLangMode, setActiveLangMode] = useState('ar-en'); // 'ar', 'ar-en', 'ar-fr', 'all'
  const [copiedAyahNum, setCopiedAyahNum] = useState(null);
  const [bookmarks, setBookmarks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('basair_bookmarks') || '[]');
    } catch {
      return [];
    }
  });

  const ayahRefs = useRef([]);

  // Auto-scroll active Ayah into view when playing
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

  if (isLoading) {
    return (
      <div className="reader-loading-state">
        <div className="loading-spinner-ornament">
          <span className="spinner-star">✦</span>
        </div>
        <p className="loading-text">جاري تحميل السورة الكريمة من المصحف الشريف...</p>
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
    <div className="reader-container">
      {/* Surah Header Banner */}
      <div className="surah-header-banner">
        <div className="surah-nav-arrows">
          <button
            onClick={onSelectPrevSurah}
            disabled={surahData.number <= 1}
            className="surah-nav-btn prev"
            title="السورة السابقة"
          >
            <ChevronRight size={20} />
            <span className="btn-label-desktop">السابقة</span>
          </button>

          <div className="surah-title-meta-box">
            <span className="surah-ornament-top">۞</span>
            <h1 className="surah-main-name font-calligraphy">{surahData.name}</h1>
            <div className="surah-tags-row">
              <span className="surah-tag revelation">
                {surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
              </span>
              <span className="surah-tag count">{surahData.numberOfAyahs} آيات</span>
              <span className="surah-tag number">ترتيبها {surahData.number}</span>
              <span className="surah-tag transliteration">{surahData.englishName}</span>
            </div>
            <span className="surah-ornament-bottom">۞</span>
          </div>

          <button
            onClick={onSelectNextSurah}
            disabled={surahData.number >= 114}
            className="surah-nav-btn next"
            title="السورة التالية"
          >
            <span className="btn-label-desktop">التالية</span>
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Display Settings Toolbar (Font scale, Language selector) */}
        <div className="reader-toolbar-row">
          <div className="toolbar-group font-scale-group">
            <span className="toolbar-label">حجم الخط:</span>
            <button 
              onClick={() => setFontSize((s) => Math.max(22, s - 3))} 
              className="toolbar-btn" 
              title="تصغير خط المصحف"
            >
              <ZoomOut size={16} />
            </button>
            <span className="font-size-indicator">{fontSize}px</span>
            <button 
              onClick={() => setFontSize((s) => Math.min(42, s + 3))} 
              className="toolbar-btn" 
              title="تكبير خط المصحف"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          <div className="toolbar-group lang-group">
            <Languages size={16} className="lang-icon" />
            <span className="toolbar-label">الترجمة:</span>
            <select
              value={activeLangMode}
              onChange={(e) => setActiveLangMode(e.target.value)}
              className="lang-select"
            >
              <option value="ar">العربية فقط (المصحف الشريف)</option>
              <option value="ar-en">عربي + إنجليزي (English - Sahih)</option>
              <option value="ar-fr">عربي + فرنسي (Français - Hamidullah)</option>
              <option value="all">الكل (عربي + English + Français)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Basmala Banner (except for Surah At-Tawbah and Surah Al-Fatihah where Basmala is verse 1) */}
      {!isAtTawbah && !isAlFatihah && (
        <div className="basmala-banner">
          <p className="basmala-text font-quran">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
        </div>
      )}

      {/* Ayahs Flow */}
      <div className="ayahs-stream-wrapper">
        {surahData.ayahs.map((ayah, index) => {
          const isCurrentActive = index === currentAyahIndex;
          const isBookmarked = bookmarks.includes(`${surahData.number}:${ayah.numberInSurah}`);
          const isCopied = copiedAyahNum === ayah.numberInSurah;

          return (
            <article
              key={ayah.number}
              ref={(el) => (ayahRefs.current[index] = el)}
              className={`ayah-card-container ${isCurrentActive ? 'active-playing' : ''}`}
              id={`ayah-${ayah.numberInSurah}`}
            >
              {/* Ayah Header Tools */}
              <div className="ayah-meta-header">
                <div className="ayah-badge-left">
                  <span className="ayah-index-pill">الآية {ayah.numberInSurah}</span>
                  {ayah.juz && <span className="juz-pill">الجزء {ayah.juz}</span>}
                </div>

                <div className="ayah-action-buttons">
                  {/* Play Ayah Audio */}
                  <button
                    onClick={() => onPlayAyah(index)}
                    className={`ayah-action-btn play ${isCurrentActive && isPlaying ? 'active' : ''}`}
                    title={isCurrentActive && isPlaying ? 'إيقاف مؤقت' : 'استمع لهذه الآية'}
                  >
                    {isCurrentActive && isPlaying ? <Pause size={15} /> : <Play size={15} />}
                    <span>{isCurrentActive && isPlaying ? 'جاري التلاوة' : 'استماع'}</span>
                  </button>

                  {/* Open Tafsir */}
                  <button
                    onClick={() => onOpenTafsir(surahData.number, ayah.numberInSurah, ayah.textAr)}
                    className="ayah-action-btn tafsir"
                    title="تفسير الميسر لهذه الآية"
                  >
                    <BookOpen size={15} />
                    <span>التفسير</span>
                  </button>

                  {/* Create Quote Card */}
                  <button
                    onClick={() => onOpenCardModal(ayah, surahData)}
                    className="ayah-action-btn card"
                    title="تصميم بطاقة ومشاركتها"
                  >
                    <Share2 size={15} />
                    <span>بطاقة</span>
                  </button>

                  {/* Copy Ayah Text */}
                  <button
                    onClick={() => handleCopyAyah(ayah)}
                    className="ayah-action-btn copy"
                    title="نسخ الآية الكريمة"
                  >
                    {isCopied ? <Check size={15} className="text-emerald" /> : <Copy size={15} />}
                  </button>

                  {/* Bookmark */}
                  <button
                    onClick={() => toggleBookmark(ayah)}
                    className={`ayah-action-btn bookmark ${isBookmarked ? 'active' : ''}`}
                    title={isBookmarked ? 'إزالة من المحفوظات' : 'حفظ الآية كعلامة مرجعية'}
                  >
                    <Bookmark size={15} />
                  </button>
                </div>
              </div>

              {/* Arabic Uthmani Text */}
              <div className="ayah-arabic-text-wrap" style={{ fontSize: `${fontSize}px` }}>
                <p className="ayah-arabic-content font-quran">
                  {ayah.textAr}
                  <span className="ayah-symbol" title={`آية ${ayah.numberInSurah}`}>
                    ۝{ayah.numberInSurah.toLocaleString('ar-EG')}
                  </span>
                </p>
              </div>

              {/* Multi-language Translations */}
              {(activeLangMode === 'ar-en' || activeLangMode === 'all') && ayah.textEn && (
                <div className="ayah-translation-block en">
                  <span className="lang-tag">English (Sahih)</span>
                  <p className="translation-text">{ayah.textEn}</p>
                </div>
              )}

              {(activeLangMode === 'ar-fr' || activeLangMode === 'all') && ayah.textFr && (
                <div className="ayah-translation-block fr">
                  <span className="lang-tag">Français (Hamidullah)</span>
                  <p className="translation-text">{ayah.textFr}</p>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
