import React, { useState } from 'react';
import { ICONS } from './common/IconSystem';
import { RECITERS } from '../data/reciters';
import reciterAvatarFallback from '../assets/reciter-avatar.jpg';

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
  currentTime = 0,
  duration = 0,
  onSeek,
  volume = 0.85,
  isMuted = false,
  onChangeVolume,
  onToggleMute,
  surahAyahs = [],
  onPlayAyah,
}) {
  const [showRecitersList, setShowRecitersList] = useState(false);
  const [showAyahsQueue, setShowAyahsQueue] = useState(false);

  const activeReciterObj = RECITERS.find((r) => r.id === selectedReciter) || RECITERS[0];
  const ayahNum = currentAyahIndex + 1;

  const handleToggleRate = () => {
    const nextRate = playbackRate === 1 ? 0.75 : 1;
    onChangePlaybackRate(nextRate);
  };

  const formatTime = (secs) => {
    if (isNaN(secs) || secs < 0) return '00:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;
  const currentVolumePercent = isMuted ? 0 : Math.round(volume * 100);

  const PlayIcon = ICONS.play;
  const PauseIcon = ICONS.pause;
  const SkipBackIcon = ICONS.skipBack;
  const SkipForwardIcon = ICONS.skipForward;
  const RepeatIcon = ICONS.repeat;
  const SpeedIcon = ICONS.speed;
  const VolumeOnIcon = ICONS.volumeOn;
  const VolumeMuteIcon = ICONS.volumeMute;
  const QueueIcon = ICONS.queue;
  const ChevronUpIcon = ICONS.chevronUp;
  const ChevronDownIcon = ICONS.chevronDown;
  const CloseIcon = ICONS.close;
  const CheckIcon = ICONS.check;

  return (
    <footer className="audio-player-dock-modern" role="region" aria-label="مشغل التلاوة الصوتي">
      <div className="player-inner-modern">
        {/* 1. Left Section: Real Reciter Photo & Track Info */}
        <div className="player-left-section">
          <button 
            onClick={() => {
              setShowRecitersList(!showRecitersList);
              setShowAyahsQueue(false);
            }}
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
            onClick={() => {
              setShowRecitersList(!showRecitersList);
              setShowAyahsQueue(false);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setShowRecitersList(!showRecitersList); }}
            aria-label={`تغيير القارئ، القارئ الحالي: ${activeReciterObj.nameAr}`}
          >
            <img 
              src={activeReciterObj.photo || reciterAvatarFallback} 
              alt={activeReciterObj.nameAr}
              className="reciter-thumb-img"
              onError={(e) => { e.currentTarget.src = reciterAvatarFallback; }}
            />
          </div>

          <div className="reciter-text-block">
            <span className="reciter-name-bold font-calligraphy">{activeReciterObj.nameAr}</span>
            <span className="reciter-surah-caption">
              سورة {currentSurah?.name || 'الفاتحة'} — الآية {ayahNum}
            </span>
          </div>

          {/* Reciters Selection Popup */}
          {showRecitersList && (
            <div className="reciters-dock-popover animate-fade-in" role="dialog" aria-label="اختر القارئ المفضل">
              <div className="popover-title-row">
                <span className="font-calligraphy">اختر القارئ المفضل</span>
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
                    <div className="reciter-choice-thumb">
                      <img 
                        src={r.photo || reciterAvatarFallback} 
                        alt={r.nameAr} 
                        className="choice-thumb-img"
                        onError={(e) => { e.currentTarget.src = reciterAvatarFallback; }}
                      />
                    </div>
                    <div className="choice-info-col">
                      <span className="choice-name font-calligraphy">{r.nameAr}</span>
                      <span className="choice-style">{r.subtext}</span>
                    </div>
                    {selectedReciter === r.id && (
                      <CheckIcon size={16} strokeWidth={2} className="choice-check-icon text-emerald" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 2. Left-Center Tools: Speed & Repeat Ayah (Shuffle removed as requested) */}
        <div className="player-subtools-row" role="group" aria-label="خيارات التلاوة">
          <button 
            onClick={handleToggleRate} 
            className={`speed-badge-btn ${playbackRate === 0.75 ? 'slow-active' : ''}`}
            title={playbackRate === 1 ? 'التبديل إلى ترتيل متأنٍ (0.75x)' : 'التبديل إلى سرعة عادية (1.0x)'}
            aria-label={`سرعة التلاوة الحالية ${playbackRate}x، اضغط للتبديل`}
          >
            <SpeedIcon size={14} strokeWidth={1.8} className="speed-pill-icon" />
            <span>{playbackRate === 0.75 ? '0.75x متأنٍ' : '1.0x'}</span>
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

        {/* 3. Center: Interactive Timeline Scrubber & Core Playback Controls */}
        <div className="player-center-section">
          {/* Interactive Timeline Scrubber */}
          <div className="timeline-scrubber-row">
            <span className="time-digit">{formatTime(currentTime)}</span>
            <div className="timeline-interactive-wrapper" dir="ltr">
              <input
                type="range"
                dir="ltr"
                min={0}
                max={duration > 0 ? duration : 100}
                step="0.1"
                value={duration > 0 ? currentTime : 0}
                onChange={(e) => onSeek && onSeek(Number(e.target.value))}
                className="timeline-range-input"
                aria-label="شريط سحب وتمرير التلاوة"
              />
              <div 
                className="timeline-track-visual" 
                dir="ltr"
                style={{ '--progress-pct': `${progressPercent}%` }}
              >
                <div 
                  className="timeline-progress-fill" 
                  dir="ltr"
                  style={{ width: `${progressPercent}%` }}
                >
                  <span className="timeline-thumb-dot" />
                </div>
              </div>
            </div>
            <span className="time-digit">{formatTime(duration)}</span>
          </div>

          {/* Controls: Prev Ayah, Play/Pause, Next Ayah */}
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

        {/* 4. Right Controls: Interactive Volume Slider & Ayahs Queue */}
        <div className="player-right-section">
          <button 
            onClick={onToggleMute} 
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

          {/* Interactive Volume Slider */}
          <div className="volume-slider-wrapper" title={`مستوى الصوت: ${currentVolumePercent}%`}>
            <input
              type="range"
              min={0}
              max={1}
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => onChangeVolume && onChangeVolume(Number(e.target.value))}
              className="volume-range-input"
              aria-label="التحكم بمستوى الصوت"
            />
            <div className="volume-track-visual">
              <div 
                className="volume-slider-fill" 
                style={{ width: `${currentVolumePercent}%` }} 
              />
            </div>
          </div>

          {/* Functional Ayahs Queue / Jumper Button */}
          <button 
            onClick={() => {
              setShowAyahsQueue(!showAyahsQueue);
              setShowRecitersList(false);
            }}
            className={`queue-list-btn ${showAyahsQueue ? 'active' : ''}`} 
            title="فهرس آيات السورة والتنقل السريع"
            aria-label="فهرس آيات السورة"
            aria-expanded={showAyahsQueue}
          >
            <QueueIcon size={18} strokeWidth={1.8} />
          </button>

          {/* Surah Ayahs Queue Dropdown / Drawer */}
          {showAyahsQueue && (
            <div className="ayahs-queue-popover animate-fade-in" role="dialog" aria-label="فهرس آيات السورة">
              <div className="popover-title-row">
                <div className="queue-header-info">
                  <span className="queue-title font-calligraphy">آيات سورة {currentSurah?.name || ''}</span>
                  <span className="queue-count">({totalAyahs} آية)</span>
                </div>
                <button 
                  onClick={() => setShowAyahsQueue(false)} 
                  className="popover-close-btn" 
                  aria-label="إغلاق الفهرس"
                >
                  <CloseIcon size={16} strokeWidth={1.8} />
                </button>
              </div>

              <div className="ayahs-queue-list" role="list">
                {surahAyahs.map((ayah, idx) => {
                  const isCurrent = idx === currentAyahIndex;
                  return (
                    <button
                      key={ayah.number || idx}
                      onClick={() => {
                        onPlayAyah && onPlayAyah(idx);
                        setShowAyahsQueue(false);
                      }}
                      className={`ayah-queue-row ${isCurrent ? 'active' : ''}`}
                      role="listitem"
                    >
                      <span className="ayah-queue-number font-calligraphy">{ayah.numberInSurah}</span>
                      <span className="ayah-queue-text font-quran">{ayah.textAr}</span>
                      {isCurrent && (
                        <span className="ayah-queue-playing-tag">
                          {isPlaying ? 'جارٍ الاستماع' : 'محدد'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
