import React, { useState, useRef } from 'react';
import { X, Copy, Check, Sparkles, Palette, Download } from 'lucide-react';

export default function AyahCardModal({ isOpen, onClose, ayah, surah }) {
  const [cardTheme, setCardTheme] = useState('emerald'); // 'emerald', 'gold', 'obsidian', 'parchment'
  const [includeTranslation, setIncludeTranslation] = useState(true);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef(null);

  if (!isOpen || !ayah || !surah) return null;

  const cardThemes = [
    { id: 'emerald', label: 'الزمرد الليلي', bgClass: 'theme-card-emerald' },
    { id: 'gold', label: 'الذهب الأندلسي', bgClass: 'theme-card-gold' },
    { id: 'obsidian', label: 'السبج الملكي', bgClass: 'theme-card-obsidian' },
    { id: 'parchment', label: 'المخطوط العتيق', bgClass: 'theme-card-parchment' },
  ];

  const handleCopyCardText = () => {
    let full = `"${ayah.textAr}"\n\n`;
    if (includeTranslation && ayah.textEn) {
      full += `${ayah.textEn}\n\n`;
    }
    full += `[سورة ${surah.name}: آية ${ayah.numberInSurah}]\nمشارَكة من منصة بَصَائِر (Basa'ir)`;
    navigator.clipboard.writeText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="card-studio-modal animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <Palette size={20} className="modal-icon text-gold" />
            <div>
              <h2 className="modal-title">مصمم بطاقات الآيات القرآنية</h2>
              <p className="modal-subtitle">صمم بطاقة اقتباس قرآنية راقية للمشاركة والإهداء</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="إغلاق المصمم">
            <X size={20} />
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

          <div className="translation-toggle-row">
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

        {/* Live Card Preview */}
        <div className="card-preview-stage">
          <div ref={cardRef} className={`designed-ayah-card ${cardTheme}`}>
            <div className="card-ornament-corner top-left">✦</div>
            <div className="card-ornament-corner top-right">✦</div>
            <div className="card-ornament-corner bottom-left">✦</div>
            <div className="card-ornament-corner bottom-right">✦</div>

            <div className="card-header-badge">
              <span className="bismillah font-quran">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</span>
            </div>

            <div className="card-body-text font-quran">
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
          <button onClick={handleCopyCardText} className="action-pill copy-btn">
            {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
            <span>{copied ? 'تم نسخ نص البطاقة الجاهز' : 'نسخ نص البطاقة للمشاركة'}</span>
          </button>
          <button onClick={onClose} className="action-pill close-btn">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
