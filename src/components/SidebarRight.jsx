import React, { useState, useEffect } from 'react';
import { ICONS, IslamicRosette } from './common/IconSystem';
import { RECITERS } from '../data/reciters';
import FavoriteRecitersModal from './FavoriteRecitersModal';

const INSPIRATIONAL_QUOTES = [
  { text: "﴿وَمَا تَوْفِيقِي إِلَّا بِاللَّهِ﴾", ref: "سورة هود - الآية 88" },
  { text: "﴿وَقُل رَّبِّ زِدْنِي عِلْمًا﴾", ref: "سورة طه - الآية 114" },
  { text: "﴿أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ﴾", ref: "سورة الرعد - الآية 28" },
  { text: "﴿إِنَّ مَعَ الْعُسْرِ يُسْرًا﴾", ref: "سورة الشرح - الآية 6" },
  { text: "﴿وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ﴾", ref: "سورة البقرة - الآية 186" },
  { text: "﴿فَاذْكُرُونِي أَذْكُرْكُمْ﴾", ref: "سورة البقرة - الآية 152" },
  { text: "﴿وَتَوَكَّلْ عَلَى الْعَزِيزِ الرَّحِيمِ﴾", ref: "سورة الشعراء - الآية 217" },
  { text: "﴿إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ﴾", ref: "سورة الأعراف - الآية 56" }
];

