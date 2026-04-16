'use client'

import type { FormData, Relationship, OffenderRole } from '../../../lib/types'

interface Props {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}

const relationships: { value: Relationship; label: string }[] = [
  { value: 'stranger', label: 'Stranger' },
  { value: 'acquaintance', label: 'Acquaintance' },
  { value: 'friend', label: 'Friend' },
  { value: 'close_friend', label: 'Close Friend' },
  { value: 'best_friend', label: 'Best Friend' },
  { value: 'partner', label: 'Partner' },
  { value: 'family', label: 'Family' },
]

const roles: { value: OffenderRole; label: string; hint: string }[] = [
  { value: 'guest', label: 'Regular Guest', hint: 'Just attending' },
  { value: 'host', label: 'Host', hint: 'Running the thing' },
  { value: 'essential', label: 'Essential', hint: "Can't start without them" },
  { value: 'guest_of_honour', label: 'Guest of Honour', hint: 'The whole point' },
  { value: 'driver', label: 'Driver', hint: 'Everyone was waiting for a lift' },
  { value: 'organiser', label: 'Organiser', hint: 'Their plans, their chaos' },
]

export default function StepOffender({ data, onChange }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <label className="form-label">Their name or alias</label>
        <p className="form-hint mb-2">Just a first name or nickname is fine.</p>
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {relationships.map((r) => (
            <button
              key={r.value}
              type="button"
              className={`option-btn ${data.relationship === r.value ? 'selected' : ''}`}
              onClick={() => onChange({ relationship: r.value })}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">What role did they have at this event?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
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
    </div>
  )
}
