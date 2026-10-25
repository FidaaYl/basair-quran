// Quran API service with intelligent caching, multi-language support, Word-by-Word data, and REST Diagnostics

const ALQURAN_BASE = 'https://api.alquran.cloud/v1';
const QURAN_COM_BASE = 'https://api.quran.com/api/v4';

// Cache stores for instant subsequent reads
const memoryCache = new Map();
const wbwCache = new Map();

// REST API Metrics Logger for the TryHackMe REST course demonstration
export const restApiLogs = [];
const listeners = [];

export function subscribeToApiLogs(callback) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

function logApiCall(method, url, status, durationMs, payloadSize, data) {
  const logItem = {
    id: Date.now() + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toLocaleTimeString(),
    method,
    url,
    status,
    durationMs: Math.round(durationMs),
    payloadSize: typeof payloadSize === 'number' ? `${(payloadSize / 1024).toFixed(1)} KB` : payloadSize,
    data,
  };
  restApiLogs.unshift(logItem);
  if (restApiLogs.length > 30) restApiLogs.pop();
  listeners.forEach((cb) => cb([...restApiLogs]));
}

/**
 * Fetch full Surah with Arabic Uthmani text, English Sahih, and French Hamidullah translations
 * @param {number|string} surahNumber (1-114)
 */
export async function getSurahDetails(surahNumber) {
  const cacheKey = `surah_${surahNumber}_multi`;
  if (memoryCache.has(cacheKey)) {
    return memoryCache.get(cacheKey);
  }

  try {
    const local = localStorage.getItem(cacheKey);
    if (local) {
      const parsed = JSON.parse(local);
      memoryCache.set(cacheKey, parsed);
      return parsed;
    }
  } catch (e) {
    // Ignore storage issues
  }

  const url = `${ALQURAN_BASE}/surah/${surahNumber}/editions/quran-uthmani,en.sahih,fr.hamidullah`;
  const startTime = performance.now();

  try {
    const res = await fetch(url);
    const duration = performance.now() - startTime;
    const json = await res.json();

    logApiCall('GET', url, res.status, duration, JSON.stringify(json).length, json);

    if (json.code !== 200 || !json.data || json.data.length < 3) {
      throw new Error(json.status || 'Failed to parse Surah data');
    }

    const arabicData = json.data[0];
    const englishData = json.data[1];
    const frenchData = json.data[2];

    const ayahs = arabicData.ayahs.map((arAyah, index) => {
      const enAyah = englishData.ayahs[index] || {};
      const frAyah = frenchData.ayahs[index] || {};

      return {
        number: arAyah.number,
        numberInSurah: arAyah.numberInSurah,
        juz: arAyah.juz,
        manzil: arAyah.manzil,
        page: arAyah.page,
        ruku: arAyah.ruku,
        hizbQuarter: arAyah.hizbQuarter,
        sajda: arAyah.sajda,
        textAr: arAyah.text,
        textEn: enAyah.text || '',
        textFr: frAyah.text || '',
      };
    });

    const result = {
      number: arabicData.number,
      name: arabicData.name,
      englishName: arabicData.englishName,
      englishNameTranslation: arabicData.englishNameTranslation,
      revelationType: arabicData.revelationType,
      numberOfAyahs: arabicData.numberOfAyahs,
      ayahs,
    };

    memoryCache.set(cacheKey, result);
    try {
      localStorage.setItem(cacheKey, JSON.stringify(result));
    } catch (e) {
      // Storage might be full
    }

    return result;
  } catch (error) {
    logApiCall('GET', url, 500, performance.now() - startTime, '0 KB', { error: error.message });
    console.error(`Error loading Surah ${surahNumber}:`, error);
    throw error;
  }
}

/**
 * Fetch Word-by-Word data from Quran.com API v4 (Official QUL / Tarteel partner API)
 * @param {number|string} surahNumber
 */
export async function getSurahWordByWord(surahNumber) {
  if (wbwCache.has(surahNumber)) return wbwCache.get(surahNumber);

  const url = `${QURAN_COM_BASE}/verses/by_chapter/${surahNumber}?words=true&word_fields=text_uthmani,translation,transliteration&per_page=300`;
  const startTime = performance.now();

  try {
    const res = await fetch(url);
    const duration = performance.now() - startTime;
    const json = await res.json();

    logApiCall('GET', url, res.status, duration, JSON.stringify(json).length, json);

    if (json && json.verses) {
      const wordsMap = {};
      json.verses.forEach((v) => {
        wordsMap[v.verse_number] = v.words.map((w) => ({
          id: w.id,
          position: w.position,
          textUthmani: w.text_uthmani || w.text,
          translationEn: w.translation?.text || '',
          transliteration: w.transliteration?.text || '',
          audioUrl: w.audio_url ? `https://audio.qurancdn.com/${w.audio_url}` : null,
          charTypeName: w.char_type_name,
        }));
      });

      wbwCache.set(surahNumber, wordsMap);
      return wordsMap;
    }
    return {};
  } catch (err) {
    logApiCall('GET', url, 500, performance.now() - startTime, '0 KB', { error: err.message });
    console.warn('Word by word fetch fallback:', err);
    return {};
  }
}

/**
 * Fetch Tafsir Al-Muyassar for a specific Ayah
 */
export async function getAyahTafsir(surahNumber, ayahNumberInSurah) {
  const cacheKey = `tafsir_${surahNumber}_${ayahNumberInSurah}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  const url = `${ALQURAN_BASE}/ayah/${surahNumber}:${ayahNumberInSurah}/ar.muyassar`;
  const startTime = performance.now();

  try {
    const res = await fetch(url);
    const duration = performance.now() - startTime;
    const json = await res.json();

    logApiCall('GET', url, res.status, duration, JSON.stringify(json).length, json);

    if (json.code === 200 && json.data) {
      const text = json.data.text;
      memoryCache.set(cacheKey, text);
      return text;
    }
    return 'التفسير غير متوفر حالياً.';
  } catch (err) {
    logApiCall('GET', url, 500, performance.now() - startTime, '0 KB', { error: err.message });
    console.error('Error fetching Tafsir:', err);
    return 'تعذر تحميل التفسير. يرجى التحقق من اتصال الإنترنت.';
  }
}

/**
 * Search across Surahs list by Arabic name, English name, or number
 */
export function searchSurahs(query, surahsList) {
  if (!query || !query.trim()) return surahsList;
  const q = query.trim().toLowerCase();
  
  const normAr = (s) => s ? s.replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآ]/g, 'ا').toLowerCase() : '';
  const qNorm = normAr(q);

  return surahsList.filter((s) => {
    return (
      s.number.toString() === q ||
      s.englishName.toLowerCase().includes(q) ||
      s.englishNameTranslation.toLowerCase().includes(q) ||
      normAr(s.name).includes(qNorm)
    );
  });
}
