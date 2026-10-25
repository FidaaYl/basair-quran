import React from 'react';
import { BookOpen, Brain, GitCompare, Lightbulb, AudioLines, Moon, Sun, Search, User, Terminal } from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  theme, 
  setTheme, 
  onOpenSurahModal, 
  onOpenRestModal,
  currentSurah 
}) {
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'reader', label: 'المصحف والتلاوة', icon: BookOpen },
    { id: 'memorize', label: 'معمل الحفظ', icon: Brain },
    { id: 'mutashabihat', label: 'المتشابهات', icon: GitCompare },
    { id: 'tadabbur', label: 'بصائر وتدبر', icon: Lightbulb },
    { id: 'scholars', label: 'كتب العلماء', icon: AudioLines },
  ];

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Search Bar matching screenshot */}
        <div className="navbar-search-wrapper" onClick={onOpenSurahModal}>
          <Search size={16} className="search-bar-icon" />
          <input
            type="text"
            readOnly
            placeholder="ابحث في القرآن الكريم..."
            className="navbar-search-input"
          />
          <kbd className="search-kbd-shortcut">Ctrl + K</kbd>
        </div>

        {/* Center Navigation Tabs (Pill style matching screenshot) */}
        <nav className="navbar-nav-pills" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`nav-pill-btn ${isActive ? 'active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={16} className="nav-pill-icon" />
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
          >
            <Terminal size={15} className="text-emerald" />
            <span className="rest-text">REST</span>
          </button>

          {/* Theme Toggles (Sun & Moon) */}
          <div className="theme-toggle-cluster">
            <button
              onClick={() => setTheme('light')}
              className={`cluster-btn ${theme === 'light' ? 'active' : ''}`}
              title="النمط النهاري (Noor)"
            >
              <Sun size={15} />
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`cluster-btn ${theme === 'dark' ? 'active' : ''}`}
              title="النمط الليلي (Layl)"
            >
              <Moon size={15} />
            </button>
          </div>

          {/* User Profile Badge */}
          <div className="user-profile-badge" title="فداء يعلاوي — عمل فردي">
            <div className="profile-avatar-circle">
              <User size={15} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
