import React, { useState, useEffect, useRef } from 'react';
import { ICONS } from './common/IconSystem';
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
  const [matchedIndices, setMatchedIndices] = useState(new Set());
  const [transcribedTranscript, setTranscribedTranscript] = useState('');
  const [recitationResult, setRecitationResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const animFrameRef = useRef(null);

  const currentAyah = surahData?.ayahs?.[currentAyahIdx] || surahData?.ayahs?.[0];

  const targetWords = currentAyah?.textAr
    ? currentAyah.textAr.trim().split(/\s+/).filter(Boolean)
    : [];

  useEffect(() => {
    setCurrentAyahIdx(initialAyahIndex);
  }, [initialAyahIndex]);

  useEffect(() => {
    stopListening();
    setMatchedIndices(new Set());
    setTranscribedTranscript('');
    setRecitationResult(null);
    setErrorMessage('');
    setAudioLevel(0);
  }, [currentAyahIdx]);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }

    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }

    setIsListening(false);
    setAudioLevel(0);
  };

  const startListening = async () => {
    setMatchedIndices(new Set());
    setTranscribedTranscript('');
    setRecitationResult(null);
    setErrorMessage('');

    let stream = null;
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaStreamRef.current = stream;

        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);

          const updateVolume = () => {
            if (!analyser) return;
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
              sum += dataArray[i];
            }
            const avg = sum / dataArray.length;
            setAudioLevel(Math.min(100, Math.round(avg * 1.8)));
            animFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      }
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('يرجى السماح بصلاحية الميكروفون في المتصفح لبدء التسميع الصوتي.');
        return;
      }
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsListening(true);
      setErrorMessage('متصفحك لا يدعم التعرف الصوتي المباشر (Web Speech API). يمكنك التسميع بصوتك واستخدام زر "كشف الكلمات" للتحقق.');
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
        setErrorMessage('');
      };

      recognition.onresult = (event) => {
        let fullTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          fullTranscript += event.results[i][0].transcript + ' ';
        }
        processSpokenArabic(fullTranscript.trim());
      };

      recognition.onerror = (e) => {
        if (e.error === 'not-allowed') {
          setErrorMessage('تم رفض إذن الميكروفون. يرجى تفعيل إذن الميكروفون من إعدادات المتصفح.');
          stopListening();
        } else if (e.error === 'no-speech') {
          setErrorMessage('جاري الاستماع... لم يتم التقاط صوت، اقرأ الآية بوضوح.');
        } else if (e.error === 'network' || e.error === 'service-not-allowed') {
          setErrorMessage('خدمة التعرف الصوتي غير متصلة حالياً بالشبكة. يمكنك التسميع الذاتي وكشف الكلمات للتحقق.');
        }
      };

      recognition.onend = () => {
        if (isListening && recognitionRef.current) {
          try {
            recognition.start();
          } catch {}
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setErrorMessage('تعذر بدء التعرف الصوتي. يرجى التأكد من توصيل الميكروفون والمحاولة مرة أخرى.');
      stopListening();
    }
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

  const revealSingleWord = (index) => {
    setMatchedIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  const revealAllWords = () => {
    const all = new Set(targetWords.map((_, i) => i));
    setMatchedIndices(all);
    finishRecitation(targetWords.length, targetWords.length);
  };

  const finishRecitation = (matchedCount, totalCount) => {
    const pct = totalCount > 0 ? Math.round((matchedCount / totalCount) * 100) : 100;
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

  const handleManualComplete = () => {
    finishRecitation(matchedIndices.size, targetWords.length);
    stopListening();
  };

  if (!isOpen || !surahData || !currentAyah) return null;

  const totalAyahs = surahData.ayahs.length;
  const CloseIcon = ICONS.close;
  const AudioLinesIcon = ICONS.audio;
  const SparklesIcon = ICONS.sparkles;
  const ChevronRightIcon = ICONS.chevronRight;
  const ChevronLeftIcon = ICONS.chevronLeft;

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
        <div className="ai-reciter-header">
          <div className="ai-reciter-title-wrap">
            <SparklesIcon size={20} className="text-gold" />
            <span className="ai-reciter-title font-calligraphy">مُعِين التسميع الذكي (AI Reciter)</span>
          </div>

          <button
            type="button"
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

        <div className="ai-reciter-controls-row">
          <div className="ai-ayah-navigator">
            <button
              type="button"
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
              type="button"
              onClick={() => setCurrentAyahIdx((p) => Math.min(totalAyahs - 1, p + 1))}
              disabled={currentAyahIdx >= totalAyahs - 1}
              className="ai-nav-step-btn"
              title="الآية التالية"
            >
              <ChevronLeftIcon size={16} />
            </button>
          </div>

          <div className="ai-mode-toggle" role="radiogroup">
            <button
              type="button"
              className={`ai-mode-btn ${recitationMode === 'blind' ? 'active' : ''}`}
              onClick={() => setRecitationMode('blind')}
            >
              تسميع غيبي (كشف بالصوت)
            </button>
            <button
              type="button"
              className={`ai-mode-btn ${recitationMode === 'follow' ? 'active' : ''}`}
              onClick={() => setRecitationMode('follow')}
            >
              متابعة التلاوة
            </button>
          </div>
        </div>

        <div className="ai-reciter-stage">
          <div className="ai-words-display font-quran">
            {targetWords.map((word, index) => {
              const isMatched = matchedIndices.has(index);

              if (recitationMode === 'blind') {
                return (
                  <span
                    key={index}
                    onClick={() => revealSingleWord(index)}
                    title={isMatched ? word : 'انقر لكشف الكلمة'}
                    className={`ai-word-unit ${isMatched ? 'revealed-matched animate-fade-in' : 'hidden-masked'}`}
                    style={{ cursor: isMatched ? 'default' : 'pointer' }}
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

          {isListening && (
            <div className="ai-listening-waveform-wrap animate-fade-in">
              <div className="ai-soundwave-bars">
                {[0.6, 1.2, 1.8, 1.4, 0.9, 1.5, 0.7].map((scale, i) => (
                  <span
                    key={i}
                    className="wave-bar"
                    style={{
                      height: `${Math.max(6, Math.min(32, 8 + (audioLevel * scale * 0.3)))}px`,
                      background: audioLevel > 15 ? '#10b981' : '#d4af37',
                      transition: 'height 0.08s ease, background 0.15s ease'
                    }}
                  />
                ))}
              </div>
              <span className="ai-listening-caption">
                {audioLevel > 12
                  ? 'صوت التلاوة مسموع: استمر في القراءة...'
                  : 'الميكروفون نشط: اقرأ الآية الكريمة بصوتك الآن...'}
              </span>
            </div>
          )}

          {errorMessage && (
            <div className="ai-error-banner animate-fade-in" style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '8px',
              padding: '8px 14px',
              color: '#fca5a5',
              fontSize: '12px',
              textAlign: 'center'
            }}>
              {errorMessage}
            </div>
          )}

          {transcribedTranscript && (
            <div className="ai-transcribed-preview">
              <span className="preview-label">الكلمات الملتقطة بالصوت:</span>
              <p className="preview-text">«{transcribedTranscript}»</p>
            </div>
          )}
        </div>

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

        <div className="ai-reciter-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {!isListening ? (
              <button type="button" onClick={startListening} className="ai-start-recite-btn">
                <AudioLinesIcon size={18} />
                <span>ابدأ التسميع بصوتك الآن</span>
              </button>
            ) : (
              <button type="button" onClick={handleManualComplete} className="ai-stop-recite-btn" style={{
                background: 'linear-gradient(135deg, #0b2b26 0%, #061c18 100%)',
                border: '1px solid #10b981',
                color: '#ffffff',
                padding: '10px 22px',
                borderRadius: '9999px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>إنهاء التسميع والتقييم</span>
              </button>
            )}

            {recitationMode === 'blind' && matchedIndices.size < targetWords.length && (
              <button
                type="button"
                onClick={revealAllWords}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(210, 170, 96, 0.35)',
                  color: '#fbbf24',
                  padding: '10px 18px',
                  borderRadius: '9999px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                اكشف الآية كاملة للتحقق
              </button>
            )}

            {matchedIndices.size > 0 && (
              <button
                type="button"
                onClick={() => {
                  stopListening();
                  setMatchedIndices(new Set());
                  setTranscribedTranscript('');
                  setRecitationResult(null);
                  setErrorMessage('');
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#94a3b8',
                  padding: '10px 16px',
                  borderRadius: '9999px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                إعادة المحاولة
              </button>
            )}
          </div>

          <div className="ai-footer-hints">
            <span>يلتقط صوتك الحقيقي عبر الميكروفون ويطابقه مع كلمات الآية فورياً دون تخمين</span>
          </div>
        </div>
      </div>
    </div>
  );
}
