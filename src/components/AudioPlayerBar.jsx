import React, { useState } from 'react';
import { ICONS } from './common/IconSystem';
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

  // Standardized Lucide icons from centralized system
  const PlayIcon = ICONS.play;
  const PauseIcon = ICONS.pause;
  const SkipBackIcon = ICONS.skipBack;
  const SkipForwardIcon = ICONS.skipForward;
  const RepeatIcon = ICONS.repeat;
  const ShuffleIcon = ICONS.shuffle;
  const SpeedIcon = ICONS.speed;
  const VolumeOnIcon = ICONS.volumeOn;
  const VolumeMuteIcon = ICONS.volumeMute;
  const QueueIcon = ICONS.queue;
  const ChevronUpIcon = ICONS.chevronUp;
  const ChevronDownIcon = ICONS.chevronDown;
  const CloseIcon = ICONS.close;

  return (
    <footer className="audio-player-dock-modern" role="region" aria-label="مشغل التلاوة الصوتي">
      <div className="player-inner-modern">
        {/* 1. Left Section: Reciter Avatar & Track Info */}
        <div className="player-left-section">
          <button 
            onClick={() => setShowRecitersList(!showRecitersList)}
            className="player-chevron-btn"
            title="اختيار القارئ"
            aria-label="قائمة القراء المتاحين"
            aria-expanded={showRecitersList}
          >
            {showRecitersList ? (
              <ChevronDownIcon size={18} strokeWidth={1.8} />
            ) : (
              <ChevronUpIcon size={18} strokeWidth={1.8} />
            )}
          </button>

          <div 
            className="reciter-thumb-circle" 
            onClick={() => setShowRecitersList(!showRecitersList)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setShowRecitersList(!showRecitersList); }}
            aria-label={`تغيير القارئ، القارئ الحالي: ${activeReciterObj.nameAr}`}
          >
            <img 
              src={reciterAvatar} 
              alt={activeReciterObj.nameAr}
              className="reciter-thumb-img"
            />
          </div>

          <div className="reciter-text-block">
            <span className="reciter-name-bold font-calligraphy">{activeReciterObj.nameAr}</span>
            <span className="reciter-surah-caption">سورة {currentSurah?.name || 'الفاتحة'} — الآية {ayahNum}</span>
          </div>

          {/* Reciters Selection Popup */}
          {showRecitersList && (
            <div className="reciters-dock-popover animate-fade-in" role="dialog" aria-label="اختر القارئ المفضل">
              <div className="popover-title-row">
                <span>اختر القارئ المفضل</span>
                <button 
                  onClick={() => setShowRecitersList(false)} 
                  className="popover-close-btn" 
                  aria-label="إغلاق قائمة القراء"
                >
                  <CloseIcon size={16} strokeWidth={1.8} />
                </button>
              </div>
              <div className="reciters-choice-list" role="listbox">
                {RECITERS.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      onSelectReciter(r.id);
                      setShowRecitersList(false);
                    }}
                    className={`reciter-choice-row ${selectedReciter === r.id ? 'active' : ''}`}
                    role="option"
                    aria-selected={selectedReciter === r.id}
                  >
                    <span className="choice-name font-calligraphy">{r.nameAr}</span>
                    <span className="choice-style">{r.subtext}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Left-Center Tools: Shuffle, Speed, Repeat Ayah (Subdued quiet controls) */}
        <div className="player-subtools-row" role="group" aria-label="خيارات التلاوة">
          <button 
            className="subtool-icon-btn" 
            title="تبديل عشوائي (Shuffle)"
            aria-label="تشغيل عشوائي"
          >
            <ShuffleIcon size={18} strokeWidth={1.8} />
          </button>

          <button 
            onClick={handleNextRate} 
            className="speed-badge-btn" 
            title="سرعة التلاوة"
            aria-label={`سرعة التلاوة الحالية ${playbackRate}x، اضغط للتبديل`}
          >
            <SpeedIcon size={14} strokeWidth={1.8} className="speed-pill-icon" />
            <span>{playbackRate}x</span>
          </button>

          <button 
            onClick={onToggleRepeatAyah} 
            className={`repeat-toggle-pill ${isRepeatAyah ? 'active' : ''}`}
            title="تكرار الآية الحالية للحفظ والتثبيت"
            aria-label="تكرار الآية للحفظ"
            aria-pressed={isRepeatAyah}
          >
            <RepeatIcon size={15} strokeWidth={1.8} className="repeat-pill-icon" />
            <span>تكرار</span>
            <span className="toggle-switch-track" aria-hidden="true">
              <span className={`toggle-switch-knob ${isRepeatAyah ? 'on' : 'off'}`} />
            </span>
          </button>
        </div>

        {/* 3. Center: Timeline & Core Playback Controls (Prominent Emerald Play Button) */}
        <div className="player-center-section">
          {/* Timeline Scrubber */}
          <div className="timeline-scrubber-row">
            <span className="time-digit">01:24</span>
            <div 
              className="timeline-track"
              role="progressbar"
              aria-valuenow={totalAyahs > 0 ? Math.round((ayahNum / totalAyahs) * 100) : 25}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div className="timeline-progress" style={{ width: `${totalAyahs > 0 ? (ayahNum / totalAyahs) * 100 : 25}%` }}>
                <span className="timeline-thumb" />
              </div>
            </div>
            <span className="time-digit">05:32</span>
          </div>

          {/* Controls: Prev, Play/Pause (22px main), Next */}
          <div className="playback-btns-row" role="group" aria-label="أزرار التحكم بالصوت">
            <button 
              onClick={onPrevAyah} 
              disabled={currentAyahIndex <= 0}
              className="dock-play-btn skip" 
              title="الآية السابقة"
              aria-label="الآية السابقة"
            >
              <SkipForwardIcon size={20} strokeWidth={1.8} />
            </button>

            <button 
              onClick={onTogglePlay} 
              className={`dock-play-btn main ${isPlaying ? 'playing' : ''}`}
              title={isPlaying ? 'إيقاف مؤقت' : 'تشغيل التلاوة'}
              aria-label={isPlaying ? 'إيقاف مؤقت للتلاوة' : 'تشغيل التلاوة'}
            >
              {isPlaying ? (
                <PauseIcon size={22} strokeWidth={1.8} />
              ) : (
                <PlayIcon size={22} strokeWidth={1.8} className="offset-play" />
              )}
            </button>

            <button 
              onClick={onNextAyah} 
              disabled={currentAyahIndex >= totalAyahs - 1}
              className="dock-play-btn skip" 
              title="الآية التالية"
              aria-label="الآية التالية"
            >
              <SkipBackIcon size={20} strokeWidth={1.8} />
            </button>
          </div>
        </div>

        {/* 4. Right Controls: Volume & Queue (Subdued) */}
        <div className="player-right-section">
          <button 
            onClick={() => setIsMuted(!isMuted)} 
            className="volume-icon-btn"
            title={isMuted ? 'إلغاء الكتم' : 'كتم الصوت'}
            aria-label={isMuted ? 'إلغاء كتم الصوت' : 'كتم الصوت'}
          >
            {isMuted ? (
              <VolumeMuteIcon size={18} strokeWidth={1.8} />
            ) : (
              <VolumeOnIcon size={18} strokeWidth={1.8} />
            )}
          </button>

          <div 
            className="volume-slider-track"
            role="progressbar"
            aria-valuenow={isMuted ? 0 : 75}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="مستوى الصوت"
          >
            <div className="volume-slider-fill" style={{ width: isMuted ? '0%' : '75%' }} />
          </div>

          <button 
            className="queue-list-btn" 
            title="قائمة التلاوات المتتالية"
            aria-label="قائمة التلاوات"
          >
            <QueueIcon size={18} strokeWidth={1.8} />
          </button>
        </div>
      </div>
    </footer>
  );
}
