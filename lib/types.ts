export type Relationship =
  | 'stranger'
  | 'acquaintance'
  | 'friend'
  | 'close_friend'
  | 'best_friend'
  | 'partner'
  | 'family'

export type OffenderRole =
  | 'guest'
  | 'host'
  | 'essential'
  | 'guest_of_honour'
  | 'driver'
  | 'organiser'

export type EventType =
  | 'casual'
  | 'dinner_home'
  | 'restaurant'
  | 'movie'
  | 'concert'
  | 'escape_room'
  | 'flight'
  | 'wedding'
  | 'professional'

export type EventDuration =
  | 'under_30'
  | '30_60'
  | '1_2hrs'
  | '2_4hrs'
  | 'half_day'
  | 'full_day'

export type NoticeTiming =
  | 'over_1hr'
  | '30_60min'
  | '10_30min'
  | 'under_10min'
  | 'after_agreed'

export type NoticeMethod = 'phone_call' | 'text' | 'none'

export type RepeatOffender =
  | 'yes_often'
  | 'yes_occasionally'
  | 'first_time'
  | 'not_sure'

export type ExcuseCategory =
  | 'emergency'
  | 'traffic'
  | 'work'
  | 'forgot'
  | 'overslept'
  | 'other'

export type CouldHaveAvoided =
  | 'definitely_not'
  | 'probably_not'
  | 'maybe'
  | 'probably_yes'
  | 'definitely_yes'

export type Apologised = 'yes_sincerely' | 'yes_hollow' | 'no'

export type EventImpact = 'not_at_all' | 'slightly' | 'significantly' | 'ruined_it'

export type Forgiven =
  | 'yes_completely'
  | 'mostly'
  | 'holding_grudge'
  | 'unresolved'

export type WillDoAgain = 'no' | 'probably_not' | 'probably' | 'definitely'

export type VerdictKey =
  | 'saint'
  | 'fashionably_late'
  | 'chronic_offender'
  | 'disrespecter'
  | 'repeat_criminal'
  | 'time_terrorist'

export interface FormData {
  // Section 1: About the Offender
  offender_name: string
  relationship: Relationship | ''
  offender_role: OffenderRole | ''

  // Section 2: About the Event
  event_description: string
  event_type: EventType | ''
  agreed_time: string
  event_duration: EventDuration | ''
  people_waiting: number

  // Section 3: About the Lateness
  actual_arrival: string
  no_show: boolean
  gave_notice: boolean
  notice_timing: NoticeTiming | ''
  notice_method: NoticeMethod | ''
  repeat_offender: RepeatOffender | ''

  // Section 4: About the Excuse
  gave_excuse: boolean
  excuse_text: string
  excuse_category: ExcuseCategory | ''
  excuse_convincing: number
  could_have_avoided: CouldHaveAvoided | ''
  apologised: Apologised | ''

  // Section 5: Your Reaction
  annoyance_level: number
  event_impact: EventImpact | ''
  forgiven: Forgiven | ''
  will_do_again: WillDoAgain | ''
  extra_context: string
}

export interface ScoreComponents {
  relativeTimeScore: number
  eventTypeScore: number
  importanceScore: number
  excuseScore: number
  noticeScore: number
  finalScore: number
  verdict: VerdictKey
  minutesLate: number
  isExceeded: boolean // score hit 120 cap
}

export interface Entry {
  id: string
  created_at: string
  offender_name: string
  relationship: Relationship
  offender_role: OffenderRole
  event_description: string | null
  event_type: EventType
  agreed_time: string
  event_duration: EventDuration
  people_waiting: number
  actual_arrival: string | null
  no_show: boolean
  minutes_late: number | null
  gave_notice: boolean
  notice_timing: NoticeTiming | null
  notice_method: NoticeMethod | null
  repeat_offender: RepeatOffender
  gave_excuse: boolean
  excuse_text: string | null
  excuse_category: ExcuseCategory | null
  excuse_convincing: number | null
  could_have_avoided: CouldHaveAvoided | null
  apologised: Apologised | null
  annoyance_level: number
  event_impact: EventImpact
  forgiven: Forgiven
  will_do_again: WillDoAgain
  extra_context: string | null
  relative_time_score: number
  event_type_score: number
  importance_score: number
  excuse_score: number
  notice_score: number
  final_score: number
  verdict: VerdictKey
}

export interface StatsResponse {
  totalEntries: number
  averageScore: number
  verdictDistribution: { verdict: VerdictKey; count: number }[]
  scoreByEventType: { event_type: EventType; avg_score: number; count: number }[]
  toleranceCurve: { bracket: string; avg_annoyance: number; count: number }[]
  forgivenessRate: { excuse_category: ExcuseCategory | 'no_excuse'; forgiven_rate: number; count: number }[]
  topOffenders: Entry[]
}
