'use client'

import type { FormData, ExcuseType, CouldHaveAvoided, Apologised, Forgiven } from '../../../lib/types'

interface Props {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
}

const excuseOptions: { value: ExcuseType; label: string; hint: string }[] = [
  { value: 'none', label: 'No excuse given', hint: 'Silence adds injury to injury' },
  { value: 'emergency', label: 'Genuine emergency', hint: 'Hard to argue with' },
  { value: 'traffic', label: 'Traffic / transport', hint: 'The classic' },
  { value: 'work', label: 'Work / obligation', hint: 'They had to' },
  { value: 'forgot', label: 'Forgot', hint: 'They actually forgot' },
  { value: 'overslept', label: 'Overslept', hint: 'The alarm let them down' },
  { value: 'other', label: 'Other', hint: 'Something else entirely' },
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
  { value: 'yes_hollow', label: 'Yes — felt hollow' },
  { value: 'no', label: 'No apology' },
]

const forgivenOptions: { value: Forgiven; label: string }[] = [
  { value: 'yes_completely', label: 'Yes, completely' },
  { value: 'mostly', label: 'Mostly' },
  { value: 'holding_grudge', label: 'Holding a grudge' },
  { value: 'unresolved', label: 'Still unresolved' },
]

export default function StepThree({ data, onChange }: Props) {
  const hasExcuse = data.excuse_type && data.excuse_type !== 'none'

  return (
    <div className="space-y-8">
      <div>
        <label className="form-label">What excuse did they give?</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {excuseOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`option-btn flex flex-col items-start gap-0.5 ${data.excuse_type === o.value ? 'selected' : ''}`}
              onClick={() => onChange({ excuse_type: o.value, could_have_avoided: '' })}
            >
              <span className="font-semibold">{o.label}</span>
              <span className="text-xs opacity-60">{o.hint}</span>
            </button>
          ))}
        </div>
      </div>

      {hasExcuse && (
        <div>
          <label className="form-label">Could they have reasonably avoided being late?</label>
          <p className="form-hint mb-2">This is the core of it — agency determines blame.</p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-1">
            {avoidedOptions.map((o) => (
              <button
                key={o.value}
                type="button"
                className={`option-btn text-center ${data.could_have_avoided === o.value ? 'selected' : ''}`}
                onClick={() => onChange({ could_have_avoided: o.value })}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="form-label">Did they apologise?</label>
        <div className="grid grid-cols-3 gap-2 mt-1">
          {apologisedOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`option-btn text-center ${data.apologised === o.value ? 'selected' : ''}`}
              onClick={() => onChange({ apologised: o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">
          How annoyed were you?{' '}
          <span className="font-normal text-gray-400">
            {data.annoyance_level}/10
          </span>
        </label>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={data.annoyance_level}
          onChange={(e) => onChange({ annoyance_level: parseInt(e.target.value) })}
          className="mt-2"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Totally fine</span>
          <span>Furious</span>
        </div>
      </div>

      <div>
        <label className="form-label">Did you forgive them?</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
          {forgivenOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`option-btn text-center ${data.forgiven === o.value ? 'selected' : ''}`}
              onClick={() => onChange({ forgiven: o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">
          Anything else? <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          className="form-input resize-none"
          rows={2}
          placeholder="Anything the score might be missing..."
          value={data.extra_context}
          onChange={(e) => onChange({ extra_context: e.target.value })}
          maxLength={500}
        />
      </div>

    </div>
  )
}
