/**
 * Seed script — inserts 20 realistic sample entries into Supabase.
 * Usage: node scripts/seed.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// ── Read env ──────────────────────────────────────────────────────────────────
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}
envContent.split('\n').forEach(line => {
  const [key, ...rest] = line.split('=')
  if (key?.trim()) env[key.trim()] = rest.join('=').trim()
})

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

// ── Scoring constants (mirrors lib/scoring.ts) ────────────────────────────────
const EVENT_DURATION_MINUTES = {
  under_30: 25, '30_60': 45, '1_2hrs': 90, '2_4hrs': 180, half_day: 240, full_day: 480,
}
const EVENT_TYPE_SCORES = {
  casual: 20, dinner_home: 40, restaurant: 60, movie: 80, concert: 80,
  escape_room: 80, flight: 100, wedding: 100, professional: 100,
}
const IMPORTANCE_SCORES = {
  guest: 25, driver: 55, organiser: 55, host: 80, essential: 80, guest_of_honour: 80,
}
const EXCUSE_SCORES = {
  definitely_not: 0, probably_not: 20, maybe: 50, probably_yes: 75, definitely_yes: 100,
}
const NOTICE_TYPE_SCORES = {
  called_early: 10, called_late: 25, texted_early: 30, texted_late: 45, after_arriving: 70, no_contact: 100,
}

function getVerdict(score) {
  if (score <= 15) return 'saint'
  if (score <= 30) return 'fashionably_late'
  if (score <= 50) return 'chronic_offender'
  if (score <= 70) return 'disrespecter'
  if (score <= 89) return 'repeat_criminal'
  return 'time_terrorist'
}

function mapNoticeType(noticeType) {
  switch (noticeType) {
    case 'no_contact':    return { gave_notice: false, notice_timing: null,          notice_method: 'none' }
    case 'called_early':  return { gave_notice: true,  notice_timing: '30_60min',    notice_method: 'phone_call' }
    case 'called_late':   return { gave_notice: true,  notice_timing: 'under_10min', notice_method: 'phone_call' }
    case 'texted_early':  return { gave_notice: true,  notice_timing: '30_60min',    notice_method: 'text' }
    case 'texted_late':   return { gave_notice: true,  notice_timing: 'under_10min', notice_method: 'text' }
    case 'after_arriving':return { gave_notice: true,  notice_timing: 'after_agreed',notice_method: 'text' }
    default:              return { gave_notice: false, notice_timing: null,          notice_method: null }
  }
}

function computeScores({ event_duration, event_type, offender_role, no_show, minutes_late, notice_type, excuse_type, could_have_avoided, repeat_offender, annoyance_level }) {
  const eventDurationMinutes = EVENT_DURATION_MINUTES[event_duration]
  const minutesLateActual = no_show ? eventDurationMinutes : minutes_late

  const relativeTimeScore = Math.min(100, (minutesLateActual / eventDurationMinutes) * 100)
  const eventTypeScore = EVENT_TYPE_SCORES[event_type]
  const importanceScore = IMPORTANCE_SCORES[offender_role]

  let excuseScore
  if (!excuse_type || excuse_type === 'none') {
    excuseScore = 65
  } else {
    excuseScore = could_have_avoided ? EXCUSE_SCORES[could_have_avoided] : 50
  }

  const noticeScore = NOTICE_TYPE_SCORES[notice_type] ?? 100

  let finalScore =
    relativeTimeScore * 0.4 +
    eventTypeScore * 0.2 +
    importanceScore * 0.2 +
    excuseScore * 0.1 +
    noticeScore * 0.1

  if (no_show) finalScore *= 1.5
  if (repeat_offender === 'yes_often') finalScore += 10

  const annoyance = typeof annoyance_level === 'number' ? annoyance_level : 5
  const annoyanceMultiplier = Math.min(1.0, 0.5 + (annoyance / 10) * 0.7)
  finalScore *= annoyanceMultiplier

  const isExceeded = finalScore > 120
  finalScore = Math.min(120, finalScore)
  finalScore = Math.round(finalScore * 10) / 10

  return {
    relative_time_score: Math.round(relativeTimeScore * 10) / 10,
    event_type_score: eventTypeScore,
    importance_score: importanceScore,
    excuse_score: excuseScore,
    notice_score: noticeScore,
    final_score: finalScore,
    verdict: getVerdict(finalScore),
  }
}

// ── Sample data ───────────────────────────────────────────────────────────────
// Each entry represents a realistic lateness incident.
// Fields mirror FormData + DB columns. Scores are computed automatically.
const samples = [
  // ── SAINTS ───────────────────────────────────────────────────────────────────
  {
    offender_name: 'Sophie', offender_role: 'guest',
    event_description: 'Game night at mine', event_type: 'casual', event_duration: '1_2hrs',
    agreed_time: '19:00', actual_arrival: '19:03', no_show: false, minutes_late: 3,
    notice_type: 'called_early', excuse_type: 'emergency', could_have_avoided: 'definitely_not',
    apologised: 'yes_sincerely', repeat_offender: 'first_time', annoyance_level: 1,
    forgiven: 'yes_completely', extra_context: 'Her cat knocked over a candle — completely valid.',
    created_at: '2026-02-10T19:30:00Z',
  },
  {
    offender_name: 'Priya', offender_role: 'guest',
    event_description: 'Coffee catch-up', event_type: 'casual', event_duration: '1_2hrs',
    agreed_time: '11:00', actual_arrival: '11:05', no_show: false, minutes_late: 5,
    notice_type: 'called_early', excuse_type: 'traffic', could_have_avoided: 'probably_not',
    apologised: 'yes_sincerely', repeat_offender: 'first_time', annoyance_level: 2,
    forgiven: 'yes_completely', extra_context: null,
    created_at: '2026-02-14T11:15:00Z',
  },

  // ── FASHIONABLY LATE ──────────────────────────────────────────────────────────
  {
    offender_name: 'Tom', offender_role: 'guest',
    event_description: 'Morning team standup', event_type: 'professional', event_duration: '30_60',
    agreed_time: '09:00', actual_arrival: '09:08', no_show: false, minutes_late: 8,
    notice_type: 'called_early', excuse_type: 'emergency', could_have_avoided: 'definitely_not',
    apologised: 'yes_sincerely', repeat_offender: 'first_time', annoyance_level: 3,
    forgiven: 'mostly', extra_context: "Car wouldn't start in the cold.",
    created_at: '2026-02-18T09:15:00Z',
  },
  {
    offender_name: 'Mia', offender_role: 'guest',
    event_description: 'Birthday dinner', event_type: 'restaurant', event_duration: '2_4hrs',
    agreed_time: '19:30', actual_arrival: '19:42', no_show: false, minutes_late: 12,
    notice_type: 'texted_early', excuse_type: 'traffic', could_have_avoided: 'probably_not',
    apologised: 'yes_sincerely', repeat_offender: 'first_time', annoyance_level: 4,
    forgiven: 'mostly', extra_context: null,
    created_at: '2026-02-22T19:45:00Z',
  },
  {
    offender_name: 'Carlos', offender_role: 'guest',
    event_description: "Cousin's wedding ceremony", event_type: 'wedding', event_duration: 'full_day',
    agreed_time: '14:00', actual_arrival: '14:15', no_show: false, minutes_late: 15,
    notice_type: 'called_early', excuse_type: 'emergency', could_have_avoided: 'definitely_not',
    apologised: 'yes_sincerely', repeat_offender: 'first_time', annoyance_level: 5,
    forgiven: 'yes_completely', extra_context: 'GPS sent him to the wrong venue. Honest mistake.',
    created_at: '2026-03-01T14:30:00Z',
  },

  // ── CHRONIC OFFENDERS ────────────────────────────────────────────────────────
  {
    offender_name: 'Kate', offender_role: 'host',
    event_description: 'Sunday roast — she was hosting', event_type: 'dinner_home', event_duration: '1_2hrs',
    agreed_time: '14:00', actual_arrival: '14:25', no_show: false, minutes_late: 25,
    notice_type: 'texted_late', excuse_type: 'overslept', could_have_avoided: 'probably_yes',
    apologised: 'yes_hollow', repeat_offender: 'first_time', annoyance_level: 6,
    forgiven: 'mostly', extra_context: 'The host showed up 25 minutes after all of her guests.',
    created_at: '2026-03-05T14:30:00Z',
  },
  {
    offender_name: 'Dan', offender_role: 'driver',
    event_description: 'Taylor Swift Eras Tour — he was driving us', event_type: 'concert', event_duration: '2_4hrs',
    agreed_time: '17:30', actual_arrival: '17:50', no_show: false, minutes_late: 20,
    notice_type: 'texted_late', excuse_type: 'work', could_have_avoided: 'maybe',
    apologised: 'yes_sincerely', repeat_offender: 'first_time', annoyance_level: 7,
    forgiven: 'mostly', extra_context: 'We nearly missed the opener. He was the designated driver.',
    created_at: '2026-03-08T18:00:00Z',
  },
  {
    offender_name: 'Emma', offender_role: 'guest',
    event_description: 'Film screening', event_type: 'movie', event_duration: '1_2hrs',
    agreed_time: '20:00', actual_arrival: '20:15', no_show: false, minutes_late: 15,
    notice_type: 'after_arriving', excuse_type: 'forgot', could_have_avoided: 'definitely_yes',
    apologised: 'yes_hollow', repeat_offender: 'first_time', annoyance_level: 5,
    forgiven: 'mostly', extra_context: 'She forgot we even had plans until I called her.',
    created_at: '2026-03-12T20:20:00Z',
  },
  {
    offender_name: 'Liam', offender_role: 'guest',
    event_description: 'Escape room — booked for 6 people', event_type: 'escape_room', event_duration: '1_2hrs',
    agreed_time: '13:00', actual_arrival: '13:20', no_show: false, minutes_late: 20,
    notice_type: 'texted_late', excuse_type: 'other', could_have_avoided: 'maybe',
    apologised: 'yes_hollow', repeat_offender: 'yes_occasionally', annoyance_level: 6,
    forgiven: 'mostly', extra_context: null,
    created_at: '2026-03-14T13:25:00Z',
  },

  // ── DISRESPECTERS ────────────────────────────────────────────────────────────
  {
    offender_name: 'Marcus', offender_role: 'guest',
    event_description: 'Restaurant booking under my name', event_type: 'restaurant', event_duration: '1_2hrs',
    agreed_time: '19:00', actual_arrival: '19:25', no_show: false, minutes_late: 25,
    notice_type: 'no_contact', excuse_type: 'none', could_have_avoided: null,
    apologised: 'no', repeat_offender: 'yes_often', annoyance_level: 7,
    forgiven: 'holding_grudge', extra_context: "Didn't even apologise when he arrived. Just sat down and ordered.",
    created_at: '2026-03-15T19:30:00Z',
  },
  {
    offender_name: 'Jamie', offender_role: 'organiser',
    event_description: 'Cinema night she organised', event_type: 'movie', event_duration: '1_2hrs',
    agreed_time: '20:00', actual_arrival: '20:30', no_show: false, minutes_late: 30,
    notice_type: 'no_contact', excuse_type: 'none', could_have_avoided: null,
    apologised: 'yes_hollow', repeat_offender: 'first_time', annoyance_level: 8,
    forgiven: 'holding_grudge', extra_context: 'She planned the whole thing. Still half an hour late. Tickets were non-refundable.',
    created_at: '2026-03-18T20:35:00Z',
  },
  {
    offender_name: 'Zoe', offender_role: 'guest',
    event_description: 'Work presentation prep', event_type: 'professional', event_duration: '30_60',
    agreed_time: '10:00', actual_arrival: '10:15', no_show: false, minutes_late: 15,
    notice_type: 'texted_late', excuse_type: 'overslept', could_have_avoided: 'definitely_yes',
    apologised: 'yes_hollow', repeat_offender: 'yes_often', annoyance_level: 7,
    forgiven: 'holding_grudge', extra_context: 'Third time this month.',
    created_at: '2026-03-20T10:20:00Z',
  },

  // ── REPEAT CRIMINALS ─────────────────────────────────────────────────────────
  {
    offender_name: 'Chris', offender_role: 'organiser',
    event_description: 'Escape room booked for 8 people', event_type: 'escape_room', event_duration: '1_2hrs',
    agreed_time: '13:00', actual_arrival: '13:30', no_show: false, minutes_late: 30,
    notice_type: 'no_contact', excuse_type: 'forgot', could_have_avoided: 'definitely_yes',
    apologised: 'yes_hollow', repeat_offender: 'yes_often', annoyance_level: 8,
    forgiven: 'holding_grudge', extra_context: 'The group had to stall reception staff for 30 minutes.',
    created_at: '2026-03-22T13:35:00Z',
  },
  {
    offender_name: 'Lily', offender_role: 'essential',
    event_description: "Friend's 30th — she was the birthday girl's best friend", event_type: 'concert', event_duration: '2_4hrs',
    agreed_time: '18:00', actual_arrival: '18:45', no_show: false, minutes_late: 45,
    notice_type: 'no_contact', excuse_type: 'forgot', could_have_avoided: 'definitely_yes',
    apologised: 'no', repeat_offender: 'yes_often', annoyance_level: 9,
    forgiven: 'holding_grudge', extra_context: null,
    created_at: '2026-03-25T18:50:00Z',
  },
  {
    offender_name: 'Nick', offender_role: 'essential',
    event_description: 'Film screening — he had all the tickets', event_type: 'movie', event_duration: '1_2hrs',
    agreed_time: '19:30', actual_arrival: '20:10', no_show: false, minutes_late: 40,
    notice_type: 'no_contact', excuse_type: 'work', could_have_avoided: 'maybe',
    apologised: 'yes_sincerely', repeat_offender: 'yes_often', annoyance_level: 8,
    forgiven: 'unresolved', extra_context: 'Nobody could get in without him. We waited outside for 40 minutes.',
    created_at: '2026-03-28T20:15:00Z',
  },

  // ── TIME TERRORISTS ──────────────────────────────────────────────────────────
  {
    offender_name: 'Alex', offender_role: 'guest_of_honour',
    event_description: "Their own surprise birthday party", event_type: 'casual', event_duration: 'half_day',
    agreed_time: '20:00', actual_arrival: null, no_show: true, minutes_late: 240,
    notice_type: 'no_contact', excuse_type: 'none', could_have_avoided: null,
    apologised: 'no', repeat_offender: 'yes_often', annoyance_level: 10,
    forgiven: 'holding_grudge', extra_context: 'We spent three weeks planning a surprise party. They went to a different pub instead. We waited two hours.',
    created_at: '2026-04-01T21:00:00Z',
  },
  {
    offender_name: 'Ben', offender_role: 'organiser',
    event_description: "Group dinner — he made the reservation", event_type: 'restaurant', event_duration: '1_2hrs',
    agreed_time: '19:00', actual_arrival: null, no_show: true, minutes_late: 90,
    notice_type: 'no_contact', excuse_type: 'none', could_have_avoided: null,
    apologised: 'no', repeat_offender: 'yes_often', annoyance_level: 10,
    forgiven: 'holding_grudge', extra_context: 'He made the reservation, confirmed it the day before, then simply did not show up. The table was lost after 15 minutes.',
    created_at: '2026-04-03T19:15:00Z',
  },
  {
    offender_name: 'Ryan', offender_role: 'essential',
    event_description: "Birthday escape room — fully booked out", event_type: 'escape_room', event_duration: '1_2hrs',
    agreed_time: '15:00', actual_arrival: null, no_show: true, minutes_late: 90,
    notice_type: 'no_contact', excuse_type: 'none', could_have_avoided: null,
    apologised: 'no', repeat_offender: 'yes_often', annoyance_level: 10,
    forgiven: 'holding_grudge', extra_context: "Non-refundable. £180 split between the remaining group. He still hasn't explained himself.",
    created_at: '2026-04-05T15:15:00Z',
  },
  {
    offender_name: 'Mike', offender_role: 'host',
    event_description: 'Dinner party he invited us to', event_type: 'dinner_home', event_duration: '1_2hrs',
    agreed_time: '18:00', actual_arrival: null, no_show: true, minutes_late: 90,
    notice_type: 'no_contact', excuse_type: 'none', could_have_avoided: null,
    apologised: 'no', repeat_offender: 'yes_often', annoyance_level: 10,
    forgiven: 'holding_grudge', extra_context: 'Four people drove 45 minutes to his house. He was not there.',
    created_at: '2026-04-08T18:20:00Z',
  },
  {
    offender_name: 'Sarah', offender_role: 'driver',
    event_description: 'Airport pickup — 6am flight', event_type: 'flight', event_duration: '30_60',
    agreed_time: '04:00', actual_arrival: null, no_show: true, minutes_late: 45,
    notice_type: 'no_contact', excuse_type: 'none', could_have_avoided: null,
    apologised: 'no', repeat_offender: 'yes_often', annoyance_level: 10,
    forgiven: 'holding_grudge', extra_context: 'She was supposed to drive me to the airport at 4am. I had to get an emergency taxi and nearly missed the flight. She was asleep.',
    created_at: '2026-04-10T04:30:00Z',
  },
]

// ── Insert ─────────────────────────────────────────────────────────────────────
async function seed() {
  console.log(`Inserting ${samples.length} entries...\n`)

  let inserted = 0
  let failed = 0

  for (const sample of samples) {
    const scores = computeScores(sample)
    const notice = mapNoticeType(sample.notice_type)
    const gaveExcuse = sample.excuse_type && sample.excuse_type !== 'none'

    const row = {
      created_at: sample.created_at,
      offender_name: sample.offender_name,
      relationship: null,
      offender_role: sample.offender_role,
      event_description: sample.event_description,
      event_type: sample.event_type,
      agreed_time: sample.agreed_time,
      event_duration: sample.event_duration,
      people_waiting: 1,
      actual_arrival: sample.actual_arrival,
      no_show: sample.no_show,
      minutes_late: sample.minutes_late,
      gave_notice: notice.gave_notice,
      notice_timing: notice.notice_timing,
      notice_method: notice.notice_method,
      repeat_offender: sample.repeat_offender,
      gave_excuse: !!gaveExcuse,
      excuse_text: null,
      excuse_category: gaveExcuse ? sample.excuse_type : null,
      excuse_convincing: null,
      could_have_avoided: gaveExcuse ? (sample.could_have_avoided ?? null) : null,
      apologised: sample.apologised,
      annoyance_level: sample.annoyance_level,
      event_impact: null,
      forgiven: sample.forgiven,
      will_do_again: null,
      extra_context: sample.extra_context,
      ...scores,
    }

    const { error } = await supabase.from('entries').insert(row)
    if (error) {
      console.error(`✗ ${sample.offender_name}: ${error.message}`)
      failed++
    } else {
      console.log(`✓ ${sample.offender_name.padEnd(10)} | ${scores.verdict.padEnd(18)} | score: ${scores.final_score}`)
      inserted++
    }
  }

  console.log(`\nDone: ${inserted} inserted, ${failed} failed.`)
}

seed().catch(console.error)
