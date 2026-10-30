import React from 'react';
import {
  BookOpen,
  Bookmark,
  Brain,
  GitCompare,
  Lightbulb,
  BookOpenText,
  Languages,
  AudioLines,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat2,
  Gauge,
  Shuffle,
  Settings2,
  Search,
  Sun,
  Moon,
  Copy,
  Check,
  Share2,
  Type,
  User,
  Terminal,
  X,
  Volume2,
  VolumeX,
  ListMusic,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sprout,
  Heart,
  Shield,
  Compass,
  Clock,
  UserCheck,
  Download,
  Info,
  Server,
  Activity,
  ShieldCheck,
  Palette,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Eye,
  EyeOff,
  Plus
} from 'lucide-react';

export const ICONS = {
  mushaf: BookOpen,
  bookmarks: Bookmark,
  memorize: Brain,
  mutashabihat: GitCompare,
  tadabbur: Lightbulb,
  scholars: AudioLines,
  tafsir: BookOpenText,
  translation: Languages,

  audio: AudioLines,
  play: Play,
  pause: Pause,
  skipBack: SkipBack,
  skipForward: SkipForward,
  repeat: Repeat2,
  speed: Gauge,
  shuffle: Shuffle,
  volumeOn: Volume2,
  volumeMute: VolumeX,
  queue: ListMusic,

  search: Search,
  settings: Settings2,
  themeLight: Sun,
  themeDark: Moon,
  profile: User,
  terminal: Terminal,
  close: X,
  type: Type,
  palette: Palette,

  plus: Plus,
  copy: Copy,
  check: Check,
  share: Share2,
  download: Download,
  externalLink: ExternalLink,
  info: Info,

  chevronUp: ChevronUp,
  chevronDown: ChevronDown,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,

  streak: Flame,
  level: Sprout,

  heart: Heart,
  shield: Shield,
  sun: Sun,
  compass: Compass,

  clock: Clock,
  userCheck: UserCheck,
  server: Server,
  activity: Activity,
  shieldCheck: ShieldCheck,
  refresh: RotateCcw,
  sparkles: Sparkles,
  eye: Eye,
  eyeOff: EyeOff
};


export const NavIcon = ({ icon: IconComponent, className = '', size = 20, strokeWidth = 1.8, ...props }) => {
  if (!IconComponent) return null;
  return <IconComponent size={size} strokeWidth={strokeWidth} className={`nav-icon-standard ${className}`} {...props} />;
};

export const ActionIcon = ({ icon: IconComponent, className = '', size = 18, strokeWidth = 1.8, ...props }) => {
  if (!IconComponent) return null;
  return <IconComponent size={size} strokeWidth={strokeWidth} className={`action-icon-standard ${className}`} {...props} />;
};

export const PlayerIcon = ({ icon: IconComponent, className = '', size = 20, strokeWidth = 1.8, ...props }) => {
  if (!IconComponent) return null;
  return <IconComponent size={size} strokeWidth={strokeWidth} className={`player-icon-standard ${className}`} {...props} />;
};

export const MetaIcon = ({ icon: IconComponent, className = '', size = 15, strokeWidth = 1.8, ...props }) => {
  if (!IconComponent) return null;
  return <IconComponent size={size} strokeWidth={strokeWidth} className={`meta-icon-standard ${className}`} {...props} />;
};


export const IslamicRosette = ({ size = 22, className = 'text-gold', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`islamic-rosette-svg ${className}`}
    aria-hidden="true"
    {...props}
  >
    {/* Outer 8-point geometric star */}
    <path
      d="M12 1.5L14.7 6.3L20 5.6L18.8 10.8L23 14.1L18 16.2L17.8 21.6L12.7 19.8L8.2 22.5L7.8 17.1L2.8 15.2L6.8 11.6L5.4 6.5L10.7 7L12 1.5Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Inner interlocking square */}
    <rect
      x="7.5"
      y="7.5"
      width="9"
      height="9"
      stroke="currentColor"
      strokeWidth="1"
      transform="rotate(45 12 12)"
    />
    {/* Center dot / jewel */}
    <circle cx="12" cy="12" r="1.8" fill="currentColor" />
  </svg>
);

export const VerseMedallion = ({ number, size = 32, className = 'text-gold', ...props }) => {
  const arabicNum = typeof number === 'number' ? number.toLocaleString('ar-EG') : number;
  return (
    <span
      className={`verse-medallion-container ${className}`}
      title={`الآية ${number}`}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', verticalAlign: 'middle', userSelect: 'none', margin: '0 6px' }}
      {...props}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="verse-medallion-svg"
        aria-hidden="true"
      >
        {/* Outer petal ring */}
        <circle cx="18" cy="18" r="16" stroke="currentColor" strokeWidth="1" opacity="0.6" strokeDasharray="2 3" />
        {/* Main geometric octagonal frame */}
        <path
          d="M18 3.5L22.2 7.8L28.2 7.8L28.2 13.8L32.5 18L28.2 22.2L28.2 28.2L22.2 28.2L18 32.5L13.8 28.2L7.8 28.2L7.8 22.2L3.5 18L7.8 13.8L7.8 7.8L13.8 7.8L18 3.5Z"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
        {/* Inner solid ring */}
        <circle cx="18" cy="18" r="11" stroke="currentColor" strokeWidth="0.8" opacity="0.8" />
      </svg>
      {/* Central Arabic Numeral */}
      <span
        className="verse-medallion-number font-calligraphy"
        style={{
          position: 'absolute',
          fontSize: size <= 32 ? '13px' : '15px',
          fontWeight: '700',
          color: 'currentColor',
          lineHeight: '1',
          marginTop: '1px'
        }}
      >
        {arabicNum}
      </span>
    </span>
  );
};

export const OrnamentalDivider = ({ className = 'text-gold', ...props }) => (
  <div
    className={`ornamental-divider-wrap ${className}`}
    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '14px 0', opacity: 0.85 }}
    aria-hidden="true"
    {...props}
  >
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, currentColor, transparent)' }} />
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3L14.5 9.5L21 12L14.5 14.5L12 21L9.5 14.5L3 12L9.5 9.5L12 3Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
    </svg>
    <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, currentColor, transparent)' }} />
  </div>
);

export const CornerArabesque = ({ position = 'top-left', size = 16, className = 'text-gold', ...props }) => {
  const getTransform = () => {
    switch (position) {
      case 'top-right': return 'scaleX(-1)';
      case 'bottom-left': return 'scaleY(-1)';
      case 'bottom-right': return 'scale(-1, -1)';
      default: return 'none';
    }
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: getTransform() }}
      className={`corner-arabesque-svg ${className}`}
      aria-hidden="true"
      {...props}
    >
      <path
        d="M3 3V12C3 12 5 8 9 8C13 8 13 14 17 14C20 14 21 12 21 12V3H3Z"
        stroke="currentColor"
        strokeWidth="1.2"
        opacity="0.7"
      />
      <circle cx="6" cy="6" r="1.5" fill="currentColor" />
    </svg>
  );
};

export const RosetteSpinner = ({ size = 26, className = 'text-emerald', ...props }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`rosette-spinner-svg animate-spin ${className}`}
    aria-hidden="true"
    {...props}
  >
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="14 30" />
    <path
      d="M12 4L13.8 8.2L18.5 7.5L16.2 11.5L19.5 14.8L15 15.5L14.2 20L11 17L7.5 19.5L8.5 15L4 13.5L8 10.5L6.5 6L11 7.5L12 4Z"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
  </svg>
);
