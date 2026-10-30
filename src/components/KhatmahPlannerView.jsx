import QuranActivityHeatmap from './QuranActivityHeatmap';
import React, { useState } from 'react';
import { ICONS } from './common/IconSystem';
import './KhatmahPlannerView.css';

const DEFAULT_KHATMAH = {
  id: 'current_khatmah',
  title: 'ختمة النور والتدبر',
  targetDays: 30,
  startDate: new Date().toISOString(),
  currentJuz: 1,
  currentHizb: 1,
  readPages: 20,
  totalPages: 604,
  streakDays: 4,
  lastReadDate: new Date().toISOString().split('T')[0],
  dailyGoalPages: 20,
  completedJuzList: [1]
};

export default function KhatmahPlannerView({ onNavigateToSurah }) {
  const [khatmah, setKhatmah] = useState(() => {
    try {
      const saved = localStorage.getItem('basair_khatmah_plan');
      return saved ? JSON.parse(saved) : DEFAULT_KHATMAH;
    } catch {
      return DEFAULT_KHATMAH;
    }
  });

  const [activePreset, setActivePreset] = useState(30);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [khatmahTitleInput, setKhatmahTitleInput] = useState(khatmah.title || 'ختمة النور والتدبر');
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const savePlan = (updated) => {
    setKhatmah(updated);
    localStorage.setItem('basair_khatmah_plan', JSON.stringify(updated));
  };

  const handleMarkTodayRead = () => {
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = khatmah.lastReadDate !== today;
    const newStreak = isNewDay ? (khatmah.streakDays || 0) + 1 : khatmah.streakDays;
    const newPages = Math.min(khatmah.totalPages, khatmah.readPages + (khatmah.dailyGoalPages || 20));
    const newJuz = Math.min(30, Math.ceil(newPages / 20.13));

    const updated = {
      ...khatmah,
      readPages: newPages,
      currentJuz: newJuz,
      currentHizb: Math.min(60, Math.ceil(newPages / 10.06)),
      streakDays: newStreak,
      lastReadDate: today
    };

    savePlan(updated);
    setFeedbackMsg('تمّ تسجيل قراءة ورد اليوم بنجاح!');
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleStartNewKhatmah = (days = 30) => {
    const dailyPages = Math.ceil(604 / days);
    const newPlan = {
      id: `khatmah_${Date.now()}`,
      title: khatmahTitleInput || `ختمة الـ ${days} يوماً`,
      targetDays: days,
      startDate: new Date().toISOString(),
      currentJuz: 1,
      currentHizb: 1,
      readPages: 0,
      totalPages: 604,
      streakDays: khatmah.streakDays || 1,
      lastReadDate: '',
      dailyGoalPages: dailyPages,
      completedJuzList: []
    };
    savePlan(newPlan);
    setShowGoalModal(false);
    setFeedbackMsg(`تمّ إطلاق ${newPlan.title}`);
    setTimeout(() => setFeedbackMsg(''), 3500);
  };

  const handleToggleJuz = (juzNum) => {
    let list = khatmah.completedJuzList || [];
    if (list.includes(juzNum)) {
      list = list.filter(j => j !== juzNum);
    } else {
      list = [...list, juzNum].sort((a, b) => a - b);
    }
    const pages = Math.min(604, Math.round(list.length * 20.13));
    const updated = {
      ...khatmah,
      completedJuzList: list,
      readPages: pages,
      currentJuz: Math.min(30, list.length + 1)
    };
    savePlan(updated);
  };

  const percentage = Math.min(100, Math.round((khatmah.readPages / khatmah.totalPages) * 100));
  const remainingPages = Math.max(0, khatmah.totalPages - khatmah.readPages);
  const remainingDays = Math.ceil(remainingPages / (khatmah.dailyGoalPages || 20));

  const CheckIcon = ICONS.check;
  const FlameIcon = ICONS.streak;
  const ClockIcon = ICONS.clock;
  const BookIcon = ICONS.mushaf;
  const SettingsIcon = ICONS.settings;

  return (
    <div className="khatmah-view-wrapper" role="region" aria-label="مخطط الختمات القرآنية">
      {/* Hero Card matching scholars-hero-card and tadabbur-hero-card */}
      <div className="khatmah-hero-card">
        <div className="badge-row">
          <div className="khatmah-badge">
            <BookIcon size={16} strokeWidth={1.8} className="text-gold" />
            <span>مخطط الختمات والمواظبة (Khatmah Studio)</span>
          </div>
          <div className="khatmah-badge-secondary">
            <FlameIcon size={15} strokeWidth={1.8} className="text-amber" />
            <span>مواظبة: {khatmah.streakDays || 1} أيام متتالية</span>
          </div>
        </div>

        <div className="khatmah-hero-main-row">
          <div className="khatmah-hero-text">
            <h2 className="khatmah-title font-calligraphy">{khatmah.title}</h2>
            <p className="khatmah-desc">
              متابعة دقيقة للأوراد اليومية، حساب الأجزاء والأحزاب، وتنظيم الختمات الزمنية وفق منهجية السلف في تعاهد القرآن الكريم.
            </p>

            <div className="khatmah-actions-row">
              <button 
                type="button"
                className="khatmah-cta-primary" 
                onClick={handleMarkTodayRead}
              >
                <CheckIcon size={16} strokeWidth={2.2} />
                <span>تمّت قراءة ورد اليوم (+{khatmah.dailyGoalPages || 20} صفحة)</span>
              </button>

              <button 
                type="button"
                className="khatmah-cta-secondary" 
                onClick={() => setShowGoalModal(true)}
              >
                <SettingsIcon size={15} strokeWidth={1.8} />
                <span>تعديل الخطة</span>
              </button>
            </div>

            {feedbackMsg && (
              <div className="khatmah-inline-toast">
                <CheckIcon size={14} />
                <span>{feedbackMsg}</span>
              </div>
            )}
          </div>

          {/* Progress Dial */}
          <div className="khatmah-dial-wrapper">
            <svg className="khatmah-dial-svg" viewBox="0 0 120 120">
              <circle className="dial-track" cx="60" cy="60" r="50" />
              <circle
                className="dial-indicator"
                cx="60"
                cy="60"
                r="50"
                style={{
                  strokeDasharray: 314.16,
                  strokeDashoffset: 314.16 - (314.16 * percentage) / 100
                }}
              />
            </svg>
            <div className="dial-center">
              <span className="dial-value font-calligraphy">{percentage}%</span>
              <span className="dial-sub">{khatmah.readPages} / {khatmah.totalPages} ص</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI 4 Cards Grid - precisely aligned in 1 single row */}
      <div className="khatmah-kpi-grid">
        <div className="khatmah-kpi-card">
          <div className="kpi-icon-box gold">
            <BookIcon size={18} strokeWidth={1.8} />
          </div>
          <div className="kpi-data">
            <span className="kpi-num font-calligraphy">{khatmah.currentJuz} <span className="kpi-sub-num">/ 30</span></span>
            <span className="kpi-label">الجزء الحالي</span>
            <span className="kpi-sub-label">الحزب {khatmah.currentHizb || 1} من 60</span>
          </div>
        </div>

        <div className="khatmah-kpi-card">
          <div className="kpi-icon-box emerald">
            <ClockIcon size={18} strokeWidth={1.8} />
          </div>
          <div className="kpi-data">
            <span className="kpi-num font-calligraphy">{remainingDays} <span className="kpi-sub-num">يوماً</span></span>
            <span className="kpi-label">المدة التقديرية للختم</span>
            <span className="kpi-sub-label">بمعدل {khatmah.dailyGoalPages || 20} صفحة يومياً</span>
          </div>
        </div>

        <div className="khatmah-kpi-card">
          <div className="kpi-icon-box amber">
            <FlameIcon size={18} strokeWidth={1.8} />
          </div>
          <div className="kpi-data">
            <span className="kpi-num font-calligraphy">{khatmah.streakDays || 1} <span className="kpi-sub-num">أيام</span></span>
            <span className="kpi-label">أيام المواظبة</span>
            <span className="kpi-sub-label">تعاهد مستمر للقرآن</span>
          </div>
        </div>

        <div className="khatmah-kpi-card">
          <div className="kpi-icon-box teal">
            <CheckIcon size={18} strokeWidth={1.8} />
          </div>
          <div className="kpi-data">
            <span className="kpi-num font-calligraphy">{remainingPages} <span className="kpi-sub-num">صفحة</span></span>
            <span className="kpi-label">الصفحات المتبقية</span>
            <span className="kpi-sub-label">من إجمالي 604 صفحة</span>
          </div>
        </div>
      </div>

      {/* 30 Ajza' Manuscript Matrix */}
      <QuranActivityHeatmap
        lastReadDate={khatmah.lastReadDate}
        streakDays={khatmah.streakDays}
      />

      <div className="khatmah-matrix-card">
        <div className="matrix-header-row">
          <div>
            <h3 className="matrix-title font-calligraphy">خريطة الأجزاء القرآنية (٣٠ جزءاً)</h3>
            <p className="matrix-desc">انقر على أي جزء لتأكيد إتمام تلاوته وحفظ التقدم</p>
          </div>
          <div className="matrix-legend">
            <span className="legend-chip"><span className="legend-bullet done"></span> تمّت قراءته</span>
            <span className="legend-chip"><span className="legend-bullet reading"></span> الجزء الحالي</span>
            <span className="legend-chip"><span className="legend-bullet waiting"></span> بانتظار الورد</span>
          </div>
        </div>

        <div className="matrix-grid">
          {Array.from({ length: 30 }, (_, i) => i + 1).map((juzNum) => {
            const isCompleted = (khatmah.completedJuzList || []).includes(juzNum);
            const isCurrent = juzNum === khatmah.currentJuz && !isCompleted;
            return (
              <button
                key={juzNum}
                type="button"
                className={`matrix-juz-cell ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => handleToggleJuz(juzNum)}
                title={`الجزء ${juzNum} - انقر لتغيير الحالة`}
              >
                <div className="juz-cell-top">
                  <span className="juz-cell-num">جزء {juzNum}</span>
                  {isCompleted && <CheckIcon size={13} className="juz-cell-check" />}
                  {isCurrent && <span className="juz-cell-curr-badge">الآن</span>}
                </div>
                <span className="juz-cell-ahzab">ح {(juzNum * 2) - 1} و {juzNum * 2}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Goal Setting Modal */}
      {showGoalModal && (
        <div className="khatmah-modal-backdrop" onClick={() => setShowGoalModal(false)}>
          <div className="khatmah-dialog" onClick={(e) => e.stopPropagation()}>
            <h3 className="dialog-title font-calligraphy">تحديد خطة الختمة القرآنية</h3>
            <p className="dialog-desc">اختر وتيرة الختمة اليومية المناسبة لجدولك:</p>

            <div className="dialog-presets-stack">
              {[
                { days: 15, label: 'ختمة مكثفة (15 يوماً)', pages: 40 },
                { days: 30, label: 'ختمة شهرية معتدلة (30 يوماً)', pages: 20 },
                { days: 60, label: 'ختمة متأنية للتدبر (60 يوماً)', pages: 10 }
              ].map((p) => (
                <button
                  key={p.days}
                  type="button"
                  className={`dialog-preset-card ${activePreset === p.days ? 'active' : ''}`}
                  onClick={() => setActivePreset(p.days)}
                >
                  <span className="preset-card-title">{p.label}</span>
                  <span className="preset-card-rate">{p.pages} صفحة يومياً</span>
                </button>
              ))}
            </div>

            <div className="dialog-field">
              <label>عنوان الختمة أو النية المباركة:</label>
              <input
                type="text"
                value={khatmahTitleInput}
                onChange={(e) => setKhatmahTitleInput(e.target.value)}
                placeholder="مثال: ختمة النور والتدبر..."
                className="dialog-input"
              />
            </div>

            <div className="dialog-buttons">
              <button
                type="button"
                className="dialog-btn-save"
                onClick={() => handleStartNewKhatmah(activePreset)}
              >
                حفظ وبدء الختمة
              </button>
              <button
                type="button"
                className="dialog-btn-cancel"
                onClick={() => setShowGoalModal(false)}
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
