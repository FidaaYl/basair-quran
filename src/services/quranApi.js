
const ALQURAN_BASE = 'https://api.alquran.cloud/v1';
const QURAN_COM_BASE = 'https://api.quran.com/api/v4';

const memoryCache = new Map();
const wbwCache = new Map();

export const restApiLogs = [];
const listeners = [];

export function subscribeToApiLogs(callback) {
  listeners.push(callback);
  return () => {
    const idx = listeners.indexOf(callback);
    if (idx !== -1) listeners.splice(idx, 1);
  };
}

export function logApiCall(method, url, status, durationMs, payloadSize, data) {
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

export function clearApiLogs() {
  restApiLogs.length = 0;
  listeners.forEach((cb) => cb([]));
}

export async function triggerTestApiCall(endpoint = 'ayah/1:1/ar.alafasy') {
  const url = `${ALQURAN_BASE}/${endpoint}`;
  const startTime = performance.now();
  try {
    const res = await fetch(url);
    const data = await res.json();
    const duration = performance.now() - startTime;
    logApiCall('GET', url, res.status, duration, JSON.stringify(data).length, data);
    return data;
  } catch (err) {
    const duration = performance.now() - startTime;
    logApiCall('GET', url, 500, duration, 0, { error: err.message });
    throw err;
  }
}

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
    }

    return result;
  } catch (error) {
    logApiCall('GET', url, 500, performance.now() - startTime, '0 KB', { error: error.message });
    console.error(`Error loading Surah ${surahNumber}:`, error);
    throw error;
  }
}

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

export async function getAyahComparativeTafsir(surahNumber, ayahNumberInSurah, scholar = 'muyassar') {
  const cacheKey = `tafsir_${scholar}_${surahNumber}_${ayahNumberInSurah}`;
  if (memoryCache.has(cacheKey)) return memoryCache.get(cacheKey);

  const startTime = performance.now();

  if (scholar === 'saadi') {
    const url = `${QURAN_COM_BASE}/tafsirs/91/by_ayah/${surahNumber}:${ayahNumberInSurah}`;
    try {
      const res = await fetch(url);
      const duration = performance.now() - startTime;
      const json = await res.json();
      logApiCall('GET', url, res.status, duration, JSON.stringify(json).length, json);

      if (json && json.tafsir && json.tafsir.text) {
        const clean = json.tafsir.text.replace(/<[^>]*>/g, '').trim();
        memoryCache.set(cacheKey, clean);
        return clean;
      }
    } catch (e) {
      console.warn('As-Saadi fetch fallback:', e);
    }
  }

  const editionMap = {
    muyassar: 'ar.muyassar',
    jalalayn: 'ar.jalalayn',
    qurtubi: 'ar.qurtubi',
  };

  const edition = editionMap[scholar] || 'ar.muyassar';
  const url = `${ALQURAN_BASE}/ayah/${surahNumber}:${ayahNumberInSurah}/${edition}`;

  try {
    const res = await fetch(url);
    const duration = performance.now() - startTime;
    const json = await res.json();

    logApiCall('GET', url, res.status, duration, JSON.stringify(json).length, json);

    if (json.code === 200 && json.data && json.data.text) {
      const text = json.data.text;
      memoryCache.set(cacheKey, text);
      return text;
    }
    return 'التفسير غير متوفر حالياً لهذه الآية.';
  } catch (err) {
    logApiCall('GET', url, 500, performance.now() - startTime, '0 KB', { error: err.message });
    console.error(`Error fetching Tafsir (${scholar}):`, err);
    return 'تعذر تحميل التفسير. يرجى التحقق من اتصال الإنترنت.';
  }
}

export const getAyahTafsir = (surahNumber, ayahNumberInSurah) =>
  getAyahComparativeTafsir(surahNumber, ayahNumberInSurah, 'muyassar');



export function normalizeArabic(s) {
  if (!s) return '';
  return s
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/[ىي]/g, 'ي')
    .toLowerCase()
    .trim();
}

export function searchSurahs(query, surahsList) {
  if (!query || !query.trim()) return surahsList;
  const qRaw = query.trim().toLowerCase();
  const qNorm = normalizeArabic(qRaw);
  const qWithoutSurah = qNorm.replace(/^سوره\s*/, '').trim();
  const qCore = qWithoutSurah.replace(/^ال/, '').trim();

  return surahsList.filter((s) => {
    const sNum = s.number.toString();
    if (sNum === qRaw) return true;

    const qCleanEn = qRaw.replace(/[^a-z0-9]/g, '');
    if (qCleanEn.length >= 2) {
      const enName = s.englishName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (enName.includes(qCleanEn)) return true;
      if (s.englishNameTranslation && s.englishNameTranslation.toLowerCase().includes(qRaw)) return true;
    }

    const sArNorm = normalizeArabic(s.name);
    const sArWithoutSurah = sArNorm.replace(/^سوره\s*/, '').trim();
    const sArCore = sArWithoutSurah.replace(/^ال/, '').trim();

    if (qNorm && sArNorm.includes(qNorm)) return true;
    if (qWithoutSurah && sArWithoutSurah.includes(qWithoutSurah)) return true;
    if (qCore && sArCore.includes(qCore)) return true;

    return false;
  });
}
