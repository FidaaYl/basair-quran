import React, { useState, useEffect } from 'react';
import { ICONS } from './common/IconSystem';
import { RECITERS } from '../data/reciters';

export default function SettingsView({ theme, setTheme, selectedReciter, onSelectReciter }) {
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('basair_quran_font_size') || 32));
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem('basair_quran_font_family') || 'amiri-quran');
  const [showTajweed, setShowTajweed] = useState(() => localStorage.getItem('basair_tajweed_enabled') !== 'false');
  const [showTranslation, setShowTranslation] = useState(() => localStorage.getItem('basair_show_trans') !== 'false');
  const [dailyGoal, setDailyGoal] = useState(() => Number(localStorage.getItem('basair_daily_goal') || 10));
  const [autoAdvance, setAutoAdvance] = useState(() => localStorage.getItem('basair_auto_advance') !== 'false');
  const [defaultSpeed, setDefaultSpeed] = useState(() => Number(localStorage.getItem('basair_default_speed') || 1));
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsAppInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsAppInstalled(true);
      setDeferredPrompt(null);
    }
  };

  const SettingsIcon = ICONS.settings;
  const VolumeIcon = ICONS.volumeOn;
  const TypeIcon = ICONS.type;
  const MemorizeIcon = ICONS.memorize;
  const SunIcon = ICONS.themeLight;
  const MoonIcon = ICONS.themeDark;
  const CheckIcon = ICONS.check;
  const DownloadIcon = ICONS.download;
  const RefreshIcon = ICONS.refresh;

  const handleSave = () => {
    localStorage.setItem('basair_quran_font_size', String(fontSize));
    localStorage.setItem('basair_quran_font_family', fontFamily);
    localStorage.setItem('basair_tajweed_enabled', String(showTajweed));
    localStorage.setItem('basair_show_trans', String(showTranslation));
    localStorage.setItem('basair_daily_goal', String(dailyGoal));
    localStorage.setItem('basair_auto_advance', String(autoAdvance));
    localStorage.setItem('basair_default_speed', String(defaultSpeed));

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const data = {
      theme,
      selectedReciter,
      fontSize,
      fontFamily,
      showTajweed,
      showTranslation,
      dailyGoal,
      autoAdvance,
      exportDate: new Date().toISOString(),
      bookmarks: JSON.parse(localStorage.getItem('basair_bookmarks') || '[]'),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `basair-settings-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDefaults = () => {
    if (window.confirm('هل تريد استعادة جميع الإعدادات إلى الوضع الافتراضي؟')) {
      setFontSize(32);
      setFontFamily('amiri-quran');
      setShowTajweed(true);
      setShowTranslation(true);
      setDailyGoal(10);
      setAutoAdvance(true);
      setDefaultSpeed(1);
      setTheme('dark');
      onSelectReciter('ar.alafasy');
      localStorage.clear();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  return (
    <div className="settings-page-wrapper animate-fade-in" role="region" aria-label="الإعدادات العامة">
      {/* Header */}
      <div className="settings-header-banner">
        <div className="settings-header-title-row">
          <div className="settings-icon-bubble">
            <SettingsIcon size={24} strokeWidth={1.8} className="text-emerald" />
          </div>
          <div>
            <h2 className="settings-main-title font-calligraphy">الإعدادات العامة وتفضيلات المنصة</h2>
            <p className="settings-subtitle">
              تخصيص تجربة التلاوة، مظهر المصحف الشريف، أهداف الحفظ، والبيانات الشخصية
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="settings-saved-toast animate-slide-up">
            <CheckIcon size={16} strokeWidth={2} />
            <span>تم حفظ التفضيلات بنجاح</span>
          </div>
        )}
      </div>

      <div className="settings-grid-layout">
        {/* 1. Recitation & Audio Settings */}
        <div className="settings-card">
          <div className="card-section-title">
            <VolumeIcon size={20} strokeWidth={1.8} className="text-emerald" />
            <h3 className="font-calligraphy">الصوتيات والتلاوة القرآنية</h3>
          </div>

          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">القارئ الافتراضي المفضل</span>
              <span className="control-hint">الشيخ المقرئ الذي يبدأ به المشغل دائماً</span>
            </div>
            <select
              value={selectedReciter}
              onChange={(e) => onSelectReciter(e.target.value)}
              className="settings-select font-calligraphy"
              aria-label="القارئ الافتراضي"
            >
              {RECITERS.map((reciter) => (
                <option key={reciter.id} value={reciter.id}>
                  {reciter.nameAr} ({reciter.style})
                </option>
              ))}
            </select>
          </div>

          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">سرعة التلاوة الافتراضية</span>
              <span className="control-hint">سرعة القراءة الصوتية عند بدء التشغيل</span>
            </div>
            <div className="settings-btn-group" role="radiogroup">
              <button
                type="button"
                onClick={() => setDefaultSpeed(1)}
                className={`settings-pill-btn ${defaultSpeed === 1 ? 'active' : ''}`}
                role="radio"
                aria-checked={defaultSpeed === 1}
              >
                1.0x (السرعة الطبيعية)
              </button>
              <button
                type="button"
                onClick={() => setDefaultSpeed(0.75)}
                className={`settings-pill-btn ${defaultSpeed === 0.75 ? 'active' : ''}`}
                role="radio"
                aria-checked={defaultSpeed === 0.75}
              >
                0.75x (ترتيل متأنٍ للحفظ والتدبر)
              </button>
            </div>
          </div>

          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">الانتقال التلقائي للآية التالية</span>
              <span className="control-hint">متابعة التلاوة تلقائياً عند انتهاء الآية الحالية</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                aria-label="الانتقال التلقائي للآية التالية"
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* 2. Mushaf & Typography */}
        <div className="settings-card">
          <div className="card-section-title">
            <TypeIcon size={20} strokeWidth={1.8} className="text-emerald" />
            <h3 className="font-calligraphy">عرض المصحف والخط القرآني</h3>
          </div>

          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">حجم خط الآيات القرآنية</span>
              <span className="control-hint">الحجم الحالي: {fontSize}px</span>
            </div>
            <div className="font-size-slider-wrapper">
              <span className="size-label">24</span>
              <input
                type="range"
                min="24"
                max="44"
                step="2"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="settings-range-slider"
                aria-label="حجم خط الآيات"
              />
              <span className="size-label">44</span>
            </div>
          </div>

          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">نوع الرسم العثماني والخط</span>
              <span className="control-hint">الخط المعتمد لعرض كلمات المصحف</span>
            </div>
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="settings-select"
              aria-label="نوع الخط القرآني"
            >
              <option value="amiri-quran">خط الأميري القرآني (Amiri Quran)</option>
              <option value="scheherazade">خط شهرزاد الجديد (Scheherazade New)</option>
            </select>
          </div>

          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">تمييز أحكام التجويد بالألوان</span>
              <span className="control-hint">تلوين الغنن والمدود والإدغام لتيسير القراءة السليمة</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showTajweed}
                onChange={(e) => setShowTajweed(e.target.checked)}
                aria-label="تمييز أحكام التجويد بالألوان"
              />
              <span className="slider round"></span>
            </label>
          </div>

          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">إظهار الترجمة الإنجليزية تلقائياً</span>
              <span className="control-hint">عرض ترجمة معاني الآيات أسفل النص القرآني</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={showTranslation}
                onChange={(e) => setShowTranslation(e.target.checked)}
                aria-label="إظهار الترجمة الإنجليزية"
              />
              <span className="slider round"></span>
            </label>
          </div>
        </div>

        {/* 3. Memorization & Daily Wird */}
        <div className="settings-card">
          <div className="card-section-title">
            <MemorizeIcon size={20} strokeWidth={1.8} className="text-emerald" />
            <h3 className="font-calligraphy">معمل الحفظ والورد القرآني</h3>
          </div>

          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">الهدف اليومي لعدد الآيات</span>
              <span className="control-hint">تحديد المقدار اليومي لمتابعة سلسلة القراءة</span>
            </div>
            <div className="settings-btn-group" role="radiogroup">
              {[5, 10, 20, 50].map((goal) => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => setDailyGoal(goal)}
                  className={`settings-pill-btn ${dailyGoal === goal ? 'active' : ''}`}
                  role="radio"
                  aria-checked={dailyGoal === goal}
                >
                  {goal} آيات
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Appearance & Data Management */}
        <div className="settings-card">
          <div className="card-section-title">
            <SunIcon size={20} strokeWidth={1.8} className="text-emerald" />
            <h3 className="font-calligraphy">المظهر وحفظ البيانات</h3>
          </div>

          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">مظهر الواجهة (Theme)</span>
              <span className="control-hint">التبديل بين النمط النهاري الدافئ والنمط الليلي المريح</span>
            </div>
            <div className="settings-btn-group" role="radiogroup">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`settings-pill-btn ${theme === 'light' ? 'active' : ''}`}
                role="radio"
                aria-checked={theme === 'light'}
              >
                <SunIcon size={16} strokeWidth={1.8} className="inline-icon" />
                <span>النمط النهاري (نور)</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`settings-pill-btn ${theme === 'dark' ? 'active' : ''}`}
                role="radio"
                aria-checked={theme === 'dark'}
              >
                <MoonIcon size={16} strokeWidth={1.8} className="inline-icon" />
                <span>النمط الليلي (ليل)</span>
              </button>
            </div>
          </div>

          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">النسخ الاحتياطي واستعادة البيانات</span>
              <span className="control-hint">تصدير إشاراتك المرجعية وإعداداتك في ملف JSON</span>
            </div>
            <div className="settings-actions-group">
              <button
                type="button"
                onClick={handleExportData}
                className="settings-action-btn export"
              >
                <DownloadIcon size={16} strokeWidth={1.8} />
                <span>تصدير البيانات</span>
              </button>
              <button
                type="button"
                onClick={handleResetDefaults}
                className="settings-action-btn reset"
              >
                <RefreshIcon size={16} strokeWidth={1.8} />
                <span>استعادة الافتراضي</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      
      {/* PWA & Offline Support Card */}
      <div className="settings-section-card">
        <div className="settings-section-header">
          <DownloadIcon size={20} strokeWidth={1.8} className="settings-header-icon" />
          <div>
            <h3 className="section-title">التطبيق التقدمي والعمل دون اتصال (PWA)</h3>
            <p className="section-desc">تثبيت منصة بَصَائِر على حاسوبك أو هاتفك والوصول السريع لآيات القرآن دون إنترنت</p>
          </div>
        </div>

        <div className="settings-controls-list">
          <div className="setting-control-row">
            <div className="control-label-group">
              <span className="control-title">حالة التثبيت على الجهاز</span>
              <span className="control-hint">
                {isAppInstalled 
                  ? 'منصة بَصَائِر مثبتة كـ Web App مستقل على جهازك' 
                  : 'يمكنك تثبيت التطبيق للتشغيل السريع بملء الشاشة مع حفظ البيانات محلياً'}
              </span>
            </div>
            <div className="settings-actions-group">
              {isAppInstalled ? (
                <span className="settings-pill-btn active" style={{ cursor: 'default' }}>
                  <CheckIcon size={16} /> مثبت كـ تطبيق
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleInstallPwa}
                  disabled={!deferredPrompt}
                  className="settings-action-btn export"
                  title={deferredPrompt ? 'تثبيت بَصَائِر' : 'التطبيق جاهز للتثبيت من شريط المتصفح'}
                >
                  <DownloadIcon size={16} strokeWidth={1.8} />
                  <span>{deferredPrompt ? 'تثبيت المنصة الآن' : 'جاهز للتثبيت (PWA)'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Floating / Bottom Bar */}
      <div className="settings-footer-bar">
        <button
          type="button"
          onClick={handleSave}
          className="settings-save-master-btn"
        >
          <CheckIcon size={18} strokeWidth={2} />
          <span>حفظ جميع التغييرات</span>
        </button>
      </div>
    </div>
  );
}
