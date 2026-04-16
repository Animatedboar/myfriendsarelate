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
  const displayScore = isExceeded ? '120+' : score

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border-2 uppercase tracking-wide ${styles.badge}`}
        style={{ fontFamily: 'Syne, sans-serif' }}>
        <span>{displayScore}</span>
        <span className="opacity-40">·</span>
        <span>{label.replace('The ', '')}</span>
      </span>
    )
  }

  if (size === 'lg') {
    return (
      <div className={`border-2 p-6 text-center ${styles.bg} ${styles.border}`}>
        <p className={`text-xs font-bold uppercase tracking-widest opacity-40 mb-2 ${styles.text}`}>
          Tardiness Score
        </p>
        <p className={`font-bold leading-none mb-3 ${styles.score}`}
          style={{ fontFamily: 'Syne, sans-serif', fontSize: '72px' }}>
          {displayScore}
        </p>
        <p className={`text-xl font-bold ${styles.text}`} style={{ fontFamily: 'Syne, sans-serif' }}>
          {label}
        </p>
      </div>
    )
  }

  return (
    <div className={`inline-flex flex-col items-center border-2 px-6 py-4 ${styles.bg} ${styles.border}`}>
      <span className={`text-4xl font-bold leading-none ${styles.score}`}
        style={{ fontFamily: 'Syne, sans-serif' }}>
        {displayScore}
      </span>
      <span className={`text-xs font-bold uppercase tracking-widest mt-1.5 ${styles.text}`}
        style={{ fontFamily: 'Syne, sans-serif' }}>
        {label.replace('The ', '')}
      </span>
    </div>
  )
}
