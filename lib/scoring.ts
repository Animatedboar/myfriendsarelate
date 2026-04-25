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
  casual: 20,
  dinner_home: 40,
  restaurant: 80,   // raised: table reservations have a hard 15-min hold window
  movie: 80,
  concert: 80,
  escape_room: 100, // raised: paid, fixed time slot — the purest hard-start event
  flight: 100,
  wedding: 100,
  professional: 100,
}

export const IMPORTANCE_SCORES: Record<OffenderRole, number> = {
  guest: 33,
  driver: 67,
  organiser: 67,
  host: 100,
  essential: 100,
  guest_of_honour: 100,
}

const EXCUSE_SCORES: Record<CouldHaveAvoided, number> = {
  definitely_not: 0,
  probably_not: 20,
  maybe: 50,
  probably_yes: 75,
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
  // 5-minute grace period — research shows people mentally round ≤5 min to "on time".
  // Slightly steeper ramp (×1.15) to compensate, preserving the 100 cap.
  const adjustedMinutes = Math.max(0, minutesLate - 5)
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
  // A sincere apology is meaningful mitigation. A hollow one signals awareness
  // of wrongdoing without ownership — often worse than silence.
  if (data.apologised === 'yes_sincerely') {
    finalScore = Math.max(0, finalScore - 10)
    modifiers.push({ label: 'Sincere apology', value: '−10 pts', positive: true })
  } else if (data.apologised === 'yes_hollow') {
    finalScore += 5
    modifiers.push({ label: 'Hollow apology', value: '+5 pts', positive: false })
  }

  // ── No-show multiplier ──
  if (data.no_show) {
    finalScore *= 1.5
    modifiers.push({ label: 'No-show', value: '×1.5', positive: false })
  }

  // ── People waiting multiplier ──
  // Social cost scales with audience size. 8 people waiting 15 min = 120 person-minutes.
  const peopleWaiting = typeof data.people_waiting === 'number' ? data.people_waiting : 1
  let groupMultiplier = 1.0
  if (peopleWaiting >= 8)      groupMultiplier = 1.5
  else if (peopleWaiting >= 4) groupMultiplier = 1.3
  else if (peopleWaiting >= 2) groupMultiplier = 1.15
  if (groupMultiplier > 1.0) {
    finalScore *= groupMultiplier
    modifiers.push({
      label: `${peopleWaiting}${peopleWaiting >= 8 ? '+' : ''} people kept waiting`,
      value: `×${groupMultiplier}`,
      positive: false,
    })
  }

  // ── Event impact multiplier ──
  // The actual harm caused matters. "Ruined it entirely" vs "not at all" are very different.
  const eventImpact = data.event_impact
  if (eventImpact === 'not_at_all') {
    finalScore *= 0.85
    modifiers.push({ label: 'No real impact on event', value: '×0.85', positive: true })
  } else if (eventImpact === 'significantly') {
    finalScore *= 1.1
    modifiers.push({ label: 'Significantly impacted event', value: '×1.1', positive: false })
  } else if (eventImpact === 'ruined_it') {
    finalScore *= 1.25
    modifiers.push({ label: 'Ruined the event', value: '×1.25', positive: false })
  }
  // 'slightly' = neutral (×1.0), no modifier shown

  // ── Repeat offender (multiplicative) ──
  // Attribution theory: a first offense is circumstantial; a pattern is dispositional.
  // A multiplier better captures this qualitative shift than a flat additive bonus.
  if (data.repeat_offender === 'yes_often') {
    finalScore *= 1.25
    modifiers.push({ label: 'Chronic offender', value: '×1.25', positive: false })
  } else if (data.repeat_offender === 'yes_occasionally') {
    finalScore *= 1.1
    modifiers.push({ label: 'Repeat offender', value: '×1.1', positive: false })
  }

  // ── Annoyance multiplier ──
  // Self-reported reaction calibrates the objective score.
  // annoyance=0 → ×0.5 (halved), annoyance=10 → ×1.0 (unchanged)
  const annoyance = typeof data.annoyance_level === 'number' ? data.annoyance_level : 5
  const annoyanceMultiplier = Math.min(1.0, 0.5 + (annoyance / 10) * 0.5)
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

export function getVerdict(score: number): VerdictKey {
  if (score <= 15) return 'saint'
  if (score <= 30) return 'fashionably_late'
  if (score <= 50) return 'chronic_offender'
  if (score <= 70) return 'disrespecter'
  if (score <= 89) return 'repeat_criminal'
  return 'time_terrorist'
}

export const VERDICT_LABELS: Record<VerdictKey, string> = {
  saint: 'The Saint',
  fashionably_late: 'The Fashionably Late',
  chronic_offender: 'The Chronic Offender',
  disrespecter: 'The Disrespecter',
  repeat_criminal: 'The Repeat Criminal',
  time_terrorist: 'The Time Terrorist',
}

export const VERDICT_DESCRIPTIONS: Record<VerdictKey, string> = {
  saint: 'Barely late, great excuse, gave plenty of notice. You might owe them an apology.',
  fashionably_late: 'A minor infraction. Annoying, sure, but not worth a grudge.',
  chronic_offender: "This is becoming a pattern. The event felt it. The data has spoken.",
  disrespecter: "This wasn't just late — this was inconsiderate. The context makes it worse.",
  repeat_criminal: "A serious breach. Multiple factors aligned against you. Consider having words.",
  time_terrorist: "This is beyond lateness. This is a statement. Forgiveness is optional.",
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
