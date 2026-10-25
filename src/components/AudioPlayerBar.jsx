import React, { useState } from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Repeat, 
  Shuffle,
  Volume2, 
  VolumeX, 
  ListMusic,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { RECITERS } from '../data/reciters';
import reciterAvatar from '../assets/reciter-avatar.jpg';

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
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [showRecitersList, setShowRecitersList] = useState(false);

  const activeReciterObj = RECITERS.find((r) => r.id === selectedReciter) || RECITERS[0];
  const ayahNum = currentAyahIndex + 1;
  const rates = [0.75, 1, 1.25, 1.5];

  const handleNextRate = () => {
    const curIdx = rates.indexOf(playbackRate);
    const nextIdx = (curIdx + 1) % rates.length;
    onChangePlaybackRate(rates[nextIdx]);
  };

  return (
    <div className="audio-player-dock-modern">
      <div className="player-inner-modern">
        {/* 1. Left Section: Reciter Avatar & Track Info */}
        <div className="player-left-section">
          <button 
            onClick={() => setShowRecitersList(!showRecitersList)}
            className="player-chevron-btn"
            title="اختيار القارئ"
          >
            {showRecitersList ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
          </button>

          <div className="reciter-thumb-circle" onClick={() => setShowRecitersList(!showRecitersList)}>
            <img 
              src={reciterAvatar} 
              alt={activeReciterObj.nameAr}
              className="reciter-thumb-img"
            />
          </div>

          <div className="reciter-text-block">
            <span className="reciter-name-bold font-calligraphy">{activeReciterObj.nameAr}</span>
            <span className="reciter-surah-caption">سورة {currentSurah?.name || 'الفاتحة'}</span>
          </div>

          {/* Reciters Selection Popup */}
          {showRecitersList && (
            <div className="reciters-dock-popover animate-fade-in">
              <div className="popover-title-row">
                <span>اختر القارئ المفضل</span>
                <button onClick={() => setShowRecitersList(false)} className="popover-close-btn">✕</button>
              </div>
              <div className="reciters-choice-list">
                {RECITERS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectReciter(r.id);
                      setShowRecitersList(false);
                    }}
                    className={`reciter-choice-row ${selectedReciter === r.id ? 'active' : ''}`}
                  >
                    <span className="choice-name">{r.nameAr}</span>
                    <span className="choice-style">{r.subtext}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Left-Center Tools: Shuffle, Speed, Repeat Ayah */}
        <div className="player-subtools-row">
          <button className="subtool-icon-btn" title="تبديل عشوائي (Shuffle)">
            <Shuffle size={16} />
          </button>

          <button onClick={handleNextRate} className="speed-badge-btn" title="سرعة التلاوة">
            <span>{playbackRate}x</span>
          </button>

          <button 
            onClick={onToggleRepeatAyah} 
            className={`repeat-toggle-pill ${isRepeatAyah ? 'active' : ''}`}
            title="تكرار الآية للحفظ"
          >
            <span>تكرار الآية</span>
            <span className="toggle-switch-track">
              <span className={`toggle-switch-knob ${isRepeatAyah ? 'on' : 'off'}`} />
            </span>
          </button>
        </div>

        {/* 3. Center: Timeline & Core Playback Controls */}
        <div className="player-center-section">
          {/* Timeline Scrubber */}
          <div className="timeline-scrubber-row">
            <span className="time-digit">01:24</span>
            <div className="timeline-track">
              <div className="timeline-progress" style={{ width: `${totalAyahs > 0 ? (ayahNum / totalAyahs) * 100 : 25}%` }}>
                <span className="timeline-thumb" />
              </div>
            </div>
            <span className="time-digit">05:32</span>
          </div>

          {/* Controls: Prev, Play/Pause, Next */}
          <div className="playback-btns-row">
            <button 
              onClick={onPrevAyah} 
              disabled={currentAyahIndex <= 0}
              className="dock-play-btn skip" 
              title="الآية السابقة"
            >
              <SkipForward size={18} />
            </button>

            <button 
              onClick={onTogglePlay} 
              className={`dock-play-btn main ${isPlaying ? 'playing' : ''}`}
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل'}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="offset-play" />}
            </button>

            <button 
              onClick={onNextAyah} 
              disabled={currentAyahIndex >= totalAyahs - 1}
              className="dock-play-btn skip" 
              title="الآية التالية"
            >
              <SkipBack size={18} />
            </button>
          </div>
        </div>

        {/* 4. Right Controls: Volume & Queue */}
        <div className="player-right-section">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="volume-icon-btn"
            title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>

          <div className="volume-slider-track">
            <div className="volume-slider-fill" style={{ width: isMuted ? '0%' : '75%' }} />
          </div>

          <button className="queue-list-btn" title="قائمة التلاوات">
            <ListMusic size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
