import React, { useRef, useState } from 'react';
import { ICONS, IslamicRosette } from './common/IconSystem';

export default function WordMorphologyModal({
  isOpen,
  onClose,
  morphologyData
}) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const audioRef = useRef(new Audio());

  if (!isOpen || !morphologyData) return null;

  const handlePlayWordAudio = () => {
    if (!morphologyData.audioUrl) return;
    const a = audioRef.current;
    a.src = morphologyData.audioUrl;
    setIsPlayingAudio(true);
    a.play()
      .then(() => {
        a.onended = () => setIsPlayingAudio(false);
      })
      .catch((e) => {
        console.error('Audio play error:', e);
        setIsPlayingAudio(false);
      });
  };

  const handleCopyAnalysis = () => {
    const text = `[المعجم الصرفي والإعراب - كلمة: ${morphologyData.textUthmani}]\nالجذر: ${morphologyData.root}\nالنوع: ${morphologyData.type}\nالوزن: ${morphologyData.pattern}\nالإعراب: ${morphologyData.grammar}\nالمعنى: ${morphologyData.meaning}`;
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const CloseIcon = ICONS.close;
  const AudioLinesIcon = ICONS.audio;
  const CopyIcon = ICONS.copy;
  const CheckIcon = ICONS.check;

  return (
    <div className="morphology-modal-overlay animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-label="المعجم الصرفي والإعراب">
      <div className="morphology-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="morphology-modal-header">
          <div className="morphology-header-title-wrap">
            <IslamicRosette size={20} className="text-gold" />
            <span className="morphology-header-title font-calligraphy">المعجم الصرفي والإعراب القرآني</span>
          </div>
          <button onClick={onClose} className="morphology-close-btn" title="إغلاق (Esc)" aria-label="إغلاق">
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Hero Word Card */}
        <div className="morphology-hero-word">
          <div className="morphology-calligraphy-display font-quran">
            {morphologyData.textUthmani}
          </div>

          <div className="morphology-sub-tags">
            {morphologyData.transliteration && (
              <span className="morphology-translit">{morphologyData.transliteration}</span>
            )}
            {morphologyData.translationEn && (
              <span className="morphology-trans-en">«{morphologyData.translationEn}»</span>
            )}
          </div>

          {morphologyData.audioUrl && (
            <button 
              onClick={handlePlayWordAudio} 
              className={`morphology-word-audio-btn ${isPlayingAudio ? 'active' : ''}`}
              title="نطق الكلمة صوتياً"
            >
              <AudioLinesIcon size={16} />
              <span>{isPlayingAudio ? 'جاري الاستماع...' : 'استمع لنطق الكلمة'}</span>
            </button>
          )}
        </div>

        {/* 3 Pillars Grid: Root, Pattern, Occurrences */}
        <div className="morphology-triplet-grid">
          <div className="morphology-stat-box root-box">
            <span className="stat-label">الجذر اللغوي</span>
            <span className="stat-value font-quran">{morphologyData.root}</span>
            <span className="stat-hint">الأصل الثلاثي المجرد</span>
          </div>

          <div className="morphology-stat-box pattern-box">
            <span className="stat-label">النوع والصيغة</span>
            <span className="stat-value">{morphologyData.pattern}</span>
            <span className="stat-hint">{morphologyData.type}</span>
          </div>

          <div className="morphology-stat-box count-box">
            <span className="stat-label">تكرار الجذر</span>
            <span className="stat-value font-calligraphy">{morphologyData.occurrences}</span>
            <span className="stat-hint">موضعاً في القرآن الكريم</span>
          </div>
        </div>

        {/* Detailed Sections: Grammar & Meaning */}
        <div className="morphology-sections-stack">
          <div className="morphology-detail-row">
            <h4 className="detail-row-title">
              <span className="title-bullet">۞</span> الإعراب والتحليل النحوي:
            </h4>
            <p className="detail-row-body">{morphologyData.grammar}</p>
          </div>

          <div className="morphology-detail-row">
            <h4 className="detail-row-title">
              <span className="title-bullet">۞</span> المعنى والبيان اللغوي:
            </h4>
            <p className="detail-row-body">{morphologyData.meaning}</p>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="morphology-footer-actions">
          <button onClick={handleCopyAnalysis} className="morphology-copy-btn">
            {isCopied ? <CheckIcon size={16} className="text-emerald" /> : <CopyIcon size={16} />}
            <span>{isCopied ? 'تم نسخ التحليل الصرفي' : 'نسخ الإعراب والمعجم'}</span>
          </button>
          <button onClick={onClose} className="morphology-dismiss-btn">
            تم الفهم
          </button>
        </div>
      </div>
    </div>
  );
}
