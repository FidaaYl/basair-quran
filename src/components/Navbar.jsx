import React from 'react';
import { BookOpen, Brain, Sparkles, Compass, Moon, Sun, Search, User } from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, theme, setTheme, onOpenSurahModal, currentSurah }) {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'reader', label: 'المصحف والتلاوة', icon: BookOpen, desc: 'قراءة واستماع' },
    { id: 'memorize', label: 'معمل الحفظ', icon: Brain, desc: 'استرجاع وحجب' },
    { id: 'mutashabihat', label: 'المتشابهات', icon: Sparkles, desc: 'فروق الآيات' },
    { id: 'tadabbur', label: 'بصائر وتدبر', icon: Compass, desc: 'حالات وتأمل' },
  ];

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand & Author Identity */}
        <div className="navbar-brand">
          <div className="brand-logo-badge">
            <span className="brand-icon-star">✦</span>
          </div>
          <div className="brand-text-block">
            <div className="brand-title-row">
              <h1 className="brand-title">بَصَائِر</h1>
              <span className="brand-tagline-badge">Basa'ir Studio</span>
            </div>
            <p className="brand-author-note">
              <User size={12} className="author-icon" />
              <span>فداء يعلاوي (Fidaa Yalaoui)</span>
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="navbar-nav" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-tab-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} className="nav-icon" />
                <div className="nav-tab-labels">
                  <span className="nav-tab-title">{item.label}</span>
                </div>
                {isActive && <div className="nav-active-indicator" />}
              </button>
            );
          })}
        </nav>

        {/* Actions: Surah Selector & Theme Toggle */}
        <div className="navbar-actions">
          <button 
            onClick={onOpenSurahModal} 
            className="action-btn surah-selector-btn"
            title="اختيار سورة والبحث السريع"
          >
            <Search size={16} />
            <span className="surah-selector-text">
              {currentSurah ? currentSurah.name : 'اختر سورة'}
            </span>
            <span className="surah-number-badge">
              {currentSurah ? `${currentSurah.number}` : ''}
            </span>
          </button>

          <button
            onClick={toggleTheme}
            className="action-btn theme-toggle-btn"
            title={theme === 'dark' ? 'التبديل إلى نمط النور (فاتح)' : 'التبديل إلى نمط الليل (داكن)'}
            aria-label="تبديل مظهر الموقع"
          >
            {theme === 'dark' ? <Sun size={18} className="theme-icon sun" /> : <Moon size={18} className="theme-icon moon" />}
          </button>
        </div>
      </div>
    </header>
  );
}
