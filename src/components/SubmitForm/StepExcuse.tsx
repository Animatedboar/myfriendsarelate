'use client'

import type { FormData, ExcuseCategory, CouldHaveAvoided, Apologised } from '../../../lib/types'

interface Props {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}

const excuseCategories: { value: ExcuseCategory; label: string }[] = [
  { value: 'emergency', label: 'Genuine emergency' },
  { value: 'traffic', label: 'Traffic or transport' },
  { value: 'work', label: 'Work or obligation' },
  { value: 'forgot', label: 'Forgot' },
  { value: 'overslept', label: 'Overslept' },
  { value: 'other', label: 'Other' },
]

const avoidedOptions: { value: CouldHaveAvoided; label: string }[] = [
  { value: 'definitely_not', label: 'Definitely not' },
  { value: 'probably_not', label: 'Probably not' },
  { value: 'maybe', label: 'Maybe' },
  { value: 'probably_yes', label: 'Probably yes' },
  { value: 'definitely_yes', label: 'Definitely yes' },
]

const apologisedOptions: { value: Apologised; label: string }[] = [
  { value: 'yes_sincerely', label: 'Yes, sincerely' },
  { value: 'yes_hollow', label: 'Yes, but it felt hollow' },
  { value: 'no', label: 'No' },
]

export default function StepExcuse({ data, onChange }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <label className="form-label">Did they give an excuse?</label>
        <div className="flex gap-3 mt-2">
          {[
            { value: true, label: 'Yes' },
            { value: false, label: 'No excuse given' },
          ].map((opt) => (
            <button
              key={String(opt.value)}
              type="button"
              className={`option-btn ${data.gave_excuse === opt.value ? 'selected' : ''}`}
              onClick={() => onChange({ gave_excuse: opt.value })}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {!data.gave_excuse && (
          <p className="form-hint mt-2 text-amber-600">
            No excuse is scored harshly. Silence adds injury to injury.
          </p>
        )}
      </div>

      {data.gave_excuse && (
        <>
          <div>
            <label className="form-label">What was the excuse? <span className="font-normal text-gray-400">(optional)</span></label>
            <div className="space-y-3 mt-2">
              <textarea
                className="form-input resize-none"
                rows={2}
                placeholder="In their own words..."
                value={data.excuse_text}
                onChange={(e) => onChange({ excuse_text: e.target.value })}
                maxLength={300}
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {excuseCategories.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    className={`option-btn ${data.excuse_category === c.value ? 'selected' : ''}`}
                    onClick={() => onChange({ excuse_category: c.value })}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="form-label">
              How convincing did you find it?
              <span className="ml-2 font-normal text-gray-400">
                {data.excuse_convincing === 0 ? '0 — completely believable' : data.excuse_convincing === 10 ? '10 — total nonsense' : data.excuse_convincing}
              </span>
            </label>
            <p className="form-hint mb-3">0 = completely believable, 10 = total nonsense</p>
            <input
              type="range"
              min={0}
              max={10}
              step={1}
              value={data.excuse_convincing}
              onChange={(e) => onChange({ excuse_convincing: parseInt(e.target.value) })}
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Believable</span>
              <span>Nonsense</span>
            </div>
          </div>

          <div>
            <label className="form-label">Could they have reasonably avoided being late?</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
              {avoidedOptions.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  className={`option-btn ${data.could_have_avoided === o.value ? 'selected' : ''}`}
                  onClick={() => onChange({ could_have_avoided: o.value })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div>
        <label className="form-label">Did they apologise?</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
          {apologisedOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`option-btn ${data.apologised === o.value ? 'selected' : ''}`}
              onClick={() => onChange({ apologised: o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
