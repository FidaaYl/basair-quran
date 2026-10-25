import React from 'react';
import { ICONS } from './common/IconSystem';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  onOpenSurahModal, 
  onOpenRestModal,
  currentSurah 
}) {
  const navItems = [
    { id: 'reader', label: 'المصحف والتلاوة', icon: ICONS.mushaf },
    { id: 'memorize', label: 'معمل الحفظ', icon: ICONS.memorize },
    { id: 'mutashabihat', label: 'المتشابهات', icon: ICONS.mutashabihat },
    { id: 'tadabbur', label: 'بصائر وتدبر', icon: ICONS.tadabbur },
    { id: 'scholars', label: 'كتب العلماء', icon: ICONS.scholars },
  ];

  const SearchIcon = ICONS.search;
  const TerminalIcon = ICONS.terminal;
  const SunIcon = ICONS.themeLight;
  const MoonIcon = ICONS.themeDark;
  const UserIcon = ICONS.profile;

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Search Bar matching screenshot */}
        <div 
          className="navbar-search-wrapper" 
          onClick={onOpenSurahModal}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onOpenSurahModal?.(); }}
          aria-label="ابحث في القرآن الكريم أو تصفح السور"
        >
          <SearchIcon size={18} strokeWidth={1.8} className="search-bar-icon" />
          <input
            type="text"
            readOnly
            placeholder="ابحث في القرآن الكريم..."
            className="navbar-search-input"
            aria-label="حقل البحث في القرآن الكريم"
          />
          <kbd className="search-kbd-shortcut">Ctrl + K</kbd>
        </div>

        {/* Center Navigation Tabs (Standardized 20px icons, 1.8px stroke) */}
        <nav className="navbar-nav-pills" aria-label="أقسام المنصة الرئيسية">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
                aria-label={item.label}
              >
                <Icon size={20} strokeWidth={1.8} className="nav-pill-icon" />
                <span className="nav-pill-label">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Tools: REST Inspector, Theme Switcher & Profile Badge */}
        <div className="navbar-right-tools">
          {/* REST API Inspector Button */}
          <button
            onClick={onOpenRestModal}
            className="navbar-tool-btn rest-btn"
            title="مستكشف واجهات برمجة التطبيقات (TryHackMe REST APIs)"
            aria-label="مستكشف واجهات برمجة التطبيقات REST API Explorer"
          >
            <TerminalIcon size={16} strokeWidth={1.8} className="text-emerald" />
            <span className="rest-text">REST</span>
          </button>

          {/* Theme Toggles (Sun & Moon) */}
          <div className="theme-toggle-cluster" role="radiogroup" aria-label="اختيار مظهر التطبيق">
            <button
              onClick={() => setTheme('light')}
              className={`cluster-btn ${theme === 'light' ? 'active' : ''}`}
              title="النمط النهاري (Noor)"
              aria-label="النمط النهاري"
              aria-checked={theme === 'light'}
              role="radio"
            >
              <SunIcon size={16} strokeWidth={1.8} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`cluster-btn ${theme === 'dark' ? 'active' : ''}`}
              title="النمط الليلي (Layl)"
              aria-label="النمط الليلي"
              aria-checked={theme === 'dark'}
              role="radio"
            >
              <MoonIcon size={16} strokeWidth={1.8} />
            </button>
          </div>

          {/* User Profile Badge */}
          <div 
            className="user-profile-badge" 
            title="فداء يعلاوي — عمل فردي (جامعة البليدة 2)"
            tabIndex={0}
            role="button"
            aria-label="الملف الشخصي: فداء يعلاوي"
          >
            <div className="profile-avatar-circle">
              <UserIcon size={16} strokeWidth={1.8} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
