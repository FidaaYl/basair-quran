import alafasyPhoto from '../assets/reciters/alafasy.jpg';
import husaryPhoto from '../assets/reciters/husary.jpg';
import minshawiPhoto from '../assets/reciters/minshawi.jpg';
import abdulbasitPhoto from '../assets/reciters/abdulbasit.jpg';
import ghamdiPhoto from '../assets/reciters/ghamdi.jpg';
import muaiqlyPhoto from '../assets/reciters/muaiqly.jpg';
import dossariPhoto from '../assets/reciters/dossari.jpg';
import sudaisPhoto from '../assets/reciters/sudais.jpg';

export const RECITERS = [
  {
    id: 'ar.alafasy',
    name: 'Mishary Rashid Alafasy',
    nameAr: 'مشاري بن راشد العفاسي',
    style: 'Murattal (مرتل)',
    subtext: 'عذوبة الصوت وإتقان المقامات',
    photo: alafasyPhoto,
    source: 'cdn',
  },
  {
    id: 'ar.husary',
    name: 'Mahmoud Khalil Al-Husary',
    nameAr: 'محمود خليل الحصري',
    style: 'Murattal (مرتل)',
    subtext: 'شيخ عموم المقارئ المصرية وإمام التجويد',
    photo: husaryPhoto,
    source: 'cdn',
  },
  {
    id: 'ar.minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    nameAr: 'محمد صديق المنشاوي',
    style: 'Murattal (مرتل)',
    subtext: 'الصوت الباكي الخاشع وريحانة القراء',
    photo: minshawiPhoto,
    source: 'everyayah',
    folder: 'Minshawy_Murattal_128kbps',
  },
  {
    id: 'ar.abdulbasitmurattal',
    name: 'Abdulbasit Abdulsamad',
    nameAr: 'عبد الباسط عبد الصمد',
    style: 'Murattal (مرتل)',
    subtext: 'صوت مكة وأسطورة التلاوة والتجويد',
    photo: abdulbasitPhoto,
    source: 'everyayah',
    folder: 'Abdul_Basit_Murattal_192kbps',
  },
  {
    id: 'ar.saadalghamidi',
    name: 'Saad Al-Ghamdi',
    nameAr: 'سعد الغامدي',
    style: 'Murattal (مرتل)',
    subtext: 'سلاسة الأداء وخشوع النبرة',
    photo: ghamdiPhoto,
    source: 'everyayah',
    folder: 'Ghamadi_40kbps',
  },
  {
    id: 'ar.mahermuaiqly',
    name: 'Maher Al-Muaiqly',
    nameAr: 'ماهر المعيقلي',
    style: 'Murattal (مرتل)',
    subtext: 'إمام وخطيب المسجد الحرام بمكة المكرمة',
    photo: muaiqlyPhoto,
    source: 'cdn',
  },
  {
    id: 'ar.dossari',
    name: 'Yasser Al-Dosari',
    nameAr: 'ياسر الدوسري',
    style: 'Murattal (مرتل)',
    subtext: 'إمام المسجد الحرام وأحد أعلام التلاوة المعاصرة',
    photo: dossariPhoto,
    source: 'everyayah',
    folder: 'Yasser_Ad-Dussary_128kbps',
  },
  {
    id: 'ar.sudais',
    name: 'Abdul-Rahman Al-Sudais',
    nameAr: 'عبد الرحمن السديس',
    style: 'Murattal (مرتل)',
    subtext: 'إمام وخطيب المسجد الحرام ورئيس الشؤون الدينية',
    photo: sudaisPhoto,
    source: 'everyayah',
    folder: 'Abdurrahmaan_As-Sudais_192kbps',
  }
];

export const getAyahAudioUrl = (reciterId, ayahInput, surahNumber, ayahInSurah) => {
  const reciter = RECITERS.find((r) => r.id === reciterId) || RECITERS[0];
  let globalAyahNum = typeof ayahInput === 'number' ? ayahInput : 1;
  let sNum = surahNumber;
  let aNum = ayahInSurah;

  if (typeof ayahInput === 'object' && ayahInput !== null) {
    globalAyahNum = ayahInput.number || globalAyahNum;
    aNum = ayahInput.numberInSurah || aNum;
    sNum = (ayahInput.surah && ayahInput.surah.number) || ayahInput.surahNumber || sNum;
  }

  if (reciter.source === 'everyayah') {
    if (sNum && aNum) {
      const sStr = String(sNum).padStart(3, '0');
      const aStr = String(aNum).padStart(3, '0');
      return `https://everyayah.com/data/${reciter.folder}/${sStr}${aStr}.mp3`;
    }
  }

  return `https://cdn.islamic.network/quran/audio/128/${reciter.id}/${globalAyahNum}.mp3`;
};
