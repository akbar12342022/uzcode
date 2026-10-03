# UzCode — loyiha holati

> LeetCode'ga o'xshash platforma: dasturchilar algoritm va kod yozish mahoratini oshiradi.
> Oxirgi yangilanish: 2026-10-03

---

## ✅ Bajarilgan (saqlangan, ishlayapti)

1. **Loyiha skeleti** — Next.js 16 + TypeScript + Tailwind v4 (React 19).
2. **Ma'lumotlar bazasi** — PostgreSQL (Docker) + Prisma 7 (driver adapter `@prisma/adapter-pg`).
   - Jadvallar: `User`, `Problem`, `TestCase`, `Submission` (migratsiya qilingan).
   - Baza **5433** portda ishlaydi (5432 band edi).
3. **Namuna masalalar** — 6 ta masala seed qilindi (oson/o'rta/qiyin), test holatlari bilan.
4. **Masalalar sahifalari + Monaco editor**
   - `/problems` — masalalar ro'yxati (raqam, nom, teglar, qiyinlik).
   - `/problems/[slug]` — chapda shart (Markdown) va namuna testlar, o'ngda kod muharriri.
   - Muharrir: Python / JavaScript / C++, har bir til uchun alohida kod; kod brauzerda (localStorage) saqlanadi; "Asl holiga qaytarish" tugmasi.
   - Umumiy qobiq: sarlavha (header), yorug'/qorong'i rejim (tizim sozlamasiga qarab), 404 va xatolik sahifalari, vaqtinchalik sodda bosh sahifa.
5. **Judge0 integratsiyasi (RapidAPI)** — kod tayyor va haqiqiy Judge0 CE'da sinalgan; ishlashi uchun **RapidAPI kaliti kerak** (pastga qarang).
   - "Ishga tushirish" — kodni namuna testlarda, "Yuborish" — barcha (yashirin ham) testlarda tekshiradi.
   - Natija muharrir ostida: hukm, nechta test o'tgani, har bir test; namuna testlarda kirish / kutilgan / sizning chiqishingiz.
   - Yashirin testlarning ma'lumoti brauzerga yuborilmaydi (faqat hukm).
   - "Yuborish" natijasi bazaga **saqlanmaydi** — `Submission` uchun foydalanuvchi kerak, 6-bosqichda qo'shiladi.

## 🔜 Qolgan ishlar

6. **Auth** — ro'yxatdan o'tish / kirish, submission tarixi, profil. *(keyingi qadam)*
7. **Reyting, filtrlar, bezaklar** — leaderboard, to'liq bosh sahifa.

---

## ▶️ Loyihani ishga tushirish

```bash
# 1. Bazani yoqish (Docker Desktop ochiq bo'lsin)
docker compose up -d

# 2. Dasturni ishga tushirish
npm run dev
# -> http://localhost:3000

# Foydali buyruqlar:
npm run db:studio   # bazani brauzerda ko'rish (Prisma Studio)
npm run db:seed     # namuna masalalarni qayta yuklash
npm run db:migrate  # yangi migratsiya
```

> **Eslatma:** noutbukni o'chirib yoqqaningizdan keyin avval `docker compose up -d` ni ishga tushiring — baza konteyneri qayta yonadi, ma'lumotlar saqlanadi.

---

## 🧩 Muhim texnik qarorlar

- **Kod bajarish modeli:** `stdin/stdout` — foydalanuvchi to'liq dastur yozadi, u standart kirishdan o'qiydi va standart chiqishga yozadi. Judge0 natijani kutilgan chiqish bilan solishtiradi. (LeetCode uslubidagi "funksiyani to'ldirish" keyin qo'shilishi mumkin.)
- **Prisma 7:** `url` schema'da emas, `prisma.config.ts` da. Client `lib/generated/prisma` ga generatsiya qilinadi (gitignore'da).
- **Til qo'llab-quvvatlash:** Python, JavaScript, C++ (keyin ko'proq). Ro'yxat `lib/languages.ts` da.
- **Next.js 16:** `params` — Promise (`PageProps<'/problems/[slug]'>`); `error.tsx` da `retry`. Kod yozishdan oldin `node_modules/next/dist/docs/` ni o'qing (AGENTS.md).
- **Ma'lumot olish:** `lib/problems.ts` (faqat serverda). Mijozga faqat **namuna** testlar (`isSample`) yuboriladi — yashirin testlar serverda qoladi.
- **Muharrir:** `components/code-workspace.tsx`. Monaco brauzerda jsDelivr CDN'dan yuklanadi (internet kerak). Kod `uzcode:code:<slug>:<til>` kaliti bilan localStorage'da turadi.
- **Dizayn:** ranglar va shriftlar `app/globals.css` + `lib/fonts.ts` da (Golos Text, Tektur, JetBrains Mono); ikat naqshi — `components/ikat.tsx`.
- **Masala sharti:** Markdown, `react-markdown` bilan serverda render qilinadi (xom HTML ko'rsatilmaydi).

## ⚠️ Judge0 — kalit kerak (5-bosqichni yakunlash)

Tanlov: **RapidAPI** (2026-10-03). Kod self-hosted Judge0 bilan ham ishlaydi — faqat `.env` o'zgaradi.

Ishga tushishi uchun sizdan:
1. rapidapi.com da **Judge0 CE** API'ga bepul (Basic) rejada obuna bo'ling.
2. `.env` da `JUDGE0_RAPIDAPI_KEY="..."` ni to'ldiring (`JUDGE0_URL` allaqachon `https://judge0-ce.p.rapidapi.com`).
3. `npm run dev` ni qayta ishga tushiring va biror masalada "Ishga tushirish" ni bosing.

Holati (2026-10-03):
- "Ishga tushirish" haqiqiy Judge0 CE'ning ochiq serverida (`ce.judge0.com`, v1.14.0, kalitsiz) uchala tilda sinalgan: to'g'ri javob, noto'g'ri javob, bajarilish xatosi, vaqt chegarasi, kompilyatsiya xatosi — hammasi to'g'ri ishladi.
- "Yuborish" (yashirin testlar), limit/uzilish/noto'g'ri kalit holatlari mahalliy soxta server bilan sinalgan.
- **RapidAPI'ning o'zi bilan sinalmagan** (kalit yo'q edi): `X-RapidAPI-Key` / `X-RapidAPI-Host` sarlavhalari faqat soxta serverda tekshirilgan.
- Til ID'lari (`lib/languages.ts`): Python 3.8.1 = 71, Node.js 12.14 = 63, C++ GCC 9.2 = 54 — Judge0 CE'ning klassik ID'lari, har qanday Judge0 CE'da bor. `ce.judge0.com` da yangiroqlari ham bor: Python 3.12.5 = 100 / 3.14.0 = 113, Node.js 22.08 = 102, C++ GCC 14.1 = 105. Kalit kelgach RapidAPI'da `GET /languages` bilan tasdiqlab, shularga o'tkazish kerak (Node 12 `?.` kabi yangi sintaksisni tushunmaydi).
- Bepul rejada kunlik so'rov limiti bor; bitta tekshiruv 1 ta yaratish + 1–3 ta natija so'rovini sarflaydi (`lib/judge0.ts`).
- Hozircha tezlik cheklovi (rate limit) yo'q: server funksiyalari ochiq. Auth qo'shilganda foydalanuvchi bo'yicha cheklash kerak.

Fayllar: `lib/judge0.ts` (Judge0 mijozi), `app/problems/actions.ts` (server funksiyalari), `components/judge-panel.tsx` (natija paneli).

---

## 🔁 Davom ettirish

Claude Code'ni `uzcode` papkada oching va **"davom et"** deng.
Keyingi qadam: **RapidAPI kalitini qo'shib 5-bosqichni haqiqiy xizmatda tekshirish**, so'ng **6-bosqich — Auth**.
