import type { ScoreComponents } from '../../lib/types'

interface Props {
  scores: ScoreComponents
}

const components = [
  {
    key: 'relativeTimeScore' as const,
    label: 'Relative Lateness',
    weight: '40%',
    description: 'How late they were relative to how long the event was supposed to last.',
  },
  {
    key: 'eventTypeScore' as const,
    label: 'Event Severity',
    weight: '20%',
    description: 'A movie has a hard start. A house party does not. This matters.',
  },
  {
    key: 'importanceScore' as const,
    label: 'Their Role',
    weight: '20%',
    description: "How critical their presence was to the event actually happening.",
  },
  {
    key: 'excuseScore' as const,
    label: 'Excuse Quality',
    weight: '10%',
    description: 'Could they have reasonably avoided being late? No excuse given scores poorly.',
  },
  {
    key: 'noticeScore' as const,
    label: 'Notice Given',
    weight: '10%',
    description: 'A text message does not undo the lateness — but it changes the experience of waiting.',
  },
]

function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.min(100, (value / max) * 100)
  const color =
    pct < 30 ? 'bg-emerald-400' : pct < 60 ? 'bg-amber-400' : pct < 80 ? 'bg-orange-400' : 'bg-red-500'

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right">{value}</span>
    </div>
  )
}

export default function ScoreBreakdown({ scores }: Props) {
  return (
    <div className="space-y-5">
      {components.map((c) => (
        <div key={c.key}>
          <div className="flex items-baseline justify-between mb-1.5">
            <div>
              <span className="text-sm font-semibold text-gray-800">{c.label}</span>
              <span className="ml-2 text-xs text-gray-400">({c.weight})</span>
            </div>
          </div>
          <ScoreBar value={scores[c.key]} />
          <p className="text-xs text-gray-400 mt-1">{c.description}</p>
        </div>
      ))}

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-700">Final Score</span>
          <span className="text-xl font-black text-ember">
            {scores.isExceeded ? '120+' : scores.finalScore}
          </span>
        </div>
        {scores.minutesLate > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            {scores.minutesLate} minute{scores.minutesLate !== 1 ? 's' : ''} late
          </p>
        )}
      </div>
    </div>
  )
}
