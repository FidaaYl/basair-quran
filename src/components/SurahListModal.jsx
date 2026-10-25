import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, BookOpen } from 'lucide-react';
import { SURAHS_LIST } from '../data/surahsList';
import { searchSurahs } from '../services/quranApi';

export default function SurahListModal({ isOpen, onClose, onSelectSurah, currentSurahNumber }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all', 'Meccan', 'Medinan'

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const filteredSurahs = useMemo(() => {
    let list = searchSurahs(searchQuery, SURAHS_LIST);
    if (filterType !== 'all') {
      list = list.filter((s) => s.revelationType.toLowerCase() === filterType.toLowerCase());
    }
    return list;
  }, [searchQuery, filterType]);

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="surah-modal-content animate-fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-wrap">
            <BookOpen size={20} className="modal-icon text-emerald" />
            <div>
              <h2 className="modal-title">فهرس سور القرآن الكريم</h2>
              <p className="modal-subtitle">اختر السورة للانتقال المباشر أو البحث السريع (114 سورة)</p>
            </div>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="إغلاق الفهرس">
            <X size={20} />
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div className="modal-search-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-input-icon" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم العربي، اللاتيني، أو رقم السورة (مثال: الكهف، 18، Al-Kahf)..."
              className="surah-search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="search-clear-btn">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="filter-chips-row">
            <button
              onClick={() => setFilterType('all')}
              className={`filter-chip ${filterType === 'all' ? 'active' : ''}`}
            >
              الكل (114)
            </button>
            <button
              onClick={() => setFilterType('Meccan')}
              className={`filter-chip ${filterType === 'Meccan' ? 'active' : ''}`}
            >
              مكية (86)
            </button>
            <button
              onClick={() => setFilterType('Medinan')}
              className={`filter-chip ${filterType === 'Medinan' ? 'active' : ''}`}
            >
              مدنية (28)
            </button>
          </div>
        </div>

        {/* Surahs Grid */}
        <div className="surahs-grid-container">
          {filteredSurahs.length === 0 ? (
            <div className="empty-results-state">
              <p>لم يتم العثور على سورة تطابق "{searchQuery}"</p>
            </div>
          ) : (
            filteredSurahs.map((surah) => {
              const isSelected = currentSurahNumber === surah.number;
              return (
                <button
                  key={surah.number}
                  onClick={() => {
                    onSelectSurah(surah.number);
                    onClose();
                  }}
                  className={`surah-card-btn ${isSelected ? 'selected' : ''}`}
                >
                  <div className="surah-number-box">
                    <span className="surah-num">{surah.number}</span>
                  </div>
                  <div className="surah-info-center">
                    <span className="surah-ar-name font-calligraphy">{surah.name}</span>
                    <span className="surah-en-name">{surah.englishName} • {surah.englishNameTranslation}</span>
                  </div>
                  <div className="surah-meta-end">
                    <span className="surah-ayah-count">{surah.numberOfAyahs} آية</span>
                    <span className={`surah-type-badge ${surah.revelationType.toLowerCase()}`}>
                      {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
