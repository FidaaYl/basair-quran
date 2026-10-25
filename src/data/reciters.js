export const RECITERS = [
  {
    id: 'ar.alafasy',
    name: 'Mishary Rashid Alafasy',
    nameAr: 'مشاري بن راشد العفاسي',
    style: 'Murattal (مرتل)',
    subtext: 'High Clarity & Renowned Pace',
  },
  {
    id: 'ar.husary',
    name: 'Mahmoud Khalil Al-Husary',
    nameAr: 'محمود خليل الحصري',
    style: 'Murattal (مرتل)',
    subtext: 'Gold Standard for Memorization & Tajweed',
  },
  {
    id: 'ar.minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    nameAr: 'محمد صديق المنشاوي',
    style: 'Murattal (مرتل)',
    subtext: 'Soulful & Reverent Classic Recitation',
  },
  {
    id: 'ar.abdulbasitmurattal',
    name: 'Abdulbasit Abdulsamad',
    nameAr: 'عبد الباسط عبد الصمد',
    style: 'Murattal (مرتل)',
    subtext: 'Legendary Master of Tajweed & Melody',
  },
  {
    id: 'ar.saadalghamidi',
    name: 'Saad Al-Ghamdi',
    nameAr: 'سعد الغامدي',
    style: 'Murattal (مرتل)',
    subtext: 'Fluent & Captivating Murattal',
  },
  {
    id: 'ar.shaatree',
    name: 'Abu Bakr Al-Shatri',
    nameAr: 'أبو بكر الشاطري',
    style: 'Murattal (مرتل)',
    subtext: 'Smooth & Warm Tone',
  }
];

export const getAyahAudioUrl = (reciterId, globalAyahNumber) => {
  return `https://cdn.islamic.network/quran/audio/128/${reciterId}/${globalAyahNumber}.mp3`;
};
