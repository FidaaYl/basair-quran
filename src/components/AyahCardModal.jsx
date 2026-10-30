import React, { useState, useRef } from 'react';
import { ICONS, CornerArabesque, OrnamentalDivider, VerseMedallion } from './common/IconSystem';
import mihrabDarkArt from '../assets/mihrab-quote-card.png';
import mihrabLightArt from '../assets/mihrab-quote-card-light.png';
import cardPatternArt from '../assets/card-pattern.png';
import goldenMandalaArt from '../assets/golden-mandala.jpg';
import islamicBorderArt from '../assets/islamic-border.jpg';
import mihrabGoldArt from '../assets/mihrab-gold.jpg';
import vectorstockArt from '../assets/vectorstock_55290651.png';
import patternBgArt from '../assets/pattern-bg.jpg';

export default function AyahCardModal({ isOpen, onClose, ayah, surah }) {
  const [cardTheme, setCardTheme] = useState('obsidian'); 
  const [fontSize, setFontSize] = useState(30);
  const [includeTranslation, setIncludeTranslation] = useState(true);
  const [showPatternOverlay, setShowPatternOverlay] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const cardRef = useRef(null);

  if (!isOpen || !ayah || !surah) return null;

  const PaletteIcon = ICONS.palette;
  const CloseIcon = ICONS.close;
  const TypeIcon = ICONS.type;
  const DownloadIcon = ICONS.download;
  const CopyIcon = ICONS.copy;
  const CheckIcon = ICONS.check;

  const cardThemes = [
    { id: 'obsidian', label: 'السبج الداكن (جلد مغربي)', isLight: false, solidBg: '#0a0e14', goldTone: '#d4af37' },
    { id: 'emerald', label: 'الزمرد الملكي (جلد أندلسي)', isLight: false, solidBg: '#06231c', goldTone: '#d4af37' },
    { id: 'navy', label: 'الكحلي العثماني (مجلد عثماني)', isLight: false, solidBg: '#0a1526', goldTone: '#d4af37' },
    { id: 'cordovan', label: 'الجلد القرطبي (بني دمشقي)', isLight: false, solidBg: '#20130e', goldTone: '#d4af37' },
    { id: 'parchment', label: 'المخطوط العتيق (ورق بردي)', isLight: true, solidBg: '#faf6ee', goldTone: '#8c6b2d' },
    { id: 'islamic-border', label: 'إطار المخطوط المذهب', bgImg: islamicBorderArt, isLight: true },
    { id: 'golden-mandala', label: 'الماندالا المذهبة', bgImg: goldenMandalaArt, isLight: true },
    { id: 'mihrab-dark', label: 'المحراب الليلي', bgImg: mihrabDarkArt, isLight: false },
    { id: 'mihrab-light', label: 'المحراب العاجي', bgImg: mihrabLightArt, isLight: true },
  ];

  const currentThemeObj = cardThemes.find((t) => t.id === cardTheme) || cardThemes[0];

  const handleCopyCardText = () => {
    let full = `﴿${ayah.textAr}﴾ [سورة ${surah.name}: آية ${ayah.numberInSurah}]\n\n`;
    if (includeTranslation && ayah.textEn) {
      full += `"${ayah.textEn}"\n\n`;
    }
    full += `مشارَكة من منصة بَصَائِر (Basa'ir Quranic Studio)`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCard = async () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const isLightTheme = currentThemeObj.isLight;

      if (currentThemeObj.bgImg) {
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        bgImg.src = currentThemeObj.bgImg;
        if (!bgImg.complete) {
          await new Promise((resolve) => {
            bgImg.onload = resolve;
            bgImg.onerror = resolve;
          });
        }
        if (bgImg.naturalWidth > 0) {
          ctx.drawImage(bgImg, 0, 0, 1080, 1350);
          ctx.fillStyle = isLightTheme ? 'rgba(250, 246, 238, 0.88)' : 'rgba(10, 14, 20, 0.85)';
          ctx.fillRect(0, 0, 1080, 1350);
        }
      } else {
        ctx.fillStyle = currentThemeObj.solidBg || (isLightTheme ? '#faf6ee' : '#0a0e14');
        ctx.fillRect(0, 0, 1080, 1350);
      }

      if (showPatternOverlay) {
        try {
          const patternImg = new Image();
          patternImg.crossOrigin = 'anonymous';
          patternImg.src = patternBgArt;
          if (!patternImg.complete) {
            await new Promise((resolve) => {
              patternImg.onload = resolve;
              patternImg.onerror = resolve;
            });
          }
          if (patternImg.naturalWidth > 0) {
            const pat = ctx.createPattern(patternImg, 'repeat');
            if (pat) {
              ctx.save();
              ctx.globalAlpha = isLightTheme ? 0.25 : 0.16;
              ctx.globalCompositeOperation = isLightTheme ? 'multiply' : 'screen';
              ctx.fillStyle = pat;
              ctx.fillRect(0, 0, 1080, 1350);
              ctx.restore();
            }
          }
        } catch (err) {
          console.warn('Canvas pattern overlay error:', err);
        }
      }

      const goldColor = isLightTheme ? '#8c6b2d' : '#d4af37';
      const goldSubtle = isLightTheme ? 'rgba(140, 107, 45, 0.35)' : 'rgba(212, 175, 55, 0.35)';

      ctx.strokeStyle = goldColor;
      ctx.lineWidth = 3;
      ctx.strokeRect(48, 48, 984, 1254);

      ctx.strokeStyle = goldSubtle;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(60, 60, 960, 1230);

      const drawCornerRosette = (cx, cy) => {
        ctx.save();
        ctx.strokeStyle = goldColor;
        ctx.fillStyle = goldColor;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };
      drawCornerRosette(48, 48);
      drawCornerRosette(1032, 48);
      drawCornerRosette(48, 1302);
      drawCornerRosette(1032, 1302);

      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillStyle = goldColor;
      ctx.font = '700 38px "Amiri Quran", "Amiri", serif';
      ctx.fillText('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 540, 190);

      ctx.strokeStyle = goldSubtle;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(380, 230);
      ctx.lineTo(700, 230);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(540, 230, 4, 0, Math.PI * 2);
      ctx.fillStyle = goldColor;
      ctx.fill();

      ctx.fillStyle = isLightTheme ? '#1a2220' : '#f8fafc';
      ctx.font = '700 52px "Amiri Quran", "Amiri", serif';
      
      const words = ayah.textAr.split(' ');
      let line = '';
      let y = 460;
      const maxLineWidth = 860;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && i > 0) {
          ctx.fillText(line, 540, y);
          line = words[i] + ' ';
          y += 95;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(`﴿ ${line.trim()} ﴾`, 540, y);

      if (includeTranslation && ayah.textEn) {
        ctx.direction = 'ltr';
        ctx.fillStyle = isLightTheme ? '#55655e' : '#a7b6ae';
        ctx.font = 'italic 400 28px "Plus Jakarta Sans", sans-serif';
        const transWords = ayah.textEn.split(' ');
        let transLine = '';
        let transY = y + 120;
        for (let j = 0; j < transWords.length; j++) {
          const testTrans = transLine + transWords[j] + ' ';
          if (ctx.measureText(testTrans).width > maxLineWidth && j > 0) {
            ctx.fillText(transLine, 540, transY);
            transLine = transWords[j] + ' ';
            transY += 46;
          } else {
            transLine = testTrans;
          }
        }
        ctx.fillText(`"${transLine.trim()}"`, 540, transY);
      }

      ctx.strokeStyle = goldSubtle;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(100, 1150);
      ctx.lineTo(980, 1150);
      ctx.stroke();

      ctx.direction = 'rtl';
      ctx.fillStyle = goldColor;
      ctx.font = '700 30px "Amiri", "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`سورة ${surah.name} — الآية ${ayah.numberInSurah}`, 540, 1200);

      ctx.direction = 'ltr';
      ctx.fillStyle = isLightTheme ? '#718096' : '#94a3b8';
      ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText("بَصَائِر | Basa'ir Quranic Studio", 540, 1245);

      const link = document.createElement('a');
      link.download = `basair-ayah-${surah.number}-${ayah.numberInSurah}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('Export failed:', e);
    } finally {
      setIsExporting(false);
    }
  };

  const getCardInlineStyle = () => {
    if (currentThemeObj.bgImg) {
      if (currentThemeObj.isLight) {
        return {
          backgroundImage: `linear-gradient(rgba(250, 246, 238, 0.90), rgba(246, 242, 232, 0.95)), url(${currentThemeObj.bgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          color: '#1a2220',
        };
      }
      return {
        backgroundImage: `linear-gradient(rgba(10, 14, 20, 0.90), rgba(8, 12, 16, 0.95)), url(${currentThemeObj.bgImg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#f8fafc',
      };
    }
    if (currentThemeObj.solidBg) {
      return {
        backgroundColor: currentThemeObj.solidBg,
        color: currentThemeObj.isLight ? '#1a2220' : '#f8fafc',
      };
    }
    return undefined;
  };

  return (
    <div className="modal-backdrop ayah-modal-backdrop" onClick={onClose}>
      <div className="card-studio-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <PaletteIcon size={20} strokeWidth={1.8} className="modal-icon text-gold" />
            <div>
              <h2 className="modal-title font-calligraphy">مصمم بطاقات الآيات القرآنية</h2>
              <p className="modal-subtitle">صمم بطاقة اقتباس قرآنية راقية للمشاركة والإهداء بنقوش إسلامية وزخارف مذهبة</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="إغلاق المصمم">
            <CloseIcon size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Style Controls */}
        <div className="studio-controls-bar">
          <div className="theme-pills-row">
            <span className="control-label font-calligraphy">النمط البصري:</span>
            {cardThemes.map((th) => (
              <button
                key={th.id}
                onClick={() => setCardTheme(th.id)}
                className={`theme-pill-btn ${cardTheme === th.id ? 'active' : ''}`}
              >
                {th.label}
              </button>
            ))}
          </div>

          <div className="subcontrols-row">
            {/* Font Size Pills */}
            <div className="font-size-cluster">
              <span className="control-label">
                <TypeIcon size={14} />
              </span>
              <button
                className={`size-btn ${fontSize === 26 ? 'active' : ''}`}
                onClick={() => setFontSize(26)}
              >
                متوسط
              </button>
              <button
                className={`size-btn ${fontSize === 30 ? 'active' : ''}`}
                onClick={() => setFontSize(30)}
              >
                كبير
              </button>
              <button
                className={`size-btn ${fontSize === 36 ? 'active' : ''}`}
                onClick={() => setFontSize(36)}
              >
                عريض
              </button>
            </div>

            {/* Translation Checkbox */}
            <label className="toggle-label-checkbox">
              <input
                type="checkbox"
                checked={includeTranslation}
                onChange={(e) => setIncludeTranslation(e.target.checked)}
              />
              <span>إدراج الترجمة الإنجليزية</span>
            </label>

            {/* Authentic Islamic Pattern Overlay Checkbox */}
            <label className="toggle-label-checkbox">
              <input
                type="checkbox"
                checked={showPatternOverlay}
                onChange={(e) => setShowPatternOverlay(e.target.checked)}
              />
              <span>تفعيل طبقة النقش الإسلامي (Pattern Overlay)</span>
            </label>
          </div>
        </div>

        {/* Live Card Preview with Authentic Double Gold Manuscript Frame & Corner Arabesques */}
        <div className="card-preview-stage">
          <div 
            ref={cardRef} 
            className={`designed-ayah-card ${cardTheme} ${currentThemeObj.isLight ? 'light-scheme' : 'dark-scheme'}`}
            style={getCardInlineStyle()}
          >
            {/* Authentic Islamic Geometric Background Pattern Overlay (5540822.jpg) */}
            {showPatternOverlay && (
              <div className="card-pattern-overlay" aria-hidden="true" />
            )}

            {/* Authentic Classical Double Gold Manuscript Frame */}
            <div className="card-manuscript-frame" aria-hidden="true">
              <div className="frame-line-outer" />
              <div className="frame-line-inner" />
              <div className="corner-rosette top-left"><CornerArabesque position="top-left" size={26} /></div>
              <div className="corner-rosette top-right"><CornerArabesque position="top-right" size={26} /></div>
              <div className="corner-rosette bottom-left"><CornerArabesque position="bottom-left" size={26} /></div>
              <div className="corner-rosette bottom-right"><CornerArabesque position="bottom-right" size={26} /></div>
            </div>

            {/* Card Content Interior */}
            <div className="card-content-interior">
              {/* Top Header: Classical Bismillah with Ornamental Illumination */}
              <div className="card-header-badge">
                <span className="bismillah font-quran">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
                <OrnamentalDivider className="card-ornament-divider text-gold" />
              </div>

              {/* Main Quranic Text with Classical Ornamental Brackets & Verse Medallion */}
              <div className="card-body-text font-quran" style={{ fontSize: `${fontSize}px` }}>
                <span className="ayah-quote-bracket font-calligraphy">﴿</span>
                {ayah.textAr}
                <span className="ayah-quote-bracket font-calligraphy">﴾</span>
                <VerseMedallion number={ayah.numberInSurah} size={30} className="card-verse-number-medallion text-gold" />
              </div>

              {/* Optional English Translation */}
              {includeTranslation && ayah.textEn && (
                <div className="card-translation-text">
                  "{ayah.textEn}"
                </div>
              )}

              {/* Classical Colophon Footer */}
              <div className="card-footer-branding">
                <div className="card-reference font-calligraphy">
                  <span>سورة {surah.name}</span>
                  <span className="dot-sep">•</span>
                  <span>الآية {ayah.numberInSurah}</span>
                </div>
                <div className="card-app-watermark">
                  <span>بَصَائِر | Basa'ir Studio</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="card-modal-footer">
          <button onClick={handleExportCard} disabled={isExporting} className="action-pill download-btn">
            <DownloadIcon size={16} strokeWidth={1.8} />
            <span>{isExporting ? 'جاري تجهيز الصورة...' : 'تحميل البطاقة عالية الدقة (PNG)'}</span>
          </button>
          <button onClick={handleCopyCardText} className="action-pill copy-btn">
            {copied ? <CheckIcon size={16} strokeWidth={1.8} className="text-emerald" /> : <CopyIcon size={16} strokeWidth={1.8} />}
            <span>{copied ? 'تم نسخ نص الآية' : 'نسخ نص الاقتباس'}</span>
          </button>
          <button onClick={onClose} className="action-pill close-btn">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