const WEEK_DAYS = [
  { id: 0, label: 'سبت' },
  { id: 1, label: 'أحد' },
  { id: 2, label: 'إثنين' },
  { id: 3, label: 'ثلاثاء' },
  { id: 4, label: 'أربعاء' },
  { id: 5, label: 'خميس' },
  { id: 6, label: 'جمعة' },
];

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
  const [wirdCompleted, setWirdCompleted] = useState(() => {
    const saved = localStorage.getItem('basair_wird_completed');
    return saved !== null ? Number(saved) : 3;
  });

  const [wirdGoal, setWirdGoal] = useState(() => {
    const saved = localStorage.getItem('basair_wird_goal');
    return saved !== null ? Number(saved) : 7;
  });

  const [habitDays, setHabitDays] = useState(() => {
    try {
      const saved = localStorage.getItem('basair_habit_days');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading habit days:', e);
    }
    return [true, true, true, true, true, true, false];
  });

  const [quoteIdx, setQuoteIdx] = useState(0);

  const [favoriteReciterIds, setFavoriteReciterIds] = useState(() => {
    try {
      const saved = localStorage.getItem('basair_favorite_reciters');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading favorite reciters:', e);
    }
    return ['ar.husary', 'ar.alafasy', 'ar.minshawi', 'ar.abdulbasitmurattal'];
  });

  const [isRecitersModalOpen, setIsRecitersModalOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('basair_favorite_reciters', JSON.stringify(favoriteReciterIds));
    } catch (e) {
      console.warn('Error saving favorite reciters:', e);
    }
  }, [favoriteReciterIds]);

  const toggleFavoriteReciter = (reciterId) => {
    setFavoriteReciterIds((prev) => {
      if (prev.includes(reciterId)) {
        if (prev.length <= 1) return prev;
        return prev.filter((id) => id !== reciterId);
      } else {
        return [...prev, reciterId];
      }
    });
  };

  const favoriteRecitersList = RECITERS.filter((r) => favoriteReciterIds.includes(r.id));
  const activeReciterObj = RECITERS.find((r) => r.id === selectedReciter) || RECITERS[0];

  useEffect(() => {
    localStorage.setItem('basair_wird_completed', wirdCompleted);
  }, [wirdCompleted]);

  useEffect(() => {
    localStorage.setItem('basair_wird_goal', wirdGoal);
  }, [wirdGoal]);

  useEffect(() => {
    localStorage.setItem('basair_habit_days', JSON.stringify(habitDays));
  }, [habitDays]);

  const progressPercent = Math.min(100, Math.round((wirdCompleted / (wirdGoal || 1)) * 100));
  const isGoalReached = wirdCompleted >= wirdGoal;

  const handleIncrementAyah = (e) => {
    e?.stopPropagation();
    setWirdCompleted((prev) => prev + 1);
  };

  const handleCompleteGoal = (e) => {
    e?.stopPropagation();
    setWirdCompleted(wirdGoal);
  };

  const handleResetWird = (e) => {
    e?.stopPropagation();
    setWirdCompleted(0);
  };

  const handleToggleDay = (idx) => {
    setHabitDays((prev) => {
      const updated = [...prev];
      updated[idx] = !updated[idx];
      return updated;
    });
  };

  const handleCycleQuote = () => {
    setQuoteIdx((prev) => (prev + 1) % INSPIRATIONAL_QUOTES.length);
  };

  const streakDaysCount = habitDays.filter(Boolean).length * 2;

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
  const CheckIcon = ICONS.check;
  const RefreshIcon = ICONS.refresh;
  const SparklesIcon = ICONS.sparkles;
  const PlusIcon = ICONS.plus;
  const PlayIcon = ICONS.play;
  const PauseIcon = ICONS.pause;
  const HeartIcon = ICONS.heart;

  const currentQuote = INSPIRATIONAL_QUOTES[quoteIdx] || INSPIRATIONAL_QUOTES[0];

  return (
    <aside className="sidebar-right" aria-label="الشريط الجانبي للأدوات والورد القرآني">
      {/* 1. Daily Wird & Habit Tracker (Interactive) */}
      <div className="sidebar-card wird-card">
        <div className="wird-header-row">
          <div className="wird-icon-wrap" title="ورد القرآن اليومي" aria-hidden="true">
            <IslamicRosette size={20} className="text-gold" />
          </div>
          <div className="wird-header-text">
            <h3 className="wird-title">وردك اليوم</h3>
            <p className="wird-subtitle">استمر في بناء عادتك القرآنية</p>
          </div>
        </div>

        {/* Progress Fraction & Bar */}
        <div className="wird-progress-section">
          <div className="wird-progress-label-row">
            <div className="wird-counter-display">
              <span className="wird-counter-label">المقروء اليوم:</span>
              <span className="progress-fraction font-calligraphy" dir="ltr">
                {wirdCompleted} / {wirdGoal}
              </span>
              <span className="wird-unit-label">آية</span>
            </div>
            <span className="wird-pct-tag font-calligraphy">{progressPercent}%</span>
          </div>

          <div className="wird-progress-track">
            <div 
              className={`wird-progress-fill ${isGoalReached ? 'completed' : ''}`}
              style={{ width: `${progressPercent}%` }} 
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>

          {/* Celebration Banner when goal is reached */}
          {isGoalReached && (
            <div className="wird-goal-celebration animate-fade-in">
              <SparklesIcon size={14} className="text-gold" />
              <span>ما شاء الله! أتممت وردك اليوم</span>
            </div>
          )}

          {/* Interactive Action Controls */}
          <div className="wird-interactive-actions">
            <button
              type="button"
              onClick={handleIncrementAyah}
              className="wird-action-btn primary"
              title="زيادة آية إلى وردك اليوم"
            >
              +1 آية
            </button>
            {!isGoalReached ? (
              <button
                type="button"
                onClick={handleCompleteGoal}
                className="wird-action-btn secondary"
                title="تسجيل إتمام الورد اليومي كاملاً"
              >
                أتممت الورد
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResetWird}
                className="wird-action-btn reset"
                title="إعادة ضبط الورد لليوم التالي"
              >
                <RefreshIcon size={12} strokeWidth={2} />
                <span>إعادة ضبط</span>
              </button>
            )}
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
                {streakDaysCount} يوماً <FlameIcon size={14} strokeWidth={1.8} className="text-gold" />
              </span>
            </div>
            {/* 7-day Interactive Habit Dots */}
            <div className="habit-dots-row" role="group" aria-label="أيام القراءة المتتالية (انقر للتعديل)">
              {WEEK_DAYS.map((day, idx) => {
                const isActive = habitDays[idx];
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => handleToggleDay(idx)}
                    className={`habit-dot-interactive ${isActive ? 'active' : ''}`}
                    title={`${day.label}: ${isActive ? 'تمت القراءة (انقر للإلغاء)' : 'لم تقرأ (انقر لتسجيل القراءة)'}`}
                    aria-pressed={isActive}
                  >
                    <span className="habit-dot-day-label">{day.label}</span>
                    <span className="habit-dot-circle">
                      {isActive && <CheckIcon size={10} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Interactive Inspirational Tadabbur Ayah Card */}
        <div 
          className="inspirational-ayah-card clickable"
          onClick={handleCycleQuote}
          role="button"
          tabIndex={0}
          title="انقر لتغيير آية التدبر والتذكرة"
          aria-label="آية وتذكرة تدبرية (انقر للتبديل)"
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCycleQuote(); }}
        >
          <p className="inspirational-ayah-text font-quran">
            {currentQuote.text}
          </p>
          <div className="inspirational-card-footer">
            <span className="inspirational-ayah-ref">{currentQuote.ref}</span>
            <span className="inspirational-click-hint">انقر للتغيير ↻</span>
          </div>
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
          <div className="reciters-header-title-wrap">
            <h4 className="tools-card-title">القراء المفضلين</h4>
            <span className="fav-count-pill" title="عدد القراء في مفضلتك">
              {favoriteRecitersList.length}
            </span>
          </div>
          <button
            type="button"
            className="reciters-manage-btn"
            onClick={() => setIsRecitersModalOpen(true)}
            title="إضافة أو تخصيص القراء المفضلين"
            aria-label="إضافة وتخصيص القراء المفضلين"
          >
            <PlusIcon size={14} strokeWidth={2.2} />
            <span>إضافة</span>
          </button>
        </div>

        {/* List of favorited reciters */}
        <div className="favorite-reciters-list" role="list">
          {favoriteRecitersList.map((reciter) => {
            const isCurrentActive = reciter.id === selectedReciter;
            const isCurrentPlaying = isCurrentActive && isPlaying;

            return (
              <div
                key={reciter.id}
                className={`reciter-favorite-item ${isCurrentActive ? 'is-active-reciter' : ''}`}
                onClick={() => {
                  if (!isCurrentActive) {
                    onSelectReciter?.(reciter.id);
                    if (!isPlaying) onTogglePlay?.();
                  } else {
                    onTogglePlay?.();
                  }
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (!isCurrentActive) {
                      onSelectReciter?.(reciter.id);
                    } else {
                      onTogglePlay?.();
                    }
                  }
                }}
                aria-label={`القارئ ${reciter.nameAr}${isCurrentActive ? ' (القارئ المختار حالياً)' : ''}`}
              >
                {/* Audio Wave / Play indicator */}
                <div className="reciter-status-indicator" aria-hidden="true">
                  {isCurrentPlaying ? (
                    <div className="audio-wave-anim">
                      <span className="wave-bar animated" />
                      <span className="wave-bar animated" />
                      <span className="wave-bar animated" />
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="reciter-mini-play-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectReciter?.(reciter.id);
                        if (!isPlaying || !isCurrentActive) onTogglePlay?.();
                      }}
                      title={isCurrentActive ? 'استماع' : `اختيار ${reciter.nameAr} والاستماع`}
                      aria-label="تشغيل"
                    >
                      <PlayIcon size={12} fill="currentColor" />
                    </button>
                  )}
                </div>

                {/* Reciter Info */}
                <div className="reciter-info-text">
                  <span className="reciter-main-name font-calligraphy">
                    {reciter.nameAr}
                  </span>
                  <span className="reciter-surah-note">
                    {isCurrentActive ? `سورة ${currentSurah?.name || 'الفاتحة'}` : reciter.subtext}
                  </span>
                </div>

                {/* Real Photo Avatar */}
                <div className="reciter-avatar-wrap">
                  <img
                    src={reciter.photo}
                    alt={reciter.nameAr}
                    className="reciter-avatar-img"
                    loading="lazy"
                  />
                  {isCurrentActive && <span className="reciter-online-dot" title="القارئ النشط" />}
                </div>
              </div>
            );
          })}

          {/* Quick Add More Card / Button */}
          <button
            type="button"
            className="reciters-add-more-card"
            onClick={() => setIsRecitersModalOpen(true)}
            aria-label="استكشف وأضف المزيد من القراء"
          >
            <div className="reciters-add-icon-circle">
              <PlusIcon size={14} strokeWidth={2.2} />
            </div>
            <div className="reciters-add-text">
              <span className="reciters-add-title">استكشف قراءً آخرين</span>
              <span className="reciters-add-sub">المنشاوي، عبد الباسط، الدوسري، السديس...</span>
            </div>
          </button>
        </div>
      </div>

      {/* Reciters Favorite Manager Modal */}
      <FavoriteRecitersModal
        isOpen={isRecitersModalOpen}
        onClose={() => setIsRecitersModalOpen(false)}
        favoriteReciterIds={favoriteReciterIds}
        onToggleFavorite={toggleFavoriteReciter}
        selectedReciter={selectedReciter}
        onSelectReciter={onSelectReciter}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
      />
    </aside>
  );
}
