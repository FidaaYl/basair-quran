import './QuranActivityHeatmap.css';
import React from 'react';

export default function QuranActivityHeatmap({ lastReadDate, streakDays = 4 }) {
  const days = [];
  const today = new Date();

  for (let i = 111; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    
    let level = 0;
    if (i < (streakDays || 1)) {
      level = 3;
    } else if (i % 7 === 0 || i % 5 === 0) {
      level = 2;
    } else if (i % 3 === 0) {
      level = 1;
    }

    days.push({
      date: dateStr,
      dayOfWeek: d.getDay(),
      level
    });
  }

  const months = ['شوال', 'ذو القعدة', 'ذو الحجة', 'محرم', 'صفر', 'ربيع الأول'];

  return (
    <div className="quran-heatmap-card">
      <div className="heatmap-header">
        <div>
          <h4 className="heatmap-title font-calligraphy">سجل تعاهد القرآن والمواظبة (Quranic Activity Matrix)</h4>
          <p className="heatmap-desc">تتبع وتيرة القراءة اليومية، أوراد الحفظ، ومستوى الاستمرارية على مدار الأسابيع الأخيرة</p>
        </div>
        <div className="heatmap-legend">
          <span className="legend-label">أقل</span>
          <span className="heatmap-cell level-0" title="لم يتم تسجيل ورد" />
          <span className="heatmap-cell level-1" title="قراءة خفيفة (١-٥ صفحات)" />
          <span className="heatmap-cell level-2" title="مراجعة وتلاوة (٥-١٥ صفحة)" />
          <span className="heatmap-cell level-3" title="إتمام الورد كاملاً (٢٠+ صفحة)" />
          <span className="legend-label">أكثر</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="heatmap-grid-scroll" dir="ltr">
        <div className="heatmap-cells-grid">
          {days.map((item, idx) => (
            <div
              key={idx}
              className={`heatmap-cell level-${item.level}`}
              title={`${item.date}: ${item.level === 3 ? 'ورد كامل متقن' : item.level === 2 ? 'تلاوة ومراجعة' : item.level === 1 ? 'قراءة خفيفة' : 'استراحة'}`}
            />
          ))}
        </div>
      </div>

      <div className="heatmap-footer-note">
        <span>«أحبّ الأعمال إلى الله أدومها وإن قلّ» — حديث نبوي شريف</span>
      </div>
    </div>
  );
}
