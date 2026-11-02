import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { ICONS } from './common/IconSystem';
import { SURAHS_LIST } from '../data/surahsList';
import { REVELATION_ORDER, TIMELINE_MILESTONES } from '../data/revelationTimelineData';
import { QURAN_LOCATIONS, PROPHETIC_ROUTES } from '../data/quranAtlasData';
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

const HISTORICAL_EPOCHS = [
  { id: 'ep-1', name: 'فجر النبوة وغار حراء', span: '١ - ٥ من البعثة', startOrder: 1, endOrder: 22, era: 'meccan' },
  { id: 'ep-2', name: 'الجهر بالدعوة والمقاطعة', span: '٥ - ١٠ من البعثة', startOrder: 23, endOrder: 49, era: 'meccan' },
  { id: 'ep-3', name: 'عام الحزن والإسراء', span: '١٠ - ١٣ من البعثة', startOrder: 50, endOrder: 86, era: 'meccan' },
  { id: 'ep-4', name: 'الهجرة وتأسيس المدينة', span: '١ - ٤ هـ', startOrder: 87, endOrder: 101, era: 'medinan' },
  { id: 'ep-5', name: 'الخندق وتمكين المجتمع', span: '٥ - ٨ هـ', startOrder: 102, endOrder: 110, era: 'medinan' },
  { id: 'ep-6', name: 'الفتح وحجة الوداع', span: '٨ - ١٠ هـ', startOrder: 111, endOrder: 114, era: 'medinan' }
];

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
  const [activeEpochTab, setActiveEpochTab] = useState('all');
  const [timelineLayoutMode, setTimelineLayoutMode] = useState('horizon');
  const [activeTimelineSurah, setActiveTimelineSurah] = useState(null);
  const [timelineProgress, setTimelineProgress] = useState(0);

  const timelineTrackRef = useRef(null);
  const isTimelineDraggingRef = useRef(false);
  const timelineDragStateRef = useRef({ startX: 0, scrollLeft: 0, hasMoved: false });

  const [selectedLocation, setSelectedLocation] = useState(QURAN_LOCATIONS[0]);
  const [showPropheticRoutes, setShowPropheticRoutes] = useState(true);
  const [selectedRouteId, setSelectedRouteId] = useState('all');
  const [mapCategoryFilter, setMapCategoryFilter] = useState('all');

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
          const depthAlpha = Math.max(0.08, Math.min(0.75, (450 - proj.depth) / 900));
          const pulse = 0.7 + Math.sin(time * 0.001 * d.pulseSpeed + i) * 0.3;
          ctx.globalAlpha = d.alpha * depthAlpha * pulse;
          ctx.beginPath();
          ctx.arc(proj.screenX, proj.screenY, Math.max(0.4, d.radius * proj.scale), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;

      if (showAstrolabeRings) {
        ctx.strokeStyle = 'rgba(210, 170, 96, 0.16)';
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
          const depthFade = Math.max(0.2, Math.min(1.0, (400 - avgDepth) / 750));

          if (isHighlighted) {
            ctx.strokeStyle = `rgba(251, 191, 36, ${0.85 * depthFade})`;
            ctx.lineWidth = 2.2;
            ctx.beginPath();
            ctx.moveTo(s1.projX, s1.projY);
            ctx.lineTo(s2.projX, s2.projY);
            ctx.stroke();
            ctx.lineWidth = 0.9;
          } else if (is1Active && is2Active) {
            ctx.strokeStyle = `rgba(180, 215, 230, ${0.22 * depthFade})`;
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

      for (let i = N_SURAHS - 1; i >= 0; i--) {
        const s = sortedStars[i];
        const dx = mouse.screenX - s.projX;
        const dy = mouse.screenY - s.projY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < minHoverDist) {
          minHoverDist = dist;
          currentHover = s;
          break;
        }
      }

      for (let i = 0; i < N_SURAHS; i++) {
        const s = sortedStars[i];
        const isFiltered = filteredSurahSet.has(s.number);
        const isHover = activeHoverOrSelected && activeHoverOrSelected.number === s.number;
        const isSelected = selectedStar && selectedStar.number === s.number;

        const depthFade = Math.max(0.35, Math.min(1.0, (400 - s.projDepth) / 700));
        const finalAlpha = isFiltered ? (isHover || isSelected ? 1 : depthFade) : 0.05;

        ctx.globalAlpha = finalAlpha;

        const starR = Math.max(2.8, s.radius * s.projScale * (isHover ? 1.4 : 1));

        const auraR = starR * (isHover ? 4.5 : 2.6);
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

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(s.projX, s.projY, Math.max(1, starR * 0.38), 0, Math.PI * 2);
        ctx.fill();

        if (isHover || isSelected || s.group === 'tiwal') {
          ctx.strokeStyle = isHover || isSelected ? '#fbbf24' : 'rgba(251, 191, 36, 0.45)';
          ctx.lineWidth = isHover || isSelected ? 1.5 : 1;
          const glint = starR * (isHover || isSelected ? 2.4 : 1.8);
          ctx.beginPath();
          ctx.moveTo(s.projX - glint, s.projY);
          ctx.lineTo(s.projX + glint, s.projY);
          ctx.moveTo(s.projX, s.projY - glint);
          ctx.lineTo(s.projX, s.projY + glint);
          ctx.stroke();
        }

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

        const showLabel = s.projDepth < 100 || isHover || isSelected || cam.zoom > 1.05;
        if (showLabel && isFiltered) {
          const fontSize = Math.max(10, Math.min(15, Math.round(11.5 * s.projScale)));
          ctx.font = `600 ${isHover ? fontSize + 2 : fontSize}px "Amiri", "Traditional Arabic", serif`;
          ctx.textAlign = 'center';
          ctx.fillStyle = isHover ? '#fbbf24' : isSelected ? '#fbbf24' : (s.group === 'tiwal' ? '#fbbf24' : '#e2e8f0');
          ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
          ctx.shadowBlur = 5;
          ctx.fillText(`${s.number}. ${s.name}`, s.projX, s.projY + starR + 13);
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
      if (activeEpochTab !== 'all') {
        const epoch = HISTORICAL_EPOCHS.find((ep) => ep.id === activeEpochTab);
        if (epoch && (item.order < epoch.startOrder || item.order > epoch.endOrder)) {
          return false;
        }
      }
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
  }, [activeEpochTab, timelineEraFilter, timelineSearch]);

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
    if (!timelineTrackRef.current || timelineLayoutMode !== 'horizon') return;
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      e.preventDefault();
      timelineTrackRef.current.scrollLeft += e.deltaY * 1.5;
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

  const jumpToOrderStation = (orderIndex) => {
    const el = document.getElementById(`chronicle-item-${orderIndex}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'center' });
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      setIsFullscreen(true);
      if (containerRef.current && !document.fullscreenElement) {
        containerRef.current.requestFullscreen?.().catch(() => {});
      }
    } else {
      setIsFullscreen(false);
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        if (document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

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
      {isFullscreen && (
        <button
          type="button"
          className="floating-fullscreen-exit animate-fade-in"
          onClick={toggleFullscreen}
          title="خروج من وضع ملء الشاشة (Escape)"
        >
          <span>✕ خروج من وضع ملء الشاشة</span>
          <kbd className="exit-kbd-hint">ESC</kbd>
        </button>
      )}
      <div className="space-hud-topbar">
        <div className="hud-title-cluster">
          <div className="hud-brand-tag">
            <SparklesIcon size={14} className="text-gold" />
            <span>كوكبة القرآن التفاعلية (Basa'ir Universe)</span>
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
              <span>سِفْر التنزيل النبوي (Timeline)</span>
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
            </div>
          </div>
        )}

        <button
          type="button"
          className={`hud-immersion-btn ${isFullscreen ? 'is-active' : ''}`}
          onClick={toggleFullscreen}
          title={isFullscreen ? 'تصغير الشاشة (Esc)' : 'توسيع المشهد لكامل الصفحة والشاشة ⛶'}
        >
          <span className="immersion-icon">{isFullscreen ? '🗗' : '⛶'}</span>
          <span className="immersion-txt">{isFullscreen ? 'تصغير الشاشة' : 'ملء الصفحة بالكامل'}</span>
        </button>
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
        <div className="chronicle-stage-wrapper animate-fade-in">
          <div className="chronicle-editorial-masthead">
            <div className="masthead-main-titles">
              <div className="masthead-pretitle">
                <span className="gold-ornament">❖</span>
                <span>سجل النزول التاريخي المعتمد</span>
                <span className="gold-ornament">❖</span>
              </div>
              <h2 className="masthead-title font-calligraphy">
                سِفْر التنزيل النبوي الشريف
              </h2>
              <p className="masthead-caption">
                المسار التاريخي التوثيقي لتتابع نزول سور القرآن الكريم عبر ثلاثة وعشرين عاماً نبوياً (من غار حراء إلى حجة الوداع).
              </p>
            </div>

            <div className="masthead-utility-cluster">
              <div className="chronicle-search-box">
                <SearchIcon size={14} className="text-gold" />
                <input
                  type="text"
                  placeholder="ابحث برقم النزول، اسم السورة، أو الحادثة..."
                  value={timelineSearch}
                  onChange={(e) => setTimelineSearch(e.target.value)}
                  className="chronicle-search-input"
                />
              </div>

              <div className="chronicle-era-toggles">
                <button
                  type="button"
                  className={`era-toggle-btn ${timelineEraFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setTimelineEraFilter('all')}
                >
                  الكل (١١٤)
                </button>
                <button
                  type="button"
                  className={`era-toggle-btn meccan ${timelineEraFilter === 'meccan' ? 'active' : ''}`}
                  onClick={() => setTimelineEraFilter('meccan')}
                >
                  مكية 🕋
                </button>
                <button
                  type="button"
                  className={`era-toggle-btn medinan ${timelineEraFilter === 'medinan' ? 'active' : ''}`}
                  onClick={() => setTimelineEraFilter('medinan')}
                >
                  مدنية 🕌
                </button>
              </div>

              <div className="chronicle-layout-toggles">
                <button
                  type="button"
                  className={`layout-toggle-btn ${timelineLayoutMode === 'horizon' ? 'active' : ''}`}
                  onClick={() => setTimelineLayoutMode('horizon')}
                  title="المسار الزمني الممتد (أفقي)"
                >
                  المسار الأفقي
                </button>
                <button
                  type="button"
                  className={`layout-toggle-btn ${timelineLayoutMode === 'ledger' ? 'active' : ''}`}
                  onClick={() => setTimelineLayoutMode('ledger')}
                  title="السجل الوثائقي المتتابع (عمودي)"
                >
                  السجل التوثيقي
                </button>
              </div>

              {timelineLayoutMode === 'horizon' && (
                <div className="horizon-nav-arrows">
                  <button
                    type="button"
                    className="horizon-arrow-btn"
                    onClick={() => scrollTimelineBy(360)}
                    title="التقدم للأمام"
                  >
                    <span>التقدم</span>
                    <span>‹</span>
                  </button>
                  <button
                    type="button"
                    className="horizon-arrow-btn"
                    onClick={() => scrollTimelineBy(-360)}
                    title="الرجوع للبداية"
                  >
                    <span>›</span>
                    <span>السابق</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="chronicle-epochs-bar">
            <span className="epochs-bar-title text-gold">الحقب التاريخية:</span>
            <div className="epochs-pills-track">
              <button
                type="button"
                className={`epoch-pill-item ${activeEpochTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveEpochTab('all')}
              >
                جميع السور (١١٤)
              </button>
              {HISTORICAL_EPOCHS.map((ep) => (
                <button
                  key={ep.id}
                  type="button"
                  className={`epoch-pill-item ${activeEpochTab === ep.id ? 'active' : ''} ${ep.era}`}
                  onClick={() => {
                    setActiveEpochTab(ep.id);
                    jumpToOrderStation(ep.startOrder);
                  }}
                >
                  <span className="epoch-item-name">{ep.name}</span>
                  <span className="epoch-item-span">({ep.span})</span>
                </button>
              ))}
            </div>
          </div>

          {timelineLayoutMode === 'horizon' ? (
            <div
              className="chronicle-horizon-viewport"
              ref={timelineTrackRef}
              onScroll={handleTimelineScroll}
              onWheel={handleTimelineWheel}
              onMouseDown={handleTimelineMouseDown}
              onMouseMove={handleTimelineMouseMove}
              onMouseUp={handleTimelineMouseUp}
              onMouseLeave={handleTimelineMouseUp}
            >
              <div className="chronicle-horizon-tape">
                <div className="horizon-spine-rule" />

                {filteredTimeline.map((item, idx) => {
                  const surahMeta = SURAHS_LIST.find((s) => s.number === item.number);
                  const isMedinan = item.era.startsWith('medinan');
                  const milestone = milestonesMap[item.order];
                  const isFirstMedinan = item.order === 87;

                  return (
                    <React.Fragment key={`horizon-${item.order}`}>
                      {isFirstMedinan && (
                        <div className="horizon-epoch-monument">
                          <div className="monument-rosette">۞</div>
                          <div className="monument-content">
                            <span className="monument-badge">منعطف التاريخ الإسلامي الأكبر</span>
                            <h4 className="monument-title font-calligraphy">
                              الهجرة النبوية المباركة إلى المدينة المنورة
                            </h4>
                            <p className="monument-desc">
                              تأسيس دار الإسلام وبناء المسجد النبوي الشريف وبدء تشريعات المجتمع والعبادات والمعاملات (السنة الأولى للهجرة - ٦٢٢ م).
                            </p>
                          </div>
                        </div>
                      )}

                      <div
                        id={`chronicle-item-${item.order}`}
                        className={`islamic-manuscript-card ${isMedinan ? 'is-medinan' : 'is-meccan'} ${activeTimelineSurah?.order === item.order ? 'active' : ''}`}
                        onClick={() => setActiveTimelineSurah(item)}
                      >
                        <div className="mihrab-arch-crest">
                          <span className="arch-finial">۩</span>
                          <span className="arch-flourish">❖ ── ۞ ── ❖</span>
                        </div>

                        {milestone && (
                          <div className="islamic-milestone-ribbon">
                            <span className="milestone-rosette">✦</span>
                            <span className="milestone-txt font-calligraphy">{milestone.title}</span>
                          </div>
                        )}

                        <div className="unwan-cartouche-header">
                          <div className="unwan-meta-line">
                            <div className="islamic-star-seal">
                              <span className="star-seal-icon">۞</span>
                              <span className="star-seal-digit font-calligraphy">{item.order}</span>
                            </div>
                            <span className={`era-illumination-tag ${isMedinan ? 'medinan' : 'meccan'}`}>
                              {isMedinan ? '🕌 تنزيل مدني مبارك' : '🕋 تنزيل مكي شريف'}
                            </span>
                            <span className="mushaf-bracket-badge">﴿ سورة #{item.number} ﴾</span>
                          </div>

                          <h3 className="unwan-surah-heading font-calligraphy">سُورَةُ {item.name}</h3>
                          <div className="unwan-year-ribbon font-calligraphy">{item.year}</div>
                        </div>

                        <div className="manuscript-commentary-frame">
                          <p className="manuscript-narrative-text">«{item.note}»</p>
                        </div>

                        <div className="manuscript-card-footer">
                          <span className="ayah-count-medallion">
                            ۞ {surahMeta ? surahMeta.numberOfAyahs : 0} آية كريمة
                          </span>

                          <button
                            type="button"
                            className="islamic-read-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSurah?.(item.number);
                              onNavigateTab?.('reader');
                            }}
                            title="فتح السورة في المصحف الشريف والتلاوة"
                          >
                            <BookOpenIcon size={14} />
                            <span>قراءة السورة ↵</span>
                          </button>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="chronicle-ledger-viewport">
              <div className="chronicle-ledger-container">
                {filteredTimeline.map((item) => {
                  const surahMeta = SURAHS_LIST.find((s) => s.number === item.number);
                  const isMedinan = item.era.startsWith('medinan');
                  const milestone = milestonesMap[item.order];
                  const isFirstMedinan = item.order === 87;

                  return (
                    <React.Fragment key={`ledger-${item.order}`}>
                      {isFirstMedinan && (
                        <div className="ledger-monument-row">
                          <div className="ledger-monument-card">
                            <span className="monument-badge">منعطف التاريخ الإسلامي الأكبر</span>
                            <h4 className="monument-title font-calligraphy">
                              الهجرة النبوية الشريفة إلى المدينة المنورة (١ هـ / ٦٢٢ م)
                            </h4>
                            <p className="monument-desc">
                              انتقال الدعوة من مرحلة البلاغ والصبر بمكة إلى مرحلة التمكين وتأسيس الدولة الإسلامية في المدينة المنورة.
                            </p>
                          </div>
                        </div>
                      )}

                      <div
                        id={`chronicle-item-${item.order}`}
                        className={`chronicle-ledger-entry ${isMedinan ? 'is-medinan' : 'is-meccan'}`}
                        onClick={() => setActiveTimelineSurah(item)}
                      >
                        <div className="ledger-entry-order">
                          <span className="ledger-order-num font-calligraphy">{item.order}</span>
                          <span className="ledger-order-caption">في النزول</span>
                        </div>

                        <div className="ledger-entry-content">
                          <div className="ledger-entry-meta-line">
                            <span className={`ledger-era-tag ${isMedinan ? 'medinan' : 'meccan'}`}>
                              {isMedinan ? 'تنزيل مدني 🕌' : 'تنزيل مكي 🕋'}
                            </span>
                            <span className="ledger-year-tag">{item.year}</span>
                            <span className="ledger-mushaf-tag">المصحف: سورة #{item.number}</span>
                            {milestone && (
                              <span className="ledger-milestone-tag">✦ {milestone.title}</span>
                            )}
                          </div>

                          <h3 className="ledger-surah-title font-calligraphy">سورة {item.name}</h3>
                          <p className="ledger-narrative-text">{item.note}</p>
                        </div>

                        <div className="ledger-entry-cta">
                          <span className="ledger-ayahs-count">{surahMeta ? surahMeta.numberOfAyahs : 0} آية</span>
                          <button
                            type="button"
                            className="ledger-read-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectSurah?.(item.number);
                              onNavigateTab?.('reader');
                            }}
                          >
                            <BookOpenIcon size={14} />
                            <span>فتح السورة ↵</span>
                          </button>
                        </div>
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          )}

          {timelineLayoutMode === 'horizon' && (
            <div className="chronicle-footer-rail">
              <div className="footer-rail-meta">
                <span className="rail-legend-item meccan">🕋 العهد المكي الشريف (من سورة العلق إلى سورة المطففين)</span>
                <span className="rail-legend-item medinan">🕌 العهد المدني المبارك (من سورة البقرة إلى سورة النصر)</span>
              </div>
              <div className="footer-rail-bar" onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const ratio = (e.clientX - rect.left) / rect.width;
                const effective = 1 - ratio;
                if (timelineTrackRef.current) {
                  const maxScroll = timelineTrackRef.current.scrollWidth - timelineTrackRef.current.clientWidth;
                  timelineTrackRef.current.scrollTo({ left: -maxScroll * effective, behavior: 'smooth' });
                }
              }}>
                <div className="rail-fill-meccan" style={{ width: '75%' }} />
                <div className="rail-fill-medinan" style={{ width: '25%' }} />
                <div className="rail-thumb-dot" style={{ right: `${timelineProgress * 100}%` }} />
              </div>
            </div>
          )}
        </div>
      )}

{activeVisualMode === 'atlas' && (
        <div className="quran-atlas-stage animate-fade-in">
          <div className="atlas-locations-sidebar">
            <div className="sidebar-header-box">
              <h3 className="sidebar-title font-calligraphy">
                <CompassIcon size={18} className="text-gold" />
                <span>أطلس المعالم والخرائط القرآنية</span>
              </h3>
              <p className="sidebar-sub">استكشف المواقع الجغرافية الشريفة المذكورة نصاً في القرآن الكريم ومسارات الأنبياء:</p>
            </div>

            <div className="atlas-category-filter-pills">
              {[
                { id: 'all', label: 'الكل (١٠)' },
                { id: 'holy', label: 'المقدسة 🕌' },
                { id: 'mountain', label: 'الجبال ⛰️' },
                { id: 'city', label: 'المدن 🏛️' },
                { id: 'river', label: 'الأنهار 🌊' },
                { id: 'desert', label: 'الأحقاف 🏜️' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`cat-pill-btn ${mapCategoryFilter === cat.id ? 'active' : ''}`}
                  onClick={() => setMapCategoryFilter(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="locations-list">
              {QURAN_LOCATIONS.filter((loc) => mapCategoryFilter === 'all' || loc.category === mapCategoryFilter).map((loc) => (
                <div
                  key={loc.id}
                  className={`location-list-item ${selectedLocation.id === loc.id ? 'active' : ''}`}
                  onClick={() => setSelectedLocation(loc)}
                  role="button"
                  tabIndex={0}
                >
                  <span className="loc-category-badge">{loc.iconSymbol}</span>
                  <div className="loc-info">
                    <span className="loc-name font-calligraphy">{loc.name}</span>
                    <span className="loc-region">{loc.region}</span>
                    <span className="loc-era-hint">{loc.historicalEra}</span>
                  </div>
                  <span className="loc-surah-pill">{loc.surahRef.split(':')[0]}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="atlas-map-canvas-card">
            <div className="map-toolbar-ribbon">
              <div className="toolbar-left-group">
                <button
                  type="button"
                  className={`map-route-toggle-btn ${showPropheticRoutes ? 'active' : ''}`}
                  onClick={() => setShowPropheticRoutes(!showPropheticRoutes)}
                >
                  <span>✦ مسارات الأنبياء والوحي</span>
                  <span className="route-status-pill">{showPropheticRoutes ? 'مفعلة' : 'مخفية'}</span>
                </button>

                {showPropheticRoutes && (
                  <div className="prophetic-routes-selector">
                    <button
                      type="button"
                      className={`route-pill-btn ${selectedRouteId === 'all' ? 'active' : ''}`}
                      onClick={() => setSelectedRouteId('all')}
                    >
                      جميع المسارات
                    </button>
                    {PROPHETIC_ROUTES.map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        className={`route-pill-btn ${selectedRouteId === r.id ? 'active' : ''}`}
                        onClick={() => setSelectedRouteId(r.id)}
                        style={{ borderColor: selectedRouteId === r.id ? r.color : 'rgba(210, 170, 96, 0.25)' }}
                      >
                        <span className="route-dot" style={{ background: r.color }} />
                        <span>{r.name.split('(')[0]}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="map-legend-tags">
                <span className="legend-tag holy">🕌 مقدسات الحرمين والأقصى</span>
                <span className="legend-tag mountain">⛰️ طور سيناء والجودي</span>
                <span className="legend-tag river">🌊 نيل مصر والرافدين</span>
              </div>
            </div>

            <div className="interactive-map-board">
              <svg
                viewBox="0 0 1000 650"
                className="antique-cartography-svg"
                preserveAspectRatio="xMidYMid meet"
              >
                <defs>
                  <radialGradient id="oceanGrad" cx="50%" cy="50%" r="70%">
                    <stop offset="0%" stopColor="#04151b" />
                    <stop offset="60%" stopColor="#020d12" />
                    <stop offset="100%" stopColor="#010609" />
                  </radialGradient>

                  <linearGradient id="parchmentLandGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#092027" />
                    <stop offset="50%" stopColor="#0c2932" />
                    <stop offset="100%" stopColor="#07191f" />
                  </linearGradient>

                  <linearGradient id="seaWaterGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#03161c" />
                    <stop offset="50%" stopColor="#05242d" />
                    <stop offset="100%" stopColor="#020f14" />
                  </linearGradient>

                  <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>

                  <pattern id="islamicLattice" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 0 20 L 20 0 L 40 20 L 20 40 Z" fill="none" stroke="rgba(210, 170, 96, 0.04)" strokeWidth="0.8" />
                    <circle cx="20" cy="20" r="3" fill="none" stroke="rgba(210, 170, 96, 0.06)" strokeWidth="0.8" />
                  </pattern>
                </defs>

                <rect width="1000" height="650" fill="#030c10" />
                <rect x="50" y="50" width="900" height="550" rx="14" fill="url(#parchmentLandGrad)" />
                <rect x="50" y="50" width="900" height="550" rx="14" fill="url(#islamicLattice)" opacity="0.65" />

                <g className="cartographic-rhumb-lines" opacity="0.12" stroke="#d4af37" strokeWidth="0.8">
                  <line x1="100" y1="100" x2="950" y2="100" />
                  <line x1="100" y1="100" x2="100" y2="600" />
                  <line x1="100" y1="100" x2="950" y2="525" />
                  <line x1="100" y1="100" x2="600" y2="600" />
                  <line x1="100" y1="100" x2="950" y2="300" />
                  <line x1="100" y1="100" x2="350" y2="600" />
                </g>

                <path
                  d="M 50 50 L 950 50 L 950 600 L 50 600 Z"
                  fill="none"
                  stroke="rgba(210, 170, 96, 0.45)"
                  strokeWidth="2.5"
                  rx="14"
                />
                <path
                  d="M 56 56 L 944 56 L 944 594 L 56 594 Z"
                  fill="none"
                  stroke="rgba(210, 170, 96, 0.22)"
                  strokeWidth="1"
                  strokeDasharray="4, 4"
                />

                <path
                  d="M 50 50 L 445 50 L 440 120 L 435 175 L 420 205 Q 390 215 360 200 Q 320 195 280 200 L 50 190 Z"
                  fill="url(#seaWaterGrad)"
                  stroke="rgba(56, 189, 248, 0.45)"
                  strokeWidth="1.6"
                />

                <path
                  d="M 340 235 L 355 268 L 385 272 L 400 248 L 405 275 L 430 330 L 460 395 L 495 460 L 530 520 L 545 545 L 535 558 L 495 515 L 455 450 L 420 385 L 390 320 L 365 270 L 340 235 Z"
                  fill="url(#seaWaterGrad)"
                  stroke="rgba(56, 189, 248, 0.48)"
                  strokeWidth="1.6"
                />

                <path
                  d="M 630 240 Q 665 270 705 295 Q 740 320 770 340 L 785 335 Q 745 290 700 255 Q 660 230 630 240 Z"
                  fill="url(#seaWaterGrad)"
                  stroke="rgba(56, 189, 248, 0.42)"
                  strokeWidth="1.6"
                />

                <path
                  d="M 535 558 Q 590 555 660 525 Q 735 480 805 415 L 950 440 L 950 600 L 490 600 Q 515 570 535 558 Z"
                  fill="url(#seaWaterGrad)"
                  stroke="rgba(56, 189, 248, 0.42)"
                  strokeWidth="1.6"
                />

                <g className="sea-wave-ripples" opacity="0.32" stroke="#38bdf8" strokeWidth="1" strokeDasharray="3, 5" fill="none">
                  <path d="M 120 100 Q 140 95 160 100 M 200 130 Q 220 125 240 130 M 280 110 Q 300 105 320 110" />
                  <path d="M 395 345 Q 405 340 415 345 M 430 405 Q 440 400 450 405 M 465 465 Q 475 460 485 465" />
                  <path d="M 665 265 Q 680 260 695 265 M 710 295 Q 725 290 740 295" />
                  <path d="M 620 570 Q 640 565 660 570 M 720 540 Q 740 535 760 540 M 820 500 Q 840 495 860 500" />
                </g>

                <path
                  d="M 300 600 Q 320 520 325 450 Q 315 360 320 250 Q 320 220 310 200 L 330 190 Q 340 220 330 250 Q 325 360 335 450 Q 330 520 310 600 Z"
                  fill="rgba(56, 189, 248, 0.35)"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                />
                <path d="M 320 210 Q 300 190 290 185" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
                <path d="M 320 210 Q 340 190 350 185" fill="none" stroke="#38bdf8" strokeWidth="1.5" />

                <path
                  d="M 510 120 Q 520 170 550 210 Q 580 230 635 245"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeOpacity="0.75"
                />
                <path
                  d="M 550 135 Q 565 170 590 200 Q 615 220 635 245"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.8"
                  strokeOpacity="0.75"
                />

                <g className="mountains-group" opacity="0.6">
                  {[[385, 260], [395, 265], [445, 330], [455, 370], [470, 420], [545, 135], [555, 130]].map(([mx, my], idx) => (
                    <polygon
                      key={`mtn-${idx}`}
                      points={`${mx},${my - 12} ${mx - 10},${my + 6} ${mx + 10},${my + 6}`}
                      fill="rgba(210, 170, 96, 0.2)"
                      stroke="#fbbf24"
                      strokeWidth="1"
                    />
                  ))}
                </g>

                <g className="sea-calligraphy-labels" opacity="0.5">
                  <text x="210" y="120" fill="#38bdf8" fontSize="15" fontFamily="'Amiri', serif" textAnchor="middle">
                    بَحْرُ الرُّومِ (المتوسط)
                  </text>
                  <text x="440" y="440" fill="#38bdf8" fontSize="15" fontFamily="'Amiri', serif" textAnchor="middle" transform="rotate(-52 440 440)">
                    بَحْرُ القُلْزُمِ (البحر الأحمر)
                  </text>
                  <text x="720" y="290" fill="#38bdf8" fontSize="14" fontFamily="'Amiri', serif" textAnchor="middle" transform="rotate(30 720 290)">
                    بَحْرُ فَارِسَ (الخليج العربي)
                  </text>
                  <text x="720" y="550" fill="#38bdf8" fontSize="14" fontFamily="'Amiri', serif" textAnchor="middle">
                    بَحْرُ العَرَبِ وَالمُحِيطُ
                  </text>
                </g>

                <g className="region-calligraphy-labels" opacity="0.65">
                  <text x="475" y="360" fill="#fbbf24" fontSize="16" fontWeight="700" fontFamily="'Amiri', serif" textAnchor="middle">
                    بِلَادُ الحِجَازِ المُبَارَكَة
                  </text>
                  <text x="440" y="160" fill="#fbbf24" fontSize="14" fontFamily="'Amiri', serif" textAnchor="middle">
                    بِلَادُ الشَّامِ وَفِلَسْطِين
                  </text>
                  <text x="260" y="270" fill="#fbbf24" fontSize="14" fontFamily="'Amiri', serif" textAnchor="middle">
                    أَرْضُ الكِنَانَةِ (مِصْر)
                  </text>
                  <text x="630" y="170" fill="#fbbf24" fontSize="14" fontFamily="'Amiri', serif" textAnchor="middle">
                    بِلَادُ الرَّافِدَيْنِ (العِرَاق)
                  </text>
                  <text x="590" y="525" fill="#fbbf24" fontSize="14" fontFamily="'Amiri', serif" textAnchor="middle">
                    اليَمَنُ السَّعِيد
                  </text>
                  <text x="660" y="440" fill="#94a3b8" fontSize="12" fontFamily="'Amiri', serif" textAnchor="middle">
                    رِمَالُ الأَحْقَافِ (الرُّبْعُ الخَالِي)
                  </text>
                </g>

                <g className="astrolabe-compass-rose" transform="translate(100, 100)">
                  <circle cx="0" cy="0" r="42" fill="rgba(4, 14, 18, 0.85)" stroke="#fbbf24" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="38" fill="none" stroke="rgba(210, 170, 96, 0.3)" strokeWidth="1" strokeDasharray="2, 4" />
                  <polygon points="0,-40 6,-8 0,0 -6,-8" fill="#fbbf24" />
                  <polygon points="0,40 6,8 0,0 -6,8" fill="rgba(251, 191, 36, 0.4)" />
                  <polygon points="40,0 8,6 0,0 8,-6" fill="rgba(251, 191, 36, 0.6)" />
                  <polygon points="-40,0 -8,6 0,0 -8,-6" fill="rgba(251, 191, 36, 0.6)" />
                  <circle cx="0" cy="0" r="5" fill="#ffffff" stroke="#fbbf24" strokeWidth="1.5" />
                  <text x="0" y="-46" fill="#fbbf24" fontSize="11" fontWeight="700" textAnchor="middle" fontFamily="'Amiri', serif">شَمَال</text>
                  <text x="0" y="54" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="'Amiri', serif">جَنُوب</text>
                  <text x="48" y="4" fill="#94a3b8" fontSize="10" textAnchor="start" fontFamily="'Amiri', serif">مَشْرِق</text>
                  <text x="-48" y="4" fill="#94a3b8" fontSize="10" textAnchor="end" fontFamily="'Amiri', serif">مَغْرِب</text>
                </g>

                {showPropheticRoutes && PROPHETIC_ROUTES.filter((r) => selectedRouteId === 'all' || r.id === selectedRouteId).map((route) => (
                  <g key={route.id} className="prophetic-route-svg-group">
                    <path
                      d={route.pathD}
                      fill="none"
                      stroke={route.color}
                      strokeWidth="2.8"
                      strokeDasharray={route.dashArray}
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                    {route.milestones.map((m, idx) => (
                      <circle
                        key={`${route.id}-m-${idx}`}
                        cx={m.x}
                        cy={m.y}
                        r="4"
                        fill="#ffffff"
                        stroke={route.color}
                        strokeWidth="2"
                      />
                    ))}
                  </g>
                ))}

                {QURAN_LOCATIONS.map((loc) => {
                  const isSelected = selectedLocation.id === loc.id;
                  const coords = loc.svgCoords || { x: loc.coordinates.x * 10, y: loc.coordinates.y * 6.5 };

                  return (
                    <g
                      key={`svg-pin-${loc.id}`}
                      className={`islamic-map-node ${isSelected ? 'is-selected' : ''}`}
                      transform={`translate(${coords.x}, ${coords.y})`}
                      onClick={() => setSelectedLocation(loc)}
                      style={{ cursor: 'pointer' }}
                    >
                      {isSelected && (
                        <>
                          <circle cx="0" cy="0" r="26" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.6">
                            <animate attributeName="r" values="16;30;16" dur="2.4s" repeatCount="indefinite" />
                            <animate attributeName="opacity" values="0.8;0;0.8" dur="2.4s" repeatCount="indefinite" />
                          </circle>
                          <circle cx="0" cy="0" r="18" fill="rgba(251, 191, 36, 0.2)" stroke="#fbbf24" strokeWidth="1.5" />
                        </>
                      )}

                      <polygon
                        points="0,-12 3,-4 11,-4 5,2 7,10 0,5 -7,10 -5,2 -11,-4 -3,-4"
                        fill={isSelected ? '#fbbf24' : 'rgba(11, 43, 38, 0.95)'}
                        stroke="#fbbf24"
                        strokeWidth="1.5"
                      />

                      <circle cx="0" cy="0" r="9" fill={isSelected ? '#0b2b26' : '#041318'} stroke="#fbbf24" strokeWidth="1.2" />
                      <text x="0" y="3.5" fill="#ffffff" fontSize="9" textAnchor="middle">
                        {loc.iconSymbol}
                      </text>

                      <g transform="translate(0, 22)">
                        <rect
                          x="-38"
                          y="-10"
                          width="76"
                          height="18"
                          rx="9"
                          fill={isSelected ? 'rgba(7, 24, 30, 0.98)' : 'rgba(3, 11, 14, 0.85)'}
                          stroke={isSelected ? '#fbbf24' : 'rgba(210, 170, 96, 0.35)'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          fill={isSelected ? '#fbbf24' : '#e2e8f0'}
                          fontSize="10"
                          fontWeight="700"
                          textAnchor="middle"
                          fontFamily="'Amiri', serif"
                        >
                          {loc.name.split(' ')[0]} {loc.name.split(' ')[1] || ''}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </svg>

              <div className="atlas-selected-spotlight animate-slide-up">
                <div className="spotlight-mihrab-crest">
                  <span className="crest-seal">۩</span>
                  <span className="crest-sub">الموقع القرآني الموثق</span>
                </div>

                <div className="spotlight-header">
                  <div className="spotlight-title-group">
                    <div className="spotlight-badge-line">
                      <span className="spotlight-region-tag">{selectedLocation.region}</span>
                      <span className="spotlight-era-tag">✦ {selectedLocation.historicalEra}</span>
                    </div>
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
