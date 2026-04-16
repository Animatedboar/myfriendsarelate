import type {
  FormData,
  ScoreComponents,
  VerdictKey,
  EventDuration,
  EventType,
  OffenderRole,
  NoticeTiming,
  NoticeMethod,
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
  restaurant: 60,
  movie: 80,
  concert: 80,
  escape_room: 80,
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

const NOTICE_TIMING_SCORES: Record<NoticeTiming, number> = {
  over_1hr: 0,
  '30_60min': 10,
  '10_30min': 25,
  under_10min: 40,
  after_agreed: 50,
}

const NOTICE_METHOD_SCORES: Record<NoticeMethod, number> = {
  phone_call: 0,
  text: 20,
  none: 50,
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
  const relativeTimeScore = Math.min(100, (minutesLate / eventDurationMinutes) * 100)

  // 2. Event Type Score (20%)
  const eventTypeScore = EVENT_TYPE_SCORES[data.event_type]

  // 3. Individual Importance Score (20%)
  const importanceScore = IMPORTANCE_SCORES[data.offender_role]

  // 4. Excuse Score (10%)
  let excuseScore: number
  if (!data.gave_excuse) {
    excuseScore = 85 // no excuse given — worse than most excuses
  } else {
    excuseScore = data.could_have_avoided
      ? EXCUSE_SCORES[data.could_have_avoided]
      : 50
  }

  // 5. Notice Quality Score (10%) — timing (0–50) + method (0–50) = 0–100
  let noticeScore: number
  if (!data.gave_notice) {
    noticeScore = 100 // worst possible — no notice at all
  } else {
    const timingScore = data.notice_timing
      ? NOTICE_TIMING_SCORES[data.notice_timing]
      : 50
    const methodScore = data.notice_method
      ? NOTICE_METHOD_SCORES[data.notice_method]
      : 50
    noticeScore = timingScore + methodScore
  }

  // Final weighted formula
  let finalScore =
    relativeTimeScore * 0.4 +
    eventTypeScore * 0.2 +
    importanceScore * 0.2 +
    excuseScore * 0.1 +
    noticeScore * 0.1

  // Modifiers
  if (data.no_show) finalScore *= 1.5
  if (data.repeat_offender === 'yes_often') finalScore += 20

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
