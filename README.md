# ✦ بَصَائِر | Basa'ir — The Intelligent Quranic Studio
> **منصة تفاعلية متقدمة لدراسة القرآن الكريم، الحفظ النشط، واستكشاف واجهات البرمجة وخدمات المايكروسيرفيس**

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Application-087F63?style=for-the-badge&logo=github)](https://fidaayl.github.io/basair-quran/)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/FidaaYl/basair-quran)
[![REST Architecture](https://img.shields.io/badge/Architecture-REST%20%26%20Microservices-d2aa60?style=for-the-badge)](https://tryhackme.com/room/restapismicroservices)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-10b981?style=for-the-badge)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **"هَٰذَا بَصَائِرُ لِلنَّاسِ وَهُدًى وَرَحْمَةٌ لِّقَوْمٍ يُوقِنُونَ"** — سورة الجاثية: 20  
> *"This [Quran] is enlightenment/clear insights for mankind and guidance and mercy for a people who are certain."*

---

## 1. 📖 نبذة عن المشروع (Project Overview)

**بَصَائِر (Basa'ir)** هي منصة قرآنية حديثة تجمع بين عمق التراث الإسلامي وهندسة البرمجيات المعاصرة، صُممت كتطبيق عملي شامل لمفاهيم **واجهات برمجة التطبيقات (REST APIs) والبنى الخدمية الدقيقة (Microservices)** وفق المعايير العالمية لغرفة التدريب **TryHackMe**.

### الأهداف الهندسية والتقنية للمشروع:
1. **استهلاك واجهات REST الخارجية الحية**: الربط المتزامن مع خوادم `api.alquran.cloud` و `api.quran.com` لاستدعاء التلاوات الصوتية، التفاسير المعتمدة، وبيانات الإعراب.
2. **محاكاة معمارية المايكروسيرفيس (Microservices Architecture)**: عزل المهام في خدمات مستقلة (خدمة التلاوة، خدمة الحفظ، خدمة الملاحظات والتدبر، وخدمة قياس الأداء).
3. **تطبيق دورة حياة المورد الكاملة (Full CRUD Lifecycle)**: دعم أفعال HTTP الدلالية (`GET`, `POST 201`, `PUT 200`, `DELETE 204`) مع معالجة حقيقية للترويسات وأكواد الاستجابة.
4. **التطوير المرتكز على تجربة المستخدم (UX/UI)**: اعتماد هوية المخطوطات الأندلسية والمغاربية التقليدية (الأخضر الزمردي `#0B2B26`، الذهب المذهب `#D4AF37`، والورق العتيق) مع الابتعاد التام عن القوالب البصرية العشوائية.

---

## 2. 🏛️ المعمارية التقنية وتطبيق معايير REST APIs (Course Core)

تم تزويد المنصة بنافذة فحص متقدمة **(REST API Inspector)** تبرز تطبيق كافة المحاور النظرية والعملية للمساق:

```
[ Client Application (React + Vite) ]
          │
          ├──> [ External Quran REST API ] (api.alquran.cloud)  ──> Multi-edition Ayahs & Recitations
          ├──> [ External Tafsir REST API ] (api.quran.com)     ──> Classical Tafsir & Audio Streams
          ├──> [ Notes CRUD Microservice ] (/api/v1/notes)      ──> Full Resource Lifecycle (POST/PUT/DELETE)
          └──> [ REST Telemetry & Interceptor ]                 ──> Real-time Latency, Status & Payload Profiler
```

### 1. العمليات الحيوية (Full CRUD Microservice Lab):
* **`GET /api/v1/notes`**: استرجاع الملاحظات والفوائد التدبرية مع دعم التصفية عبر معلمات الاستعلام (`Query Parameters`).
* **`POST /api/v1/notes`**: إنشاء مورد جديد وإرجاع كود الاستجابة القياسي `201 Created` مع حزمة JSON للمورد المنشأ.
* **`PUT /api/v1/notes/:id`**: تحديث الحقول وتعديل المورد القائم مع إرجاع `200 OK`.
* **`DELETE /api/v1/notes/:id`**: حذف المورد وإرجاع `204 No Content`.

### 2. التوثيق وتأمين الواجهات (API Security & Bearer Auth):
* اختبار ترويسة المصادقة القياسية: `Authorization: Bearer <JWT_TOKEN>`.
* محاكاة الرفض الأمني التلقائي وإصدار استجابة `401 Unauthorized` في حال غياب التوكن أو عدم صلاحيته.

### 3. محاكي أكواد الاستجابة وحالات الفشل (Status Code Simulator):
* اختبار ومعالجة حالات الخطأ المختلفة لضمان موثوقية التطبيق:
  * `200 OK`: نجاح استرداد البيانات.
  * `201 Created`: نجاح إنشاء الكيان.
  * `400 Bad Request`: خطأ في هيكل البيانات المرسلة (Validation Error).
  * `401 Unauthorized`: غياب صلاحيات الوصول.
  * `404 Not Found`: طلب معرف غير مسجل في قاعدة البيانات.
  * `429 Too Many Requests`: محاكاة تجاوز حد الطلبات واستخراج ترويسة `Retry-After: 60s`.
  * `500 Internal Server Error`: محاكاة تعطل الخادم والتعامل معه بنوافذ تنبيه ودودة للمستخدم.

### 4. التوثيق المعياري وتصدير الجلسة (OpenAPI 3.0 & Audit Export):
* توثيق مدمج لكافة المسارات وفق معيار **Swagger / OpenAPI 3.0**.
* **ميزة التصدير الأكاديمي (Export Audit)**: زر مخصص لتوليد تقرير JSON كامل بجميع الطلبات المنفذة، أزمنة الاستجابة بالمللي ثانية، وأحجام الحزم لتقديمه كإثبات معملي للمشرف.

---

## 3. 🌟 المحاور الوظيفية للمنصة (Platform Core Pillars)

### 1. 📖 المصحف الإلكتروني والتحليل الصرفي (Mushaf & Morphology)
* عرض المصحف بالخط العثماني الواضح وتزامن التلاوة مع 8 قراء بارزين.
* **المختبر الصرفي للجذور القرآنية**: النقر على أي كلمة لاستعراض **جذرها اللغوي الثلاثي**، **وزنها الصرفي**، وإعرابها النحوي المبسط.

### 2. 🧠 معمل الحفظ والاسترجاع النشط (Active Recall & Memorization)
* مستويات تدريجية لحجب الآيات (إخفاء جزئي 25%، 50%، إخفاء كامل).
* استدعاء الحرف الأول كمنبه ذهني، واختبار الآية التالية مع قياس نسبة الإتقان وسلاسل المواظبة.

### 3. 🔍 مستكشف المتشابهات اللفظية (Mutashabihat Explorer)
* رصد الآيات المتطابقة في الألفاظ مع إبراز الكلمات الفارقة بلون ذهبي وتوضيح الضابط البلاغي والسياقي لكل موضع لمنع اللبس.

### 4. 📚 مكتبة العلماء والمخطوطات (Scholars Library)
* قراءة واستماع مباشر لأمهات المصنفات الإسلامية (تفسير السعدي، رياض الصالحين، الأربعين النووية، وزاد المعاد) بأسلوب عرض المخطوطات المذهبة.

### 5. 🎯 مخطط الختمات وخريطة المواظبة (Khatmah & Activity Heatmap)
* حساب الأوراد اليومية، متابعة إنجاز الأجزاء الـ 30، وخريطة حرارية للنشاط القرآني على مدار 16 أسبوعاً (112 يوماً).

### 6. 🎨 استوديو بطاقات الآيات (Ayah Card Studio)
* تصميم بطاقات اقتباس عالية الدقة (1080x1350) صالحة للنشر مع نقوش وزخارف إسلامية مستوحاة من التراث.

### 7. ⌨️ نظام الاختصارات ولوحة الأوامر (Command Palette & Shortcuts)
* **`Ctrl + K`**: بحث شامل وفوري عن السور، الآيات، الكتب، والأدوات.
* اختصارات سريعة للمصحف: `Space` (تشغيل/إيقاف)، `← / →` (تنقل بين الآيات)، `F` (وضع المحراب بملء الشاشة)، و `T` (فتح التفسير).

### 8. 📲 الدعم الكامل للعمل دون إنترنت (PWA & Offline Ready)
* تثبيت المنصة كتطبيق مستقل على الحواسيب والهواتف مع تخزين مؤقت للآيات والملفات الثابتة عبر Service Worker.

---

## 4. 🛠️ حزمة التقنيات المستخدمة (Tech Stack)

* **الواجهة الأمامية**: React 18, Vite 8, Modern CSS Variables (Design Tokens).
* **معالجة النصوص القرآنية**: Amiri Quran, Scheherazade New, Plus Jakarta Sans.
* **إدارة الحالات والبيانات**: Native React Hooks, IndexedDB / Cache API, LocalStorage Engine.
* **محاكاة الشبكات**: Web Fetch API, Service Worker Cache Interceptor, Performance Timing API.
* **الأيقونات والزخارف**: Lucide React + مصفوفة مخصصة للنقوش والوردات والزخارف الإسلامية (SVG Rosettes).

---

## 5. 🚀 التشغيل والنشر (Setup & Deployment)

### التشغيل المحلي (Local Development):
```bash
git clone https://github.com/FidaaYl/basair-quran.git
cd basair-quran
npm install
npm run dev
```

### الرابط الحي للمنصة:
**[https://fidaayl.github.io/basair-quran/](https://fidaayl.github.io/basair-quran/)**

---

## 📄 الترخيص (License)
هذا المشروع متاح بموجب ترخيص [MIT License](LICENSE).
