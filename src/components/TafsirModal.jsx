import React, { useState, useEffect } from 'react';
import { X, BookOpen, Copy, Check, Sparkles } from 'lucide-react';
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
            <BookOpen size={20} className="modal-icon text-emerald" />
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
              <span className="spinner-star">✦</span>
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
