import React, { useState, useEffect } from 'react';
import { ICONS } from './common/IconSystem';
import './KeyboardShortcutsHelpModal.css';

export default function KeyboardShortcutsHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'تشغيل أو إيقاف التلاوة الصوتية مؤقتاً', badge: 'صوت' },
    { key: '→ / ←', desc: 'الانتقال إلى الآية السابقة أو التالية', badge: 'تنقل' },
    { key: 'F', desc: 'تفعيل وضع المحراب (Mihrab Focus Mode - شاشة كاملة)', badge: 'خشوع' },
    { key: 'T', desc: 'فتح درج تفسير الميسر للآية الحالية', badge: 'علم' },
    { key: 'S', desc: 'فتح استوديو مصمم بطاقات الآيات للمشاركة', badge: 'مشاركة' },
    { key: 'Ctrl + K', desc: 'فتح لوحة الأوامر الموحدة والبحث الشامل', badge: 'بحث' },
    { key: 'ESC', desc: 'إغلاق أي نافذة أو الرجوع للوضع الطبيعي', badge: 'نظام' },
  ];

  const CloseIcon = ICONS.close;
  const SparklesIcon = ICONS.sparkles;

  return (
    <div className="shortcuts-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true" aria-label="اختصارات لوحة المفاتيح">
      <div className="shortcuts-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-modal-header">
          <div className="shortcuts-header-title-group">
            <SparklesIcon size={18} className="text-gold" />
            <h3 className="shortcuts-title font-calligraphy">اختصارات لوحة المفاتيح السريعة</h3>
          </div>
          <button type="button" onClick={onClose} className="shortcuts-close-btn" aria-label="إغلاق">
            <CloseIcon size={16} />
          </button>
        </div>

        <p className="shortcuts-intro">
          تحكم في التلاوة والتنقل بين الآيات وفتح الأدوات دون الحاجة لاستخدام الفأرة:
        </p>

        <div className="shortcuts-list">
          {shortcuts.map((s, idx) => (
            <div key={idx} className="shortcut-item-row">
              <span className="shortcut-desc">{s.desc}</span>
              <div className="shortcut-keys-group">
                <span className="shortcut-category-tag">{s.badge}</span>
                <kbd className="shortcut-kbd">{s.key}</kbd>
              </div>
            </div>
          ))}
        </div>

        <div className="shortcuts-modal-footer">
          <span>اضغط <kbd>ESC</kbd> أو انقر بالخارج للإغلاق</span>
        </div>
      </div>
    </div>
  );
}
