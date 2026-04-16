'use client'

import type { FormData, NoticeTiming, NoticeMethod, RepeatOffender } from '../../../lib/types'

interface Props {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}

const noticeTimings: { value: NoticeTiming; label: string }[] = [
  { value: 'over_1hr', label: 'More than 1 hour before' },
  { value: '30_60min', label: '30–60 minutes before' },
  { value: '10_30min', label: '10–30 minutes before' },
  { value: 'under_10min', label: 'Less than 10 minutes before' },
  { value: 'after_agreed', label: 'After the agreed time' },
]

const noticeMethods: { value: NoticeMethod; label: string }[] = [
  { value: 'phone_call', label: 'Phone call' },
  { value: 'text', label: 'Text message' },
  { value: 'none', label: 'No contact at all' },
]

const repeatOptions: { value: RepeatOffender; label: string }[] = [
  { value: 'yes_often', label: "Yes — they're chronic about it" },
  { value: 'yes_occasionally', label: 'Yes, occasionally' },
  { value: 'first_time', label: 'First time' },
  { value: 'not_sure', label: "Not sure" },
]

export default function StepLateness({ data, onChange }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <label className="form-label">What time did they actually arrive?</label>
        <div className="flex flex-col gap-3 mt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 accent-ember rounded"
              checked={data.no_show}
              onChange={(e) => onChange({ no_show: e.target.checked, actual_arrival: '' })}
            />
            <span className="text-sm font-medium text-gray-700">They never showed up</span>
          </label>
          {!data.no_show && (
            <input
              type="time"
              className="form-input"
              style={{ maxWidth: '180px' }}
              value={data.actual_arrival}
              onChange={(e) => onChange({ actual_arrival: e.target.value })}
            />
          )}
        </div>
      </div>

      <div>
        <label className="form-label">Did they give notice they&apos;d be late?</label>
        <div className="flex gap-3 mt-2">
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No' },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              className={`option-btn px-8 ${data.gave_notice === opt.value ? 'selected' : ''}`}
              onClick={() => onChange({ gave_notice: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {data.gave_notice && (
        <>
          <div>
            <label className="form-label">When did they give notice?</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
              {noticeTimings.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  className={`option-btn ${data.notice_timing === t.value ? 'selected' : ''}`}
                  onClick={() => onChange({ notice_timing: t.value })}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="form-label">How did they give notice?</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {noticeMethods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  className={`option-btn ${data.notice_method === m.value ? 'selected' : ''}`}
                  onClick={() => onChange({ notice_method: m.value })}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <label className="form-label">Have they done this before?</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
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
