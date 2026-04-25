import type {
  FormData,
  ScoreComponents,
  ScoreModifier,
  VerdictKey,
  EventDuration,
  EventType,
  OffenderRole,
  NoticeType,
  CouldHaveAvoided,
} from './types'

// ---------------------------------------------------------------------------
// Lookup tables
// ---------------------------------------------------------------------------

export const EVENT_DURATION_MINUTES: Record<EventDuration, number> = {
  under_30: 25,
  '30_60': 45,
  '1_2hrs': 90,
  '2_4hrs': 180,
  half_day: 240,
  full_day: 480,
}

export const EVENT_TYPE_SCORES: Record<EventType, number> = {
  casual:       20,   // low stakes; social norms allow significant flex
  dinner_home:  40,   // more structured but still relaxed
  restaurant:   70,   // table holds for ~15 min; reservation has real cost
  movie:        75,   // soft hard-start; you can still take your seat
  concert:      80,   // harder start; you miss the opener
  escape_room: 100,   // paid fixed slot — the purest hard-start event
  flight:      100,   // zero tolerance; you miss the plane
  wedding:     100,   // formal ceremony; someone's most important day
  professional: 90,   // research: 10 min causes measurable satisfaction drop
}

export const IMPORTANCE_SCORES: Record<OffenderRole, number> = {
  guest:           33,
  driver:          60,   // slightly lower than organiser — their absence delays, not destroys
  organiser:       67,
  host:           100,
  essential:      100,
  guest_of_honour: 100,
}

const EXCUSE_SCORES: Record<CouldHaveAvoided, number> = {
  definitely_not:  0,
  probably_not:   20,
  maybe:          50,
  probably_yes:   75,
  definitely_yes: 100,
}

// Combined notice question maps directly to a notice score (0–100)
export const NOTICE_TYPE_SCORES: Record<NoticeType, number> = {
  called_early:   10,  // called 30+ min before — best possible
  called_late:    25,  // called <30 min before
  texted_early:   30,  // texted 30+ min before
  texted_late:    45,  // texted <30 min before
  after_arriving: 70,  // told them after arriving late
  no_contact:    100,  // nothing — worst possible
}

