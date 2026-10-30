import React, { useState, useEffect } from 'react';
import { ICONS } from './common/IconSystem';
import logoBasair from '../assets/logo-basair.png';

const SPIRITUAL_VERSES = [
  { text: "وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ", surah: "سورة البينة", ayah: 5 },
  { text: "أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ", surah: "سورة الرعد", ayah: 28 },
  { text: "وَتَوَكَّلْ عَلَى الْحَيِّ الَّذِي لَا يَمُوتُ", surah: "سورة الفرقان", ayah: 58 },
  { text: "وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ", surah: "سورة البقرة", ayah: 186 },
  { text: "إِنَّ مَعَ الْعُسْرِ يُسْرًا", surah: "سورة الشرح", ayah: 6 },
  { text: "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ", surah: "سورة الطلاق", ayah: "2-3" },
  { text: "فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ", surah: "سورة البقرة", ayah: 152 },
  { text: "رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ", surah: "سورة البقرة", ayah: 201 },
  { text: "وَقُل رَّبِّ زِدْنِي عِلْمًا", surah: "سورة طه", ayah: 114 },
  { text: "إِنَّ اللَّهَ مَعَ الصَّابِرِينَ", surah: "سورة البقرة", ayah: 153 },
  { text: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ", surah: "سورة آل عمران", ayah: 173 },
  { text: "إِنَّ رَحْمَتَ اللَّهِ قَرِيبٌ مِّنَ الْمُحْسِنِينَ", surah: "سورة الأعراف", ayah: 56 },
  { text: "فَصَبْرٌ جَمِيلٌ وَاللَّهُ الْمُسْتَعَانُ", surah: "سورة يوسف", ayah: 18 },
  { text: "وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ", surah: "سورة الأعراف", ayah: 156 }
];

export default function SidebarLeft({ activeTab, setActiveTab, onOpenBookmarks, onOpenSurahModal, theme = 'dark' }) {
  const [verseIndex, setVerseIndex] = useState(() => Math.floor(Math.random() * SPIRITUAL_VERSES.length));
  const [isShuffling, setIsShuffling] = useState(false);

  const menuItems = [
    { id: 'reader', label: 'المصحف الشريف', icon: ICONS.mushaf },
    { id: 'bookmarks', label: 'الإشارات المرجعية', icon: ICONS.bookmarks },
    { id: 'memorize', label: 'خطط الحفظ', icon: ICONS.memorize },
    { id: 'settings', label: 'الإعدادات العامة', icon: ICONS.settings },
  ];

  const handleShuffleVerse = (e) => {
    e?.stopPropagation();
    setIsShuffling(true);
    setTimeout(() => {
      setVerseIndex((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * SPIRITUAL_VERSES.length);
        } while (next === prev && SPIRITUAL_VERSES.length > 1);
        return next;
      });
      setIsShuffling(false);
    }, 150);
  };

  const currentVerse = SPIRITUAL_VERSES[verseIndex] || SPIRITUAL_VERSES[0];
  const ShuffleIcon = ICONS.refresh;

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
              id={`sidebar-nav-${item.id}`}
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

      {/* Bottom Spiritual Inscription Card with dynamic random verse & shuffle action */}
      <div 
        className="sidebar-bottom-quote-card"
        onClick={handleShuffleVerse}
        role="button"
        tabIndex={0}
        title="انقر لتغيير الآية والتذكرة"
        aria-label="آية وتذكرة يومية (انقر للتبديل)"
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleShuffleVerse(e); }}
      >
        <button
          type="button"
          onClick={handleShuffleVerse}
          className="quote-shuffle-btn"
          title="تبديل الآية"
          aria-label="تبديل الآية والتذكرة"
        >
          <ShuffleIcon size={12} strokeWidth={2} />
        </button>

        <div className={`quote-card-center-stage ${isShuffling ? 'fade-out' : 'fade-in'}`}>
          <p className="quote-text font-calligraphy">
            {currentVerse.text}
          </p>
          <span className="quote-reference">{currentVerse.surah} - الآية {currentVerse.ayah}</span>
        </div>
      </div>
    </aside>
  );
}
