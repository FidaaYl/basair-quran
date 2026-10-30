import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ICONS, IslamicRosette } from './common/IconSystem';
import { SCHOLARS_BOOKS } from '../data/scholarsBooks';
import { SURAHS_LIST } from '../data/surahsList';

export default function ScholarsLibraryView() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const [readingBook, setReadingBook] = useState(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [copiedChapter, setCopiedChapter] = useState(false);
  const [readerSearchQuery, setReaderSearchQuery] = useState('');
  const [readerFontSize, setReaderFontSize] = useState(18);

  const [tafsirViewMode, setTafsirViewMode] = useState('surahs');
  const [selectedSurahNumber, setSelectedSurahNumber] = useState(1);
  const [surahTafsirData, setSurahTafsirData] = useState([]);
  const [isLoadingSurahTafsir, setIsLoadingSurahTafsir] = useState(false);
  const [surahTafsirError, setSurahTafsirError] = useState(null);

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const audioPlayerRef = useRef(new Audio());

  useEffect(() => {
    const audio = audioPlayerRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoadingAudio(false);
      setAudioError(null);
    };

    const handleWaiting = () => {
      setIsLoadingAudio(true);
    };

    const handleCanPlay = () => {
      setIsLoadingAudio(false);
    };

    const handleEnded = () => {
      setIsPlayingAudio(false);
      setCurrentTime(0);
    };

    const handleError = (e) => {
      console.warn('Audio playback network error:', e);
      setIsLoadingAudio(false);
      setIsPlayingAudio(false);
      setAudioError('تعذر الاتصال بخادم الصوت. يرجى التحقق من اتصال الإنترنت.');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('waiting', handleWaiting);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('waiting', handleWaiting);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, []);

  useEffect(() => {
    if (!readingBook || readingBook.id !== 'tafsir-saadi' || tafsirViewMode !== 'surahs') {
      return;
    }

    let isMounted = true;
    setIsLoadingSurahTafsir(true);
    setSurahTafsirError(null);

    fetch(`https://api.quran.com/api/v4/tafsirs/91/by_chapter/${selectedSurahNumber}?per_page=120`)
      .then((res) => {
        if (!res.ok) throw new Error('فشل استرداد بيانات التفسير من الخادم');
        return res.json();
      })
      .then((data) => {
        if (!isMounted) return;
        if (data.tafsirs && data.tafsirs.length > 0) {
          setSurahTafsirData(data.tafsirs);
        } else {
          setSurahTafsirData([]);
        }
        setIsLoadingSurahTafsir(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.warn('Tafsir fetch error:', err);
        setSurahTafsirError('تعذر تحميل تفسير السورة من المصدر الرسمي. تحقق من اتصال الإنترنت.');
        setIsLoadingSurahTafsir(false);
      });

    return () => {
      isMounted = false;
    };
  }, [readingBook, tafsirViewMode, selectedSurahNumber]);

  const handlePlayBookAudio = (book, specificChapter = null, surahNum = null) => {
    const audio = audioPlayerRef.current;
    let targetUrl = book.audioUrl;
    let trackTitle = book.title;
    let subTitle = specificChapter?.title || book.author;

    if (book.id === 'tafsir-saadi' && surahNum) {
      const padded = String(surahNum).padStart(3, '0');
      targetUrl = `${book.audioBaseUrl}${padded}.mp3`;
      const surahMeta = SURAHS_LIST.find((s) => s.number === surahNum);
      subTitle = `تفسير ${surahMeta ? surahMeta.name : `السورة ${surahNum}`}`;
    }

    if (currentTrack?.audioUrl === targetUrl && isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
      return;
    }

    setCurrentTrack({
      bookId: book.id,
      bookTitle: book.title,
      author: book.author,
      chapterTitle: subTitle,
      leatherColor: book.leatherColor,
      audioUrl: targetUrl,
      pdfUrl: book.pdfUrl,
      shamelaUrl: book.shamelaUrl
    });

    document.querySelectorAll('audio').forEach((a) => {
      if (a !== audio) a.pause();
    });

    setAudioError(null);
    setIsLoadingAudio(true);

    if (audio.src !== targetUrl) {
      audio.src = targetUrl;
    }
    audio.playbackRate = playbackSpeed;
    audio.volume = isMuted ? 0 : volume;

    audio.play()
      .then(() => {
        setIsPlayingAudio(true);
        setIsLoadingAudio(false);
      })
      .catch((err) => {
        console.warn('Audio play failed:', err);
        setIsLoadingAudio(false);
        setIsPlayingAudio(false);
        setAudioError('تعذر تشغيل الصوت مباشرة. يرجى التحقق من اتصال الإنترنت.');
      });
  };

  const handleTogglePlayPause = () => {
    const audio = audioPlayerRef.current;
    if (isPlayingAudio) {
      audio.pause();
      setIsPlayingAudio(false);
    } else {
      audio.play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false));
    }
  };

  const handleSeek = (e) => {
    const audio = audioPlayerRef.current;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleSkipTime = (deltaSeconds) => {
    const audio = audioPlayerRef.current;
    const newTime = Math.min(Math.max(0, audio.currentTime + deltaSeconds), duration);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleToggleMute = () => {
    const audio = audioPlayerRef.current;
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const handleVolumeChange = (e) => {
    const audio = audioPlayerRef.current;
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    audio.volume = newVol;
    if (newVol > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const handleSpeedChange = () => {
    const audio = audioPlayerRef.current;
    const speeds = [1, 0.75, 1.25];
    const currentIdx = speeds.indexOf(playbackSpeed);
    const nextSpeed = speeds[(currentIdx + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
    audio.playbackRate = nextSpeed;
  };

  const handleStopAudio = () => {
    const audio = audioPlayerRef.current;
    audio.pause();
    setIsPlayingAudio(false);
    setCurrentTrack(null);
  };

  const handleOpenReader = (book, chapterIdx = 0) => {
    setReadingBook(book);
    setActiveChapterIndex(chapterIdx);
    setReaderSearchQuery('');
    if (book.id === 'tafsir-saadi') {
      setTafsirViewMode('surahs');
    }
  };

  const handleCopyChapter = (chapterTitle, content, benefits = []) => {
    const fullText = `[${readingBook?.title || 'كتاب تراثي'} — ${chapterTitle}]\n\n${content}\n\nفوائد وهدايات:\n${benefits.map((b) => '• ' + b).join('\n')}\n\nمشارَكة من منصة بَصَائِر | Basa'ir Studio`;
    navigator.clipboard.writeText(fullText);
    setCopiedChapter(true);
    setTimeout(() => setCopiedChapter(false), 2000);
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const cleanHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, ' ').replace(/\s{2,}/g, ' ').trim();
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
  const CloseIcon = ICONS.close;
  const CopyIcon = ICONS.copy;
  const CheckIcon = ICONS.check;
  const SparklesIcon = ICONS.sparkles;
  const DownloadIcon = ICONS.download;
  const ExternalLinkIcon = ICONS.externalLink;
  const SearchIcon = ICONS.search;
  const VolumeIcon = isMuted || volume === 0 ? ICONS.volumeMute : ICONS.volumeOn;
  const SkipBackIcon = ICONS.skipBack;
  const SkipForwardIcon = ICONS.skipForward;
  const GaugeIcon = ICONS.speed;
  const ShieldCheckIcon = ICONS.shieldCheck;

  const filteredChapters = (readingBook?.chapters || []).filter((ch) => {
    if (!readerSearchQuery) return true;
    const query = readerSearchQuery.toLowerCase();
    return (
      ch.title?.toLowerCase().includes(query) ||
      ch.content?.toLowerCase().includes(query) ||
      String(ch.number || '').includes(query)
    );
  });

  return (
    <div className="scholars-wrapper animate-fade-in" role="region" aria-label="مكتبة الكتب الصوتية والمقروءة للعلماء">
      {/* Hero Header */}
      <div className="scholars-hero-card">
        <div className="badge-row">
          <div className="scholars-badge">
            <AudioLinesIcon size={18} strokeWidth={1.8} className="text-gold" />
            <span>مكتبة التراث الإسلامي والكتب الصوتية (Scholars Library)</span>
          </div>
        </div>
        <h2 className="scholars-title font-calligraphy">
          المكتبة الصوتية والمقروءة لأكابر علماء الأمة
        </h2>
        <p className="scholars-desc">
          تصفح واستمع إلى أمهات الكتب المعتمدة في التفسير، الحديث النبوي، السيرة العطرة، والتزكية القلبية مع إمكانية القراءة الكاملة، تصفح فصول المخطوط، وتحميل المجلدات الأصلية.
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

      {/* Books Grid with Rich Manuscript Styling (No Gradients, Authentic Islamic Library) */}
      <div className="scholars-grid">
        {filteredBooks.map((book) => {
          const isCurrentlyPlaying = currentTrack?.bookId === book.id && isPlayingAudio;

          return (
            <article key={book.id} className="scholar-book-card-v2 animate-fade-in">
              {/* Classical Leather Hardcover Spine & Header (Solid Leather Tone with Islamic Pattern Overlay) */}
              <div 
                className="book-card-header-v2" 
                style={{ backgroundColor: book.leatherColor }}
              >
                {/* Islamic Geometric Background Pattern Overlay */}
                <div className="card-pattern-overlay" aria-hidden="true" />

                {/* Gold Stamped Ornamental Inset Frame */}
                <div className="manuscript-gold-frame" />

                <div className="book-header-content">
                  <div className="book-header-top-row">
                    <span className="book-category-tag-v2">{book.category}</span>
                    <div className="manuscript-rosette-wrap">
                      <IslamicRosette size={20} className="text-gold" />
                    </div>
                  </div>

                  <h3 className="book-title-v2 font-calligraphy">{book.title}</h3>
                  <span className="book-title-en-v2">{book.titleEn}</span>

                  <div className="manuscript-spine-badge">
                    <span>{book.volumeInfo}</span>
                  </div>
                </div>
              </div>

              {/* Book Body with Scholarly Details & Seals */}
              <div className="book-card-body-v2">
                {/* Author with Death Year Cartouche */}
                <div className="book-author-row-v2">
                  <UserCheckIcon size={16} strokeWidth={1.8} className="author-badge-icon text-gold" />
                  <div className="author-names-group">
                    <span className="book-author-name font-calligraphy">{book.author}</span>
                    <span className="author-death-badge">وفاة {book.deathYear}</span>
                  </div>
                </div>

                <p className="book-desc-v2">{book.description}</p>

                {/* Scholarly Verification Seal */}
                <div className="manuscript-verification-seal">
                  <ShieldCheckIcon size={14} strokeWidth={2} className="text-emerald" />
                  <span className="seal-text">{book.verificationSeal}</span>
                </div>

                {/* Direct Chapter Previews Accordion */}
                <div className="manuscript-chapters-preview">
                  <div className="preview-label-row">
                    <span className="preview-label">
                      {book.isHadithCollection 
                        ? 'فهرس الأحاديث المتاحة (٤٢ حديثاً كاملاً):' 
                        : book.isQuranTafsir 
                        ? 'تصفح تفسير السور والمختارات (١١٤ سورة):'
                        : 'أبواب وفصول متاحة للمطالعة:'}
                    </span>
                  </div>
                  <div className="chapter-pills-flow">
                    {book.chapters.slice(0, 4).map((ch, chIdx) => (
                      <button
                        key={ch.id || chIdx}
                        type="button"
                        onClick={() => handleOpenReader(book, chIdx)}
                        className="ch-preview-chip"
                        title={`الانتقال مباشرة إلى: ${ch.title}`}
                      >
                        <span className="ch-pill-num">{ch.number || chIdx + 1}</span>
                        <span className="ch-pill-title">{ch.title}</span>
                      </button>
                    ))}
                    {book.chapters.length > 4 && (
                      <button
                        type="button"
                        onClick={() => handleOpenReader(book, 4)}
                        className="ch-preview-more-btn"
                      >
                        + تصفح باقي الفصول ({book.chapters.length} باباً كاملاً)
                      </button>
                    )}
                  </div>
                </div>

                <div className="book-meta-chips-v2">
                  <div className="meta-chip-v2">
                    <ClockIcon size={13} strokeWidth={1.8} />
                    <span>{book.totalDuration}</span>
                  </div>
                  <div className="meta-chip-v2">
                    <BookOpenIcon size={13} strokeWidth={1.8} />
                    <span>{book.chaptersCount} باباً</span>
                  </div>
                </div>

                {/* Dual Action Buttons: Read Book & Listen to Audio */}
                <div className="book-card-actions-v2">
                  <button
                    type="button"
                    onClick={() => handleOpenReader(book)}
                    className="book-read-btn"
                    title={`قراءة وتصفح فصول ${book.title}`}
                  >
                    <BookOpenIcon size={16} strokeWidth={1.8} />
                    <span>قراءة وتصفح المخطوط</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handlePlayBookAudio(book)}
                    className={`book-listen-btn ${isCurrentlyPlaying ? 'playing' : ''}`}
                    title={isCurrentlyPlaying ? 'إيقاف مؤقت' : 'استماع صوتي معتمد'}
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

      {/* Floating Scholars Audiobook Player Dock (Always visible when a book is played) */}
      {currentTrack && (
        <div className="scholars-floating-player-dock animate-fade-in" role="region" aria-label="مشغل الكتب الصوتية">
          <div className="floating-player-container">
            {/* Track Info */}
            <div className="floating-player-track">
              <div 
                className="floating-track-badge" 
                style={{ backgroundColor: currentTrack.leatherColor || '#087f63' }}
              >
                {isPlayingAudio ? (
                  <div className="audio-wave-equalizer">
                    <span className="wave-bar" />
                    <span className="wave-bar" />
                    <span className="wave-bar" />
                    <span className="wave-bar" />
                  </div>
                ) : (
                  <IslamicRosette size={18} className="text-gold" />
                )}
              </div>
              <div className="floating-track-meta">
                <span className="floating-track-title font-calligraphy">{currentTrack.bookTitle}</span>
                <span className="floating-track-subtitle">{currentTrack.chapterTitle || currentTrack.author}</span>
              </div>
            </div>

            {/* Central Controls & Timeline */}
            <div className="floating-player-center">
              <div className="floating-player-buttons">
                <button
                  type="button"
                  onClick={() => handleSkipTime(-10)}
                  className="floating-ctrl-btn"
                  title="تراجع ١٠ ثوانٍ"
                >
                  <SkipBackIcon size={16} strokeWidth={1.8} />
                </button>

                <button
                  type="button"
                  onClick={handleTogglePlayPause}
                  className="floating-play-main-btn"
                  title={isPlayingAudio ? 'إيقاف مؤقت' : 'تشغيل'}
                >
                  {isLoadingAudio ? (
                    <span className="mini-audio-spinner" />
                  ) : isPlayingAudio ? (
                    <PauseIcon size={20} strokeWidth={2} />
                  ) : (
                    <PlayIcon size={20} strokeWidth={2} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleSkipTime(10)}
                  className="floating-ctrl-btn"
                  title="تقدم ١٠ ثوانٍ"
                >
                  <SkipForwardIcon size={16} strokeWidth={1.8} />
                </button>
              </div>

              {/* Scrubber Timeline */}
              <div className="floating-timeline-row">
                <span className="timeline-time-label">{formatTime(currentTime)}</span>
                <div className="floating-scrubber-wrap">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="floating-timeline-slider"
                    aria-label="شريط تقدم المقطع الصوتي"
                  />
                  <div 
                    className="floating-timeline-progress"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>
                <span className="timeline-time-label">{formatTime(duration)}</span>
              </div>
            </div>

            {/* Speed, Volume, and Close */}
            <div className="floating-player-extras">
              <button
                type="button"
                onClick={handleSpeedChange}
                className="floating-speed-btn"
                title="سرعة القراءة"
              >
                <GaugeIcon size={14} strokeWidth={1.8} />
                <span>{playbackSpeed}x</span>
              </button>

              <div className="floating-vol-control">
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="floating-vol-btn"
                  title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
                >
                  <VolumeIcon size={17} strokeWidth={1.8} />
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="floating-vol-slider"
                  aria-label="مستوى الصوت"
                />
              </div>

              <button
                type="button"
                onClick={handleStopAudio}
                className="floating-close-btn"
                title="إغلاق المشغل الصوتي"
              >
                <CloseIcon size={18} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* Audio Error Banner */}
          {audioError && (
            <div className="floating-player-error-banner animate-fade-in">
              <span>{audioError}</span>
            </div>
          )}
        </div>
      )}

      {/* Book Reader Modal via Portal */}
      {readingBook && createPortal(
        <div className="book-reader-modal-overlay animate-fade-in" role="dialog" aria-label={readingBook.title}>
          <div className="book-reader-modal-card">
            {/* Modal Header */}
            <div className="reader-modal-header" style={{ backgroundColor: readingBook.leatherColor }}>
              <div className="reader-header-titles">
                <span className="reader-category-pill">{readingBook.category}</span>
                <h3 className="reader-book-title font-calligraphy">{readingBook.title}</h3>
                <span className="reader-book-author font-calligraphy">{readingBook.author} (توفي {readingBook.deathYear})</span>
              </div>

              <div className="reader-header-actions">
                {/* PDF Original Volume Download Button */}
                {readingBook.pdfUrl && (
                  <a
                    href={readingBook.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reader-action-link-btn"
                    title="تحميل وتصفح المجلد الأصلي الكامل (PDF)"
                  >
                    <DownloadIcon size={15} strokeWidth={1.8} />
                    <span>تحميل الكتاب كاملاً (PDF)</span>
                  </a>
                )}

                {/* Shamela Digital Library */}
                {readingBook.shamelaUrl && (
                  <a
                    href={readingBook.shamelaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="reader-action-link-btn shamela"
                    title="تصفح الكتاب في المكتبة الشاملة (فهرس وبحث متقدم)"
                  >
                    <ExternalLinkIcon size={15} strokeWidth={1.8} />
                    <span>المكتبة الشاملة</span>
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => setReadingBook(null)}
                  className="reader-close-btn"
                  aria-label="إغلاق قارئ الكتاب"
                >
                  <CloseIcon size={20} strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Embedded Audio Bar for the Book */}
            <div className="reader-audio-integrated-bar">
              <div className="reader-audio-bar-info">
                <AudioLinesIcon size={16} strokeWidth={1.8} className="text-gold" />
                <span>
                  {currentTrack?.bookId === readingBook.id
                    ? `جاري الاستماع: ${currentTrack.chapterTitle || readingBook.title}`
                    : `استمع إلى التسجيل الصوتي المعتمد لـ ${readingBook.title}`}
                </span>
              </div>

              <div className="reader-audio-bar-controls">
                <button
                  type="button"
                  onClick={() => {
                    if (readingBook.id === 'tafsir-saadi' && tafsirViewMode === 'surahs') {
                      handlePlayBookAudio(readingBook, null, selectedSurahNumber);
                    } else {
                      handlePlayBookAudio(readingBook, readingBook.chapters[activeChapterIndex]);
                    }
                  }}
                  className="reader-audio-play-toggle"
                >
                  {currentTrack?.bookId === readingBook.id && isPlayingAudio ? (
                    <>
                      <PauseIcon size={14} strokeWidth={2} />
                      <span>إيقاف الصوت</span>
                    </>
                  ) : (
                    <>
                      <PlayIcon size={14} strokeWidth={2} />
                      <span>تشغيل التسجيل الصوتي</span>
                    </>
                  )}
                </button>

                {/* Font Size Adjusters */}
                <div className="reader-font-controls">
                  <span className="font-ctrl-label">حجم الخط:</span>
                  <button
                    type="button"
                    onClick={() => setReaderFontSize((s) => Math.max(14, s - 2))}
                    className="font-ctrl-btn"
                    title="تصغير الخط"
                  >
                    -A
                  </button>
                  <span className="font-size-indicator">{readerFontSize}px</span>
                  <button
                    type="button"
                    onClick={() => setReaderFontSize((s) => Math.min(26, s + 2))}
                    className="font-ctrl-btn"
                    title="تكبير الخط"
                  >
                    +A
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Content Stage (Chapters Sidebar + Main Content) */}
            <div className="reader-modal-stage">
              {/* Chapters List Nav */}
              <div className="reader-chapters-nav">
                {/* For Tafsir As-Sa'di: Switch between Surah Browser & Curated Highlights */}
                {readingBook.isQuranTafsir && (
                  <div className="tafsir-mode-toggle-box">
                    <button
                      type="button"
                      onClick={() => setTafsirViewMode('surahs')}
                      className={`tafsir-mode-btn ${tafsirViewMode === 'surahs' ? 'active' : ''}`}
                    >
                      فهرس سور القرآن (١١٤ سورة)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTafsirViewMode('curated')}
                      className={`tafsir-mode-btn ${tafsirViewMode === 'curated' ? 'active' : ''}`}
                    >
                      المختارات الإيمانية
                    </button>
                  </div>
                )}

                {/* Search Bar in Sidebar */}
                <div className="chapters-search-box">
                  <SearchIcon size={14} strokeWidth={1.8} className="search-icon-inside" />
                  <input
                    type="text"
                    value={readerSearchQuery}
                    onChange={(e) => setReaderSearchQuery(e.target.value)}
                    placeholder={
                      readingBook.isQuranTafsir && tafsirViewMode === 'surahs'
                        ? 'ابحث باسم السورة أو رقمها...'
                        : readingBook.isHadithCollection
                        ? 'ابحث في أحاديث النووي (٤٢)...'
                        : 'ابحث في أبواب وفصول الكتاب...'
                    }
                    className="chapters-search-input"
                  />
                  {readerSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setReaderSearchQuery('')}
                      className="search-clear-btn"
                    >
                      <CloseIcon size={13} strokeWidth={2} />
                    </button>
                  )}
                </div>

                <div className="chapters-nav-list">
                  {/* Surah List for Tafsir As-Sa'di */}
                  {readingBook.isQuranTafsir && tafsirViewMode === 'surahs' ? (
                    SURAHS_LIST.filter((s) => {
                      if (!readerSearchQuery) return true;
                      const q = readerSearchQuery.toLowerCase();
                      return (
                        s.name.includes(q) ||
                        s.englishName.toLowerCase().includes(q) ||
                        String(s.number).includes(q)
                      );
                    }).map((surah) => (
                      <button
                        key={surah.number}
                        type="button"
                        onClick={() => setSelectedSurahNumber(surah.number)}
                        className={`chapter-nav-item ${selectedSurahNumber === surah.number ? 'active' : ''}`}
                      >
                        <span className="chapter-nav-num font-calligraphy">{surah.number}</span>
                        <div className="chapter-nav-meta">
                          <span className="chapter-nav-title">{surah.name}</span>
                          <span className="chapter-nav-sub">{surah.numberOfAyahs} آية • {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</span>
                        </div>
                      </button>
                    ))
                  ) : (
                    filteredChapters.map((ch, idx) => (
                      <button
                        key={ch.id || idx}
                        type="button"
                        onClick={() => setActiveChapterIndex(readingBook.chapters.indexOf(ch))}
                        className={`chapter-nav-item ${activeChapterIndex === readingBook.chapters.indexOf(ch) ? 'active' : ''}`}
                      >
                        <span className="chapter-nav-num font-calligraphy">{ch.number || idx + 1}</span>
                        <div className="chapter-nav-meta">
                          <span className="chapter-nav-title">{ch.title}</span>
                          {ch.keyBenefits && (
                            <span className="chapter-nav-sub">{ch.keyBenefits.length} فوائد مسلكية</span>
                          )}
                        </div>
                      </button>
                    ))
                  )}

                  {filteredChapters.length === 0 && (
                    <div className="no-chapters-found">
                      <span>لا توجد نتائج مطابقة لبحثك.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chapter Display Stage */}
              <div className="reader-chapter-viewport">
                {/* DYNAMIC TAFSIR AS-SA'DI SURAH VIEW */}
                {readingBook.isQuranTafsir && tafsirViewMode === 'surahs' ? (
                  (() => {
                    const currentSurahMeta = SURAHS_LIST.find((s) => s.number === selectedSurahNumber) || SURAHS_LIST[0];

                    return (
                      <div className="chapter-content-box animate-fade-in">
                        {/* Surah Header Banner */}
                        <div className="surah-tafsir-header-banner">
                          <div className="surah-tafsir-meta">
                            <span className="surah-badge-number">السورة رقم {currentSurahMeta.number}</span>
                            <h4 className="surah-tafsir-title font-calligraphy">{currentSurahMeta.name}</h4>
                            <span className="surah-tafsir-details">
                              {currentSurahMeta.numberOfAyahs} آية كريمة • نزلت {currentSurahMeta.revelationType === 'Meccan' ? 'بمكة المكرمة' : 'بالمدينة المنورة'}
                            </span>
                          </div>

                          <div className="surah-tafsir-actions">
                            <button
                              type="button"
                              onClick={() => handlePlayBookAudio(readingBook, null, currentSurahMeta.number)}
                              className="surah-listen-direct-btn"
                              title="الاستماع للتفسير الصوتي لهذه السورة"
                            >
                              <PlayIcon size={15} strokeWidth={2} />
                              <span>الاستماع لتفسير السورة</span>
                            </button>
                          </div>
                        </div>

                        {/* Surah Tafsir Ayahs Content */}
                        {isLoadingSurahTafsir ? (
                          <div className="tafsir-loading-state">
                            <div className="tafsir-spinner" />
                            <p className="font-calligraphy">جاري استرداد تفسير {currentSurahMeta.name} من متن تيسير الكريم الرحمن...</p>
                          </div>
                        ) : surahTafsirError ? (
                          <div className="tafsir-error-state">
                            <p>{surahTafsirError}</p>
                            <button
                              type="button"
                              onClick={() => setSelectedSurahNumber(selectedSurahNumber)}
                              className="tafsir-retry-btn"
                            >
                              إعادة المحاولة
                            </button>
                          </div>
                        ) : surahTafsirData && surahTafsirData.length > 0 ? (
                          <div className="surah-ayahs-tafsir-flow" style={{ fontSize: `${readerFontSize}px` }}>
                            {surahTafsirData.map((ayahTafsir, aIdx) => (
                              <div key={ayahTafsir.resource_id || aIdx} className="ayah-tafsir-card">
                                <div className="ayah-tafsir-number-badge">
                                  <span>الآية {aIdx + 1}</span>
                                </div>
                                <div 
                                  className="ayah-tafsir-text font-quran"
                                  dangerouslySetInnerHTML={{ __html: ayahTafsir.text }}
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="empty-chapter-placeholder">
                            <p>اختر سورة من القائمة الجانبية لعرض تفسيرها الكامل.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()
                ) : readingBook.chapters && readingBook.chapters[activeChapterIndex] ? (
                  (() => {
                    const ch = readingBook.chapters[activeChapterIndex];
                    return (
                      <div className="chapter-content-box animate-fade-in">
                        <div className="chapter-content-top-bar">
                          <div className="chapter-header-text-group">
                            <h4 className="chapter-active-title font-calligraphy">{ch.title}</h4>
                            {ch.number && (
                              <span className="chapter-number-pill">الحديث رقم {ch.number} من الأربعين النووية</span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyChapter(ch.title, ch.content, ch.keyBenefits)}
                            className="chapter-copy-action-btn"
                            title="نسخ نص الباب والفوائد"
                          >
                            {copiedChapter ? (
                              <>
                                <CheckIcon size={16} strokeWidth={2} className="text-emerald" />
                                <span>تم النسخ</span>
                              </>
                            ) : (
                              <>
                                <CopyIcon size={16} strokeWidth={1.8} />
                                <span>نسخ النص والفوائد</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Chapter Text Content with Dynamic Font Scaling */}
                        <div 
                          className="chapter-main-text font-quran" 
                          style={{ fontSize: `${readerFontSize}px`, lineHeight: 1.85 }}
                        >
                          {ch.content}
                        </div>

                        {/* Scholarly Key Benefits */}
                        {ch.keyBenefits && ch.keyBenefits.length > 0 && (
                          <div className="chapter-benefits-card">
                            <div className="benefits-title-row">
                              <SparklesIcon size={16} strokeWidth={1.8} className="text-gold" />
                              <span className="benefits-heading font-calligraphy">
                                فوائد وهدايات مسلكية مستنبطة من الباب
                              </span>
                            </div>
                            <ul className="benefits-bullet-list">
                              {ch.keyBenefits.map((benefit, bIdx) => (
                                <li key={bIdx} className="benefit-item">
                                  <span className="benefit-dot" />
                                  <span style={{ fontSize: `${Math.max(13, readerFontSize - 3)}px` }}>{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Bottom Chapter Navigation Bar (Previous / Next Chapter) */}
                        <div className="chapter-bottom-nav-row">
                          <button
                            type="button"
                            disabled={activeChapterIndex === 0}
                            onClick={() => setActiveChapterIndex((idx) => Math.max(0, idx - 1))}
                            className="chapter-nav-btn prev"
                          >
                            <span>← الباب السابق</span>
                          </button>

                          <span className="chapter-nav-progress font-calligraphy">
                            {activeChapterIndex + 1} من أصل {readingBook.chapters.length}
                          </span>

                          <button
                            type="button"
                            disabled={activeChapterIndex >= readingBook.chapters.length - 1}
                            onClick={() => setActiveChapterIndex((idx) => Math.min(readingBook.chapters.length - 1, idx + 1))}
                            className="chapter-nav-btn next"
                          >
                            <span>الباب التالي →</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="empty-chapter-placeholder">
                    <p>اختر فصلاً من القائمة الجانبية للمطالعة.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