// Research-backed grace periods per event type (minutes before lateness "counts").
// Casual social events: 15-30 min is socially acceptable in Western cultures (cross-cultural
// study, Sage 2024). Hard-start events (flights, escape rooms) have zero tolerance.
// Professional: 10 min causes measurable satisfaction/effectiveness drops (PubMed 2024).
const GRACE_PERIOD: Record<EventType, number> = {
  casual:        15,  // research: 15-30 min fine for casual social hangouts
  dinner_home:   10,  // more structured; host has prepared
  restaurant:     8,  // table holds ~10-15 min; 8 min feels right
  movie:          5,  // soft hard-start — you can still walk in
  concert:        5,  // same — opener may already be on
  escape_room:    2,  // paid fixed slot; staff can't wait
  flight:         0,  // plane doesn't wait
  wedding:        5,  // ceremony is formal; small buffer only
  professional:   5,  // 10 min = measurable impact; 5 min grace is fair
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function calculateMinutesLate(agreedTime: string, actualArrival: string): number {
  const [ah, am] = agreedTime.split(':').map(Number)
  const [rh, rm] = actualArrival.split(':').map(Number)
  const agreedMinutes = ah * 60 + am
  const actualMinutes = rh * 60 + rm
  let diff = actualMinutes - agreedMinutes
  if (diff < 0) diff += 24 * 60 // crossed midnight
  return Math.max(0, diff)
}

// ---------------------------------------------------------------------------
// Main calculator
// ---------------------------------------------------------------------------

export function calculateScore(data: Partial<FormData>): ScoreComponents | null {
  if (
    !data.event_duration ||
    !data.event_type ||
    !data.offender_role ||
    !data.agreed_time ||
    (!data.no_show && !data.actual_arrival)
  ) {
    return null
  }

  const eventDurationMinutes = EVENT_DURATION_MINUTES[data.event_duration]

  const minutesLate = data.no_show
    ? eventDurationMinutes
    : calculateMinutesLate(data.agreed_time!, data.actual_arrival!)

  // 1. Relative Time Score (40%)
  // Grace period varies by event type — research shows casual gatherings tolerate 15 min,
  // while hard-start events have near-zero tolerance. Ramp (×1.15) compensates for the
  // grace offset to preserve the 100 cap on genuinely severe lateness.
  const grace = GRACE_PERIOD[data.event_type]
  const adjustedMinutes = Math.max(0, minutesLate - grace)
  const relativeTimeScore = Math.min(100, (adjustedMinutes / eventDurationMinutes) * 115)

  // 2. Event Type Score (20%)
  const eventTypeScore = EVENT_TYPE_SCORES[data.event_type]

  // 3. Individual Importance Score (20%)
  const importanceScore = IMPORTANCE_SCORES[data.offender_role]

  // 4. Excuse Score (10%)
  let excuseScore: number
  if (!data.excuse_type || data.excuse_type === 'none') {
    excuseScore = 65 // no excuse given — scored poorly but not maximally
  } else {
    excuseScore = data.could_have_avoided
      ? EXCUSE_SCORES[data.could_have_avoided]
      : 50
  }

  // 5. Notice Quality Score (10%)
  const noticeScore = data.notice_type
    ? NOTICE_TYPE_SCORES[data.notice_type]
    : 100 // no answer = assume no contact

  // Final weighted formula
  let finalScore =
    relativeTimeScore * 0.4 +
    eventTypeScore * 0.2 +
    importanceScore * 0.2 +
    excuseScore * 0.1 +
    noticeScore * 0.1

  const modifiers: ScoreModifier[] = []

  // ── Apology modifier ──
  // Meta-analysis (r=.32 effect on forgiveness): a sincere apology is meaningful mitigation.
  // A hollow one signals awareness without ownership — often worse than silence.
  if (data.apologised === 'yes_sincerely') {
    finalScore = Math.max(0, finalScore - 10)
    modifiers.push({ label: 'Sincere apology', value: '−10 pts', positive: true })
  } else if (data.apologised === 'yes_hollow') {
    finalScore += 4
    modifiers.push({ label: 'Hollow apology', value: '+4 pts', positive: false })
  }

  // ── No-show multiplier ──
  // A no-show is qualitatively different from being late — it's an absence of commitment.
  // Multiplier is firm but not as extreme as before; the base score already reflects severity.
  if (data.no_show) {
    finalScore *= 1.35
    modifiers.push({ label: 'No-show', value: '×1.35', positive: false })
  }

  // ── People waiting multiplier ──
  // Social cost scales with audience size (person-minutes of wasted time).
  // Reduced upper end — the base score already captures event severity.
  const peopleWaiting = typeof data.people_waiting === 'number' ? data.people_waiting : 1
  let groupMultiplier = 1.0
  if (peopleWaiting >= 8)      groupMultiplier = 1.4
  else if (peopleWaiting >= 4) groupMultiplier = 1.2
  else if (peopleWaiting >= 2) groupMultiplier = 1.1
  if (groupMultiplier > 1.0) {
    finalScore *= groupMultiplier
    modifiers.push({
      label: `${peopleWaiting}${peopleWaiting >= 8 ? '+' : ''} people kept waiting`,
      value: `×${groupMultiplier}`,
      positive: false,
    })
  }

  // ── Event impact multiplier ──
  // Actual harm matters. "Ruined it" and "not at all" are very different outcomes.
  // Reduced from previous version — impact is already partly captured by event type score.
  const eventImpact = data.event_impact
  if (eventImpact === 'not_at_all') {
    finalScore *= 0.80
    modifiers.push({ label: 'No real impact on event', value: '×0.80', positive: true })
  } else if (eventImpact === 'significantly') {
    finalScore *= 1.07
    modifiers.push({ label: 'Significantly impacted event', value: '×1.07', positive: false })
  } else if (eventImpact === 'ruined_it') {
    finalScore *= 1.18
    modifiers.push({ label: 'Ruined the event', value: '×1.18', positive: false })
  }

  // ── Repeat offender (multiplicative) ──
  // Attribution theory: a first offense is circumstantial; a pattern is dispositional.
  // Research: only 15-20% of adults are truly chronic laters (planning fallacy, not character).
  // Multiplier is meaningful but less aggressive — patterns should compound, not detonate.
  if (data.repeat_offender === 'yes_often') {
    finalScore *= 1.18
    modifiers.push({ label: 'Chronic offender', value: '×1.18', positive: false })
  } else if (data.repeat_offender === 'yes_occasionally') {
    finalScore *= 1.08
    modifiers.push({ label: 'Repeat offender', value: '×1.08', positive: false })
  }

  // ── Annoyance calibration ──
  // Self-reported reaction calibrates the objective score to the submitter's experience.
  // annoyance=0 → ×0.45 (heavily discounted), annoyance=10 → ×1.0 (unchanged)
  // Slightly wider range than before — very low annoyance should meaningfully dampen.
  const annoyance = typeof data.annoyance_level === 'number' ? data.annoyance_level : 5
  const annoyanceMultiplier = Math.min(1.0, 0.45 + (annoyance / 10) * 0.55)
  finalScore *= annoyanceMultiplier

  const isExceeded = finalScore > 120
  finalScore = Math.min(120, finalScore)
  finalScore = Math.round(finalScore * 10) / 10

  return {
    relativeTimeScore: Math.round(relativeTimeScore * 10) / 10,
    eventTypeScore,
    importanceScore,
    excuseScore,
    noticeScore,
    finalScore,
    verdict: getVerdict(finalScore),
    minutesLate,
    isExceeded,
    modifiers,
  }
}

// ---------------------------------------------------------------------------
// Verdict
// ---------------------------------------------------------------------------

// Thresholds calibrated against research benchmarks:
// — 10 min is the empirical frustration onset (cross-cultural study, 1,432 workers)
// — 15-20 min is the Western cultural threshold for "clearly rude"
// — Only ~15-20% of adults are chronic laters; most lateness is situational
// Time Terrorist reserved for genuinely egregious cases — should be rare.
export function getVerdict(score: number): VerdictKey {
  if (score <= 22) return 'saint'
  if (score <= 40) return 'fashionably_late'
  if (score <= 58) return 'chronic_offender'
  if (score <= 75) return 'disrespecter'
  if (score <= 92) return 'repeat_criminal'
  return 'time_terrorist'
}

export const VERDICT_LABELS: Record<VerdictKey, string> = {
  saint:            'The Saint',
  fashionably_late: 'The Fashionably Late',
  chronic_offender: 'The Inconsiderate',
  disrespecter:     'The Disrespecter',
  repeat_criminal:  'The Repeat Criminal',
  time_terrorist:   'The Time Terrorist',
}

export const VERDICT_DESCRIPTIONS: Record<VerdictKey, string> = {
  saint:
    'Within normal tolerance. Life happens — this barely registers. You might owe them an apology.',
  fashionably_late:
    'A minor infraction. Annoying in the moment, forgettable by next week. Not worth a grudge.',
  chronic_offender:
    "Genuinely inconsiderate. The context made it worse than just the minutes. Worth a conversation.",
  disrespecter:
    "This crossed a line. It wasn't just late — it showed a lack of respect for your time and the event.",
  repeat_criminal:
    "A serious breach of trust. Whether this is a pattern or a one-off disaster, the damage is real.",
  time_terrorist:
    "This is beyond lateness. This is a statement. Reserved for the truly egregious. Forgiveness is optional.",
}

// Tailwind class sets per verdict
export const VERDICT_STYLES: Record<
  VerdictKey,
  { bg: string; text: string; border: string; badge: string; score: string }
> = {
  saint: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-300',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    score: 'text-emerald-600',
  },
  fashionably_late: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-300',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    score: 'text-amber-600',
  },
  chronic_offender: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    border: 'border-orange-300',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
    score: 'text-orange-600',
  },
  disrespecter: {
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-300',
    badge: 'bg-red-100 text-red-700 border-red-300',
    score: 'text-red-600',
  },
  repeat_criminal: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-400',
    badge: 'bg-red-200 text-red-900 border-red-400',
    score: 'text-red-700',
  },
  time_terrorist: {
    bg: 'bg-gray-950',
    text: 'text-red-400',
    border: 'border-red-900',
    badge: 'bg-gray-900 text-red-400 border-red-800',
    score: 'text-red-400',
  },
}
