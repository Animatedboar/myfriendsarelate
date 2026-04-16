'use client'

import type { FormData, NoticeType, RepeatOffender } from '../../../lib/types'

interface Props {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}

const noticeOptions: { value: NoticeType; label: string; hint: string }[] = [
  { value: 'called_early', label: 'Called 30+ min before', hint: 'The gold standard' },
  { value: 'called_late', label: 'Called just before', hint: 'At least they called' },
  { value: 'texted_early', label: 'Texted 30+ min before', hint: 'Good enough' },
  { value: 'texted_late', label: 'Texted just before', hint: 'Better than nothing' },
  { value: 'after_arriving', label: 'Told me after arriving', hint: 'Too little, too late' },
  { value: 'no_contact', label: 'No contact at all', hint: 'Just showed up late (or not at all)' },
]

const repeatOptions: { value: RepeatOffender; label: string }[] = [
  { value: 'first_time', label: 'First time' },
  { value: 'not_sure', label: 'Not sure' },
  { value: 'yes_occasionally', label: 'Yes, occasionally' },
  { value: 'yes_often', label: "Yes — it's a pattern" },
]

export default function StepTwo({ data, onChange }: Props) {
  return (
    <div className="space-y-8">
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
          <label className="form-label">When did they actually arrive?</label>
          <div className="space-y-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-ember"
                checked={data.no_show}
                onChange={(e) => onChange({ no_show: e.target.checked, actual_arrival: '' })}
              />
              <span className="text-sm font-medium text-gray-700">They never showed up</span>
            </label>
            {!data.no_show && (
              <input
                type="time"
                className="form-input"
                value={data.actual_arrival}
                onChange={(e) => onChange({ actual_arrival: e.target.value })}
              />
            )}
          </div>
        </div>
      </div>

      <div>
        <label className="form-label">How did they let you know?</label>
        <p className="form-hint mb-2">
          An unexplained wait feels twice as long as an explained one.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {noticeOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`option-btn flex flex-col items-start gap-0.5 ${data.notice_type === o.value ? 'selected' : ''}`}
              onClick={() => onChange({ notice_type: o.value })}
            >
              <span className="font-semibold">{o.label}</span>
              <span className="text-xs opacity-60">{o.hint}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Have they done this before?</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
          {repeatOptions.map((r) => (
            <button
              key={r.value}
              type="button"
              className={`option-btn ${data.repeat_offender === r.value ? 'selected' : ''}`}
              onClick={() => onChange({ repeat_offender: r.value })}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
