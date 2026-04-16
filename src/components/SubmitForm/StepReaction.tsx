'use client'

import type { FormData, EventImpact, Forgiven, WillDoAgain } from '../../../lib/types'
import type { ScoreComponents } from '../../../lib/types'
import VerdictBadge from '../VerdictBadge'
import ScoreBreakdown from '../ScoreBreakdown'

interface Props {
  data: FormData
  onChange: (updates: Partial<FormData>) => void
  liveScore: ScoreComponents | null
}

const impactOptions: { value: EventImpact; label: string }[] = [
  { value: 'not_at_all', label: 'Not at all' },
  { value: 'slightly', label: 'Slightly' },
  { value: 'significantly', label: 'Significantly' },
  { value: 'ruined_it', label: 'Ruined it entirely' },
]

const forgivenOptions: { value: Forgiven; label: string }[] = [
  { value: 'yes_completely', label: 'Yes completely' },
  { value: 'mostly', label: 'Mostly' },
  { value: 'holding_grudge', label: 'Holding a grudge' },
  { value: 'unresolved', label: 'Still unresolved' },
]

const willDoAgainOptions: { value: WillDoAgain; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'probably_not', label: 'Probably not' },
  { value: 'probably', label: 'Probably' },
  { value: 'definitely', label: 'Definitely' },
]

export default function StepReaction({ data, onChange, liveScore }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <label className="form-label">
          How annoyed were you?
          <span className="ml-2 font-normal text-gray-400">
            {data.annoyance_level === 0 ? '0 — not at all' : data.annoyance_level === 10 ? '10 — furious' : data.annoyance_level}
          </span>
        </label>
        <p className="form-hint mb-3">0 = not at all, 10 = furious</p>
        <input
          type="range"
          min={0}
          max={10}
          step={1}
          value={data.annoyance_level}
          onChange={(e) => onChange({ annoyance_level: parseInt(e.target.value) })}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Totally fine</span>
          <span>Furious</span>
        </div>
      </div>

      <div>
        <label className="form-label">Did it affect the event itself?</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {impactOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`option-btn ${data.event_impact === o.value ? 'selected' : ''}`}
              onClick={() => onChange({ event_impact: o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Did you forgive them?</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {forgivenOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`option-btn ${data.forgiven === o.value ? 'selected' : ''}`}
              onClick={() => onChange({ forgiven: o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Do you think they&apos;ll do it again?</label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
          {willDoAgainOptions.map((o) => (
            <button
              key={o.value}
              type="button"
              className={`option-btn ${data.will_do_again === o.value ? 'selected' : ''}`}
              onClick={() => onChange({ will_do_again: o.value })}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="form-label">Any other context? <span className="font-normal text-gray-400">(optional)</span></label>
        <textarea
          className="form-input resize-none"
          rows={3}
          placeholder="Anything the score might be missing..."
          value={data.extra_context}
          onChange={(e) => onChange({ extra_context: e.target.value })}
          maxLength={500}
        />
      </div>

      {liveScore && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 animate-slide-up">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Live Score Preview
          </p>
          <div className="flex items-center gap-4 mb-6">
            <VerdictBadge
              verdict={liveScore.verdict}
              score={liveScore.finalScore}
              isExceeded={liveScore.isExceeded}
              size="md"
            />
            <p className="text-sm text-gray-500">
              This will update as you fill in more details.
            </p>
          </div>
          <ScoreBreakdown scores={liveScore} />
        </div>
      )}
    </div>
  )
}
