'use client'

import type { FormData, OffenderRole, Relationship, EventType, EventDuration } from '../../../lib/types'

interface Props {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}

const relationships: { value: Relationship; label: string }[] = [
  { value: 'stranger',     label: 'Stranger' },
  { value: 'acquaintance', label: 'Acquaintance' },
  { value: 'friend',       label: 'Friend' },
  { value: 'close_friend', label: 'Close Friend' },
  { value: 'best_friend',  label: 'Best Friend' },
  { value: 'partner',      label: 'Partner' },
  { value: 'family',       label: 'Family' },
]

const roles: { value: OffenderRole; label: string; hint: string }[] = [
  { value: 'guest',           label: 'Regular Guest',   hint: 'Just attending' },
  { value: 'host',            label: 'Host',            hint: 'Running the thing' },
  { value: 'essential',       label: 'Essential',       hint: "Can't start without them" },
  { value: 'guest_of_honour', label: 'Guest of Honour', hint: 'The whole point' },
  { value: 'driver',          label: 'Driver',          hint: 'Everyone needed a lift' },
  { value: 'organiser',       label: 'Organiser',       hint: 'Their plans, their chaos' },
]

const eventTypes: { value: EventType; label: string; hint: string }[] = [
  { value: 'casual',       label: 'Casual Hangout',    hint: 'Flexible by nature' },
  { value: 'dinner_home',  label: 'Dinner at Home',    hint: 'Food waits for no one' },
  { value: 'restaurant',   label: 'Restaurant',        hint: 'Reservation on the line' },
  { value: 'movie',        label: 'Movie / Theatre',   hint: 'Hard start time' },
  { value: 'concert',      label: 'Concert / Sports',  hint: 'Doors close' },
  { value: 'escape_room',  label: 'Escape Room',       hint: 'Paid slot — clock starts without you' },
  { value: 'flight',       label: 'Flight / Transport', hint: 'Leaves without you' },
  { value: 'wedding',      label: 'Wedding / Formal',  hint: 'Unforgivable territory' },
  { value: 'professional', label: 'Job / Professional', hint: 'Career on the line' },
]

const durations: { value: EventDuration; label: string }[] = [
  { value: 'under_30', label: 'Under 30 min' },
  { value: '30_60',    label: '30–60 min' },
  { value: '1_2hrs',   label: '1–2 hours' },
  { value: '2_4hrs',   label: '2–4 hours' },
  { value: 'half_day', label: 'Half day' },
  { value: 'full_day', label: 'Full day+' },
]

// Maps display bucket → exact number stored (aligns with scoring multiplier tiers)
const waitingOptions: { label: string; hint: string; value: number }[] = [
  { value: 1,  label: 'Just me',      hint: 'One-on-one' },
  { value: 2,  label: '2–3 people',   hint: 'Small group' },
  { value: 4,  label: '4–7 people',   hint: 'Medium group' },
  { value: 8,  label: '8+ people',    hint: 'Everyone was waiting' },
]

export default function StepOne({ data, onChange }: Props) {
  return (
    <div className="space-y-8">

      <div>
        <label className="form-label">Their name or alias</label>
        <input
          type="text"
          className="form-input"
          placeholder="e.g. Dave, The Perpetrator, My Flatmate"
          value={data.offender_name}
          onChange={(e) => onChange({ offender_name: e.target.value })}
          maxLength={50}
        />
      </div>

      <div>
        <label className="form-label">How well do you know them?</label>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mt-1">
          {relationships.map((r) => (
            <button
              key={r.value}
              type="button"
              className={`option-btn text-center ${data.relationship === r.value ? 'selected' : ''}`}
              onClick={() => onChange({ relationship: r.value })}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">What role did they have?</label>
        <p className="form-hint mb-2">Not how close you are — what were they actually supposed to do?</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {roles.map((r) => (
            <button
              key={r.value}
              type="button"
              className={`option-btn flex flex-col items-start gap-0.5 ${data.offender_role === r.value ? 'selected' : ''}`}
              onClick={() => onChange({ offender_role: r.value })}
            >
              <span className="font-semibold">{r.label}</span>
              <span className="text-xs opacity-60">{r.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">
          What was the event? <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <input
          type="text"
          className="form-input"
          placeholder='e.g. "Slay the Spire night", "birthday dinner", "job interview"'
          value={data.event_description}
          onChange={(e) => onChange({ event_description: e.target.value })}
          maxLength={100}
        />
      </div>

      <div>
        <label className="form-label">Event type</label>
        <p className="form-hint mb-2">A movie has a hard start. A house party doesn&apos;t. This matters.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {eventTypes.map((e) => (
            <button
              key={e.value}
              type="button"
              className={`option-btn flex flex-col items-start gap-0.5 ${data.event_type === e.value ? 'selected' : ''}`}
              onClick={() => onChange({ event_type: e.value })}
            >
              <span className="font-semibold">{e.label}</span>
              <span className="text-xs opacity-60">{e.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">How long was the event expected to last?</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-1">
          {durations.map((d) => (
            <button
              key={d.value}
              type="button"
              className={`option-btn text-center ${data.event_duration === d.value ? 'selected' : ''}`}
              onClick={() => onChange({ event_duration: d.value })}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">How many people were kept waiting?</label>
        <p className="form-hint mb-2">10 people waiting 15 minutes is 150 person-minutes of disrespect.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
          {waitingOptions.map((w) => (
            <button
              key={w.value}
              type="button"
              className={`option-btn flex flex-col items-start gap-0.5 ${data.people_waiting === w.value ? 'selected' : ''}`}
              onClick={() => onChange({ people_waiting: w.value })}
            >
              <span className="font-semibold">{w.label}</span>
              <span className="text-xs opacity-60">{w.hint}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
