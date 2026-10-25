import React, { useState } from 'react';
import { 
  Lightbulb, 
  Heart, 
  Sparkles, 
  BookOpen, 
  Share2, 
  Shield, 
  Sun, 
  Compass,
  Info
} from 'lucide-react';
import { EMOTIONAL_STATES, PROPHETIC_DUAS } from '../data/thematicAyahs';

const EMOTION_ICONS = {
  anxiety: Shield,
  sadness: Heart,
  gratitude: Sun,
  guidance: Compass,
};

export default function TadabburView({ onSelectSurah, onOpenCardModal }) {
  const [activeTab, setActiveTab] = useState('emotions'); // 'emotions', 'duas'
  const [selectedEmotionId, setSelectedEmotionId] = useState('anxiety');

  const currentEmotion = EMOTIONAL_STATES.find((e) => e.id === selectedEmotionId) || EMOTIONAL_STATES[0];

  return (
    <div className="tadabbur-wrapper">
      {/* Hero Header */}
      <div className="tadabbur-hero-card">
        <div className="badge-row">
          <div className="tadabbur-badge">
            <Lightbulb size={16} className="text-emerald" />
            <span>بصائر وتدبر القرآن الكريم (Thematic Reflection & Sanctuary)</span>
          </div>
        </div>
        <h2 className="tadabbur-title font-calligraphy">
          "كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ"
        </h2>
        <p className="tadabbur-desc">
          القرآن الكريم شفاء لما في الصدور وهداية في منعطفات الحياة. اختر حالتك الوجدانية أو استكشف أدعية الأنبياء لتنعم بالسكينة والتوجيه الرباني.
        </p>

        {/* Sub-tabs */}
        <div className="tadabbur-nav-row">
          <button
            onClick={() => setActiveTab('emotions')}
            className={`tadabbur-subtab-btn ${activeTab === 'emotions' ? 'active' : ''}`}
          >
            <Heart size={16} />
            <span>حالات الوجدان والسكينة (Emotional Guidance)</span>
          </button>

          <button
            onClick={() => setActiveTab('duas')}
            className={`tadabbur-subtab-btn ${activeTab === 'duas' ? 'active' : ''}`}
          >
            <Sparkles size={16} />
            <span>أدعية الأنبياء ومواقف الإجابة (Prophetic Duas)</span>
          </button>
        </div>
      </div>

      {/* Section 1: Emotional Guidance */}
      {activeTab === 'emotions' && (
        <div className="emotions-section animate-fade-in">
          {/* Emotion Selector Pills */}
          <div className="emotions-selector-bar">
            <span className="selector-title">كيف تشعر الآن؟</span>
            <div className="emotions-chips-scroll">
              {EMOTIONAL_STATES.map((emo) => {
                const isSelected = emo.id === selectedEmotionId;
                const EmoIcon = EMOTION_ICONS[emo.id] || Heart;
                return (
                  <button
                    key={emo.id}
                    onClick={() => setSelectedEmotionId(emo.id)}
                    className={`emotion-pill-btn ${isSelected ? 'active' : ''}`}
                  >
                    <EmoIcon size={16} className={`emotion-icon ${isSelected ? 'text-emerald' : 'text-muted'}`} />
                    <div className="emotion-labels">
                      <span className="emotion-ar">{emo.labelAr}</span>
                      <span className="emotion-en">{emo.labelEn}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="emotion-header-context">
            <h3 className="context-title">{currentEmotion.labelAr}</h3>
            <p className="context-desc">{currentEmotion.descriptionAr}</p>
          </div>

          {/* Verses for this emotion */}
          <div className="tadabbur-cards-list">
            {currentEmotion.verses.map((v, idx) => (
              <div key={idx} className="tadabbur-card">
                <div className="tadabbur-card-top">
                  <span className="tadabbur-surah-ref">
                    سورة {v.surahName} (الآية {v.ayahNumber})
                  </span>
                  <div className="tadabbur-actions">
                    <button
                      onClick={() => onSelectSurah(v.surahNumber)}
                      className="tadabbur-btn jump"
                      title="فتح السورة في المصحف"
                    >
                      <BookOpen size={14} />
                      <span>قراءة في المصحف</span>
                    </button>
                    <button
                      onClick={() =>
                        onOpenCardModal(
                          { numberInSurah: v.ayahNumber, textAr: v.ayahText, textEn: v.translationEn },
                          { name: v.surahName, number: v.surahNumber }
                        )
                      }
                      className="tadabbur-btn card"
                      title="تصميم بطاقة دعوية"
                    >
                      <Share2 size={14} />
                      <span>بطاقة</span>
                    </button>
                  </div>
                </div>

                <p className="tadabbur-arabic-text font-quran">{v.ayahText}</p>

                {/* Translation */}
                <div className="tadabbur-translations-box">
                  <p className="tadabbur-en">{v.translationEn}</p>
                  <p className="tadabbur-fr">{v.translationFr}</p>
                </div>

                {/* Tadabbur Reflection Note */}
                <div className="reflection-note-box">
                  <div className="reflection-badge">
                    <MessageCircle size={15} className="text-emerald" />
                    <span>بصيرة وتأمل:</span>
                  </div>
                  <p className="reflection-text">{v.reflectionAr}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 2: Prophetic Duas */}
      {activeTab === 'duas' && (
        <div className="duas-section animate-fade-in">
          <div className="duas-cards-grid">
            {PROPHETIC_DUAS.map((item, idx) => (
              <div key={idx} className="prophetic-dua-card">
                <div className="dua-prophet-badge">
                  <Sparkles size={16} className="text-gold" />
                  <span className="prophet-name">{item.prophet}</span>
                  <span className="prophet-name-en">({item.prophetEn})</span>
                </div>

                <div className="dua-situation-note">
                  <strong>الموقف: </strong>{item.situation}
                </div>

                <div className="dua-arabic-box font-quran">
                  "{item.ayahText}"
                </div>

                <div className="dua-footer">
                  <span className="dua-ref">{item.surah}</span>
                  <p className="dua-effect">{item.effect}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contemplative Notice */}
      <div className="tadabbur-disclaimer-card">
        <Info size={16} className="text-emerald" />
        <p>
          ملاحظة: هذا القسم مخصص للاستئناس الروحي والتأمل والتدبر الإيماني في آيات الذكر الحكيم، وليس بديلاً عن الاستشارات الطبية أو النفسية المتخصصة عند الحاجة.
        </p>
      </div>
    </div>
  );
}
