import type { ScoreComponents } from '../../lib/types'

interface Props {
  scores: ScoreComponents
}

const components = [
  {
    key: 'relativeTimeScore' as const,
    label: 'Relative Lateness',
    weight: '40%',
    description: 'How late they were relative to how long the event was supposed to last. First 5 minutes are a grace period.',
  },
  {
    key: 'eventTypeScore' as const,
    label: 'Event Severity',
    weight: '20%',
    description: 'A movie has a hard start. A house party does not. An escape room slot is paid and fixed. This matters.',
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
      <div className="flex-1 h-1.5 bg-gray-100 overflow-hidden">
        <div
          className={`h-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-sm font-semibold text-gray-700 w-8 text-right tabular-nums">{value}</span>
    </div>
  )
}

export default function ScoreBreakdown({ scores }: Props) {
  const activeModifiers = scores.modifiers ?? []

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

      {activeModifiers.length > 0 && (
        <div className="pt-4 border-t-2 border-gray-100">
          <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Modifiers applied</p>
          <div className="space-y-1.5">
            {activeModifiers.map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{m.label}</span>
                <span className={`text-sm font-bold tabular-nums ${m.positive ? 'text-emerald-600' : 'text-ember'}`}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pt-4 border-t-2 border-navy">
        <div className="flex items-center justify-between">
          <span className="font-bold text-gray-700 uppercase tracking-widest text-xs">Final Score</span>
          <span className="text-2xl font-black text-ember tabular-nums">
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
