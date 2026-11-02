import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { ICONS } from './common/IconSystem';
import { SURAHS_LIST } from '../data/surahsList';
import { REVELATION_ORDER, TIMELINE_MILESTONES } from '../data/revelationTimelineData';
import { QURAN_LOCATIONS } from '../data/quranAtlasData';
import './ConstellationSpaceView.css';

function getSurahClassification(surahNumber) {
  if (surahNumber >= 2 && surahNumber <= 9) return 'tiwal';
  if (surahNumber >= 10 && surahNumber <= 35) return 'miun';
  if (surahNumber >= 36 && surahNumber <= 49) return 'mathani';
  return 'mufassal';
}

const CLASSIFICATION_LABELS = {
  all: 'الكل (١١٤)',
  tiwal: 'السبع الطوال',
  miun: 'المئون',
  mathani: 'المثاني',
  mufassal: 'المفصّل'
};

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

function buildConstellationStars() {
  const stars = [];

  stars.push({
    number: 1,
    name: 'الفاتحة',
    baseX: 0,
    baseY: 0,
    x: 0,
    y: 0,
    radius: 7,
    color: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.45)',
    group: 'fatihah',
    revelationType: 'Meccan',
    numberOfAyahs: 7,
    driftSpeed: 0.8,
    driftAngle: 0
  });

  for (let i = 2; i <= 114; i++) {
    const meta = SURAHS_LIST[i - 1];
    let r, theta;
    const classification = getSurahClassification(i);

    if (i >= 2 && i <= 9) {
      const tiwalIdx = i - 2;
      r = 135 + (tiwalIdx % 2) * 35;
      theta = (tiwalIdx / 8) * Math.PI * 2 - Math.PI / 2;
    } else if (i >= 10 && i <= 35) {
      const idx = i - 10;
      r = 230 + (idx / 26) * 160 + (idx % 3) * 25;
      theta = idx * GOLDEN_ANGLE;
    } else if (i >= 36 && i <= 49) {
      const idx = i - 36;
      r = 440 + (idx / 14) * 160 + (idx % 2) * 30;
      theta = idx * GOLDEN_ANGLE + 1.2;
    } else {
      const idx = i - 50;
      r = 640 + Math.sqrt(idx / 65) * 360 + (idx % 4) * 20;
      theta = idx * GOLDEN_ANGLE + 2.5;
    }

    const x = Math.round(Math.cos(theta) * r);
    const y = Math.round(Math.sin(theta) * r);

    const isTiwal = classification === 'tiwal';
    const isMeccan = meta.revelationType === 'Meccan';

    const color = isTiwal ? '#fbbf24' : isMeccan ? '#38bdf8' : '#34d399';
    const glowColor = isTiwal
      ? 'rgba(251, 191, 36, 0.4)'
      : isMeccan
      ? 'rgba(56, 189, 248, 0.4)'
      : 'rgba(52, 211, 153, 0.4)';

    const starRadius = Math.max(3.5, Math.min(7, 3 + Math.sqrt(meta.numberOfAyahs) * 0.2));

    stars.push({
      number: i,
      name: meta.name.replace('سُورَةُ ', ''),
      fullName: meta.name,
      englishName: meta.englishName,
      englishNameTranslation: meta.englishNameTranslation,
      baseX: x,
      baseY: y,
      x,
      y,
      radius: starRadius,
      color,
      glowColor,
      group: classification,
      revelationType: meta.revelationType,
      numberOfAyahs: meta.numberOfAyahs,
      driftSpeed: 0.5 + ((i % 5) * 0.2),
      driftAngle: (i * 47) % 360
    });
  }

  return stars;
}

const STATIC_STARS = buildConstellationStars();

