# LGC Smart Farm OS — Backend (Pilot: Irrigation Module)

هذا الـ Backend الأولي لمشروع LGC Smart Farm OS، مبني على القرارات المعمارية المعتمدة سابقًا:
**Node.js/Express + PostgreSQL + JWT auth middleware**.

تم اختيار وحدة **الري الذكي (Irrigation)** كنموذج تجريبي أول — بعد ما تنجح، نكرر نفس النمط
(routes + schema + auth) على باقي الوحدات التسعة.

## البنية

```
lgc-backend/
├── src/
│   ├── app.js              # تجميع الـ Express app
│   ├── server.js           # نقطة التشغيل
│   ├── db.js                # اتصال PostgreSQL (pool)
│   ├── db/migrate.js        # تشغيل schema.sql
│   ├── middleware/auth.js   # JWT auth + role guard
│   └── routes/
│       ├── auth.js          # تسجيل / دخول
│       └── irrigation.js    # وحدة الري الذكي
├── sql/schema.sql           # جداول: users, zones, moisture_readings, irrigation_actions
├── .env.example
└── package.json
```

## التشغيل المحلي

```bash
cd lgc-backend
npm install
cp .env.example .env        # عدّل القيم حسب بيئتك (خصوصًا JWT_SECRET وبيانات PostgreSQL)

# أنشئ قاعدة البيانات (مرة واحدة فقط)، ثم طبّق الجداول:
npm run migrate

# تشغيل السيرفر:
npm start
# أو مع إعادة تشغيل تلقائي عند التعديل:
npm run dev
```

السيرفر يعمل افتراضيًا على `http://localhost:4000`.

## نقاط الوصول (API Endpoints)

### المصادقة
| الطريقة | المسار | الوصف |
|---|---|---|
| POST | `/api/auth/register` | تسجيل مستخدم جديد `{ full_name, email, password, role? }` |
| POST | `/api/auth/login` | تسجيل الدخول `{ email, password }` → يرجع `token` |

استخدم الـ `token` في كل الطلبات التالية عبر الهيدر:
```
Authorization: Bearer <token>
```

### وحدة الري الذكي
| الطريقة | المسار | الوصف |
|---|---|---|
| GET | `/api/irrigation/zones` | كل القطاعات + آخر قراءة رطوبة لكل واحد |
| GET | `/api/irrigation/zones/:id/readings` | سجل قراءات الرطوبة لقطاع معين |
| POST | `/api/irrigation/zones/:id/readings` | إضافة قراءة جديدة (من حساس أو يدويًا) |
| POST | `/api/irrigation/zones/:id/irrigate` | تشغيل الري لقطاع معين |
| GET | `/api/irrigation/zones/:id/actions` | سجل عمليات الري السابقة |

## الخطوة التالية

ربط `irrigation.html` + `app.js` في الواجهة الأمامية (الديمو) بهالـ API الحقيقي بدل البيانات
الوهمية الثابتة — بعدها نكرر نفس النمط على: الطاقة، المحاصيل، الحساسات، المستخدمين...، إلخ.
