import React, { useState } from 'react';
import { ICONS } from './common/IconSystem';
import { MUTASHABIHAT_DATA } from '../data/mutashabihat';

export default function MutashabihatView({ onSelectSurah }) {
  const [searchFilter, setSearchFilter] = useState('');

  const filteredData = MUTASHABIHAT_DATA.filter((item) => {
    const matchesSearch =
      item.topic.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.topicEn.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.category.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.rule.toLowerCase().includes(searchFilter.toLowerCase());

    return matchesSearch;
  });

  const GitCompareIcon = ICONS.mutashabihat;
  const SearchIcon = ICONS.search;
  const BookOpenIcon = ICONS.mushaf;
  const LightbulbIcon = ICONS.tadabbur;

  return (
    <div className="mutashabihat-wrapper" role="region" aria-label="مستكشف المتشابهات اللفظية">
      {/* Hero Header */}
      <div className="mutashabihat-hero-card">
        <div className="badge-row">
          <div className="mutashabihat-badge">
            <GitCompareIcon size={18} strokeWidth={1.8} className="text-gold" />
            <span>مستكشف المتشابهات اللفظية وتوجيه الفروق (Mutashabihat Explorer)</span>
          </div>
        </div>
        <h2 className="mutashabihat-title font-calligraphy">
          ضبط المتشابهات اللفظية وتثبيت الحفظ
        </h2>
        <p className="mutashabihat-desc">
          أحد أعظم علوم القرآن الكريم التي يحتاجها الحافظ والمفسر: مقارنة الآيات المتشابهة في الألفاظ، إبراز الكلمات الفارقة، وبيان الضابط البلاغي والسياقي للتفريق بينها حتى لا يلتبس الحفظ.
        </p>

        {/* Search */}
        <div className="mutashabihat-search-box">
          <SearchIcon size={18} strokeWidth={1.8} className="search-icon" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="ابحث في المتشابهات بالسورة، الموضع، أو الكلمة (مثال: البقرة، رغداً، شهيداً)..."
            className="mutashabihat-search-input"
            aria-label="البحث في مواضع المتشابهات القرآنية"
          />
        </div>
      </div>

      {/* Comparisons Feed */}
      <div className="mutashabihat-cards-grid">
        {filteredData.length === 0 ? (
          <div className="empty-results-state" role="status">
            <p>لم يتم العثور على مواضع متشابهة تطابق بحثك.</p>
          </div>
        ) : (
          filteredData.map((item) => (
            <div key={item.id} className="mutashabihat-item-card animate-fade-in">
              {/* Header */}
              <div className="item-card-header">
                <div className="topic-block">
                  <span className="category-pill">{item.category}</span>
                  <h3 className="item-topic font-calligraphy">{item.topic}</h3>
                  <span className="item-topic-en">{item.topicEn}</span>
                </div>
              </div>

              {/* Side-by-side or stacked verses comparison */}
              <div className="comparison-verses-grid">
                {item.verses.map((v, vIdx) => (
                  <div key={vIdx} className="compared-verse-card">
                    <div className="verse-meta-bar">
                      <span className="verse-number-chip">الموضع {vIdx + 1}: {v.reference}</span>
                      <button
                        onClick={() => onSelectSurah(v.surahNumber)}
                        className="jump-surah-btn"
                        title="الانتقال إلى هذه السورة في المصحف"
                        aria-label={`الانتقال إلى سورة ${v.reference}`}
                      >
                        <BookOpenIcon size={16} strokeWidth={1.8} />
                        <span>فتح السورة</span>
                      </button>
                    </div>

                    <div className="compared-arabic-text font-quran">
                      {v.textBefore}
                      <span className="diff-highlight-pill" title="الكلمة الفارقة المميزة">
                        {v.differingWord}
                      </span>
                      {v.textAfter}
                    </div>
                  </div>
                ))}
              </div>

              {/* Mnemonic Rule & Guidance */}
              <div className="mnemonic-rule-box">
                <div className="rule-title-row">
                  <LightbulbIcon size={18} strokeWidth={1.8} className="text-gold" />
                  <span className="rule-title">ضابط الحفظ والتوجيه البلاغي:</span>
                </div>
                <p className="rule-explanation-text">{item.rule}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
