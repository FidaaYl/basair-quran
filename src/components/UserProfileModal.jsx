import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ICONS, IslamicRosette } from './common/IconSystem';

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  onNavigateSettings,
  theme,
  setTheme 
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const UserIcon = ICONS.profile;
  const CloseIcon = ICONS.close;
  const FlameIcon = ICONS.streak;
  const SproutIcon = ICONS.level;
  const MushafIcon = ICONS.mushaf;
  const BookmarksIcon = ICONS.bookmarks;
  const SettingsIcon = ICONS.settings;
  const SparklesIcon = ICONS.sparkles;
  const CheckIcon = ICONS.check;
  const SunIcon = ICONS.themeLight;
  const MoonIcon = ICONS.themeDark;

  return createPortal(
    <div 
      className="profile-modal-overlay animate-fade-in" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="الملف الشخصي: فداء يعلاوي"
    >
      <div 
        className="profile-modal-card" 
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header with Islamic Pattern Accent */}
        <div className="profile-modal-header">
          <div className="profile-header-meta">
            <div className="profile-avatar-large">
              <UserIcon size={32} strokeWidth={1.8} className="text-emerald" />
              <div className="profile-avatar-badge" title="طالب نشط">
                <CheckIcon size={12} strokeWidth={2.5} />
              </div>
            </div>
            <div className="profile-header-titles">
              <div className="profile-name-row">
                <h2 className="profile-full-name font-calligraphy">فداء يعلاوي</h2>
                <span className="profile-role-tag">طالب علم وباحث</span>
              </div>
              <p className="profile-affiliation">
                منصة بَصَائِر القرآنية الذكية — Basa'ir Studio
              </p>
            </div>
          </div>

          <button 
            type="button" 
            onClick={onClose} 
            className="profile-modal-close-btn"
            title="إغلاق الملف الشخصي"
            aria-label="إغلاق النافذة"
          >
            <CloseIcon size={18} strokeWidth={2} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="profile-modal-body">
          {/* Main Quranic Milestones & Stats */}
          <div className="profile-stats-grid">
            <div className="profile-stat-box">
              <div className="stat-box-icon text-gold">
                <FlameIcon size={20} strokeWidth={1.8} />
              </div>
              <div className="stat-box-content">
                <span className="stat-box-number font-calligraphy">12 يوماً</span>
                <span className="stat-box-label">سلسلة القراءة المتواصلة</span>
              </div>
            </div>

            <div className="profile-stat-box">
              <div className="stat-box-icon text-emerald">
                <MushafIcon size={20} strokeWidth={1.8} />
              </div>
              <div className="stat-box-content">
                <span className="stat-box-number font-calligraphy">3 سور</span>
                <span className="stat-box-label">تم حفظها وتثبيتها</span>
              </div>
            </div>

            <div className="profile-stat-box">
              <div className="stat-box-icon text-gold">
                <BookmarksIcon size={20} strokeWidth={1.8} />
              </div>
              <div className="stat-box-content">
                <span className="stat-box-number font-calligraphy">7 إشارات</span>
                <span className="stat-box-label">علامات مرجعية وتدبر</span>
              </div>
            </div>

            <div className="profile-stat-box">
              <div className="stat-box-icon text-emerald">
                <SproutIcon size={20} strokeWidth={1.8} />
              </div>
              <div className="stat-box-content">
                <span className="stat-box-number font-calligraphy">مبتدئ متقدم</span>
                <span className="stat-box-label">المستوى القرآني</span>
              </div>
            </div>
          </div>

          {/* Current Khatmah Progress Card */}
          <div className="profile-khatmah-card">
            <div className="khatmah-card-header">
              <div className="khatmah-title-group">
                <IslamicRosette size={18} className="text-gold" />
                <h3 className="khatmah-card-title">الختمة التدبرية الأولى (1446-1447هـ)</h3>
              </div>
              <span className="khatmah-percent-pill font-calligraphy">تقدم: 8.5%</span>
            </div>
            <div className="khatmah-progress-bar-wrap">
              <div className="khatmah-progress-bar-fill" style={{ width: '8.5%' }} />
            </div>
            <div className="khatmah-footer-row">
              <span className="khatmah-note">الحزب الحالي: الحزب الأول (سورة البقرة)</span>
              <span className="khatmah-target">الهدف: جزء كل أسبوعين</span>
            </div>
          </div>

          {/* Quick Settings & Theme Action */}
          <div className="profile-actions-row">
            <div className="profile-theme-toggle-group">
              <span className="action-label">مظهر التطبيق:</span>
              <div className="theme-toggle-cluster" role="radiogroup" aria-label="اختيار مظهر التطبيق">
                <button
                  type="button"
                  onClick={() => setTheme?.('light')}
                  className={`cluster-btn ${theme === 'light' ? 'active' : ''}`}
                  title="النمط النهاري"
                >
                  <SunIcon size={15} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme?.('dark')}
                  className={`cluster-btn ${theme === 'dark' ? 'active' : ''}`}
                  title="النمط الليلي"
                >
                  <MoonIcon size={15} strokeWidth={1.8} />
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose?.();
                onNavigateSettings?.();
              }}
              className="profile-full-settings-btn"
            >
              <SettingsIcon size={16} strokeWidth={1.8} />
              <span>الإعدادات الشاملة للمنصة</span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