const AMBIENT_PARTICLES = Array.from({ length: 90 }, (_, i) => ({
  x: (Math.random() - 0.5) * 2400,
  y: (Math.random() - 0.5) * 2400,
  radius: 0.6 + Math.random() * 1.5,
  alpha: 0.15 + Math.random() * 0.5,
  speed: 0.2 + Math.random() * 0.4
}));

export default function ConstellationSpaceView({ onSelectSurah, onNavigateTab }) {
  const [activeVisualMode, setActiveVisualMode] = useState('timeline');
  const [timelineEraFilter, setTimelineEraFilter] = useState('all');
  const [timelineSearch, setTimelineSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(QURAN_LOCATIONS[0]);
  const [activeTimelineSurah, setActiveTimelineSurah] = useState(null);
  const [timelineProgress, setTimelineProgress] = useState(0);

  const timelineTrackRef = useRef(null);
  const isTimelineDraggingRef = useRef(false);
  const timelineDragStateRef = useRef({ startX: 0, scrollLeft: 0, hasMoved: false });

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [filterType, setFilterType] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStar, setSelectedStar] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const cameraRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    zoom: 0.58,
    targetZoom: 0.58
  });

  const mouseRef = useRef({
    screenX: 0,
    screenY: 0,
    worldX: 0,
    worldY: 0,
    isDown: false,
    dragStartX: 0,
    dragStartY: 0,
    camStartX: 0,
    camStartY: 0,
    hasMoved: false
  });

  const animFrameRef = useRef(null);
  const starsRef = useRef(STATIC_STARS);

  const filteredTimeline = useMemo(() => {
    return REVELATION_ORDER.filter((item) => {
      if (timelineEraFilter !== 'all') {
        if (timelineEraFilter === 'meccan' && !item.era.startsWith('meccan')) return false;
        if (timelineEraFilter === 'medinan' && !item.era.startsWith('medinan')) return false;
      }
      if (timelineSearch.trim()) {
        const q = timelineSearch.trim().toLowerCase();
        return (
          item.name.includes(q) ||
          item.note.includes(q) ||
          String(item.number) === q ||
          String(item.order) === q
        );
      }
      return true;
    });
  }, [timelineEraFilter, timelineSearch]);

  const milestonesMap = useMemo(() => {
    const map = {};
    TIMELINE_MILESTONES.forEach((m) => {
      map[m.orderIndex] = m;
    });
    return map;
  }, []);

  const handleTimelineScroll = useCallback(() => {
    if (!timelineTrackRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = timelineTrackRef.current;
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      const prog = Math.abs(scrollLeft) / maxScroll;
      setTimelineProgress(Math.min(1, Math.max(0, prog)));
    }
  }, []);

  const handleTimelineWheel = (e) => {
    if (!timelineTrackRef.current) return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      timelineTrackRef.current.scrollLeft += e.deltaY * 1.6;
    }
  };

  const handleTimelineMouseDown = (e) => {
    if (e.button !== 0 || !timelineTrackRef.current) return;
    isTimelineDraggingRef.current = true;
    timelineDragStateRef.current = {
      startX: e.clientX,
      scrollLeft: timelineTrackRef.current.scrollLeft,
      hasMoved: false
    };
  };

  const handleTimelineMouseMove = (e) => {
    if (!isTimelineDraggingRef.current || !timelineTrackRef.current) return;
    const dx = e.clientX - timelineDragStateRef.current.startX;
    if (Math.abs(dx) > 3) {
      timelineDragStateRef.current.hasMoved = true;
    }
    timelineTrackRef.current.scrollLeft = timelineDragStateRef.current.scrollLeft - dx;
  };

  const handleTimelineMouseUp = () => {
    isTimelineDraggingRef.current = false;
  };

  const scrollTimelineBy = (offset) => {
    if (!timelineTrackRef.current) return;
    timelineTrackRef.current.scrollBy({ left: offset, behavior: 'smooth' });
  };

  const jumpToMilestone = (orderIndex) => {
    const el = document.getElementById(`timeline-station-${orderIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  };

  const handleScrubberClick = (e) => {
    const bar = e.currentTarget;
    if (!bar || !timelineTrackRef.current) return;
    const rect = bar.getBoundingClientRect();
    const clickRatio = (e.clientX - rect.left) / rect.width;
    const isRtl = document.dir === 'rtl' || true;
    const effectiveRatio = isRtl ? (1 - clickRatio) : clickRatio;
    const { scrollWidth, clientWidth } = timelineTrackRef.current;
    const maxScroll = scrollWidth - clientWidth;
    timelineTrackRef.current.scrollTo({
      left: (isRtl ? -1 : 1) * maxScroll * effectiveRatio,
      behavior: 'smooth'
    });
  };

  const filteredSurahSet = useMemo(() => {
    const set = new Set();
    starsRef.current.forEach((s) => {
      if (filterType !== 'all' && s.revelationType !== filterType) return;
      if (filterClass !== 'all' && s.group !== filterClass) return;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const cleanQ = q.replace(/[إأآا]/g, 'ا');
        const cleanName = s.name.replace(/[إأآا]/g, 'ا');
        if (
          !s.name.includes(q) &&
          !cleanName.includes(cleanQ) &&
          !s.englishName.toLowerCase().includes(q) &&
          String(s.number) !== q
        ) {
          return;
        }
      }
      set.add(s.number);
    });
    return set;
  }, [filterType, filterClass, searchQuery]);

  const focusOnStar = useCallback((star) => {
    if (!star) return;
    cameraRef.current.targetX = star.baseX;
    cameraRef.current.targetY = star.baseY;
    cameraRef.current.targetZoom = 1.3;
    setSelectedStar(star);
  }, []);

  const handleResetCamera = useCallback(() => {
    cameraRef.current.targetX = 0;
    cameraRef.current.targetY = 0;
    cameraRef.current.targetZoom = 0.58;
    setSelectedStar(null);
  }, []);

  useEffect(() => {
    if (activeVisualMode !== 'constellation') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = 0;
    let height = 0;

    const handleResize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(canvas);

    let lastTime = performance.now();

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const cam = cameraRef.current;
      cam.x += (cam.targetX - cam.x) * (1 - Math.exp(-8 * dt));
      cam.y += (cam.targetY - cam.y) * (1 - Math.exp(-8 * dt));
      cam.zoom += (cam.targetZoom - cam.zoom) * (1 - Math.exp(-8 * dt));

      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 40, width / 2, height / 2, Math.max(width, height) * 0.7);
      bgGrad.addColorStop(0, '#061314');
      bgGrad.addColorStop(0.5, '#030a0b');
      bgGrad.addColorStop(1, '#010405');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.scale(cam.zoom, cam.zoom);
      ctx.translate(-cam.x, -cam.y);

      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < AMBIENT_PARTICLES.length; i++) {
        const p = AMBIENT_PARTICLES[i];
        const pulse = 0.6 + Math.sin(time * 0.001 * p.speed + i) * 0.4;
        ctx.globalAlpha = p.alpha * pulse;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      ctx.strokeStyle = 'rgba(210, 170, 96, 0.08)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 12]);
      const rings = [145, 310, 520, 840];
      for (let i = 0; i < rings.length; i++) {
        ctx.beginPath();
        ctx.arc(0, 0, rings[i], 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);

      const stars = starsRef.current;
      const count = stars.length;
      const tSec = time * 0.001;

      for (let i = 0; i < count; i++) {
        const s = stars[i];
        const angle = s.driftAngle + tSec * s.driftSpeed * 0.2;
        s.x = s.baseX + Math.cos(angle) * 3;
        s.y = s.baseY + Math.sin(angle) * 3;
      }

      ctx.lineWidth = 0.85;
      const maxDist = 95;
      for (let i = 0; i < count; i++) {
        const s1 = stars[i];
        const is1Active = filteredSurahSet.has(s1.number);
        for (let j = i + 1; j < count; j++) {
          const s2 = stars[j];
          const is2Active = filteredSurahSet.has(s2.number);
          const dx = s1.x - s2.x;
          const dy = s1.y - s2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * (is1Active && is2Active ? 0.28 : 0.04);
            ctx.strokeStyle = `rgba(180, 205, 220, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        }
      }

      const activeHover = hoveredStar || selectedStar;
      if (activeHover) {
        ctx.lineWidth = 1.5;
        for (let i = 0; i < count; i++) {
          const s = stars[i];
          if (s.number === activeHover.number) continue;
          const dx = activeHover.x - s.x;
          const dy = activeHover.y - s.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 180) {
            const alpha = (1 - dist / 180) * 0.65;
            ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(activeHover.x, activeHover.y);
            ctx.lineTo(s.x, s.y);
            ctx.stroke();
          }
        }
      }

      const m = mouseRef.current;
      m.worldX = (m.screenX - width / 2) / cam.zoom + cam.x;
      m.worldY = (m.screenY - height / 2) / cam.zoom + cam.y;

      let currentHover = null;
      let minHoverDist = 26 / cam.zoom;

      for (let i = 0; i < count; i++) {
        const s = stars[i];
        const dx = m.worldX - s.x;
        const dy = m.worldY - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minHoverDist) {
          minHoverDist = dist;
          currentHover = s;
        }
      }

      for (let i = 0; i < count; i++) {
        const s = stars[i];
        const isFiltered = filteredSurahSet.has(s.number);
        const isHover = activeHover && activeHover.number === s.number;
        const isSelected = selectedStar && selectedStar.number === s.number;

        ctx.globalAlpha = isFiltered ? 1 : 0.16;

        const auraRadius = s.radius * (isHover ? 3.5 : 2.2);
        const auraGrad = ctx.createRadialGradient(s.x, s.y, s.radius * 0.3, s.x, s.y, auraRadius);
        auraGrad.addColorStop(0, s.glowColor);
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(s.x, s.y, auraRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isHover ? '#ffffff' : s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius * (isHover ? 1.3 : 1), 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius + 6, 0, Math.PI * 2);
          ctx.stroke();

          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.radius + 12, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        if (isFiltered) {
          ctx.font = `600 ${isHover ? 13 : 10.5}px "Amiri", "Traditional Arabic", serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = isHover ? '#fbbf24' : isSelected ? '#fbbf24' : '#cbd5e1';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          ctx.shadowBlur = 4;
          ctx.fillText(s.name, s.x, s.y + s.radius + 13);
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;
      ctx.restore();

      setHoveredStar(currentHover);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [activeVisualMode, filteredSurahSet, selectedStar]);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return;
    const m = mouseRef.current;
    m.isDown = true;
    m.hasMoved = false;
    m.dragStartX = e.clientX;
    m.dragStartY = e.clientY;
    m.camStartX = cameraRef.current.targetX;
    m.camStartY = cameraRef.current.targetY;
  };

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const m = mouseRef.current;
    m.screenX = e.clientX - rect.left;
    m.screenY = e.clientY - rect.top;

    if (m.isDown) {
      const dx = (e.clientX - m.dragStartX) / cameraRef.current.zoom;
      const dy = (e.clientY - m.dragStartY) / cameraRef.current.zoom;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        m.hasMoved = true;
      }
      cameraRef.current.targetX = m.camStartX - dx;
      cameraRef.current.targetY = m.camStartY - dy;
    }
  };

  const handleMouseUp = () => {
    const m = mouseRef.current;
    if (m.isDown && !m.hasMoved) {
      if (hoveredStar) {
        focusOnStar(hoveredStar);
      } else {
        setSelectedStar(null);
      }
    }
    m.isDown = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.87;
    cameraRef.current.targetZoom = Math.min(2.8, Math.max(0.3, cameraRef.current.targetZoom * factor));
  };

  const SparklesIcon = ICONS.sparkles;
  const SearchIcon = ICONS.search;
  const BookOpenIcon = ICONS.mushaf;
  const MemorizeIcon = ICONS.memorize;
  const RefreshIcon = ICONS.refresh;
  const CompassIcon = ICONS.compass;

  return (
    <div
      className={`constellation-space-root ${isFullscreen ? 'is-fullscreen' : ''}`}
      ref={containerRef}
      role="region"
      aria-label="استكشف بصائر — التجارب البصرية القرآنية"
    >
      <div className="space-hud-topbar">
        <div className="hud-title-cluster">
          <div className="hud-brand-tag">
            <SparklesIcon size={14} className="text-gold" />
            <span>استكشف بصائر (Visual Experiences)</span>
          </div>

          <div className="visual-mode-tabs" role="tablist">
            <button
              type="button"
              className={`mode-tab-btn ${activeVisualMode === 'timeline' ? 'active' : ''}`}
              onClick={() => setActiveVisualMode('timeline')}
            >
              <CompassIcon size={14} />
              <span>الخط الزمني للوحي (Timeline)</span>
            </button>

            <button
              type="button"
              className={`mode-tab-btn ${activeVisualMode === 'atlas' ? 'active' : ''}`}
              onClick={() => setActiveVisualMode('atlas')}
            >
              <BookOpenIcon size={14} />
              <span>أطلس المواقع القرآنية (Atlas)</span>
            </button>

            <button
              type="button"
              className={`mode-tab-btn ${activeVisualMode === 'constellation' ? 'active' : ''}`}
              onClick={() => setActiveVisualMode('constellation')}
            >
              <SparklesIcon size={14} />
              <span>كوكبة ومدار السور (Constellation)</span>
            </button>
          </div>
        </div>

        {activeVisualMode === 'constellation' && (
          <div className="hud-tools-cluster">
            <button
              type="button"
              className="hud-icon-btn"
              onClick={() => {
                cameraRef.current.targetZoom = Math.min(2.8, cameraRef.current.targetZoom * 1.25);
              }}
              title="تكبير"
            >
              +
            </button>
            <button
              type="button"
              className="hud-icon-btn"
              onClick={() => {
                cameraRef.current.targetZoom = Math.max(0.3, cameraRef.current.targetZoom * 0.8);
              }}
              title="تصغير"
            >
              -
            </button>
            <button
              type="button"
              className="hud-icon-btn"
              onClick={handleResetCamera}
              title="إعادة ضبط المشهد"
            >
              <RefreshIcon size={13} />
            </button>
          </div>
        )}
      </div>

      {activeVisualMode === 'timeline' && (
        <div className="revelation-timeline-stage animate-fade-in">
          <div className="timeline-control-header">
            <div className="timeline-search-box">
              <SearchIcon size={14} className="text-gold" />
              <input
                type="text"
                placeholder="ابحث في السور حسب ترتيب النزول أو الأحداث التاريخية..."
                value={timelineSearch}
                onChange={(e) => setTimelineSearch(e.target.value)}
                className="timeline-search-input"
              />
            </div>

            <div className="timeline-era-pills">
              <button
                type="button"
                className={`era-pill ${timelineEraFilter === 'all' ? 'active' : ''}`}
                onClick={() => setTimelineEraFilter('all')}
              >
                جميع السور (١١٤)
              </button>
              <button
                type="button"
                className={`era-pill ${timelineEraFilter === 'meccan' ? 'active' : ''}`}
                onClick={() => setTimelineEraFilter('meccan')}
              >
                العهد المكي 🕋 (86 سورة)
              </button>
              <button
                type="button"
                className={`era-pill ${timelineEraFilter === 'medinan' ? 'active' : ''}`}
                onClick={() => setTimelineEraFilter('medinan')}
              >
                العهد المدني 🕌 (28 سورة)
              </button>
            </div>

            <div className="timeline-flow-navigation-arrows">
              <button
                type="button"
                className="timeline-nav-arrow-btn"
                onClick={() => scrollTimelineBy(420)}
                title="التقدم للأمام في الزمن"
              >
                <span>التقدم</span>
                <span>‹</span>
              </button>
              <button
                type="button"
                className="timeline-nav-arrow-btn"
                onClick={() => scrollTimelineBy(-420)}
                title="الرجوع للبداية"
              >
                <span>›</span>
                <span>السابق</span>
              </button>
            </div>
          </div>

          <div className="milestones-ticker-strip">
            <span className="ticker-label text-gold">المنعطفات الكبرى:</span>
            <div className="ticker-scroll">
              {TIMELINE_MILESTONES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="milestone-ticker-item-btn"
                  onClick={() => jumpToMilestone(m.orderIndex)}
                  title={`انتقل فوراً إلى محطة: ${m.title}`}
                >
                  <span className="ticker-dot" />
                  <span className="ticker-title">{m.title}</span>
                  <span className="ticker-year">({m.year})</span>
                </button>
              ))}
            </div>
          </div>

          <div
            className="timeline-horizontal-viewport"
            ref={timelineTrackRef}
            onScroll={handleTimelineScroll}
            onWheel={handleTimelineWheel}
            onMouseDown={handleTimelineMouseDown}
            onMouseMove={handleTimelineMouseMove}
            onMouseUp={handleTimelineMouseUp}
            onMouseLeave={handleTimelineMouseUp}
          >
            <div className="timeline-flow-canvas">
              <div className="flowing-chronology-spine" />

              {filteredTimeline.map((item, idx) => {
                const surahMeta = SURAHS_LIST.find((s) => s.number === item.number);
                const isMedinan = item.era.startsWith('medinan');
                const isAbove = idx % 2 === 0;
                const isSelected = activeTimelineSurah && activeTimelineSurah.order === item.order;
                const milestone = milestonesMap[item.order];

                return (
                  <div
                    key={`station-${item.order}`}
                    id={`timeline-station-${item.order}`}
                    className={`timeline-flow-station ${isAbove ? 'station-above' : 'station-below'} ${isMedinan ? 'is-medinan' : 'is-meccan'} ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => setActiveTimelineSurah(item)}
                  >
                    {milestone && (
                      <div className="milestone-beacon-flag animate-fade-in">
                        <div className="flag-pulse-ring" />
                        <span className="flag-epoch-title">{milestone.title}</span>
                        <span className="flag-epoch-year">{milestone.year}</span>
                      </div>
                    )}

                    <div className="flowing-surah-card">
                      <div className="flow-card-glow-edge" />
                      
                      <div className="flow-card-head">
                        <div className="flow-badges-group">
                          <span className="flow-revelation-rank">النزول #{item.order}</span>
                          <span className="flow-mushaf-rank">المصحف #{item.number}</span>
                        </div>
                        <span className={`flow-era-tag ${isMedinan ? 'medinan' : 'meccan'}`}>
                          {isMedinan ? 'مدنية 🕌' : 'مكية 🕋'}
                        </span>
                      </div>

                      <div className="flow-card-body">
                        <div className="surah-title-cluster">
                          <h4 className="flow-surah-title font-calligraphy">سورة {item.name}</h4>
                          <span className="flow-year-caption">{item.year}</span>
                        </div>

                        <p className="flow-historical-note">{item.note}</p>
                      </div>

                      <div className="flow-card-footer">
                        <span className="flow-ayahs-badge">
                          {surahMeta ? surahMeta.numberOfAyahs : 0} آية
                        </span>

                        <button
                          type="button"
                          className="flow-launch-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectSurah?.(item.number);
                            onNavigateTab?.('reader');
                          }}
                          title="فتح السورة في المصحف والتلاوة"
                        >
                          <BookOpenIcon size={13} />
                          <span>تلاوة السورة ↵</span>
                        </button>
                      </div>
                    </div>

                    <div className="axis-stem-connector" />

                    <div className="axis-node-beacon">
                      <div className="beacon-outer-pulse" />
                      <div className="beacon-core">
                        <span>{item.order}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="timeline-bottom-scrubber-bar">
            <div className="scrubber-era-labels">
              <span className="scrubber-era-label meccan">
                🕋 العهد المكي الشريف (من سورة العلق إلى سورة المطففين)
              </span>
              <span className="scrubber-era-label medinan">
                🕌 العهد المدني المبارك (من سورة البقرة إلى سورة النصر)
              </span>
            </div>

            <div
              className="timeline-scrubber-track"
              onClick={handleScrubberClick}
              role="slider"
              aria-label="مسار الاستكشاف الزمني"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow={Math.round(timelineProgress * 100)}
              tabIndex={0}
            >
              <div className="scrubber-track-rail-meccan" style={{ width: '75%' }} />
              <div className="scrubber-track-rail-medinan" style={{ width: '25%' }} />
              <div
                className="scrubber-indicator-thumb"
                style={{ right: `${timelineProgress * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {activeVisualMode === 'atlas' && (
        <div className="quran-atlas-stage animate-fade-in">
          <div className="atlas-locations-sidebar">
            <h3 className="sidebar-title">
              <CompassIcon size={16} className="text-gold" />
              <span>معالم وأطلس المواقع القرآنية</span>
            </h3>
            <p className="sidebar-sub">اختر موقعاً لاستكشاف آياته وقصصه الشريفة في كتاب الله:</p>

            <div className="locations-list">
              {QURAN_LOCATIONS.map((loc) => (
                <div
                  key={loc.id}
                  className={`location-list-item ${selectedLocation.id === loc.id ? 'active' : ''}`}
                  onClick={() => setSelectedLocation(loc)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="loc-dot" />
                  <div className="loc-info">
                    <span className="loc-name">{loc.name.split(' ')[0]} {loc.name.split(' ')[1] || ''}</span>
                    <span className="loc-region">{loc.region}</span>
                  </div>
                  <span className="loc-surah-pill">{loc.surahRef.split(':')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="atlas-map-canvas-card">
            <div className="interactive-map-board">
              <div className="map-grid-overlay" />

              <div className="map-compass-rose">
                <span>شمال ⬆</span>
              </div>

              {QURAN_LOCATIONS.map((loc) => {
                const isSelected = selectedLocation.id === loc.id;
                return (
                  <div
                    key={`pin-${loc.id}`}
                    className={`map-location-pin ${isSelected ? 'selected' : ''}`}
                    style={{ left: `${loc.coordinates.x}%`, top: `${loc.coordinates.y}%` }}
                    onClick={() => setSelectedLocation(loc)}
                    role="button"
                    tabIndex={0}
                    title={loc.name}
                  >
                    <div className="pin-pulse-ring" />
                    <div className="pin-core">
                      <span className="pin-icon">📍</span>
                    </div>
                    <span className="pin-label font-calligraphy">{loc.name.split(' ')[0]}</span>
                  </div>
                );
              })}

              <div className="atlas-selected-spotlight animate-slide-up">
                <div className="spotlight-header">
                  <div className="spotlight-title-group">
                    <span className="spotlight-region-tag">{selectedLocation.region}</span>
                    <h3 className="spotlight-name font-calligraphy">{selectedLocation.name}</h3>
                    <span className="spotlight-en">{selectedLocation.englishName}</span>
                  </div>

                  <button
                    type="button"
                    className="spotlight-reader-btn"
                    onClick={() => {
                      onSelectSurah?.(selectedLocation.surahNumber);
                      onNavigateTab?.('reader');
                    }}
                  >
                    <BookOpenIcon size={16} />
                    <span>فتح {selectedLocation.surahRef} في المصحف ↵</span>
                  </button>
                </div>

                <div className="spotlight-verse-banner">
                  <p className="verse-text font-calligraphy">"{selectedLocation.verse}"</p>
                  <span className="verse-source">— {selectedLocation.surahRef}</span>
                </div>

                <p className="spotlight-story">{selectedLocation.story}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeVisualMode === 'constellation' && (
        <div className="canvas-viewport-wrapper">
          <canvas
            ref={canvasRef}
            className="constellation-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          />

          <div className="space-canvas-hint">
            <span>انقر واسحب للتجول في الفضاء • استخدم عجلة الفأرة للتكبير • انقر على أي سورة لاستكشافها</span>
          </div>

          {hoveredStar && !selectedStar && (
            <div
              className="star-floating-tooltip animate-fade-in"
              style={{
                left: `${mouseRef.current.screenX + 16}px`,
                top: `${mouseRef.current.screenY - 12}px`
              }}
            >
              <div className="tooltip-head">
                <span className="tooltip-num">#{hoveredStar.number}</span>
                <span className="tooltip-name font-calligraphy">سورة {hoveredStar.name}</span>
              </div>
              <div className="tooltip-meta">
                <span>{hoveredStar.numberOfAyahs} آية</span>
                <span>•</span>
                <span>{hoveredStar.revelationType === 'Meccan' ? 'مكية 🕋' : 'مدنية 🕌'}</span>
                <span>•</span>
                <span className="text-gold">{CLASSIFICATION_LABELS[hoveredStar.group]}</span>
              </div>
            </div>
          )}

          {selectedStar && (
            <div className="selected-star-drawer animate-slide-up">
              <button
                type="button"
                className="drawer-close-btn"
                onClick={() => setSelectedStar(null)}
                title="إغلاق"
              >
                ×
              </button>

              <div className="drawer-header-row">
                <div className="drawer-badge-line">
                  <span className="drawer-number-badge">سورة رقم {selectedStar.number}</span>
                  <span className={`drawer-rev-badge ${selectedStar.revelationType.toLowerCase()}`}>
                    {selectedStar.revelationType === 'Meccan' ? 'تنزيل مكي 🕋' : 'تنزيل مدني 🕌'}
                  </span>
                  <span className="drawer-class-badge">{CLASSIFICATION_LABELS[selectedStar.group]}</span>
                </div>

                <h3 className="drawer-title font-calligraphy">{selectedStar.fullName}</h3>
                <p className="drawer-subtitle">
                  {selectedStar.englishName} • {selectedStar.englishNameTranslation}
                </p>
              </div>

              <div className="drawer-metrics-row">
                <div className="drawer-metric">
                  <span className="metric-tag">الآيات</span>
                  <span className="metric-number font-calligraphy">{selectedStar.numberOfAyahs}</span>
                </div>
                <div className="drawer-metric">
                  <span className="metric-tag">المقدار</span>
                  <span className="metric-number font-calligraphy">
                    {Math.max(1, Math.round(selectedStar.numberOfAyahs / 20))} حزب
                  </span>
                </div>
              </div>

              <div className="drawer-actions-row">
                <button
                  type="button"
                  className="drawer-action-btn primary"
                  onClick={() => {
                    onSelectSurah?.(selectedStar.number);
                    onNavigateTab?.('reader');
                  }}
                >
                  <BookOpenIcon size={17} />
                  <span>فتح {selectedStar.name} في المصحف والتلاوة ↵</span>
                </button>

                <button
                  type="button"
                  className="drawer-action-btn secondary"
                  onClick={() => {
                    onSelectSurah?.(selectedStar.number);
                    onNavigateTab?.('memorize');
                  }}
                >
                  <MemorizeIcon size={17} />
                  <span>تسميع وحفظ</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
