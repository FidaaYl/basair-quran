import React, { useState, useEffect } from 'react';
import { X, BookOpenText, Copy, Check } from 'lucide-react';
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

  const handleCopy = () => {
    navigator.clipboard.writeText(`${ayahText}\n\nتفسير الميسر:\n${tafsirText}\n\n[سورة ${surahName}: آية ${ayahNumber}]`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="tafsir-modal-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <BookOpenText size={20} className="modal-icon text-emerald" />
            <div>
              <h2 className="modal-title">تفسير الميسر</h2>
              <p className="modal-subtitle">
                سورة {surahName} — الآية {ayahNumber} (مجمع الملك فهد لطباعة المصحف الشريف)
              </p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="إغلاق التفسير">
            <X size={20} />
          </button>
        </div>

        {/* Ayah Quoted */}
        <div className="tafsir-quoted-ayah font-quran">
          "{ayahText}"
        </div>

        {/* Tafsir Content */}
        <div className="tafsir-body-content">
          {isLoading ? (
            <div className="tafsir-loading">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="spinner-star animate-spin text-emerald">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeDasharray="14 30" />
              </svg>
              <p>جاري استرجاع التفسير الميسر المعتمد...</p>
            </div>
          ) : (
            <p className="tafsir-paragraph">{tafsirText}</p>
          )}
        </div>

        {/* Footer Actions */}
        <div className="tafsir-footer-actions">
          <button onClick={handleCopy} className="action-pill copy-btn">
            {copied ? <Check size={16} className="text-emerald" /> : <Copy size={16} />}
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
