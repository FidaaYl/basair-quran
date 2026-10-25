import React, { useState, useMemo } from 'react';
import { 
  Brain, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle, 
  RefreshCw, 
  Sliders, 
  Trophy, 
  HelpCircle,
  Flame,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MemorizationStudio({ surahData, onSelectSurah }) {
  const [activeDrill, setActiveDrill] = useState('masking'); // 'masking', 'firstLetter', 'nextAyah'
  const [maskRatio, setMaskRatio] = useState(0.5); // 0.25, 0.5, 1.0
  const [revealedWords, setRevealedWords] = useState({}); // { `${ayahIdx}-${wordIdx}`: true }
  
  // Next-Ayah Quiz State
  const [quizAyahIndex, setQuizAyahIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizStreak, setQuizStreak] = useState(0);
  const [selectedQuizOption, setSelectedQuizOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);

  // Masking helpers
  const toggleWordReveal = (ayahIdx, wordIdx) => {
    const key = `${ayahIdx}-${wordIdx}`;
    setRevealedWords((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const revealAll = () => {
    const all = {};
    surahData?.ayahs.forEach((ayah, aIdx) => {
      const words = ayah.textAr.split(/\s+/);
      words.forEach((_, wIdx) => {
        all[`${aIdx}-${wIdx}`] = true;
      });
    });
    setRevealedWords(all);
  };

  const hideAll = () => {
    setRevealedWords({});
  };

  // Next-Ayah Quiz options generator
  const quizQuestion = useMemo(() => {
    if (!surahData || surahData.ayahs.length < 3) return null;
    const maxIndex = surahData.ayahs.length - 2;
    const currentIdx = Math.min(quizAyahIndex, maxIndex);
    const promptAyah = surahData.ayahs[currentIdx];
    const correctAyah = surahData.ayahs[currentIdx + 1];

    // Pick 2 distractors from other ayahs in this surah
    const otherAyahs = surahData.ayahs.filter((_, i) => i !== currentIdx && i !== currentIdx + 1);
    const shuffledOthers = [...otherAyahs].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 2);

    const options = [correctAyah, ...distractors].sort(() => 0.5 - Math.random());

    return {
      promptAyah,
      correctAyah,
      options,
    };
  }, [surahData, quizAyahIndex]);

  const handleSelectQuizOption = (ayah) => {
    if (isAnswerChecked) return;
    setSelectedQuizOption(ayah);
    setIsAnswerChecked(true);

    if (ayah.numberInSurah === quizQuestion.correctAyah.numberInSurah) {
      const newStreak = quizStreak + 1;
      setQuizStreak(newStreak);
      setQuizScore((s) => s + 10);
      if (newStreak % 3 === 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }
    } else {
      setQuizStreak(0);
    }
  };

  const handleNextQuizQuestion = () => {
    setSelectedQuizOption(null);
    setIsAnswerChecked(false);
    if (quizAyahIndex >= surahData.ayahs.length - 2) {
      setQuizAyahIndex(0);
    } else {
      setQuizAyahIndex((prev) => prev + 1);
    }
  };

  if (!surahData) {
    return (
      <div className="memorize-empty-state">
        <p>يرجى اختيار سورة لبدء معمل الحفظ والاسترجاع.</p>
      </div>
    );
  }

  return (
    <div className="memorize-studio-wrapper">
      {/* Studio Header */}
      <div className="studio-hero-card">
        <div className="studio-hero-header">
          <div className="studio-badge">
            <Brain size={18} className="text-emerald" />
            <span>معمل الحفظ والاسترجاع النشط (Active Recall Studio)</span>
          </div>
          <h2 className="studio-title font-calligraphy">
            تثبيت حفظ سورة {surahData.name}
          </h2>
          <p className="studio-desc">
            طرق معرفية مثبتة علمياً لترسيخ الآيات في الذاكرة: حجب الكلمات، استرجاع الحرف الأول، وتحدي الآية التالية.
          </p>
        </div>

        {/* Drill Mode Tabs */}
        <div className="drill-tabs-row">
          <button
            onClick={() => setActiveDrill('masking')}
            className={`drill-tab-btn ${activeDrill === 'masking' ? 'active' : ''}`}
          >
            <EyeOff size={16} />
            <span>حجب الكلمات (Masking)</span>
          </button>

          <button
            onClick={() => setActiveDrill('firstLetter')}
            className={`drill-tab-btn ${activeDrill === 'firstLetter' ? 'active' : ''}`}
          >
            <Sparkles size={16} />
            <span>الحرف الأول (First-Letter)</span>
          </button>

          <button
            onClick={() => setActiveDrill('nextAyah')}
            className={`drill-tab-btn ${activeDrill === 'nextAyah' ? 'active' : ''}`}
          >
            <Trophy size={16} />
            <span>تحدي الآية التالية (Quiz)</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Masking Studio */}
      {activeDrill === 'masking' && (
        <div className="drill-panel masking-panel animate-fade-in">
          {/* Controls Bar */}
          <div className="masking-controls-bar">
            <div className="masking-intensity-group">
              <span className="control-label">نسبة الحجب:</span>
              <button
                onClick={() => { setMaskRatio(0.25); hideAll(); }}
                className={`intensity-btn ${maskRatio === 0.25 ? 'active' : ''}`}
              >
                خفيف (25%)
              </button>
              <button
                onClick={() => { setMaskRatio(0.5); hideAll(); }}
                className={`intensity-btn ${maskRatio === 0.5 ? 'active' : ''}`}
              >
                متوسط (50%)
              </button>
              <button
                onClick={() => { setMaskRatio(1.0); hideAll(); }}
                className={`intensity-btn ${maskRatio === 1.0 ? 'active' : ''}`}
              >
                حجب كامل (100%)
              </button>
            </div>

            <div className="masking-actions-group">
              <button onClick={hideAll} className="action-pill hide-all">
                <EyeOff size={15} />
                <span>إخفاء الكل</span>
              </button>
              <button onClick={revealAll} className="action-pill reveal-all">
                <Eye size={15} />
                <span>كشف الكل للتأكد</span>
              </button>
            </div>
          </div>

          <p className="drill-instruction-note">
            💡 اضغط على أي كلمة مظللة لكشفها فوراً والتأكد من حفظك.
          </p>

          {/* Verses Flow with Interactive Masked Words */}
          <div className="masked-ayahs-list">
            {surahData.ayahs.map((ayah, aIdx) => {
              const words = ayah.textAr.split(/\s+/);

              return (
                <div key={ayah.number} className="masked-ayah-row">
                  <div className="ayah-num-badge">الآية {ayah.numberInSurah}</div>
                  <div className="masked-words-flow font-quran">
                    {words.map((word, wIdx) => {
                      const key = `${aIdx}-${wIdx}`;
                      // Deterministic mask based on word index and ratio
                      const shouldBeMaskedByDefault = ((wIdx * 7 + aIdx * 3) % 100) < (maskRatio * 100);
                      const isRevealed = revealedWords[key] ?? !shouldBeMaskedByDefault;

                      return (
                        <span
                          key={wIdx}
                          onClick={() => toggleWordReveal(aIdx, wIdx)}
                          className={`masked-word-unit ${isRevealed ? 'revealed' : 'masked'}`}
                          title={isRevealed ? word : 'اضغط للكشف والتأكد'}
                        >
                          {isRevealed ? word : '••••'}
                        </span>
                      );
                    })}
                    <span className="ayah-symbol">
                      ۝{ayah.numberInSurah.toLocaleString('ar-EG')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 2: First-Letter Memory Trigger */}
      {activeDrill === 'firstLetter' && (
        <div className="drill-panel first-letter-panel animate-fade-in">
          <div className="drill-banner-alert">
            <Sparkles size={18} className="text-gold" />
            <p>
              <strong>تقنية الحرف الأول:</strong> يظهر الحرف الأول فقط من كل كلمة كمفتاح استدعاء ذهني سريع، مما يدرب الدماغ على إكمال الآية ذاتياً دون الاعتماد على القراءة السلبية. اضغط على أي كلمة لإظهارها كاملة.
            </p>
          </div>

          <div className="masked-ayahs-list">
            {surahData.ayahs.map((ayah, aIdx) => {
              const words = ayah.textAr.split(/\s+/);

              return (
                <div key={ayah.number} className="masked-ayah-row">
                  <div className="ayah-num-badge">الآية {ayah.numberInSurah}</div>
                  <div className="masked-words-flow font-quran">
                    {words.map((word, wIdx) => {
                      const key = `fl-${aIdx}-${wIdx}`;
                      const isRevealed = revealedWords[key];
                      const firstChar = word.trim().charAt(0);

                      return (
                        <span
                          key={wIdx}
                          onClick={() => toggleWordReveal(`fl-${aIdx}`, wIdx)}
                          className={`first-letter-unit ${isRevealed ? 'revealed' : ''}`}
                          title={word}
                        >
                          {isRevealed ? word : `${firstChar}ـ`}
                        </span>
                      );
                    })}
                    <span className="ayah-symbol">
                      ۝{ayah.numberInSurah.toLocaleString('ar-EG')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Mode 3: Next-Ayah Quiz Challenge */}
      {activeDrill === 'nextAyah' && quizQuestion && (
        <div className="drill-panel quiz-panel animate-fade-in">
          {/* Quiz Scoreboard */}
          <div className="quiz-scoreboard">
            <div className="score-stat">
              <Trophy size={18} className="text-gold" />
              <span>النقاط: <strong>{quizScore}</strong></span>
            </div>
            <div className="score-stat streak">
              <Flame size={18} className="text-emerald" />
              <span>حلقات التتابع (Streak): <strong>{quizStreak}</strong></span>
            </div>
            <div className="score-stat">
              <span>السؤال: آية <strong>{quizQuestion.promptAyah.numberInSurah}</strong> / {surahData.numberOfAyahs}</span>
            </div>
          </div>

          {/* Prompt Ayah */}
          <div className="quiz-prompt-card">
            <span className="prompt-label">ما هي الآية التالية لهذه الآية الكريمة؟</span>
            <p className="prompt-text font-quran">
              "{quizQuestion.promptAyah.textAr}"
            </p>
            <span className="prompt-reference">
              [سورة {surahData.name}: الآية {quizQuestion.promptAyah.numberInSurah}]
            </span>
          </div>

          {/* Options */}
          <div className="quiz-options-list">
            {quizQuestion.options.map((opt, oIdx) => {
              const isSelected = selectedQuizOption?.numberInSurah === opt.numberInSurah;
              const isCorrect = opt.numberInSurah === quizQuestion.correctAyah.numberInSurah;

              let btnClass = 'quiz-option-btn';
              if (isAnswerChecked) {
                if (isCorrect) btnClass += ' correct';
                else if (isSelected) btnClass += ' incorrect';
              } else if (isSelected) {
                btnClass += ' selected';
              }

              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectQuizOption(opt)}
                  disabled={isAnswerChecked}
                  className={btnClass}
                >
                  <span className="option-indicator">{String.fromCharCode(65 + oIdx)}</span>
                  <p className="option-text font-quran">{opt.textAr}</p>
                  {isAnswerChecked && isCorrect && (
                    <CheckCircle size={20} className="check-icon text-emerald" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          {isAnswerChecked && (
            <div className="quiz-feedback-row animate-fade-in">
              <div className="feedback-message">
                {selectedQuizOption?.numberInSurah === quizQuestion.correctAyah.numberInSurah ? (
                  <span className="feedback-correct">
                    ✓ إجابة صحيحة ومتقنة! أحسنت الاستذكار.
                  </span>
                ) : (
                  <span className="feedback-wrong">
                    ✕ إجابة غير دقيقة. الآية الصحيحة هي رقم {quizQuestion.correctAyah.numberInSurah}.
                  </span>
                )}
              </div>
              <button onClick={handleNextQuizQuestion} className="quiz-next-btn">
                <span>الآية التالية</span>
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
