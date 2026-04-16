import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { supabase } from '../../../../lib/supabase'
import { VERDICT_LABELS, VERDICT_DESCRIPTIONS, VERDICT_STYLES } from '../../../../lib/scoring'
import ScoreBreakdown from '../../../components/ScoreBreakdown'
import ShareButton from '../../../components/ShareButton'
import type { ScoreComponents } from '../../../../lib/types'

interface Props {
  params: { id: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Tardiness Verdict — Entry ${params.id.slice(0, 8)}`,
  }
}

export default async function ResultPage({ params }: Props) {
  const { data: entry, error } = await supabase
    .from('entries')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !entry) notFound()

  const verdict = entry.verdict
  const styles = VERDICT_STYLES[verdict]
  const isExceeded = entry.final_score >= 120
  const displayScore = isExceeded ? '120+' : entry.final_score

  const scores: ScoreComponents = {
    relativeTimeScore: entry.relative_time_score,
    eventTypeScore: entry.event_type_score,
    importanceScore: entry.importance_score,
    excuseScore: entry.excuse_score,
    noticeScore: entry.notice_score,
    finalScore: entry.final_score,
    verdict: entry.verdict,
    minutesLate: entry.minutes_late ?? 0,
    isExceeded,
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-navy font-bold text-lg hover:text-ember transition-colors">
            My Friends Are Late
          </Link>
          <Link href="/submit" className="text-sm text-gray-500 hover:text-navy transition-colors">
            Submit another →
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Hero verdict card — designed to be screenshot-worthy */}
        <div
          className={`rounded-3xl border-2 p-8 text-center mb-8 animate-fade-in ${styles.bg} ${styles.border}`}
        >
          <p className={`text-xs font-bold uppercase tracking-widest mb-4 opacity-50 ${styles.text}`}>
            Tardiness Score
          </p>
          <p className={`text-8xl font-black tracking-tight leading-none mb-3 ${styles.score}`}>
            {displayScore}
          </p>
          <p className={`text-3xl font-bold mb-3 ${styles.text}`}>
            {VERDICT_LABELS[verdict]}
          </p>
          <p className={`text-base opacity-70 max-w-sm mx-auto ${styles.text}`}>
            {VERDICT_DESCRIPTIONS[verdict]}
          </p>

          {/* Key facts strip */}
          <div
            className={`mt-6 pt-6 border-t border-current/10 flex flex-wrap justify-center gap-4 text-sm font-medium opacity-60 ${styles.text}`}
          >
            <span>{entry.offender_name}</span>
            {entry.minutes_late != null && (
              <>
                <span>·</span>
                <span>
                  {entry.no_show
                    ? 'No-show'
                    : `${entry.minutes_late} min${entry.minutes_late !== 1 ? 's' : ''} late`}
                </span>
              </>
            )}
            {entry.event_description && (
              <>
                <span>·</span>
                <span>{entry.event_description}</span>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10 animate-slide-up">
          <ShareButton id={params.id} />
          <Link href="/submit" className="btn-secondary flex-1 text-center">
            Submit Another
          </Link>
          <Link href="/dashboard" className="btn-secondary flex-1 text-center">
            See the Dashboard →
          </Link>
        </div>

        {/* Score breakdown */}
        <div className="rounded-2xl border border-gray-100 p-6 animate-slide-up">
          <h2 className="text-lg font-bold text-navy mb-6">How the score was calculated</h2>
          <ScoreBreakdown scores={scores} />
        </div>

        {/* Compare prompt */}
        <div className="mt-8 text-center text-sm text-gray-400">
          See how {entry.offender_name} compares to everyone else →{' '}
          <Link href="/dashboard" className="text-ember hover:underline font-medium">
            View the dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
