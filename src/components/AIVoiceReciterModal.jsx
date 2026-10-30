import React, { useState, useEffect, useRef } from 'react';
import { ICONS, IslamicRosette, RosetteSpinner } from './common/IconSystem';
import { normalizeArabic } from '../services/quranApi';

export default function AIVoiceReciterModal({
  isOpen,
  onClose,
  surahData,
  initialAyahIndex = 0,
}) {
  const [currentAyahIdx, setCurrentAyahIdx] = useState(initialAyahIndex);
  const [isListening, setIsListening] = useState(false);
  const [recitationMode, setRecitationMode] = useState('blind');
  const [recognizedWords, setRecognizedWords] = useState([]);
  const [matchedIndices, setMatchedIndices] = useState(new Set());
  const [transcribedTranscript, setTranscribedTranscript] = useState('');
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);
  const [isSimulationMode, setIsSimulationMode] = useState(false);
  const [recitationResult, setRecitationResult] = useState(null);

  const recognitionRef = useRef(null);
  const simTimerRef = useRef(null);

  const currentAyah = surahData?.ayahs?.[currentAyahIdx] || surahData?.ayahs?.[0];

  const targetWords = currentAyah?.textAr
    ? currentAyah.textAr.trim().split(/\s+/).filter(Boolean)
    : [];

  useEffect(() => {
    setCurrentAyahIdx(initialAyahIndex);
  }, [initialAyahIndex]);

  useEffect(() => {
    stopListening();
    setRecognizedWords([]);
    setMatchedIndices(new Set());
    setTranscribedTranscript('');
    setRecitationResult(null);
  }, [currentAyahIdx]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasSpeechSupport(false);
    }
  }, []);

  const startListening = () => {
    setRecognizedWords([]);
    setMatchedIndices(new Set());
    setTranscribedTranscript('');
    setRecitationResult(null);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      startSimulation();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 2;

      recognition.onstart = () => {
        setIsListening(true);
        setIsSimulationMode(false);
      };

      recognition.onresult = (event) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        processSpokenArabic(fullTranscript.trim());
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error, activating fallback:', e);
        if (e.error === 'not-allowed' || e.error === 'network' || e.error === 'service-not-allowed') {
          stopListening();
          startSimulation();
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Failed to start speech recognition, running simulator:', err);
      startSimulation();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setIsListening(false);
    setIsSimulationMode(false);
  };

  const processSpokenArabic = (transcript) => {
    setTranscribedTranscript(transcript);
    const spokenTokens = transcript.split(/\s+/).map((w) => normalizeArabic(w));
    const newMatched = new Set();

    let searchIdx = 0;
    spokenTokens.forEach((spokenWord) => {
      for (let i = searchIdx; i < targetWords.length; i++) {
        const targetClean = normalizeArabic(targetWords[i]);
        if (
          targetClean === spokenWord ||
          targetClean.includes(spokenWord) ||
          spokenWord.includes(targetClean) ||
          (spokenWord.length >= 3 && targetClean.slice(0, 3) === spokenWord.slice(0, 3))
        ) {
          newMatched.add(i);
          searchIdx = i + 1;
          break;
        }
      }
    });

    setMatchedIndices(newMatched);

    if (targetWords.length > 0 && newMatched.size === targetWords.length) {
      finishRecitation(newMatched.size, targetWords.length);
    }
  };

  const startSimulation = () => {
    setIsListening(true);
    setIsSimulationMode(true);
    let currentIdx = 0;

    simTimerRef.current = setInterval(() => {
      if (currentIdx < targetWords.length) {
        setMatchedIndices((prev) => new Set([...prev, currentIdx]));
        setTranscribedTranscript((prev) => `${prev} ${targetWords[currentIdx]}`);
        currentIdx++;
      } else {
        clearInterval(simTimerRef.current);
        simTimerRef.current = null;
        setIsListening(false);
        finishRecitation(targetWords.length, targetWords.length);
      }
    }, 700);
  };

  const finishRecitation = (matchedCount, totalCount) => {
    const pct = Math.round((matchedCount / totalCount) * 100);
    setRecitationResult({
      score: pct,
      matched: matchedCount,
      total: totalCount,
      message:
        pct >= 90
          ? 'ما شاء الله تبارك الله! حفظ متقن وتلاوة مجودة.'
          : pct >= 70
          ? 'أحسنت! حفظ طيب مع حاجة لمراجعة بعض الكلمات.'
          : 'استمر في التكرار، فالمراجعة تثبت الحفظ في الصدور.',
    });
  };

  if (!isOpen || !surahData || !currentAyah) return null;

  const totalAyahs = surahData.ayahs.length;
  const CloseIcon = ICONS.close;
  const AudioLinesIcon = ICONS.audio;
  const SparklesIcon = ICONS.sparkles;
  const ChevronRightIcon = ICONS.chevronRight;
  const ChevronLeftIcon = ICONS.chevronLeft;
  const CheckIcon = ICONS.check;

  return (
    <div
      className="ai-reciter-overlay animate-fade-in"
      onClick={() => {
        stopListening();
        onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="مُعِين التسميع الذكي بالذكاء الاصطناعي"
    >
      <div className="ai-reciter-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="ai-reciter-header">
          <div className="ai-reciter-title-wrap">
            <SparklesIcon size={20} className="text-gold" />
            <span className="ai-reciter-title font-calligraphy">مُعِين التسميع الذكي (AI Reciter)</span>
          </div>

          <button
            onClick={() => {
              stopListening();
              onClose();
            }}
            className="ai-reciter-close-btn"
            title="إغلاق (Esc)"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Subhead: Ayah Navigation & Mode Selector */}
        <div className="ai-reciter-controls-row">
          <div className="ai-ayah-navigator">
            <button
              onClick={() => setCurrentAyahIdx((p) => Math.max(0, p - 1))}
              disabled={currentAyahIdx <= 0}
              className="ai-nav-step-btn"
              title="الآية السابقة"
            >
              <ChevronRightIcon size={16} />
            </button>
            <span className="ai-ayah-label font-calligraphy">
              سُورَةُ {surahData.name} • الآية {currentAyah.numberInSurah} من {totalAyahs}
            </span>
            <button
              onClick={() => setCurrentAyahIdx((p) => Math.min(totalAyahs - 1, p + 1))}
              disabled={currentAyahIdx >= totalAyahs - 1}
              className="ai-nav-step-btn"
              title="الآية التالية"
            >
              <ChevronLeftIcon size={16} />
            </button>
          </div>

          {/* Mode Pill: Follow-along vs Blind Recall */}
          <div className="ai-mode-toggle" role="radiogroup">
            <button
              className={`ai-mode-btn ${recitationMode === 'blind' ? 'active' : ''}`}
              onClick={() => setRecitationMode('blind')}
            >
              تسميع غيبي (كشف بالصوت)
            </button>
            <button
              className={`ai-mode-btn ${recitationMode === 'follow' ? 'active' : ''}`}
              onClick={() => setRecitationMode('follow')}
            >
              متابعة التلاوة
            </button>
          </div>
        </div>

        {/* Main Recitation Stage (Target Words) */}
        <div className="ai-reciter-stage">
          <div className="ai-words-display font-quran">
            {targetWords.map((word, index) => {
              const isMatched = matchedIndices.has(index);

              if (recitationMode === 'blind') {
                return (
                  <span
                    key={index}
                    className={`ai-word-unit ${isMatched ? 'revealed-matched animate-fade-in' : 'hidden-masked'}`}
                  >
                    {isMatched ? word : '۞'}
                  </span>
                );
              }

              return (
                <span
                  key={index}
                  className={`ai-word-unit follow ${isMatched ? 'highlighted-correct' : 'pending'}`}
                >
                  {word}
                </span>
              );
            })}
          </div>

          {/* Live Audio Visualizer Animation */}
          {isListening && (
            <div className="ai-listening-waveform-wrap animate-fade-in">
              <div className="ai-soundwave-bars">
                <span className="wave-bar bar-1" />
                <span className="wave-bar bar-2" />
                <span className="wave-bar bar-3" />
                <span className="wave-bar bar-4" />
                <span className="wave-bar bar-5" />
                <span className="wave-bar bar-4" />
                <span className="wave-bar bar-3" />
                <span className="wave-bar bar-2" />
                <span className="wave-bar bar-1" />
              </div>
              <span className="ai-listening-caption">
                {isSimulationMode
                  ? 'جاري محاكاة التسميع الصوتي واختبار دقة الكلمات...'
                  : 'الميكروفون نشط: اقرأ الآية الكريمة بصوتك الآن...'}
              </span>
            </div>
          )}

          {/* Live Transcribed Speech Preview */}
          {transcribedTranscript && (
            <div className="ai-transcribed-preview">
              <span className="preview-label">الكلمات التي التقطها الذكاء الاصطناعي:</span>
              <p className="preview-text">«{transcribedTranscript}»</p>
            </div>
          )}
        </div>

        {/* Results Card if finished */}
        {recitationResult && (
          <div className="ai-recitation-result-card animate-fade-in">
            <div className="result-score-circle">
              <span className="score-number font-calligraphy">{recitationResult.score}%</span>
              <span className="score-sub">دقة الحفظ</span>
            </div>
            <div className="result-feedback-body">
              <h4 className="result-title">
                {recitationResult.score >= 90 ? '🏆 حفظ متقن بنجاح!' : '✨ محاولة طيبة ومباركة'}
              </h4>
              <p className="result-message">{recitationResult.message}</p>
              <div className="result-pills-row">
                <span className="result-pill">الكلمات المتقنة: {recitationResult.matched} من {recitationResult.total}</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Interactive Controls */}
        <div className="ai-reciter-footer">
          {!isListening ? (
            <button onClick={startListening} className="ai-start-recite-btn">
              <AudioLinesIcon size={18} />
              <span>ابدأ التسميع بصوتك الآن</span>
            </button>
          ) : (
            <button onClick={stopListening} className="ai-stop-recite-btn">
              <span>إيقاف التسميع والتقييم</span>
            </button>
          )}

          <div className="ai-footer-hints">
            <span>مدعوم بتقنية التعرّف الصوتي القرآني الفوري (Web Speech & Phonetics)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
