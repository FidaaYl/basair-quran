import React from 'react';
import { BookOpen, Bookmark, Calendar, Settings2 } from 'lucide-react';
import logoBasair from '../assets/logo-basair.png';

export default function SidebarLeft({ activeTab, setActiveTab, onOpenBookmarks, onOpenSurahModal }) {
  const menuItems = [
    { id: 'reader', label: 'المصحف', icon: BookOpen },
    { id: 'bookmarks', label: 'الإشارات المرجعية', icon: Bookmark },
    { id: 'memorize', label: 'خطط الحفظ', icon: Calendar },
    { id: 'settings', label: 'الإعدادات', icon: Settings2 },
  ];

  return (
    <aside className="sidebar-left">
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

      {/* Navigation List */}
      <nav className="sidebar-nav-list" aria-label="شريط التنقل الجانبي">
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
            >
              <Icon size={18} className="sidebar-item-icon" />
              <span className="sidebar-item-text">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom Spiritual Inscription Card with user's uploaded artwork */}
      <div className="sidebar-bottom-quote-card">
        <div className="quote-ornament-star">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="text-gold">
            <path d="M12 2L14.8 6.5L20 6.8L16.5 10.7L17.5 16L12 13.8L6.5 16L7.5 10.7L4 6.8L9.2 6.5L12 2Z" />
          </svg>
        </div>
        <p className="quote-text font-calligraphy">
          وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ
        </p>
        <span className="quote-reference">سورة البينة - الآية 5</span>
      </div>
    </aside>
  );
}
