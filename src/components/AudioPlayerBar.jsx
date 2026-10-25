import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Mic2,
  Gauge
} from 'lucide-react';
import { RECITERS } from '../data/reciters';

export default function AudioPlayerBar({
  isPlaying,
  onTogglePlay,
  currentSurah,
  currentAyahIndex,
  onNextAyah,
  onPrevAyah,
  selectedReciter,
  onSelectReciter,
  playbackRate,
  onChangePlaybackRate,
  isRepeatAyah,
  onToggleRepeatAyah,
  totalAyahs,
}) {
  const [isMuted, setIsMuted] = useState(false);
  const [showReciterMenu, setShowReciterMenu] = useState(false);

  const activeReciterObj = RECITERS.find((r) => r.id === selectedReciter) || RECITERS[0];
  const ayahNum = currentAyahIndex + 1;

  const rates = [0.75, 1, 1.25, 1.5];

  const handleNextRate = () => {
    const curIdx = rates.indexOf(playbackRate);
    const nextIdx = (curIdx + 1) % rates.length;
    onChangePlaybackRate(rates[nextIdx]);
  };

  return (
    <div className="audio-player-dock">
      <div className="audio-player-inner">
        {/* Ayah & Surah Track Info */}
        <div className="player-track-info">
          <div className="track-icon-badge">
            <span className="track-icon-glow">📖</span>
          </div>
          <div className="track-text">
            <div className="track-surah-title">
              <span className="font-calligraphy">{currentSurah ? currentSurah.name : 'سورة'}</span>
              <span className="track-ayah-badge">آية {ayahNum} من {totalAyahs || 1}</span>
            </div>
            <div className="track-reciter-name">
              <Mic2 size={12} className="reciter-mini-icon" />
              <span>{activeReciterObj.nameAr}</span>
            </div>
          </div>
        </div>

        {/* Central Controls: Prev, Play/Pause, Next */}
        <div className="player-core-controls">
          <button 
            onClick={onPrevAyah} 
            className="player-btn prev-btn" 
            title="الآية السابقة"
            disabled={currentAyahIndex <= 0}
          >
            <SkipForward size={20} />
          </button>

          <button
            onClick={onTogglePlay}
            className={`player-btn play-main-btn ${isPlaying ? 'playing' : ''}`}
            title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
            aria-label={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
          >
            {isPlaying ? <Pause size={22} /> : <Play size={22} className="play-triangle-offset" />}
          </button>

          <button 
            onClick={onNextAyah} 
            className="player-btn next-btn" 
            title="الآية التالية"
            disabled={currentAyahIndex >= totalAyahs - 1}
          >
            <SkipBack size={20} />
          </button>
        </div>

        {/* Extended Tools: Repeat, Speed, Reciter Switcher */}
        <div className="player-extended-tools">
          {/* Repeat Ayah Mode (Essential for Hifdh) */}
          <button
            onClick={onToggleRepeatAyah}
            className={`tool-btn repeat-tool-btn ${isRepeatAyah ? 'active' : ''}`}
            title={isRepeatAyah ? 'إلغاء تكرار الآية' : 'تفعيل تكرار الآية للحفظ (Loop)'}
          >
            <Repeat size={16} />
            <span className="tool-label">تكرار الآية</span>
          </button>

          {/* Speed Selector */}
          <button
            onClick={handleNextRate}
            className="tool-btn rate-tool-btn"
            title="تغيير سرعة التلاوة"
          >
            <Gauge size={16} />
            <span className="rate-text">{playbackRate}x</span>
          </button>

          {/* Reciter Selector Menu */}
          <div className="reciter-selector-wrap">
            <button
              onClick={() => setShowReciterMenu(!showReciterMenu)}
              className="tool-btn reciter-tool-btn"
              title="اختيار القارئ"
            >
              <Mic2 size={16} />
              <span className="reciter-short-label">{activeReciterObj.nameAr.split(' ')[0]}...</span>
            </button>

            {showReciterMenu && (
              <div className="reciters-popover animate-fade-in">
                <div className="popover-header">
                  <span>اختر القارئ</span>
                  <button onClick={() => setShowReciterMenu(false)} className="popover-close-x">✕</button>
                </div>
                <div className="popover-list">
                  {RECITERS.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        onSelectReciter(r.id);
                        setShowReciterMenu(false);
                      }}
                      className={`reciter-option-btn ${selectedReciter === r.id ? 'active' : ''}`}
                    >
                      <span className="reciter-name-ar">{r.nameAr}</span>
                      <span className="reciter-style-sub">{r.subtext}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
