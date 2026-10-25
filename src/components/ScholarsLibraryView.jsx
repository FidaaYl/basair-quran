import React, { useState, useRef } from 'react';
import { ICONS } from './common/IconSystem';
import { SCHOLARS_BOOKS } from '../data/scholarsBooks';

export default function ScholarsLibraryView() {
  const [activeBookId, setActiveBookId] = useState(SCHOLARS_BOOKS[0].id);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const audioPlayerRef = useRef(new Audio());

  const handlePlayBookAudio = (book) => {
    const audio = audioPlayerRef.current;
    if (activeBookId === book.id && isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      setActiveBookId(book.id);
      audio.src = book.audioUrl;
      audio.play()
        .then(() => setIsPlayingAudio(true))
        .catch((e) => {
          console.warn('Audio playback error:', e);
          setIsPlayingAudio(false);
        });
    }
  };

  const categories = ['all', 'تفسير القرآن الكريم', 'الحديث الشريف وعلومه', 'الرقائق والتزكية', 'السيرة النبوية والفقه'];

  const filteredBooks = selectedCategory === 'all' 
    ? SCHOLARS_BOOKS 
    : SCHOLARS_BOOKS.filter((b) => b.category === selectedCategory);

  const AudioLinesIcon = ICONS.scholars;
  const PlayIcon = ICONS.play;
  const PauseIcon = ICONS.pause;
  const ClockIcon = ICONS.clock;
  const BookOpenIcon = ICONS.mushaf;
  const UserCheckIcon = ICONS.userCheck;

  return (
    <div className="scholars-wrapper" role="region" aria-label="مكتبة الكتب الصوتية للعلماء">
      {/* Hero Header */}
      <div className="scholars-hero-card">
        <div className="badge-row">
          <div className="scholars-badge">
            <AudioLinesIcon size={18} strokeWidth={1.8} className="text-gold" />
            <span>مكتبة العلماء والكتب الصوتية (Islamic Scholars Audiobooks)</span>
          </div>
        </div>
        <h2 className="scholars-title font-calligraphy">
          المكتبة الصوتية لأكابر علماء الأمة
        </h2>
        <p className="scholars-desc">
          استمع إلى أمهات الكتب في التفسير والحديث والسيرة النبوية والأخلاق بصوت نخبة من أهل العلم والقراءات، مع شروحات ميسرة وتصفح منظم.
        </p>

        {/* Category Filter Pills */}
        <div className="scholars-filters-row" role="radiogroup" aria-label="تصفية الكتب حسب التصنيف">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedCategory(cat)}
              className={`scholar-filter-chip ${selectedCategory === cat ? 'active' : ''}`}
              role="radio"
              aria-checked={selectedCategory === cat}
            >
              {cat === 'all' ? 'جميع الكتب والمصنفات' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Books Grid */}
      <div className="scholars-grid">
        {filteredBooks.map((book) => {
          const isCurrentActive = activeBookId === book.id;
          const isCurrentlyPlaying = isCurrentActive && isPlayingAudio;

          return (
            <article key={book.id} className="scholar-book-card animate-fade-in">
              <div className="book-card-header" style={{ background: book.coverBg }}>
                <span className="book-category-tag">{book.category}</span>
                <h3 className="book-title font-calligraphy">{book.title}</h3>
                <span className="book-title-en">{book.titleEn}</span>
              </div>

              <div className="book-card-body">
                <div className="book-author-row">
                  <UserCheckIcon size={16} strokeWidth={1.8} className="author-badge-icon" />
                  <span className="book-author font-calligraphy">{book.author}</span>
                </div>

                <p className="book-desc">{book.description}</p>

                <div className="book-meta-chips">
                  <div className="meta-chip">
                    <ClockIcon size={14} strokeWidth={1.8} />
                    <span>{book.totalDuration}</span>
                  </div>
                  <div className="meta-chip">
                    <BookOpenIcon size={14} strokeWidth={1.8} />
                    <span>{book.chaptersCount} فصلاً</span>
                  </div>
                </div>

                <div className="book-tags-row">
                  {book.tags.map((tag, tIdx) => (
                    <span key={tIdx} className="scholar-tag">#{tag}</span>
                  ))}
                </div>

                <div className="book-card-footer">
                  <button
                    onClick={() => handlePlayBookAudio(book)}
                    className={`play-book-btn ${isCurrentlyPlaying ? 'playing' : ''}`}
                    aria-label={isCurrentlyPlaying ? `إيقاف استماع ${book.title}` : `بدء استماع ${book.title}`}
                  >
                    {isCurrentlyPlaying ? (
                      <PauseIcon size={16} strokeWidth={1.8} />
                    ) : (
                      <PlayIcon size={16} strokeWidth={1.8} />
                    )}
                    <span>{isCurrentlyPlaying ? 'إيقاف الاستماع' : 'استماع صوتي'}</span>
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
