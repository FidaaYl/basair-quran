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
const N_SURAHS = 114;

function getSphereCoords(i) {
  const y = 1 - ((i - 0.5) / N_SURAHS) * 2;
  const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = i * GOLDEN_ANGLE;
  return {
    x: Math.cos(theta) * radiusAtY * 360,
    y: y * 360,
    z: Math.sin(theta) * radiusAtY * 360
  };
}

function getGalaxyCoords(i) {
  const r = 85 + Math.sqrt(i / N_SURAHS) * 350;
  const theta = (i / N_SURAHS) * Math.PI * 8;
  const armOffset = i % 2 === 0 ? 0 : Math.PI;
  return {
    x: Math.cos(theta + armOffset) * r,
    y: Math.sin(i * 0.45) * 45,
    z: Math.sin(theta + armOffset) * r
  };
}

function getOrbitsCoords(i) {
  let r, theta, tilt;
  if (i <= 9) {
    r = 145;
    theta = (i / 9) * Math.PI * 2;
    tilt = 0.2;
  } else if (i <= 35) {
    r = 235;
    theta = ((i - 9) / 26) * Math.PI * 2;
    tilt = -0.15;
  } else if (i <= 49) {
    r = 325;
    theta = ((i - 35) / 14) * Math.PI * 2;
    tilt = 0.25;
  } else {
    r = 425 + ((i - 49) % 3) * 25;
    theta = ((i - 49) / 65) * Math.PI * 2;
    tilt = -0.2;
  }
  const x0 = Math.cos(theta) * r;
  const z0 = Math.sin(theta) * r;
  return {
    x: x0,
    y: z0 * Math.sin(tilt) + Math.sin(theta * 3) * 15,
    z: z0 * Math.cos(tilt)
  };
}

const THEMATIC_LINKS = [
  [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 2],
  [40, 41], [41, 42], [42, 43], [43, 44], [44, 45], [45, 46],
  [17, 57], [57, 59], [59, 61], [61, 62], [62, 64], [64, 87],
  [1, 2], [1, 36], [1, 114], [36, 37], [37, 38], [38, 39],
  [50, 51], [51, 52], [52, 53], [53, 54], [54, 55], [55, 56],
  [67, 68], [68, 69], [69, 70], [70, 71],
  [108, 109], [109, 110], [110, 111], [111, 112], [112, 113], [113, 114]
];

function buildInitial3DStars() {
  const stars = [];
  for (let i = 1; i <= N_SURAHS; i++) {
    const meta = SURAHS_LIST[i - 1];
    const classification = getSurahClassification(i);
    const isTiwal = classification === 'tiwal';
    const isMeccan = meta.revelationType === 'Meccan';

    const color = isTiwal ? '#fbbf24' : isMeccan ? '#38bdf8' : '#34d399';
    const glowColor = isTiwal
      ? 'rgba(251, 191, 36, 0.45)'
      : isMeccan
      ? 'rgba(56, 189, 248, 0.45)'
      : 'rgba(52, 211, 153, 0.45)';

    const starRadius = Math.max(3.8, Math.min(7.5, 3.4 + Math.sqrt(meta.numberOfAyahs) * 0.22));

    const spherePos = getSphereCoords(i);

    stars.push({
      number: i,
      name: meta.name.replace('سُورَةُ ', ''),
      fullName: meta.name,
      englishName: meta.englishName,
      englishNameTranslation: meta.englishNameTranslation,
      x: spherePos.x,
      y: spherePos.y,
      z: spherePos.z,
      targetX: spherePos.x,
      targetY: spherePos.y,
      targetZ: spherePos.z,
      projX: 0,
      projY: 0,
      projScale: 1,
      projDepth: 0,
      radius: starRadius,
      color,
      glowColor,
      group: classification,
      revelationType: meta.revelationType,
      numberOfAyahs: meta.numberOfAyahs
    });
  }
  return stars;
}

const STATIC_3D_STARS = buildInitial3DStars();

const AMBIENT_3D_DUST = Array.from({ length: 120 }, (_, i) => ({
  x: (Math.random() - 0.5) * 1100,
  y: (Math.random() - 0.5) * 1100,
  z: (Math.random() - 0.5) * 1100,
  radius: 0.7 + Math.random() * 1.6,
  alpha: 0.15 + Math.random() * 0.45,
  pulseSpeed: 0.3 + Math.random() * 0.7
}));

