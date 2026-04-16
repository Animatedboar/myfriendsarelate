'use client'

import type { FormData, EventType, EventDuration } from '../../../lib/types'

interface Props {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}

const eventTypes: { value: EventType; label: string; hint: string }[] = [
  { value: 'casual', label: 'Casual Hangout', hint: 'Flexible by nature' },
  { value: 'dinner_home', label: 'Dinner at Home', hint: 'Food waits for no one' },
  { value: 'restaurant', label: 'Restaurant Reservation', hint: 'Booked in advance' },
  { value: 'movie', label: 'Movie or Theatre', hint: 'Hard start time' },
  { value: 'concert', label: 'Concert or Sports', hint: 'Doors close' },
  { value: 'escape_room', label: 'Escape Room', hint: 'Time slot is fixed' },
  { value: 'flight', label: 'Flight or Transport', hint: 'Leaves without you' },
  { value: 'wedding', label: 'Wedding or Formal', hint: 'Unforgivable territory' },
  { value: 'professional', label: 'Job or Professional', hint: 'Career on the line' },
]

const durations: { value: EventDuration; label: string }[] = [
  { value: 'under_30', label: 'Under 30 min' },
  { value: '30_60', label: '30–60 min' },
  { value: '1_2hrs', label: '1–2 hours' },
  { value: '2_4hrs', label: '2–4 hours' },
  { value: 'half_day', label: 'Half day' },
  { value: 'full_day', label: 'Full day or more' },
]

export default function StepEvent({ data, onChange }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <label className="form-label">What was the event? <span className="font-normal text-gray-400">(optional)</span></label>
        <p className="form-hint mb-2">
          e.g. &ldquo;Slay the Spire gaming session&rdquo;, &ldquo;birthday dinner&rdquo;, &ldquo;escape room&rdquo;
        </p>
        <input
          type="text"
          className="form-input"
          placeholder="Brief description..."
          value={data.event_description}
          onChange={(e) => onChange({ event_description: e.target.value })}
          maxLength={100}
        />
      </div>

      <div>
        <label className="form-label">Event type</label>
        <p className="form-hint mb-2">A movie has a hard start. A house party doesn&apos;t. This matters.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className="form-label">Agreed start time</label>
          <input
            type="time"
            className="form-input"
            value={data.agreed_time}
            onChange={(e) => onChange({ agreed_time: e.target.value })}
          />
        </div>

        <div>
          <label className="form-label">How long was the event expected to last?</label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {durations.map((d) => (
              <button
                key={d.value}
                type="button"
                className={`option-btn ${data.event_duration === d.value ? 'selected' : ''}`}
                onClick={() => onChange({ event_duration: d.value })}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className="form-label">How many people were waiting for them?</label>
        <input
          type="number"
          className="form-input"
          min={1}
          max={500}
          value={data.people_waiting}
          onChange={(e) => onChange({ people_waiting: Math.max(1, parseInt(e.target.value) || 1) })}
          style={{ maxWidth: '120px' }}
        />
        <p className="form-hint">Every extra person waiting makes it worse.</p>
      </div>
    </div>
  )
}
