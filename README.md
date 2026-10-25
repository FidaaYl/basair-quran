# ✦ بَصَائِر | Basa'ir — The Intelligent Quranic Studio

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Application-10b981?style=for-the-badge&logo=github)](https://fidaayl.github.io/basair-quran/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/FidaaYl/basair-quran)
[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **"هَٰذَا بَصَائِرُ لِلنَّاسِ وَهُدًى وَرَحْمَةٌ لِّقَوْمٍ يُوقِنُونَ"** — سورة الجاثية: 20  
> *"This [Quran] is enlightenment/clear insights for mankind and guidance and mercy for a people who are certain."*

---

## 📖 نظرة عامة عن المشروع (Project Overview)

**بَصَائِر (Basa'ir)** هي منصة قرآنية تفاعلية حديثة وشاملة تم تطويرها استجابةً للمسابقة الجامعية لمادة هندسة البرمجيات وتطبيقات الويب (REST APIs & Microservices).

يجمع المشروع بين النماذج الرائدة المذكورة في نص المسابقة:
* **Muhaffidh (muhaffidh.app)**: معمل الاسترجاع النشط، حجب الكلمات، واستدعاء الحرف الأول.
* **Tarteel AI (tarteel.ai)**: التسميع الصوتي بالذكاء الاصطناعي مع قياس دقة التلاوة وتصحيح الكلمات لحظياً.
* **Rawy (rawy.net)**: مكتبة صوتية لأمهات كتب العلماء والشروحات الإسلامية الكلاسيكية.
* **Tafsir.one & Quran.com**: التلاوة المتزامنة مع 6 قراء معتمدين، الترجمة اللفظية كلمة بكلمة، وتفسير الميسر.
* **TryHackMe REST APIs Room**: مستكشف واجهات برمجة التطبيقات الحي (REST API Inspector) لمراقبة الأكواد، الترويسات، وتوليد أوامر cURL.

---

## 🌟 المزايا والابتكارات السبعة (The 7 Pillars of Innovation)

### 1. 🧠 معمل الحفظ والاسترجاع النشط والتسميع الصوتي (Voice AI & Active Recall)
* **التسميع الصوتي الذكي (Voice AI - مستوحى من Tarteel)**: استخدام تقنيات التعرف الصوتي (Web Speech Recognition) للتعرف على تلاوة المستخدم باللغة العربية، وتظليل الكلمات المتلوة صحيحة بالأخضر اللامع وحساب نسبة الدقة لحظياً.
* **حجب الكلمات التفاعلي (Word Masking - مستوحى من Muhaffidh)**: حجب تدريجي (25%، 50%، 100%) مع إمكانية النقر على أي مفردة لكشفها فوراً.
* **تقنية الحرف الأول (First-Letter Recall)**: إبراز الحرف الأول كمفتاح عصبي لاستدعاء الآية كاملة.
* **تحدي الآية التالية (Next-Ayah Quiz)**: اختبار ذاكرة الآيات اللاحقة مع قياس سلاسل التتابع (Streak) ورسوم تشجيعية.

### 2. 🔤 الترجمة والنطق اللفظي كلمة بكلمة (Word-by-Word Morphology)
* النقر على أي كلمة داخل أي آية لعرض ترجمتها الإنجليزية، كتابتها الصوتية (Transliteration)، والاستماع لنطق الكلمة المفردة عبر خوادم `qurancdn.com`.

### 3. ✨ مستكشف المتشابهات اللفظية وتوجيه الفروق (Mutashabihat Explorer)
* دراسة مقارنة جنباً إلى جنب للآيات المتشابهة في الألفاظ عبر مختلف السور مع إبراز الكلمات الفارقة بلون ذهبي واضح.
* توضيح **الضابط البلاغي والسياقي** المعين على ضبط الحفظ وعدم الخلط أثناء التلاوة.

### 4. 🎧 مكتبة العلماء والكتب الصوتية (Scholars Audiobooks — مستوحاة من Rawy.net)
* استماع مباشر لأشهر الشروحات والمصنفات:
  * *تيسير الكريم الرحمن في تفسير كلام المنان (للشيخ السعدي)*
  * *شرح الأربعين النووية (للإمام النووي)*
  * *رياض الصالحين من كلام سيد المرسلين (للإمام النووي)*
  * *زاد المعاد في هدي خير العباد (للإمام ابن القيم)*
  * *الشمائل المحمدية (للإمام الترمذي)*

### 5. 🧭 بصائر وتدبر وحالات الوجدان (Thematic Sanctuary & Reflection)
* محرك وجداني: *"كيف يشعر قلبك اليوم؟"* (*قلق أو خوف، حزن وضيق، شكر وامتنان، حيرة وطلب الهداية*) يعرض آيات السكينة مع الترجمة الإنجليزية والفرنسية والخواطر التدبرية.
* أدعية الأنبياء عليهم السلام ومواقف الاستجابة الربانية.

### 6. 🛠️ مستكشف واجهات برمجة التطبيقات الحي (REST API Inspector)
* تطبيق عملي ومباشر لمفاهيم مادة **REST APIs & Microservices (TryHackMe)**:
  * تتبع حي للطلبات (HTTP Methods: GET, Endpoints, Latency in ms, Payload Size in KB).
  * رموز الاستجابة (Status Codes: `200 OK`, `304 Not Modified`, `400 Bad Request`, `500 Server Error`).
  * عارض الردود (JSON Viewer) المنسق.
  * مولد أوامر الطرفية (cURL Generator) لتجربة الطلبات في سطر الأوامر.

### 7. 🎨 مصمم بطاقات الآيات (Ayah Card Studio)
* تصميم بطاقات اقتباس قرآنية بدقة عالية ومشاركتها عبر وسائل التواصل بـ 4 أنماط بصرية راقية.

---

## 🚀 النشر والاستضافة (Deployment Options)

### 1. الرابط الحي على GitHub Pages:
**[https://fidaayl.github.io/basair-quran/](https://fidaayl.github.io/basair-quran/)**

### 2. النشر على منصة Render (الموصى بها في المسابقة):
تم تضمين ملف الإعداد التلقائي `render.yaml` (Infrastructure as Code):
1. قم بزيارة [dashboard.render.com](https://dashboard.render.com/) وتسجيل الدخول عبر GitHub.
2. اضغط على **"New +"** ثم اختر **"Blueprint"** أو **"Static Site"**.
3. اختر مستودع `FidaaYl/basair-quran` واضغط **"Apply"** ليتم النشر التلقائي في ثوانٍ.

### 3. النشر على Vercel:
1. قم بالدخول إلى [vercel.com](https://vercel.com/) واضغط **"Add New Project"**.
2. اختر مستودع `basair-quran` واضغط **"Deploy"**.

---

## 👤 معلومات إعداد المشروع (Author & Academic Attribution)

* **اسم الطالب**: فداء يعلاوي (Fidaa Yalaoui)
* **نوع العمل**: فردي (Solo Project)
* **المساق الدراسي**: بنية واجهات البرمجة وتطبيقات الويب (REST APIs & Microservices)
* **الأستاذ المشرف**: د. صحراوي محمد (Dr. Sahraoui Mohammed)
* **البريد الإلكتروني للتقييم**: `sahraoui.mohammed@outlook.com`

---

## 📄 الترخيص (License)
هذا المشروع مفتوح المصدر ومتاح بموجب ترخيص MIT.
