import React, { useState } from 'react';
import { RECITERS } from '../data/reciters';
import { ICONS, IslamicRosette } from './common/IconSystem';

export default function FavoriteRecitersModal({
  isOpen,
  onClose,
  favoriteReciterIds = [],
  onToggleFavorite,
  selectedReciter,
  onSelectReciter,
  isPlaying,
  onTogglePlay,
}) {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredReciters = RECITERS.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      r.nameAr.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      (r.subtext && r.subtext.toLowerCase().includes(q))
    );
  });

  const CloseIcon = ICONS.close;
  const SearchIcon = ICONS.search;
  const HeartIcon = ICONS.heart;
  const PlayIcon = ICONS.play;
  const PauseIcon = ICONS.pause;
  const CheckIcon = ICONS.check;

  return (
    <div
      className="reciters-modal-overlay animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="إدارة وتخصيص القراء المفضلين"
    >
      <div className="reciters-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="reciters-modal-header">
          <div className="reciters-modal-title-wrap">
            <IslamicRosette size={20} className="text-gold" />
            <span className="reciters-modal-title font-calligraphy">
              إدارة القراء المفضلين ({favoriteReciterIds.length} من {RECITERS.length})
            </span>
          </div>
          <button onClick={onClose} className="reciters-modal-close-btn" title="إغلاق (Esc)" aria-label="إغلاق">
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="reciters-modal-search-wrap">
          <SearchIcon size={16} className="text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم عن الشيخ أو القارئ (مثال: الحصري، العفاسي، المنشاوي، الدوسري...)"
            className="reciters-modal-search-input"
            autoFocus
          />
        </div>

        {/* Reciters Grid */}
        <div className="reciters-modal-grid">
          {filteredReciters.map((reciter) => {
            const isFav = favoriteReciterIds.includes(reciter.id);
            const isCurrentActive = reciter.id === selectedReciter;

            return (
              <div
                key={reciter.id}
                className={`reciter-select-card ${isCurrentActive ? 'active-current' : ''} ${isFav ? 'is-fav' : ''}`}
              >
                <div className="reciter-card-top-row">
                  <div className="reciter-portrait-frame">
                    <img
                      src={reciter.photo}
                      alt={reciter.nameAr}
                      className="reciter-real-photo"
                      loading="lazy"
                    />
                    {isCurrentActive && (
                      <span className="current-active-tag">القارئ النشط</span>
                    )}
                  </div>

                  <div className="reciter-card-text">
                    <h4 className="reciter-name-ar font-calligraphy">{reciter.nameAr}</h4>
                    <span className="reciter-name-en">{reciter.name}</span>
                    <span className="reciter-desc-sub">{reciter.subtext}</span>
                  </div>
                </div>

                <div className="reciter-card-actions-row">
                  {/* Select as active reciter */}
                  <button
                    onClick={() => {
                      onSelectReciter?.(reciter.id);
                      if (!isPlaying) onTogglePlay?.();
                    }}
                    className={`reciter-action-btn select-btn ${isCurrentActive ? 'playing' : ''}`}
                    title="الاستماع لتلاوة هذا القارئ"
                  >
                    {isCurrentActive && isPlaying ? (
                      <>
                        <PauseIcon size={14} />
                        <span>جاري التلاوة</span>
                      </>
                    ) : (
                      <>
                        <PlayIcon size={14} />
                        <span>{isCurrentActive ? 'استمع الآن' : 'اختر كقارئ'}</span>
                      </>
                    )}
                  </button>

                  {/* Toggle Favorite button */}
                  <button
                    onClick={() => onToggleFavorite?.(reciter.id)}
                    className={`reciter-action-btn fav-toggle-btn ${isFav ? 'active-fav' : ''}`}
                    title={isFav ? 'إزالة من قائمة القراء المفضلين' : 'إضافة إلى قائمة القراء المفضلين'}
                  >
                    <HeartIcon size={15} className={isFav ? 'heart-icon-filled' : ''} />
                    <span>{isFav ? 'في المفضلة' : '+ أضف للمفضلة'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="reciters-modal-footer">
          <span className="reciters-footer-note">
            جميع صور القراء حقيقية ورسمية، ويتم حفظ اختياراتك المفضلة تلقائياً.
          </span>
          <button onClick={onClose} className="reciters-modal-done-btn">
            تم وحفظ التفضيلات
          </button>
        </div>
      </div>
    </div>
  );
}
