# 🪐 Orbit — Spaced Repetition Memory Tracker

Full-stack spaced repetition app: Next.js 14 + TypeScript + Prisma + Supabase (PostgreSQL) + Tailwind.

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Supabase setup
1. Create a free project at supabase.com
2. Go to **Settings → Database → Connection string → URI tab**
3. Copy the string and replace `[YOUR-PASSWORD]` with your DB password
4. Create a `.env` file in the project root:

```
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxx.supabase.co:5432/postgres"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

### 3. Push schema & run
```bash
npx prisma generate
npx prisma db push
npm run dev
```

Open http://localhost:3000 🚀

---

## Deploy to Vercel
```bash
npx vercel
```
Add these in Vercel dashboard → Settings → Environment Variables:
- `DATABASE_URL` — your Supabase connection string
- `NEXT_PUBLIC_BASE_URL` — `https://your-app.vercel.app`

Then: `npx vercel --prod`

---

## Features
- 🧠 SM-2 spaced repetition algorithm (same as Anki)
- 📉 Full-screen forgetting curves — 30d / 3mo / 6mo / 1yr
- 🎮 Review session mode — fullscreen flashcard flow
- 🔥 Activity heatmap — 52-week calendar + streak counter
- 🔗 Deck sharing — public share links
- 🍪 No login required — anonymous cookie-based identity
- 🗄️ PostgreSQL via Supabase — all data persisted

## Difficulty ratings
| Rating | Effect |
|---|---|
| 🕳️ Blackhole | Forgot completely — resets to 1 day |
| 😤 Hard | Short interval |
| 😐 OK | Normal progression |
| 😊 Easy | Longer interval |
| 🚀 Mastered | Maximum spacing (60-120+ days) |
