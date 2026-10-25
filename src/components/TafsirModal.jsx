import React, { useState, useEffect } from 'react';
import { ICONS, RosetteSpinner } from './common/IconSystem';
import { getAyahTafsir } from '../services/quranApi';

export default function TafsirModal({ isOpen, onClose, surahNumber, ayahNumber, surahName, ayahText }) {
  const [tafsirText, setTafsirText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && surahNumber && ayahNumber) {
      setIsLoading(true);
      getAyahTafsir(surahNumber, ayahNumber)
        .then((txt) => {
          setTafsirText(txt);
          setIsLoading(false);
        })
        .catch(() => {
          setTafsirText('تعذر تحميل التفسير حالياً.');
          setIsLoading(false);
        });
    }
  }, [isOpen, surahNumber, ayahNumber]);

  if (!isOpen) return null;

  const TafsirIcon = ICONS.tafsir;
  const CloseIcon = ICONS.close;
  const CopyIcon = ICONS.copy;
  const CheckIcon = ICONS.check;

  const handleCopy = () => {
    navigator.clipboard.writeText(`${ayahText}\n\nتفسير الميسر:\n${tafsirText}\n\n[سورة ${surahName}: آية ${ayahNumber}]`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div 
        className="tafsir-modal-card animate-fade-in" 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tafsir-modal-title"
      >
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <TafsirIcon size={20} strokeWidth={1.8} className="modal-icon text-emerald" />
            <div>
              <h2 id="tafsir-modal-title" className="modal-title">تفسير الميسر</h2>
              <p className="modal-subtitle">
                سورة {surahName} — الآية {ayahNumber} (مجمع الملك فهد لطباعة المصحف الشريف)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="إغلاق لوحة التفسير">
            <CloseIcon size={20} strokeWidth={1.8} />
          </button>
        </div>

        {/* Ayah Quoted */}
        <div className="tafsir-quoted-ayah font-quran">
          "{ayahText}"
        </div>

        {/* Tafsir Content */}
        <div className="tafsir-body-content">
          {isLoading ? (
            <div className="tafsir-loading" role="status" aria-live="polite">
              <RosetteSpinner size={28} className="text-emerald" />
              <p>جاري استرجاع التفسير الميسر المعتمد...</p>
            </div>
          ) : (
            <p className="tafsir-paragraph">{tafsirText}</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="tafsir-footer-actions">
          <button onClick={handleCopy} className="action-pill copy-btn">
            {copied ? (
              <CheckIcon size={16} strokeWidth={1.8} className="text-emerald" />
            ) : (
              <CopyIcon size={16} strokeWidth={1.8} />
            )}
            <span>{copied ? 'تم نسخ التفسير والآية' : 'نسخ التفسير'}</span>
          </button>
          <button onClick={onClose} className="action-pill close-btn">
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
