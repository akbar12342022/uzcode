# UzCode

An open-source coding-practice platform in Uzbek. Problem statements, hints and
editorials are written in Uzbek — not translated from English — so that a beginner
can learn algorithms without first having to learn English.

> O'zbek tilidagi ochiq kodli algoritm mashq platformasi. Masala shartlari, maslahatlar
> va yechim izohlari o'zbekcha yoziladi.

## Why

Uzbekistan has a large and growing number of self-taught developers, and almost no
programming-education material in their own language. The practice platforms they
are pointed to — LeetCode, Codeforces, HackerRank — are English-only, which turns
"learn to solve problems" into "learn English first". UzCode exists to remove that
step: the whole surface, from the problem statement to the verdict message, is Uzbek.

It is built for skill-building rather than interview drilling: problems follow a
learning path, and each one ships with an editorial.

## What's in here

- **Problem workspace** — statement and sample tests on the left, Monaco editor on
  the right. Per-language code is kept separately and persisted in the browser.
- **Two execution engines.** By default each submission runs in a throwaway Docker
  container on your own machine — no account, no API key, no quota. Setting
  `JUDGE_ENGINE="judge0"` sends it to a hosted Judge0 CE instance instead.
- **Languages:** Python, JavaScript, C++.
- **Run vs. Submit** — *Run* checks the sample tests, *Submit* checks every test
  including the hidden ones. Hidden test data never reaches the browser.
- **In-browser demo** — the home page lets you solve a problem without signing up;
  the code runs in a Web Worker, so it costs no server time.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
PostgreSQL 17 · Prisma 7 · Monaco Editor · Docker

## Running it locally

Requires Node.js 20+ and Docker Desktop.

```bash
git clone https://github.com/akbar12342022/uzcode.git
cd uzcode
npm install

cp .env.example .env     # defaults work as-is for local development

npm run db:up            # PostgreSQL on port 5433
npm run db:migrate
npm run db:seed          # sample problems with their test cases

npm run dev              # http://localhost:3000
```

`npm run dev` builds the sandbox image on first run, so the first start takes a
few minutes. See `.env.example` for the Judge0 variables if you would rather use a
hosted judge than the local Docker sandbox.

| Command | What it does |
|---|---|
| `npm run db:studio` | Prisma Studio, to browse the database |
| `npm run db:reset` | Drop, re-migrate and re-seed |
| `npm run judge:build` | Rebuild the sandbox image by hand |

## Status

Early but working. The problem workspace, both judge engines and the seeded problem
set all run today. Accounts, submission history and a leaderboard are the next
pieces; the schema already has `User` and `Submission` tables waiting for them.

`HOLAT.md` tracks what is done and what is next (in Uzbek), `REJA.md` holds the
longer-term plan.

## Contributing

Problem contributions are the most useful kind. A problem is a statement, a set of
test cases and an editorial — all in Uzbek — added through `prisma/seed.ts`. Open an
issue first if you are planning something larger, so we don't duplicate work.

## License

MIT — see [LICENSE](LICENSE).
