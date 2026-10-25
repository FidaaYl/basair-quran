import React from 'react';
import { ICONS, IslamicRosette } from './common/IconSystem';
import logoBasair from '../assets/logo-basair.png';

export default function SidebarLeft({ activeTab, setActiveTab, onOpenBookmarks, onOpenSurahModal }) {
  const menuItems = [
    { id: 'reader', label: 'المصحف الشريف', icon: ICONS.mushaf },
    { id: 'bookmarks', label: 'الإشارات المرجعية', icon: ICONS.bookmarks },
    { id: 'memorize', label: 'خطط الحفظ', icon: ICONS.memorize },
    { id: 'settings', label: 'الإعدادات العامة', icon: ICONS.settings },
  ];

  return (
    <aside className="sidebar-left" aria-label="شريط التنقل الجانبي">
      {/* Brand & Logo from user asset */}
      <div className="sidebar-brand-block">
        <div className="brand-logo-img-wrap">
          <img 
            src={logoBasair} 
            alt="شعار بَصَائِر | Basa'ir" 
            className="brand-logo-img"
          />
        </div>
        <div className="brand-titles">
          <h1 className="brand-main-title font-calligraphy">بَصَائِر</h1>
          <span className="brand-subtitle">Basa'ir Studio</span>
        </div>
      </div>

      {/* Navigation List with standardized 20px icons and 1.8px stroke */}
      <nav className="sidebar-nav-list" aria-label="قائمة الأقسام">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'reader' && activeTab === 'reader');
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'bookmarks') {
                  onOpenBookmarks?.();
                } else {
                  setActiveTab(item.id);
                }
              }}
              className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              aria-label={item.label}
            >
              <Icon size={20} strokeWidth={1.8} className="sidebar-item-icon" />
              <span className="sidebar-item-text">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Spiritual Inscription Card with user's uploaded artwork and authentic Islamic Rosette */}
      <div className="sidebar-bottom-quote-card">
        <div className="quote-ornament-star" aria-hidden="true">
          <IslamicRosette size={18} className="text-gold" />
        </div>
        <p className="quote-text font-calligraphy">
          وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ
        </p>
        <span className="quote-reference">سورة البينة - الآية 5</span>
      </div>
    </aside>
  );
}
