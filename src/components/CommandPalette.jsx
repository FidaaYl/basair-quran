import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ICONS } from './common/IconSystem';
import { SURAHS_LIST } from '../data/surahsList';
import { SCHOLARS_BOOKS } from '../data/scholarsBooks';
import './CommandPalette.css';

export default function CommandPalette({
  isOpen,
  onClose,
  onSelectSurah,
  onSelectAyah,
  onNavigateTab,
  onOpenRestModal,
  onOpenProfile
}) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const items = [];

    const quickActions = [
      {
        id: 'action-reader',
        type: 'action',
        title: 'المصحف والتلاوة',
        subtitle: 'الانتقال إلى وضع المصحف وتلاوة الآيات',
        badge: 'قسم',
        icon: ICONS.mushaf,
        run: () => onNavigateTab('reader')
      },
      {
        id: 'action-memorize',
        type: 'action',
        title: 'معمل الحفظ الذكي',
        subtitle: 'جلسات استرجاع وتثبيت الحفظ والمراجعة',
        badge: 'قسم',
        icon: ICONS.memorize,
        run: () => onNavigateTab('memorize')
      },
      {
        id: 'action-mutashabihat',
        type: 'action',
        title: 'مستكشف المتشابهات اللفظية',
        subtitle: 'فروق الآيات والضبط البلاغي واللغوي',
        badge: 'قسم',
        icon: ICONS.mutashabihat,
        run: () => onNavigateTab('mutashabihat')
      },
      {
        id: 'action-tadabbur',
        type: 'action',
        title: 'بصائر وتدبر',
        subtitle: 'تأملات وهدايات قرآنية عميقة',
        badge: 'قسم',
        icon: ICONS.tadabbur,
        run: () => onNavigateTab('tadabbur')
      },
      {
        id: 'action-scholars',
        type: 'action',
        title: 'مكتبة كتب العلماء',
        subtitle: 'أمهات كتب التفسير والحديث والمخطوطات',
        badge: 'قسم',
        icon: ICONS.scholars,
        run: () => onNavigateTab('scholars')
      },
      {
        id: 'action-khatmah',
        type: 'action',
        title: 'مخطط الختمات والأوراد',
        subtitle: 'متابعة أوراد التلاوة، نسبة إنجاز الأجزاء، وأيام المواظبة',
        badge: 'قسم',
        icon: ICONS.streak,
        run: () => onNavigateTab('khatmah')
      },
      {
        id: 'action-rest',
        type: 'action',
        title: 'مستكشف واجهات REST API',
        subtitle: 'فحص الترويسات ومسارات HTTP الحية وزمن الاستجابة',
        badge: 'أداة تقنية',
        icon: ICONS.terminal,
        run: () => onOpenRestModal()
      },
      {
        id: 'action-profile',
        type: 'action',
        title: 'الملف الأكاديمي والتعريفي',
        subtitle: 'إعدادات المنصة، المظهر وتفضيلات التلاوة والحفظ',
        badge: 'حساب',
        icon: ICONS.profile,
        run: () => onOpenProfile()
      }
    ];

    if (!q) {
      return quickActions;
    }

    quickActions.forEach(action => {
      if (action.title.toLowerCase().includes(q) || action.subtitle.toLowerCase().includes(q)) {
        items.push(action);
      }
    });

    const surahMatches = SURAHS_LIST.filter(surah => {
      const numMatch = String(surah.number) === q;
      const nameMatch = surah.name.includes(q) || surah.englishName.toLowerCase().includes(q);
      const cleanQ = q.replace(/[إأآا]/g, 'ا');
      const cleanName = surah.name.replace(/[إأآا]/g, 'ا');
      return numMatch || nameMatch || cleanName.includes(cleanQ);
    }).slice(0, 8).map(surah => ({
      id: `surah-${surah.number}`,
      type: 'surah',
      title: `سورة ${surah.name}`,
      subtitle: `${surah.englishName} • ${surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • ${surah.numberOfAyahs} آية`,
      badge: `رقم ${surah.number}`,
      icon: ICONS.mushaf,
      run: () => {
        onSelectSurah(surah.number);
        onNavigateTab('reader');
      }
    }));
    items.push(...surahMatches);

    const bookMatches = (SCHOLARS_BOOKS || []).filter(book => {
      return (
        book.title?.toLowerCase().includes(q) ||
        book.author?.toLowerCase().includes(q) ||
        book.desc?.toLowerCase().includes(q)
      );
    }).slice(0, 4).map(book => ({
      id: `book-${book.id}`,
      type: 'book',
      title: book.title,
      subtitle: `${book.author} (${book.authorDeath || ''}) • ${book.category || 'مخطوط'}`,
      badge: 'مكتبة العلماء',
      icon: ICONS.tafsir,
      run: () => onNavigateTab('scholars')
    }));
    items.push(...bookMatches);

    return items;
  }, [query, onNavigateTab, onOpenRestModal, onOpenProfile, onSelectSurah]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % (results.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % (results.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].run();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, selectedIndex, onClose]);

  if (!isOpen) return null;

  const SearchIcon = ICONS.search;
  const CloseIcon = ICONS.close;

  return (
    <div className="palette-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="لوحة الأوامر والبحث الشامل">
      <div className="palette-modal" onClick={e => e.stopPropagation()}>
        {/* Header Search Input */}
        <div className="palette-search-header">
          <SearchIcon size={20} className="palette-search-icon" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="ابحث عن سورة، آية، كتاب، أو قسم داخل المنصة (أو اكتب رقماً)..."
            className="palette-search-input"
            dir="rtl"
          />
          {query ? (
            <button className="palette-clear-btn" onClick={() => setQuery('')} aria-label="مسح البحث">
              <CloseIcon size={16} />
            </button>
          ) : (
            <kbd className="palette-esc-kbd">ESC</kbd>
          )}
        </div>

        {/* Results List */}
        <div className="palette-results-list" role="listbox">
          {results.length > 0 ? (
            results.map((item, idx) => {
              const Icon = item.icon || ICONS.search;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  className={`palette-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  role="option"
                  aria-selected={isSelected}
                >
                  <div className="palette-item-icon-wrap">
                    <Icon size={18} strokeWidth={1.8} />
                  </div>
                  <div className="palette-item-info">
                    <div className="palette-item-title-row">
                      <span className="palette-item-title">{item.title}</span>
                      {item.badge && <span className="palette-item-badge">{item.badge}</span>}
                    </div>
                    {item.subtitle && <p className="palette-item-sub">{item.subtitle}</p>}
                  </div>
                  {isSelected && <span className="palette-enter-hint">↵ انتقال</span>}
                </div>
              );
            })
          ) : (
            <div className="palette-empty-state">
              <p>لم نجد نتائج مطابقة لـ "{query}"</p>
              <span>جرّب البحث باسم السورة (مثل: الكهف)، أو رقمها (مثل: 18)، أو اسم كتاب.</span>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="palette-footer">
          <div className="palette-shortcuts-hint">
            <span><kbd>↑</kbd> <kbd>↓</kbd> للتنقل</span>
            <span><kbd>↵</kbd> للاختيار</span>
            <span><kbd>ESC</kbd> للإغلاق</span>
          </div>
          <div className="palette-brand-tag">
            <span>بَصَائِر | Basa'ir Unified Command</span>
          </div>
        </div>
      </div>
    </div>
  );
}