export default function ConstellationSpaceView({ onSelectSurah, onNavigateTab }) {
  const [activeVisualMode, setActiveVisualMode] = useState('constellation');
  const [geometryMode, setGeometryMode] = useState('sphere');
  const [autoRotate, setAutoRotate] = useState(true);
  const [showConstellationLines, setShowConstellationLines] = useState(true);
  const [showAstrolabeRings, setShowAstrolabeRings] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStar, setSelectedStar] = useState(null);
  const [hoveredStar, setHoveredStar] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const [timelineEraFilter, setTimelineEraFilter] = useState('all');
  const [timelineSearch, setTimelineSearch] = useState('');
  const [activeTimelineSurah, setActiveTimelineSurah] = useState(null);
  const [timelineProgress, setTimelineProgress] = useState(0);
  const timelineTrackRef = useRef(null);
  const isTimelineDraggingRef = useRef(false);
  const timelineDragStateRef = useRef({ startX: 0, scrollLeft: 0, hasMoved: false });

  const [selectedLocation, setSelectedLocation] = useState(QURAN_LOCATIONS[0]);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  const camera3DRef = useRef({
    rotX: 0.25,
    rotY: -0.4,
    targetRotX: 0.25,
    targetRotY: -0.4,
    velX: 0,
    velY: 0,
    zoom: 1,
    targetZoom: 1,
    cameraDist: 850
  });

  const mouse3DRef = useRef({
    screenX: 0,
    screenY: 0,
    isDown: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    hasMoved: false
  });

  const stars3DRef = useRef(STATIC_3D_STARS);
  const animFrameRef = useRef(null);

  const set3DGeometry = useCallback((mode) => {
    setGeometryMode(mode);
    const stars = stars3DRef.current;
    for (let i = 0; i < N_SURAHS; i++) {
      const s = stars[i];
      let coords;
      if (mode === 'galaxy') coords = getGalaxyCoords(s.number);
      else if (mode === 'orbits') coords = getOrbitsCoords(s.number);
      else coords = getSphereCoords(s.number);

      s.targetX = coords.x;
      s.targetY = coords.y;
      s.targetZ = coords.z;
    }
  }, []);

  const flyCameraToStar = useCallback((star) => {
    if (!star) return;
    const yaw = Math.atan2(-star.targetX, star.targetZ);
    const horizDist = Math.sqrt(star.targetX * star.targetX + star.targetZ * star.targetZ);
    const pitch = Math.atan2(star.targetY, horizDist);

    const cam = camera3DRef.current;
    cam.targetRotY = yaw;
    cam.targetRotX = pitch;
    cam.targetZoom = 1.35;
    cam.velX = 0;
    cam.velY = 0;
    setSelectedStar(star);
  }, []);

  const handleReset3DCamera = useCallback((preset = 'default') => {
    const cam = camera3DRef.current;
    if (preset === 'polar') {
      cam.targetRotX = 1.45;
      cam.targetRotY = 0;
    } else if (preset === 'equator') {
      cam.targetRotX = 0;
      cam.targetRotY = -0.5;
    } else {
      cam.targetRotX = 0.25;
      cam.targetRotY = -0.4;
    }
    cam.targetZoom = 1;
    cam.velX = 0;
    cam.velY = 0;
    setSelectedStar(null);
  }, []);

  const filteredSurahSet = useMemo(() => {
    const set = new Set();
    stars3DRef.current.forEach((s) => {
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

  useEffect(() => {
    if (!searchQuery.trim()) return;
    const match = stars3DRef.current.find((s) => filteredSurahSet.has(s.number));
    if (match) {
      flyCameraToStar(match);
    }
  }, [searchQuery, filteredSurahSet, flyCameraToStar]);

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

      const cam = camera3DRef.current;
      const mouse = mouse3DRef.current;

      if (autoRotate && !mouse.isDown && !hoveredStar && !selectedStar) {
        cam.targetRotY += 0.14 * dt;
      }

      if (!mouse.isDown) {
        cam.rotY += cam.velY;
        cam.rotX += cam.velX;
        cam.velY *= 0.92;
        cam.velX *= 0.92;
      }

      cam.rotX += (cam.targetRotX - cam.rotX) * (1 - Math.exp(-9 * dt));
      cam.rotY += (cam.targetRotY - cam.rotY) * (1 - Math.exp(-9 * dt));
      cam.zoom += (cam.targetZoom - cam.zoom) * (1 - Math.exp(-9 * dt));

      cam.rotX = Math.max(-1.5, Math.min(1.5, cam.rotX));

      const cosY = Math.cos(cam.rotY);
      const sinY = Math.sin(cam.rotY);
      const cosX = Math.cos(cam.rotX);
      const sinX = Math.sin(cam.rotX);

      const project3D = (x, y, z) => {
        const x1 = x * cosY + z * sinY;
        const z1 = -x * sinY + z * cosY;
        const y2 = y * cosX - z1 * sinX;
        const z2 = y * sinX + z1 * cosX;

        const distance = cam.cameraDist;
        const scale = (distance / (distance + z2)) * cam.zoom;
        const screenX = width / 2 + x1 * scale;
        const screenY = height / 2 - y2 * scale;
        return { screenX, screenY, scale, depth: z2 };
      };

      ctx.clearRect(0, 0, width, height);

      const bgGrad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        60,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      bgGrad.addColorStop(0, '#06161b');
      bgGrad.addColorStop(0.5, '#020b0e');
      bgGrad.addColorStop(1, '#010405');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      const stars = stars3DRef.current;
      const morphSpeed = 1 - Math.exp(-7 * dt);
      for (let i = 0; i < N_SURAHS; i++) {
        const s = stars[i];
        s.x += (s.targetX - s.x) * morphSpeed;
        s.y += (s.targetY - s.y) * morphSpeed;
        s.z += (s.targetZ - s.z) * morphSpeed;

        const proj = project3D(s.x, s.y, s.z);
        s.projX = proj.screenX;
        s.projY = proj.screenY;
        s.projScale = proj.scale;
        s.projDepth = proj.depth;
      }

      ctx.fillStyle = '#ffffff';
      for (let i = 0; i < AMBIENT_3D_DUST.length; i++) {
        const d = AMBIENT_3D_DUST[i];
        const proj = project3D(d.x, d.y, d.z);
        if (proj.depth > -cam.cameraDist + 50) {
          const depthAlpha = Math.max(0.04, Math.min(0.65, (proj.depth + 400) / 800));
          const pulse = 0.7 + Math.sin(time * 0.001 * d.pulseSpeed + i) * 0.3;
          ctx.globalAlpha = d.alpha * depthAlpha * pulse;
          ctx.beginPath();
          ctx.arc(proj.screenX, proj.screenY, Math.max(0.4, d.radius * proj.scale), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (showAstrolabeRings) {
        ctx.strokeStyle = 'rgba(210, 170, 96, 0.12)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 10]);

        const draw3DCircle = (radius, plane = 'xz') => {
          ctx.beginPath();
          const segments = 48;
          for (let k = 0; k <= segments; k++) {
            const angle = (k / segments) * Math.PI * 2;
            let cx = 0, cy = 0, cz = 0;
            if (plane === 'xz') {
              cx = Math.cos(angle) * radius;
              cz = Math.sin(angle) * radius;
            } else if (plane === 'xy') {
              cx = Math.cos(angle) * radius;
              cy = Math.sin(angle) * radius;
            } else if (plane === 'yz') {
              cy = Math.cos(angle) * radius;
              cz = Math.sin(angle) * radius;
            }
            const pt = project3D(cx, cy, cz);
            if (k === 0) ctx.moveTo(pt.screenX, pt.screenY);
            else ctx.lineTo(pt.screenX, pt.screenY);
          }
          ctx.stroke();
        };

        draw3DCircle(360, 'xz');
        draw3DCircle(360, 'yz');
        draw3DCircle(180, 'xz');
        draw3DCircle(520, 'xz');
        ctx.setLineDash([]);
      }

      if (showConstellationLines) {
        ctx.lineWidth = 0.9;
        const starsMap = {};
        for (let i = 0; i < N_SURAHS; i++) {
          starsMap[stars[i].number] = stars[i];
        }

        for (let i = 0; i < THEMATIC_LINKS.length; i++) {
          const [u, v] = THEMATIC_LINKS[i];
          const s1 = starsMap[u];
          const s2 = starsMap[v];
          if (!s1 || !s2) continue;

          const is1Active = filteredSurahSet.has(u);
          const is2Active = filteredSurahSet.has(v);
          const isHighlighted =
            (hoveredStar && (hoveredStar.number === u || hoveredStar.number === v)) ||
            (selectedStar && (selectedStar.number === u || selectedStar.number === v));

          const avgDepth = (s1.projDepth + s2.projDepth) / 2;
          const depthFade = Math.max(0.08, Math.min(1, (avgDepth + 350) / 700));

          if (isHighlighted) {
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.85 * depthFade})`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(s1.projX, s1.projY);
            ctx.lineTo(s2.projX, s2.projY);
            ctx.stroke();
            ctx.lineWidth = 0.9;
          } else if (is1Active && is2Active) {
            ctx.strokeStyle = `rgba(180, 215, 230, ${0.2 * depthFade})`;
            ctx.beginPath();
            ctx.moveTo(s1.projX, s1.projY);
            ctx.lineTo(s2.projX, s2.projY);
            ctx.stroke();
          }
        }
      }

      const activeHoverOrSelected = hoveredStar || selectedStar;
      if (activeHoverOrSelected) {
        ctx.lineWidth = 1.4;
        const targetNum = activeHoverOrSelected.number;
        for (let i = 0; i < N_SURAHS; i++) {
          const s = stars[i];
          if (s.number === targetNum) continue;
          const dx = activeHoverOrSelected.x - s.x;
          const dy = activeHoverOrSelected.y - s.y;
          const dz = activeHoverOrSelected.z - s.z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist3D < 190) {
            const alpha = (1 - dist3D / 190) * 0.7;
            ctx.strokeStyle = `rgba(251, 191, 36, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(activeHoverOrSelected.projX, activeHoverOrSelected.projY);
            ctx.lineTo(s.projX, s.projY);
            ctx.stroke();
          }
        }
      }

      const sortedStars = [...stars].sort((a, b) => b.projDepth - a.projDepth);

      let currentHover = null;
      let minHoverDist = 26;

      for (let i = 0; i < N_SURAHS; i++) {
        const s = sortedStars[i];
        const dx = mouse.screenX - s.projX;
        const dy = mouse.screenY - s.projY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minHoverDist) {
          minHoverDist = dist;
          currentHover = s;
        }
      }

      for (let i = 0; i < N_SURAHS; i++) {
        const s = sortedStars[i];
        const isFiltered = filteredSurahSet.has(s.number);
        const isHover = activeHoverOrSelected && activeHoverOrSelected.number === s.number;
        const isSelected = selectedStar && selectedStar.number === s.number;

        const depthFactor = Math.max(0.2, Math.min(1.4, (s.projDepth + 400) / 600));
        const finalAlpha = isFiltered ? (isHover || isSelected ? 1 : Math.max(0.25, depthFactor * 0.95)) : 0.08;

        ctx.globalAlpha = finalAlpha;

        const starR = Math.max(2, s.radius * s.projScale * (isHover ? 1.4 : 1));

        const auraR = starR * (isHover ? 4.2 : 2.5);
        const auraGrad = ctx.createRadialGradient(s.projX, s.projY, starR * 0.2, s.projX, s.projY, auraR);
        auraGrad.addColorStop(0, s.glowColor);
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(s.projX, s.projY, auraR, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = isHover ? '#ffffff' : s.color;
        ctx.beginPath();
        ctx.arc(s.projX, s.projY, starR, 0, Math.PI * 2);
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(s.projX, s.projY, starR + 7, 0, Math.PI * 2);
          ctx.stroke();

          ctx.setLineDash([3, 4]);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.7)';
          ctx.beginPath();
          ctx.arc(s.projX, s.projY, starR + 13, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        const showLabel = s.projDepth > -150 || isHover || isSelected || cam.zoom > 1.15;
        if (showLabel && isFiltered) {
          const fontSize = Math.max(9, Math.min(14, Math.round(11 * s.projScale)));
          ctx.font = `600 ${isHover ? fontSize + 2 : fontSize}px "Amiri", "Traditional Arabic", serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = isHover ? '#fbbf24' : isSelected ? '#fbbf24' : '#e2e8f0';
          ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          ctx.shadowBlur = 4;
          ctx.fillText(s.name, s.projX, s.projY + starR + 12);
          ctx.shadowBlur = 0;
        }
      }

      ctx.globalAlpha = 1;
      setHoveredStar(currentHover);
      animFrameRef.current = requestAnimationFrame(render);
    };

    animFrameRef.current = requestAnimationFrame(render);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
    };
  }, [activeVisualMode, autoRotate, showConstellationLines, showAstrolabeRings, filteredSurahSet, selectedStar, hoveredStar]);

  const handleCanvasMouseDown = (e) => {
    if (e.button !== 0) return;
    const m = mouse3DRef.current;
    m.isDown = true;
    m.hasMoved = false;
    m.startX = e.clientX;
    m.startY = e.clientY;
    m.lastX = e.clientX;
    m.lastY = e.clientY;
  };

  const handleCanvasMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const m = mouse3DRef.current;
    m.screenX = e.clientX - rect.left;
    m.screenY = e.clientY - rect.top;

    if (m.isDown) {
      const dx = e.clientX - m.lastX;
      const dy = e.clientY - m.lastY;
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        m.hasMoved = true;
      }
      const cam = camera3DRef.current;
      cam.targetRotY += dx * 0.0055;
      cam.targetRotX += dy * 0.0055;
      cam.velY = dx * 0.002;
      cam.velX = dy * 0.002;
      m.lastX = e.clientX;
      m.lastY = e.clientY;
    }
  };

  const handleCanvasMouseUp = () => {
    const m = mouse3DRef.current;
    if (m.isDown && !m.hasMoved) {
      if (hoveredStar) {
        flyCameraToStar(hoveredStar);
      } else {
        setSelectedStar(null);
      }
    }
    m.isDown = false;
  };

  const handleCanvasWheel = (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.12 : 0.89;
    const cam = camera3DRef.current;
    cam.targetZoom = Math.min(2.4, Math.max(0.4, cam.targetZoom * factor));
  };

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
    const isRtl = true;
    const effectiveRatio = isRtl ? (1 - clickRatio) : clickRatio;
    const { scrollWidth, clientWidth } = timelineTrackRef.current;
    const maxScroll = scrollWidth - clientWidth;
    timelineTrackRef.current.scrollTo({
      left: (isRtl ? -1 : 1) * maxScroll * effectiveRatio,
      behavior: 'smooth'
    });
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.().catch(() => {});
      setIsFullscreen(false);
    }
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
      aria-label="استكشف بصائر — الفضاء الكوني والمعرفي للقرآن الكريم"
    >
      <div className="space-hud-topbar">
        <div className="hud-title-cluster">
          <div className="hud-brand-tag">
            <SparklesIcon size={14} className="text-gold" />
            <span>كوكبة القرآن ثلاثية الأبعاد (3D Celestial Universe)</span>
          </div>

          <div className="visual-mode-tabs" role="tablist">
            <button
              type="button"
              className={`mode-tab-btn ${activeVisualMode === 'constellation' ? 'active' : ''}`}
              onClick={() => setActiveVisualMode('constellation')}
            >
              <SparklesIcon size={14} />
              <span>كوكبة ومدار السور (3D Universe)</span>
            </button>

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
          </div>
        </div>

        {activeVisualMode === 'constellation' && (
          <div className="hud-3d-geometry-cluster">
            <div className="geometry-mode-pills" role="radiogroup" aria-label="الشكل الفلكي ثلاثي الأبعاد">
              <button
                type="button"
                className={`geo-pill-btn ${geometryMode === 'sphere' ? 'active' : ''}`}
                onClick={() => set3DGeometry('sphere')}
                title="عرض الكرة السماوية الإسطرلابية"
              >
                <span>الكرة الفلكية 🌐</span>
              </button>
              <button
                type="button"
                className={`geo-pill-btn ${geometryMode === 'galaxy' ? 'active' : ''}`}
                onClick={() => set3DGeometry('galaxy')}
                title="عرض المجرة الحلزونية الدوارة"
              >
                <span>المجرة الحلزونية 🌀</span>
              </button>
              <button
                type="button"
                className={`geo-pill-btn ${geometryMode === 'orbits' ? 'active' : ''}`}
                onClick={() => set3DGeometry('orbits')}
                title="عرض المدارات الكوكبية متحدة المركز"
              >
                <span>المدارات القرآنية 🪐</span>
              </button>
            </div>

            <div className="hud-tools-cluster">
              <button
                type="button"
                className={`hud-icon-btn ${autoRotate ? 'active' : ''}`}
                onClick={() => setAutoRotate(!autoRotate)}
                title="تشغيل / إيقاف الدوران التلقائي"
              >
                ↻
              </button>
              <button
                type="button"
                className={`hud-icon-btn ${showConstellationLines ? 'active' : ''}`}
                onClick={() => setShowConstellationLines(!showConstellationLines)}
                title="إظهار / إخفاء خطوط الأبراج"
              >
                ✦
              </button>
              <button
                type="button"
                className={`hud-icon-btn ${showAstrolabeRings ? 'active' : ''}`}
                onClick={() => setShowAstrolabeRings(!showAstrolabeRings)}
                title="إظهار / إخفاء حلقات الإسطرلاب"
              >
                ⭕
              </button>
              <button
                type="button"
                className="hud-icon-btn"
                onClick={() => {
                  camera3DRef.current.targetZoom = Math.min(2.4, camera3DRef.current.targetZoom * 1.25);
                }}
                title="تكبير المشهد"
              >
                +
              </button>
              <button
                type="button"
                className="hud-icon-btn"
                onClick={() => {
                  camera3DRef.current.targetZoom = Math.max(0.4, camera3DRef.current.targetZoom * 0.8);
                }}
                title="تصغير المشهد"
              >
                -
              </button>
              <button
                type="button"
                className="hud-icon-btn"
                onClick={() => handleReset3DCamera('default')}
                title="إعادة ضبط زاوية الكاميرا"
              >
                <RefreshIcon size={13} />
              </button>
              <button
                type="button"
                className="hud-icon-btn"
                onClick={toggleFullscreen}
                title="ملء الشاشة"
              >
                ⛶
              </button>
            </div>
          </div>
        )}
      </div>

      {activeVisualMode === 'constellation' && (
        <div className="canvas-viewport-wrapper">
          <div className="space-3d-floating-filterbar">
            <div className="floating-search-box">
              <SearchIcon size={14} className="text-gold" />
              <input
                type="text"
                placeholder="ابحث عن سورة للتحليق نحوها في الفضاء..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="floating-search-input"
              />
            </div>

            <div className="floating-pills-row">
              {[
                { id: 'all', label: 'الكل (١١٤)' },
                { id: 'Meccan', label: 'مكية 🕋' },
                { id: 'Medinan', label: 'مدنية 🕌' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`floating-pill ${filterType === p.id ? 'active' : ''}`}
                  onClick={() => setFilterType(p.id)}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="floating-pills-row">
              {Object.entries(CLASSIFICATION_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`floating-pill ${filterClass === key ? 'active' : ''}`}
                  onClick={() => setFilterClass(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="floating-camera-presets">
              <button
                type="button"
                className="camera-preset-btn"
                onClick={() => handleReset3DCamera('polar')}
                title="منظر من القطب الشمالي"
              >
                قطبي ⬆
              </button>
              <button
                type="button"
                className="camera-preset-btn"
                onClick={() => handleReset3DCamera('equator')}
                title="منظر استوائي جانبي"
              >
                استوائي 🧭
              </button>
            </div>
          </div>

          <canvas
            ref={canvasRef}
            className="constellation-canvas-3d"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onWheel={handleCanvasWheel}
          />

          <div className="space-canvas-hint-3d">
            <span>انقر واسحب لتدوير الفضاء 360° • عجلة الفأرة للتكبير • انقر على أي سورة للتحليق نحوها</span>
          </div>

          {hoveredStar && !selectedStar && (
            <div
              className="star-floating-tooltip-3d animate-fade-in"
              style={{
                left: `${mouse3DRef.current.screenX + 16}px`,
                top: `${mouse3DRef.current.screenY - 14}px`
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
            <div className="selected-star-drawer-3d animate-slide-up">
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
                  <span className="metric-tag">الآيات الكريمة</span>
                  <span className="metric-number font-calligraphy">{selectedStar.numberOfAyahs}</span>
                </div>
                <div className="drawer-metric">
                  <span className="metric-tag">المقدار التقديري</span>
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
                  <BookOpenIcon size={16} />
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
                  <MemorizeIcon size={16} />
                  <span>تسميع وحفظ بالذكاء الاصطناعي</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

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
    </div>
  );
}
