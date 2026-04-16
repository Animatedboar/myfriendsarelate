import { VERDICT_LABELS, VERDICT_STYLES } from '../../lib/scoring'
import type { VerdictKey } from '../../lib/types'

interface Props {
  verdict: VerdictKey
  score: number
  isExceeded?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export default function VerdictBadge({ verdict, score, isExceeded, size = 'md' }: Props) {
  const styles = VERDICT_STYLES[verdict]
  const label = VERDICT_LABELS[verdict]
  const displayScore = isExceeded ? '120+' : score.toString()

  if (size === 'sm') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${styles.badge}`}
      >
        <span>{displayScore}</span>
        <span className="opacity-60">·</span>
        <span>{label}</span>
      </span>
    )
  }

  if (size === 'lg') {
    return (
      <div className={`rounded-2xl border-2 p-6 text-center ${styles.bg} ${styles.border}`}>
        <p className={`text-6xl font-black tracking-tight mb-1 ${styles.score}`}>{displayScore}</p>
        <p className={`text-sm font-medium uppercase tracking-widest opacity-60 ${styles.text}`}>
          Tardiness Score
        </p>
        <p className={`text-2xl font-bold mt-3 ${styles.text}`}>{label}</p>
      </div>
    )
  }

  return (
    <div className={`inline-flex flex-col items-center gap-1 rounded-xl border px-5 py-3 ${styles.bg} ${styles.border}`}>
      <span className={`text-3xl font-black ${styles.score}`}>{displayScore}</span>
      <span className={`text-sm font-semibold ${styles.text}`}>{label}</span>
    </div>
  )
}
