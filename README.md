# My Friends Are Late

A website where you submit instances of friends being late and receive a **Tardiness Score** — a data-driven verdict on exactly how bad it was.

Companion to the [My Friends Are Late YouTube channel](https://youtube.com).

---

## What it does

- **Submit an entry** — answer 22 questions about the offender, the event, the lateness, and the excuse
- **Receive a Tardiness Score** (0–120+) and a named verdict: *The Saint*, *The Fashionably Late*, *The Chronic Offender*, *The Disrespecter*, *The Repeat Criminal*, or *The Time Terrorist*
- **Share your verdict** — designed to be screenshot-worthy and sent to the late friend
- **Live dashboard** — aggregate stats, charts, and patterns across all submissions
- **Hall of Fame** — the 25 most egregious offenders ever submitted

---

## Tech stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (Postgres)
- **Recharts**
- **Vercel** (deployment)

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run the SQL in `supabase/schema.sql` in the Supabase SQL editor
3. Copy your project URL and anon key

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials in `.env.local`.

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Scoring formula

The Tardiness Score is calculated from five weighted factors:

| Factor | Weight | What it measures |
|--------|--------|-----------------|
| Relative Lateness | 40% | How late vs. how long the event was |
| Event Severity | 20% | A wedding vs. a casual hangout |
| Their Role | 20% | Could the event not start without them? |
| Excuse Quality | 10% | Could they have avoided it? |
| Notice Given | 10% | How early, and by what method |

**Modifiers:** No-shows multiply the score by 1.5. Chronic repeat offenders add 20 points. Score caps at 120.

---

## Deployment

Deploy to Vercel with one click. Set the same environment variables in Vercel's project settings.
