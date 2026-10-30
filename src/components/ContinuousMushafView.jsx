import React, { useState } from 'react';
import { IslamicRosette, VerseMedallion, OrnamentalDivider, ICONS } from './common/IconSystem';

export default function ContinuousMushafView({
  surahData,
  currentAyahIndex,
  isPlaying,
  onPlayAyah,
  onOpenTafsir,
  onOpenCardModal,
  fontSize = 28,
}) {
  const [activeTooltipAyah, setActiveTooltipAyah] = useState(null);

  if (!surahData || !surahData.ayahs) return null;

  const isAtTawbah = surahData.number === 9;
  const isAlFatihah = surahData.number === 1;

  const firstAyah = surahData.ayahs[0] || {};
  const juzNumber = firstAyah.juz || 1;
  const pageNumber = firstAyah.page || 1;

  const PlayIcon = ICONS.play;
  const PauseIcon = ICONS.pause;
  const TafsirIcon = ICONS.tafsir;
  const ShareIcon = ICONS.share;

  const handleAyahClick = (index, e) => {
    e.stopPropagation();
    const ayah = surahData.ayahs[index];
    setActiveTooltipAyah(activeTooltipAyah === ayah.numberInSurah ? null : ayah.numberInSurah);
    onPlayAyah?.(index);
  };

  return (
    <div className="mushaf-page-container animate-fade-in" onClick={() => setActiveTooltipAyah(null)}>
      {/* Authentic Medina Mushaf Double Gold Border Frame */}
      <div className="mushaf-parchment-sheet">
        {/* Top Header Margins (Juz, Surah Name, Hizb) */}
        <div className="mushaf-page-top-margin">
          <span className="mushaf-margin-label font-calligraphy">الجزء {juzNumber}</span>
          <div className="mushaf-margin-center-rosette">
            <IslamicRosette size={18} className="text-gold" />
            <span className="mushaf-margin-surah-title font-calligraphy">سُورَةُ {surahData.name}</span>
            <IslamicRosette size={18} className="text-gold" />
          </div>
          <span className="mushaf-margin-label font-calligraphy">الحزب {Math.ceil(juzNumber * 2)}</span>
        </div>

        {/* Golden Ornamental Surah Cartouche Frame */}
        <div className="mushaf-surah-cartouche">
          <div className="cartouche-inner-frame">
            <div className="cartouche-side-ornament left">۞</div>
            <div className="cartouche-center-content">
              <h2 className="cartouche-surah-name font-calligraphy">سُورَةُ {surahData.name}</h2>
              <div className="cartouche-meta-pills">
                <span>{surahData.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                <span>•</span>
                <span>{surahData.numberOfAyahs} آيَاتٍ</span>
                <span>•</span>
                <span>تَرْتِيبُهَا {surahData.number}</span>
              </div>
            </div>
            <div className="cartouche-side-ornament right">۞</div>
          </div>
        </div>

        {/* Basmala Banner */}
        {!isAtTawbah && !isAlFatihah && (
          <div className="mushaf-basmala-frame">
            <span className="basmala-ornament-bracket">«</span>
            <p className="mushaf-basmala-text font-quran">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</p>
            <span className="basmala-ornament-bracket">»</span>
          </div>
        )}

        {/* Continuous Flowing Mushaf Text */}
        <div 
          className="mushaf-flowing-text-area font-quran" 
          style={{ fontSize: `${fontSize + 2}px` }}
        >
          {surahData.ayahs.map((ayah, index) => {
            const isCurrentActive = index === currentAyahIndex;
            const isTooltipOpen = activeTooltipAyah === ayah.numberInSurah;

            return (
              <span
                key={ayah.number}
                className={`mushaf-verse-span ${isCurrentActive ? 'current-active-verse' : ''}`}
                onClick={(e) => handleAyahClick(index, e)}
                title={`الآية ${ayah.numberInSurah} — انقر للاستماع والخيارات`}
              >
                <span className="mushaf-verse-text">{ayah.textAr}</span>
                <span className="mushaf-medallion-inline">
                  <VerseMedallion number={ayah.numberInSurah} size={28} />
                </span>

                {/* Floating Micro-Dock on Active Ayah */}
                {isTooltipOpen && (
                  <span 
                    className="mushaf-verse-floating-dock animate-fade-in"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => onPlayAyah?.(index)}
                      className={`micro-dock-btn ${isCurrentActive && isPlaying ? 'active' : ''}`}
                      title={isCurrentActive && isPlaying ? 'إيقاف' : 'استماع'}
                    >
                      {isCurrentActive && isPlaying ? <PauseIcon size={14} /> : <PlayIcon size={14} />}
                      <span>{isCurrentActive && isPlaying ? 'إيقاف' : 'استماع'}</span>
                    </button>
                    <button
                      onClick={() => onOpenTafsir?.(surahData.number, ayah.numberInSurah, ayah.textAr)}
                      className="micro-dock-btn"
                      title="تفسير الآية"
                    >
                      <TafsirIcon size={14} />
                      <span>تفسير</span>
                    </button>
                    <button
                      onClick={() => onOpenCardModal?.(ayah, surahData)}
                      className="micro-dock-btn"
                      title="تصميم بطاقة"
                    >
                      <ShareIcon size={14} />
                      <span>بطاقة</span>
                    </button>
                  </span>
                )}
              </span>
            );
          })}
        </div>

        {/* Mushaf Page Footer Margin */}
        <div className="mushaf-page-bottom-margin">
          <OrnamentalDivider className="text-gold opacity-50" />
          <div className="mushaf-page-number-wrap font-calligraphy">
            <span className="page-flourish">«</span>
            <span className="page-number-display">{pageNumber}</span>
            <span className="page-flourish">»</span>
          </div>
        </div>
      </div>
    </div>
  );
}
