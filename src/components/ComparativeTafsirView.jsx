import React, { useState, useEffect } from 'react';
import { getAyahComparativeTafsir } from '../services/quranApi';
import { IslamicRosette, VerseMedallion, RosetteSpinner, ICONS } from './common/IconSystem';

const SCHOLARS = [
  { id: 'saadi', name: 'تفسير السعدي', book: 'تيسير الكريم الرحمن', era: '١٣٧٦ هـ' },
  { id: 'muyassar', name: 'التفسير الميسر', book: 'مجمع الملك فهد', era: 'معاصر' },
  { id: 'jalalayn', name: 'تفسير الجلالين', book: 'المحلي والسيوطي', era: '٩١١ هـ' },
  { id: 'qurtubi', name: 'تفسير القرطبي', book: 'الجامع لأحكام القرآن', era: '٦٧١ هـ' },
];

export default function ComparativeTafsirView({
  surahData,
  currentAyahIndex,
  onPlayAyah,
  isPlaying,
}) {
  const [selectedAyahIdx, setSelectedAyahIdx] = useState(currentAyahIndex || 0);
  const [activeScholar, setActiveScholar] = useState('saadi');
  const [tafsirText, setTafsirText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fontSize, setFontSize] = useState(18);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (typeof currentAyahIndex === 'number' && surahData?.ayahs?.[currentAyahIndex]) {
      setSelectedAyahIdx(currentAyahIndex);
    }
  }, [currentAyahIndex, surahData]);

  const currentAyah = surahData?.ayahs?.[selectedAyahIdx] || surahData?.ayahs?.[0];

  useEffect(() => {
    if (!surahData?.number || !currentAyah?.numberInSurah) return;

    let isMounted = true;
    setIsLoading(true);
    setTafsirText('');

    getAyahComparativeTafsir(surahData.number, currentAyah.numberInSurah, activeScholar)
      .then((res) => {
        if (isMounted) {
          setTafsirText(res);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTafsirText('تعذر تحميل التفسير، يرجى المحاولة لاحقاً.');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [surahData?.number, currentAyah?.numberInSurah, activeScholar]);

  if (!surahData || !surahData.ayahs) return null;

  const totalAyahs = surahData.ayahs.length;

  const handleCopy = () => {
    const textToCopy = `[تفسير الآية ${currentAyah.numberInSurah} من سورة ${surahData.name} - ${SCHOLARS.find((s) => s.id === activeScholar)?.name}]:\n\n${tafsirText}`;
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const ChevronRightIcon = ICONS.chevronRight;
  const ChevronLeftIcon = ICONS.chevronLeft;
  const AudioLinesIcon = ICONS.audio;
  const PauseIcon = ICONS.pause;
  const CopyIcon = ICONS.copy;
  const CheckIcon = ICONS.check;

  const isCurrentPlaying = selectedAyahIdx === currentAyahIndex && isPlaying;

  return (
    <div className="comparative-tafsir-container animate-fade-in">
      {/* Top Ayah Stepper Bar */}
      <div className="tafsir-stepper-bar">
        <button
          onClick={() => setSelectedAyahIdx((prev) => Math.max(0, prev - 1))}
          disabled={selectedAyahIdx <= 0}
          className="tafsir-step-btn"
          title="الآية السابقة"
        >
          <ChevronRightIcon size={18} />
          <span>الآية السابقة</span>
        </button>

        <div className="tafsir-ayah-indicator font-calligraphy">
          <IslamicRosette size={18} className="text-gold" />
          <span>الآية {currentAyah.numberInSurah} من {totalAyahs}</span>
          <IslamicRosette size={18} className="text-gold" />
        </div>

        <button
          onClick={() => setSelectedAyahIdx((prev) => Math.min(totalAyahs - 1, prev + 1))}
          disabled={selectedAyahIdx >= totalAyahs - 1}
          className="tafsir-step-btn"
          title="الآية التالية"
        >
          <span>الآية التالية</span>
          <ChevronLeftIcon size={18} />
        </button>
      </div>

      {/* Selected Ayah Display Box */}
      <div className="tafsir-verse-spotlight-card">
        <div className="spotlight-verse-header">
          <span className="spotlight-ayah-badge">سُورَةُ {surahData.name} • الآية {currentAyah.numberInSurah}</span>
          <button
            onClick={() => onPlayAyah?.(selectedAyahIdx)}
            className={`spotlight-play-btn ${isCurrentPlaying ? 'active' : ''}`}
            title={isCurrentPlaying ? 'إيقاف التلاوة' : 'استماع لتلاوة الآية'}
          >
            {isCurrentPlaying ? <PauseIcon size={16} /> : <AudioLinesIcon size={16} />}
            <span>{isCurrentPlaying ? 'إيقاف' : 'استماع للتلاوة'}</span>
          </button>
        </div>

        <p className="spotlight-arabic-text font-quran">
          {currentAyah.textAr}
          <VerseMedallion number={currentAyah.numberInSurah} size={32} />
        </p>
      </div>

      {/* Classical Scholars Tabs */}
      <div className="tafsir-scholars-bar" role="tablist" aria-label="أئمة التفسير">
        {SCHOLARS.map((scholar) => (
          <button
            key={scholar.id}
            role="tab"
            aria-selected={activeScholar === scholar.id}
            onClick={() => setActiveScholar(scholar.id)}
            className={`scholar-tab-pill ${activeScholar === scholar.id ? 'active' : ''}`}
          >
            <span className="scholar-tab-name">{scholar.name}</span>
            <span className="scholar-tab-book">{scholar.book}</span>
          </button>
        ))}
      </div>

      {/* Tafsir Body Card with Typography Controls */}
      <div className="tafsir-body-card">
        <div className="tafsir-body-header">
          <div className="tafsir-scholar-meta">
            <h3 className="scholar-meta-title">{SCHOLARS.find((s) => s.id === activeScholar)?.name}</h3>
            <span className="scholar-meta-sub">{SCHOLARS.find((s) => s.id === activeScholar)?.book} ({SCHOLARS.find((s) => s.id === activeScholar)?.era})</span>
          </div>

          <div className="tafsir-body-tools">
            {/* Font Scaler */}
            <div className="tafsir-font-controls">
              <button
                onClick={() => setFontSize((s) => Math.max(14, s - 2))}
                className="tafsir-font-btn"
                title="تصغير الخط"
              >
                A-
              </button>
              <span className="tafsir-font-val">{fontSize}px</span>
              <button
                onClick={() => setFontSize((s) => Math.min(28, s + 2))}
                className="tafsir-font-btn"
                title="تكبير الخط"
              >
                A+
              </button>
            </div>

            {/* Copy Tafsir Button */}
            <button
              onClick={handleCopy}
              className="tafsir-copy-btn"
              title="نسخ نص التفسير"
            >
              {isCopied ? <CheckIcon size={16} className="text-emerald" /> : <CopyIcon size={16} />}
              <span>{isCopied ? 'تم النسخ' : 'نسخ التفسير'}</span>
            </button>
          </div>
        </div>

        <div className="tafsir-content-area" style={{ fontSize: `${fontSize}px` }}>
          {isLoading ? (
            <div className="tafsir-loading-indicator">
              <RosetteSpinner size={28} className="text-emerald" />
              <span>جاري استحضار نص التفسير المعتمد...</span>
            </div>
          ) : (
            <p className="tafsir-text-paragraph">{tafsirText}</p>
          )}
        </div>
      </div>
    </div>
  );
}
