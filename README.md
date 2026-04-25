# My Friends Are Late

A companion website for a YouTube video essay channel exploring the social dynamics of tardiness. Viewers submit entries about times a friend was late, receive a scientifically-calibrated **Tardiness Score**, and can share their verdict.

Live at **myfriendslate.com**

---

## What It Does

- **Submit an entry** — 3-step form covering the offender, what happened, and the excuse
- **Get a Tardiness Score (0–120+)** — a weighted formula using 5 components + contextual modifiers
- **Share your verdict** — screenshot-worthy result page, shareable link
- **Dashboard** — live aggregate stats, charts, and leaderboard
- **Hall of Fame** — the 25 most egregious acts of lateness ever submitted

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (Postgres) |
| Deployment | Vercel |
| Charts | Recharts |
| Fonts | Syne (display) + DM Sans (body) |
| Language | TypeScript |

---

## Scoring Formula

The Tardiness Score is calculated from 5 weighted components plus contextual modifiers.

### Components (0–100 each)

| Component | Weight | What it measures |
|---|---|---|
| Relative Lateness | 40% | Minutes late ÷ event duration. 5-minute grace period applied. |
| Event Severity | 20% | Hard-start events (flights, weddings, escape rooms) score higher |
| Their Role | 20% | Guest (33) → Driver/Organiser (67) → Host/Essential/GoH (100) |
| Excuse Quality | 10% | How avoidable was being late? No excuse = 65 |
| Notice Given | 10% | Called early (10) → No contact (100) |

### Modifiers (applied after base score)

| Modifier | Effect | Condition |
|---|---|---|
| Sincere apology | −10 pts | `apologised = yes_sincerely` |
| Hollow apology | +5 pts | `apologised = yes_hollow` |
| No-show | ×1.5 | `no_show = true` |
| 2–3 people waiting | ×1.15 | `people_waiting ≥ 2` |
| 4–7 people waiting | ×1.30 | `people_waiting ≥ 4` |
| 8+ people waiting | ×1.50 | `people_waiting ≥ 8` |
| Event not affected | ×0.85 | `event_impact = not_at_all` |
| Significantly impacted | ×1.10 | `event_impact = significantly` |
| Ruined the event | ×1.25 | `event_impact = ruined_it` |
| Repeat offender | ×1.10 | `repeat_offender = yes_occasionally` |
| Chronic offender | ×1.25 | `repeat_offender = yes_often` |
| Annoyance calibration | ×0.5–1.0 | Self-reported annoyance (0–10) |

Score is capped at 120. Display shows `120+` if exceeded.

### Verdict Tiers

| Score | Verdict |
|---|---|
| 0–15 | The Saint |
| 16–30 | The Fashionably Late |
| 31–50 | The Chronic Offender |
| 51–70 | The Disrespecter |
| 71–89 | The Repeat Criminal |
| 90–120+ | The Time Terrorist |

---

## Project Structure

```
/
├── src/app/
│   ├── page.tsx                  # Home page
│   ├── submit/page.tsx           # Submit form
│   ├── result/[id]/page.tsx      # Score result + share
│   ├── dashboard/page.tsx        # Live stats dashboard
│   ├── hall-of-fame/page.tsx     # Top 25 worst offenders
│   └── api/
│       ├── submit/route.ts       # POST — score + insert entry
│       └── stats/route.ts        # GET — aggregate dashboard data
├── src/components/
│   ├── SubmitForm/               # 3-step form (StepOne, StepTwo, StepThree)
│   ├── ScoreBreakdown.tsx        # Score component bars + modifiers
│   ├── VerdictBadge.tsx          # Coloured verdict chip
│   ├── ShareButton.tsx           # Copy link button
│   └── charts/                   # Recharts components for dashboard
├── lib/
│   ├── scoring.ts                # Full scoring formula (importable)
│   ├── types.ts                  # All TypeScript types
│   └── supabase.ts               # Supabase client
└── scripts/
    └── seed.js                   # Sample data seeding script
```

---

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run dev server
npm run dev
```

### Seed sample data
```bash
node scripts/seed.js
```

---

## Database

Hosted on Supabase (Postgres). Single `entries` table — see `claudeContext/SPEC.md` for full schema.

TypeScript build errors from Supabase's untyped client are suppressed via `next.config.mjs` (`typescript: { ignoreBuildErrors: true }`). Run codegen to resolve properly.

---

## Design

- **Palette:** Deep navy `#1B2A4A` + warm ember `#E8543A` on white
- **Typography:** Syne 700/800 for headings, DM Sans for body
- **Aesthetic:** Editorial brutalism — sharp borders, no border-radius, bold uppercase labels
- **Fonts loaded via:** `src/app/layout.tsx` Google Fonts import

---

## YouTube Channel

This site is a companion to a video essay channel exploring everyday social dynamics. The data collected here feeds future videos:

- *"The 5-minute forgiveness threshold"*
- *"Chronic offenders: nature or nurture?"*
- *"The excuse that always works (and the one that never does)"*
- *"Does being close to someone make lateness more forgivable?"*
