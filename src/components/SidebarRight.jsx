import React from 'react';
import { ICONS, IslamicRosette } from './common/IconSystem';
import { RECITERS } from '../data/reciters';
import reciterAvatar from '../assets/reciter-avatar.jpg';

export default function SidebarRight({ 
  currentSurah, 
  currentAyahIndex, 
  totalAyahs, 
  selectedReciter,
  onSelectReciter,
  setActiveTab,
  onOpenCardModal,
  onOpenTafsir,
  isPlaying,
  onTogglePlay
}) {
  const currentAyahNum = currentAyahIndex + 1;
  const progressPercent = totalAyahs > 0 ? Math.round((currentAyahNum / totalAyahs) * 100) : 0;
  const activeReciterObj = RECITERS.find((r) => r.id === selectedReciter) || RECITERS[0];

  const quickTools = [
    { id: 'memorize', label: 'معمل الحفظ', icon: ICONS.memorize, action: () => setActiveTab('memorize') },
    { id: 'mutashabihat', label: 'المتشابهات', icon: ICONS.mutashabihat, action: () => setActiveTab('mutashabihat') },
    { id: 'tafsir', label: 'التفسير', icon: ICONS.tafsir, action: () => onOpenTafsir?.() },
    { id: 'listen', label: 'الإستماع', icon: ICONS.audio, action: () => onTogglePlay?.() },
    { id: 'tadabbur', label: 'تدبر', icon: ICONS.tadabbur, action: () => setActiveTab('tadabbur') },
    { id: 'cards', label: 'بطاقات الآيات', icon: ICONS.share, action: () => onOpenCardModal?.() },
  ];

  const SproutIcon = ICONS.level;
  const FlameIcon = ICONS.streak;
  const ChevronLeftIcon = ICONS.chevronLeft;

  return (
    <aside className="sidebar-right" aria-label="الشريط الجانبي للأدوات والورد القرآني">
      {/* 1. Daily Wird & Habit Tracker */}
      <div className="sidebar-card wird-card">
        <div className="wird-header-row">
          <div className="wird-icon-wrap" title="ورد القرآن اليومي" aria-hidden="true">
            <IslamicRosette size={20} className="text-gold" />
          </div>
          <div>
            <h3 className="wird-title">وردك اليوم</h3>
            <p className="wird-subtitle">استمر في بناء عادتك القرآنية</p>
          </div>
        </div>

        {/* Progress Fraction & Bar */}
        <div className="wird-progress-section">
          <div className="wird-progress-label-row">
            <span className="progress-fraction font-calligraphy">{currentAyahNum} / {totalAyahs || 7}</span>
          </div>
          <div className="wird-progress-track">
            <div 
              className="wird-progress-fill" 
              style={{ width: `${progressPercent}%` }} 
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {/* Level and Streak */}
        <div className="wird-stats-list">
          <div className="wird-stat-row">
            <span className="wird-stat-label">مستواك الحالي</span>
            <span className="wird-level-badge">
              <SproutIcon size={14} strokeWidth={1.8} className="text-emerald" />
              <span>مبتدئ</span>
            </span>
          </div>

          <div className="wird-streak-row">
            <div className="streak-title-wrap">
              <span className="wird-stat-label">سلسلة القراءة</span>
              <span className="streak-days">
                12 يوماً <FlameIcon size={14} strokeWidth={1.8} className="text-gold" />
              </span>
            </div>
            {/* 7-day Habit Dots */}
            <div className="habit-dots-row" aria-label="أيام القراءة المتتالية">
              {[true, true, true, true, true, true, false].map((active, idx) => (
                <span key={idx} className={`habit-dot ${active ? 'active' : ''}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Inspirational Quote Card */}
        <div className="inspirational-ayah-card">
          <p className="inspirational-ayah-text font-quran">
            ﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ﴾
          </p>
          <span className="inspirational-ayah-ref">سورة هود - الآية 88</span>
        </div>
      </div>

      {/* 2. Quick Tools Grid (2 columns, 18px icons, 1.8px stroke) */}
      <div className="sidebar-card tools-grid-card">
        <h4 className="tools-card-title">أدوات سريعة</h4>
        <div className="quick-tools-grid">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={tool.action}
                className="quick-tool-btn"
                aria-label={tool.label}
              >
                <Icon size={18} strokeWidth={1.8} className="quick-tool-icon" />
                <span className="quick-tool-label">{tool.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Favorite Reciters Widget */}
      <div className="sidebar-card reciters-widget-card">
        <div className="reciters-widget-header">
          <h4 className="tools-card-title">القراء المفضلين</h4>
          <ChevronLeftIcon size={16} strokeWidth={1.8} className="text-muted" />
        </div>

        <div 
          className="active-reciter-card" 
          onClick={onTogglePlay}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onTogglePlay?.(); }}
          aria-label={`القارئ الحالي: ${activeReciterObj.nameAr}، اضغط للتشغيل أو الإيقاف`}
        >
          <div className="reciter-avatar-wrap">
            <img 
              src={reciterAvatar} 
              alt={activeReciterObj.nameAr}
              className="reciter-avatar-img"
            />
          </div>
          <div className="reciter-info-text">
            <span className="reciter-main-name font-calligraphy">{activeReciterObj.nameAr}</span>
            <span className="reciter-surah-note">سورة {currentSurah?.name || 'الفاتحة'}</span>
          </div>
          <div className="audio-wave-anim" aria-hidden="true">
            <span className={`wave-bar ${isPlaying ? 'animated' : ''}`} />
            <span className={`wave-bar ${isPlaying ? 'animated' : ''}`} />
            <span className={`wave-bar ${isPlaying ? 'animated' : ''}`} />
          </div>
        </div>
      </div>
    </aside>
  );
}
