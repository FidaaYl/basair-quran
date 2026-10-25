import React, { useState, useRef } from 'react';
import { ICONS, CornerArabesque } from './common/IconSystem';
import mihrabDarkArt from '../assets/mihrab-quote-card.png';
import mihrabLightArt from '../assets/mihrab-quote-card-light.png';

export default function AyahCardModal({ isOpen, onClose, ayah, surah }) {
  const [cardTheme, setCardTheme] = useState('mihrab-dark'); 
  const [fontSize, setFontSize] = useState(28); // 24, 28, 34
  const [includeTranslation, setIncludeTranslation] = useState(true);
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
    { id: 'mihrab-dark', label: 'المحراب الليلي', isArtwork: true, bgImg: mihrabDarkArt },
    { id: 'mihrab-light', label: 'المحراب العاجي', isArtwork: true, bgImg: mihrabLightArt },
    { id: 'emerald', label: 'الزمرد الملكي' },
    { id: 'gold', label: 'الذهب الأندلسي' },
    { id: 'obsidian', label: 'السبج الداكن' },
    { id: 'parchment', label: 'المخطوط العتيق' },
  ];

  const handleCopyCardText = () => {
    let full = `"${ayah.textAr}"\n\n`;
    if (includeTranslation && ayah.textEn) {
      full += `${ayah.textEn}\n\n`;
    }
    full += `[سورة ${surah.name}: آية ${ayah.numberInSurah}]\nمشارَكة من منصة بَصَائِر (Basa'ir Studio)`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCard = () => {
    setIsExporting(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350; // High resolution 4:5 social media card
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background
      if (cardTheme === 'mihrab-dark' || cardTheme === 'obsidian') {
        const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
        grad.addColorStop(0, '#0c1618');
        grad.addColorStop(0.5, '#0e2422');
        grad.addColorStop(1, '#081014');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1350);
      } else if (cardTheme === 'emerald') {
        const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
        grad.addColorStop(0, '#084c3c');
        grad.addColorStop(1, '#04271e');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1350);
      } else if (cardTheme === 'gold') {
        const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
        grad.addColorStop(0, '#38220f');
        grad.addColorStop(1, '#1a0e05');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1350);
      } else if (cardTheme === 'mihrab-light' || cardTheme === 'parchment') {
        const grad = ctx.createLinearGradient(0, 0, 1080, 1350);
        grad.addColorStop(0, '#faf7ee');
        grad.addColorStop(1, '#eee8d5');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1080, 1350);
      }

      // Draw Border
      ctx.strokeStyle = cardTheme.includes('light') || cardTheme === 'parchment' ? '#b58a43' : '#d2aa60';
      ctx.lineWidth = 4;
      ctx.strokeRect(40, 40, 1000, 1270);
      ctx.lineWidth = 1;
      ctx.strokeRect(55, 55, 970, 1240);

      // Bismillah
      ctx.textAlign = 'center';
      ctx.direction = 'rtl';
      ctx.fillStyle = cardTheme.includes('light') || cardTheme === 'parchment' ? '#8c6b2d' : '#d2aa60';
      ctx.font = '600 36px "Amiri Quran", "Amiri", serif';
      ctx.fillText('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ', 540, 180);

      // Ayah Text in Arabic
      ctx.fillStyle = cardTheme.includes('light') || cardTheme === 'parchment' ? '#1c2826' : '#f0fdf4';
      ctx.font = '700 52px "Amiri Quran", "Amiri", serif';
      
      // Multi-line wrap
      const words = ayah.textAr.split(' ');
      let line = '';
      let y = 420;
      const maxLineWidth = 880;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxLineWidth && i > 0) {
          ctx.fillText(line, 540, y);
          line = words[i] + ' ';
          y += 90;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, 540, y);

      // Translation if included
      if (includeTranslation && ayah.textEn) {
        ctx.direction = 'ltr';
        ctx.fillStyle = cardTheme.includes('light') || cardTheme === 'parchment' ? '#55655e' : '#a7b6ae';
        ctx.font = '400 28px "Plus Jakarta Sans", sans-serif';
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
        ctx.fillText(transLine, 540, transY);
      }

      // Footer: Reference & Brand
      ctx.direction = 'rtl';
      ctx.fillStyle = cardTheme.includes('light') || cardTheme === 'parchment' ? '#78827b' : '#8fa199';
      ctx.font = '600 30px "Amiri", "Plus Jakarta Sans", sans-serif';
      ctx.fillText(`سورة ${surah.name} — الآية ${ayah.numberInSurah}`, 540, 1180);

      ctx.direction = 'ltr';
      ctx.fillStyle = cardTheme.includes('light') || cardTheme === 'parchment' ? '#087f63' : '#19a681';
      ctx.font = '700 24px "Plus Jakarta Sans", sans-serif';
      ctx.fillText("بَصَائِر | Basa'ir Quranic Studio", 540, 1230);

      // Trigger download
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

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card-studio-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <PaletteIcon size={20} strokeWidth={1.8} className="modal-icon text-gold" />
            <div>
              <h2 className="modal-title">مصمم بطاقات الآيات القرآنية</h2>
              <p className="modal-subtitle">صمم بطاقة اقتباس قرآنية راقية للمشاركة والإهداء بجودة فائقة</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="إغلاق المصمم">
            <CloseIcon size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Style Controls */}
        <div className="studio-controls-bar">
          <div className="theme-pills-row">
            <span className="control-label">النمط البصري:</span>
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

          <div className="card-subcontrols-row">
            {/* Font Size Pills */}
            <div className="size-pills-group">
              <TypeIcon size={14} strokeWidth={1.8} className="text-muted" />
              {[24, 28, 34].map((sz) => (
                <button
                  key={sz}
                  onClick={() => setFontSize(sz)}
                  className={`size-pill-btn ${fontSize === sz ? 'active' : ''}`}
                >
                  {sz === 24 ? 'متوسط' : sz === 28 ? 'كبير' : 'عريض'}
                </button>
              ))}
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
          </div>
        </div>

        {/* Live Card Preview with Authentic Corner Arabesques */}
        <div className="card-preview-stage">
          <div 
            ref={cardRef} 
            className={`designed-ayah-card ${cardTheme}`}
            style={
              cardTheme === 'mihrab-dark' 
                ? { backgroundImage: `linear-gradient(rgba(12, 18, 21, 0.88), rgba(12, 18, 21, 0.94)), url(${mihrabDarkArt})` }
                : cardTheme === 'mihrab-light'
                ? { backgroundImage: `linear-gradient(rgba(248, 246, 240, 0.88), rgba(248, 246, 240, 0.94)), url(${mihrabLightArt})` }
                : undefined
            }
          >
            <div className="card-ornament-corner top-left"><CornerArabesque position="top-left" size={18} /></div>
            <div className="card-ornament-corner top-right"><CornerArabesque position="top-right" size={18} /></div>
            <div className="card-ornament-corner bottom-left"><CornerArabesque position="bottom-left" size={18} /></div>
            <div className="card-ornament-corner bottom-right"><CornerArabesque position="bottom-right" size={18} /></div>

            <div className="card-header-badge">
              <span className="bismillah font-quran">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
            </div>

            <div className="card-body-text font-quran" style={{ fontSize: `${fontSize}px` }}>
              "{ayah.textAr}"
            </div>

            {includeTranslation && ayah.textEn && (
              <div className="card-translation-text">
                {ayah.textEn}
              </div>
            )}

            <div className="card-footer-branding">
              <div className="card-reference">
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
