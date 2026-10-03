# UzCode — reja

> Kelishilgan sana: 2026-10-03
> Bu fayl — nima qurayotganimiz va nega. Kundalik holat uchun `HOLAT.md` ga qarang.

---

## 1. Pozitsiya

**UzCode — o'zbek tilidagi LeetCode. Maqsad: ishga suhbatga va algoritmga tayyorgarlik.**

Auditoriya: IT o'rganayotgan yoshlar — kurs bitirgan, birinchi ishini qidirayotgan junior dasturchilar.

Nega bo'shliq bor:

- **RoboContest**, **KEP.uz** — bor, lekin olimpiada/sport dasturlash uchun: matematik masalalar, kontest formati, C++ ustun.
- **LeetCode** — aynan ishga suhbat uchun, lekin inglizcha. Yangi boshlovchi uchun til jiddiy to'siq.
- O'zbek tilida "interview prep" qiladigan hech kim yo'q.

Har bir qaror shu bitta gapga bo'ysunadi. Olimpiada tomonga og'ib ketmaymiz — u yerda bizdan kuchli, bepul raqiblar bor.

Model: **avval bepul o'sish, monetizatsiya keyin.**

## 2. Masala formati — funksiya uslubiga o'tamiz

**Hozir:** `stdin/stdout` — foydalanuvchi to'liq dastur yozadi, `input()` dan o'qiydi. Bu olimpiada odati.

**Bo'ladi:** LeetCode uslubi — tayyor funksiya sarlavhasi beriladi, foydalanuvchi faqat ichini yozadi:

```python
def twoSum(nums: list[int], target: int) -> list[int]:
    # yechimingiz
```

Sabab: ishga suhbatda aynan shunday so'raladi. Bu bizni raqiblardan ajratadigan birinchi narsa.

Texnik ma'nosi:

- Har bir masala + til uchun **driver** (o'rov kodi): testni o'qiydi, foydalanuvchi funksiyasini chaqiradi, natijani chop etadi.
- Judge0 baribir stdin/stdout bilan ishlayveradi — biz faqat ustidan o'raymiz, judge tomoni o'zgarmaydi.
- `Problem` jadvaliga qo'shiladi: funksiya nomi, parametrlar (nom + tur), qaytish turi.
- Testlar JSON ko'rinishida saqlanadi (matn emas), driver ularni tilga mos turga aylantiradi.

**Buni birinchi navbatda qilamiz.** 50 ta masala yozilgandan keyin bu o'zgarish ikki barobar qimmatga tushadi.

## 3. Kod tekshiruvchi (judge)

| Variant | Narx | Qaror |
|---|---|---|
| RapidAPI bepul | 0 | ~50 so'rov/kun — faqat ishlab chiqish uchun. **Hozir shu.** |
| Judge0 Cloud | €27/oy dan (2000 submission/kun) | erta, kerak emas |
| Self-hosted Judge0 | VPS $5–10/oy, dastur bepul | **Ommaga chiqishdan oldin shunga o'tamiz** |

Eslatma: Judge0 cgroup v1 talab qiladi — VPS **KVM** tipida bo'lsin, LXC emas.

## 4. Kontent — asosiy qiymat

Kod bir hafta, kontent uch oy. Reja: **50–60 masala**, uch darajada.

- LeetCode matnlarini ko'chirib bo'lmaydi (mualliflik huquqi). Klassik masalalarning g'oyasi erkin — shartni noldan o'zbekcha yozamiz.
- Har masalaga: shart, 2–3 namuna, yashirin testlar, **o'zbekcha yechim tahlili (editorial)**.
- Editorial — bizni ajratadigan narsa va keyinchalik pullik qilinadigan birinchi qism.

Taqsimot: masalalarni Claude yozadi, Akbar til va mazmunini ko'rib chiqadi.

## 5. Dizayn — qorong'i dev-tool

**Olib tashlanadi:** ikat bloki, Tektur shrifti, lojuvard palitra, bo'sh hero sahifa.

**O'rniga:**

- Fon sof qora emas — chuqur neytral; yuzalar bir pog'ona ochiq; **bitta** yorqin urg'u rangi.
- Shriftlar: UI uchun Geist/Inter, kod va barcha raqamlar uchun JetBrains Mono.
- Bosh sahifada **ishlaydigan kod muharriri** — mehmon ro'yxatdan o'tmasdan masala yechib ko'radi.
- Masalalar ro'yxati: status, nom, qiyinlik, teglar, qabul foizi; filtr va qidiruv.
- Masala sahifasi: o'lchami o'zgaradigan uch panel, pastda konsol.

Qorong'i rejim — asosiy. Yorug' rejim keyin qo'shiladi.

## 6. Bosqichlar

### Faza 0 — poydevor (3–4 kun)

- [x] Hamma ishni git'ga commit qilish
- [ ] Dizayn tizimi: palitra, shriftlar, umumiy komponentlar
- [ ] Bosh sahifa va masalalar ro'yxatining yangi ko'rinishi
- [ ] Funksiya formatiga o'tish (schema + driver + muharrir)

### Faza 1 — MVP (2–3 hafta)

- [ ] Auth: Telegram login + email/parol
- [ ] Profil: yechilgan masalalar, urinishlar tarixi, streak
- [ ] 50 masala + har biriga editorial
- [ ] Deploy: Vercel + self-hosted judge VPS
- [ ] Telegram kanal: har kuni bitta masala (Faza 1 bilan **birga** boshlanadi)

### Faza 2 — o'sish

- [ ] Leaderboard
- [ ] Kundalik masala (daily)
- [ ] Kompaniya teglari: Uzum, Click, Payme, EPAM va boshqalar
- [ ] Yechimlar muhokamasi

### Faza 3 — monetizatsiya

- Premium: batafsil editorial, mock interview, kompaniya bo'yicha ro'yxatlar
- B2B: IT kurslar uchun guruh va avtotekshiruv

## 7. Asosiy xavf

Platforma tayyor bo'lib, hech kim kirmasligi mumkin. Kod — eng oson qismi.

Qarshi chora: **Telegram kanal + kundalik masala**. Har kuni bitta masala, qisqa tahlil, saytga havola. Buni Faza 1 bilan birga boshlaymiz, oxirida emas.
