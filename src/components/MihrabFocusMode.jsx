import React, { useState, useEffect, useRef } from 'react';
import { ICONS, IslamicRosette, VerseMedallion } from './common/IconSystem';

export default function MihrabFocusMode({
  isOpen,
  onClose,
  surahData,
  currentAyahIndex,
  onSelectAyah,
  isPlaying,
  onTogglePlay,
  selectedReciter,
}) {
  const [activeAyahIdx, setActiveAyahIdx] = useState(currentAyahIndex || 0);
  const [ambientSound, setAmbientSound] = useState('none');
  const [isAmbientPlaying, setIsAmbientPlaying] = useState(false);
  const [fontSize, setFontSize] = useState(36);
  const [showTranslation, setShowTranslation] = useState(false);

  const audioCtxRef = useRef(null);
  const noiseNodeRef = useRef(null);
  const gainNodeRef = useRef(null);

  useEffect(() => {
    if (typeof currentAyahIndex === 'number') {
      setActiveAyahIdx(currentAyahIndex);
    }
  }, [currentAyahIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        handleNextAyah();
      } else if (e.key === 'ArrowRight') {
        handlePrevAyah();
      } else if (e.key === ' ') {
        e.preventDefault();
        onTogglePlay?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeAyahIdx, surahData]);

  useEffect(() => {
    if (ambientSound === 'none') {
      stopAmbientSound();
      return;
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopAmbientSound();

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      if (ambientSound === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(650, ctx.currentTime);
      } else {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);
        filter.Q.setValueAtTime(0.8, ctx.currentTime);
      }

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, ctx.currentTime);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start(0);
      noiseNodeRef.current = noise;
      gainNodeRef.current = gain;
      setIsAmbientPlaying(true);
    } catch (err) {
      console.warn('Web Audio Ambient error:', err);
      setIsAmbientPlaying(false);
    }

    return () => {
      stopAmbientSound();
    };
  }, [ambientSound]);

  const stopAmbientSound = () => {
    if (noiseNodeRef.current) {
      try {
        noiseNodeRef.current.stop();
        noiseNodeRef.current.disconnect();
      } catch {}
      noiseNodeRef.current = null;
    }
    setIsAmbientPlaying(false);
  };

  if (!isOpen || !surahData || !surahData.ayahs) return null;

  const currentAyah = surahData.ayahs[activeAyahIdx] || surahData.ayahs[0];
  const totalAyahs = surahData.ayahs.length;

  const handleNextAyah = () => {
    if (activeAyahIdx < totalAyahs - 1) {
      const next = activeAyahIdx + 1;
      setActiveAyahIdx(next);
      onSelectAyah?.(next);
    }
  };

  const handlePrevAyah = () => {
    if (activeAyahIdx > 0) {
      const prev = activeAyahIdx - 1;
      setActiveAyahIdx(prev);
      onSelectAyah?.(prev);
    }
  };

  const CloseIcon = ICONS.close;
  const PlayIcon = ICONS.play;
  const PauseIcon = ICONS.pause;
  const ChevronRightIcon = ICONS.chevronRight;
  const ChevronLeftIcon = ICONS.chevronLeft;
  const SparklesIcon = ICONS.sparkles;

  return (
    <div 
      className="mihrab-focus-overlay animate-fade-in" 
      role="dialog" 
      aria-modal="true" 
      aria-label="نمط الخلوة والمحراب للقرآن الكريم"
    >
      {/* Background Ambient Atmospheric Lighting */}
      <div className="mihrab-ambient-halo" />
      <div className="mihrab-candle-lantern-glow" />

      {/* Top Floating Control Bar */}
      <header className="mihrab-top-bar">
        <div className="mihrab-surah-meta">
          <IslamicRosette size={20} className="text-gold" />
          <div className="meta-text-group">
            <span className="mihrab-surah-name font-calligraphy">{surahData.name}</span>
            <span className="mihrab-ayah-progress">الآية {activeAyahIdx + 1} من {totalAyahs}</span>
          </div>
        </div>

        {/* Center: Ambient Sound Selector & Translation Toggle */}
        <div className="mihrab-zen-tools">
          <div className="ambient-switch-group">
            <span className="ambient-label">أصوات الخلوة:</span>
            <button
              type="button"
              onClick={() => setAmbientSound('none')}
              className={`ambient-chip ${ambientSound === 'none' ? 'active' : ''}`}
            >
              صمت تام
            </button>
            <button
              type="button"
              onClick={() => setAmbientSound('rain')}
              className={`ambient-chip ${ambientSound === 'rain' ? 'active' : ''}`}
            >
              مطر هادئ
            </button>
            <button
              type="button"
              onClick={() => setAmbientSound('breeze')}
              className={`ambient-chip ${ambientSound === 'breeze' ? 'active' : ''}`}
            >
              نسيم الليل
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowTranslation(!showTranslation)}
            className={`mihrab-toggle-btn ${showTranslation ? 'active' : ''}`}
            title="إظهار الترجمة الإنجليزية"
          >
            {showTranslation ? 'إخفاء الترجمة' : 'إظهار الترجمة'}
          </button>
        </div>

        {/* Right: Font Controls & Close */}
        <div className="mihrab-right-actions">
          <div className="mihrab-font-controls">
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.max(26, s - 4))}
              className="mihrab-font-btn"
              title="تصغير الخط"
            >
              -A
            </button>
            <span className="font-indicator">{fontSize}px</span>
            <button
              type="button"
              onClick={() => setFontSize((s) => Math.min(54, s + 4))}
              className="mihrab-font-btn"
              title="تكبير الخط"
            >
              +A
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              stopAmbientSound();
              onClose();
            }}
            className="mihrab-close-btn"
            title="الخروج من نمط الخلوة (ESC)"
            aria-label="إغلاق نمط الخلوة"
          >
            <CloseIcon size={20} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Central Sanctum Viewport */}
      <main className="mihrab-sanctum-stage">
        {/* Previous Ayah Arrow */}
        <button
          type="button"
          onClick={handlePrevAyah}
          disabled={activeAyahIdx === 0}
          className="mihrab-nav-arrow next-btn"
          title="الآية السابقة (السهم الأيمن)"
          aria-label="الآية السابقة"
        >
          <ChevronRightIcon size={32} strokeWidth={2} />
        </button>

        {/* Central Illuminated Verse Display */}
        <div className="mihrab-verse-card animate-fade-in" key={currentAyah.numberInSurah}>
          {/* Subtle Classical Arch Top Ornament */}
          <div className="mihrab-arch-silhouette" />

          {/* Verse Number Badge */}
          <div className="mihrab-verse-badge-row">
            <span className="mihrab-verse-badge">
              <SparklesIcon size={13} className="text-gold" />
              <span>الآية الكريمة {currentAyah.numberInSurah}</span>
            </span>
          </div>

          {/* Majestic Quranic Text with Spotlight Candle Glow */}
          <div 
            className="mihrab-quran-text font-quran"
            style={{ fontSize: `${fontSize}px` }}
          >
            {currentAyah.textAr}
            <span className="mihrab-verse-medallion">
              <VerseMedallion number={currentAyah.numberInSurah} size={Math.max(28, fontSize * 0.9)} />
            </span>
          </div>

          {/* Optional Translation */}
          {showTranslation && currentAyah.textEn && (
            <div className="mihrab-translation-text animate-fade-in">
              {currentAyah.textEn}
            </div>
          )}

          {/* Reciter & Audio Play Toggle */}
          <div className="mihrab-audio-dock">
            <button
              type="button"
              onClick={onTogglePlay}
              className={`mihrab-play-btn ${isPlaying ? 'playing' : ''}`}
              title={isPlaying ? 'إيقاف مؤقت' : 'استماع للتلاوة'}
            >
              {isPlaying ? (
                <PauseIcon size={22} strokeWidth={2} />
              ) : (
                <PlayIcon size={22} strokeWidth={2} />
              )}
              <span>{isPlaying ? 'إيقاف التلاوة' : 'استمع للآية بصوت القارئ'}</span>
            </button>
          </div>
        </div>

        {/* Next Ayah Arrow */}
        <button
          type="button"
          onClick={handleNextAyah}
          disabled={activeAyahIdx >= totalAyahs - 1}
          className="mihrab-nav-arrow prev-btn"
          title="الآية التالية (السهم الأيسر)"
          aria-label="الآية التالية"
        >
          <ChevronLeftIcon size={32} strokeWidth={2} />
        </button>
      </main>

      {/* Footer Navigation Hints */}
      <footer className="mihrab-footer-hints">
        <span className="hint-pill">اضغط <strong>Space</strong> للتلاوة</span>
        <span className="hint-pill">استخدم <strong>← / →</strong> للتنقل بين الآيات</span>
        <span className="hint-pill">اضغط <strong>ESC</strong> للعودة</span>
      </footer>
    </div>
  );
}
