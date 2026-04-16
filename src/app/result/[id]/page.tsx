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
  return { title: `Tardiness Verdict` }
}

const EVENT_LABELS: Record<string, string> = {
  casual: 'Casual hangout', dinner_home: 'Dinner at home', restaurant: 'Restaurant',
  movie: 'Movie / Theatre', concert: 'Concert / Sports', escape_room: 'Escape room',
  flight: 'Flight', wedding: 'Wedding', professional: 'Professional',
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
  const displayScore = isExceeded ? '120+' : Math.round(entry.final_score)

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
      {/* Minimal nav */}
      <nav className="border-b-2 border-navy">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-navy hover:text-ember transition-colors"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            My Friends Are Late
          </Link>
          <Link href="/submit" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-navy transition-colors">
            Submit another →
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">

        {/* ─── THE VERDICT CARD ─── screenshot-worthy */}
        <div className={`relative overflow-hidden border-2 mb-3 ${styles.border} ${styles.bg}`}>

          {/* Top label bar */}
          <div className={`px-8 pt-8 pb-0 flex items-center justify-between`}>
            <p className={`text-xs font-bold uppercase tracking-widest opacity-40 ${styles.text}`}>
              Tardiness Score
            </p>
            <p className={`text-xs font-bold uppercase tracking-widest opacity-40 ${styles.text}`}>
              myfriendslate.com
            </p>
          </div>

          {/* Giant score */}
          <div className="px-8 pt-2 pb-0">
            <p
              className={`font-bold leading-none ${styles.score}`}
              style={{
                fontFamily: 'Syne, sans-serif',
                fontSize: 'clamp(100px, 25vw, 180px)',
                letterSpacing: '-0.04em',
              }}
            >
              {displayScore}
            </p>
          </div>

          {/* Verdict name */}
          <div className={`px-8 pb-6 border-t ${styles.border} mt-4 pt-5`}>
            <p
              className={`text-3xl sm:text-4xl font-bold ${styles.text}`}
              style={{ fontFamily: 'Syne, sans-serif' }}
            >
              {VERDICT_LABELS[verdict]}
            </p>
            <p className={`text-sm mt-2 opacity-60 max-w-sm ${styles.text}`}>
              {VERDICT_DESCRIPTIONS[verdict]}
            </p>
          </div>

          {/* Case details strip */}
          <div className={`px-8 py-4 border-t ${styles.border} flex flex-wrap gap-x-6 gap-y-1`}>
            <span className={`text-xs font-bold uppercase tracking-widest opacity-50 ${styles.text}`}>
              {entry.offender_name}
            </span>
            {entry.event_description && (
              <span className={`text-xs font-bold uppercase tracking-widest opacity-50 ${styles.text}`}>
                {entry.event_description}
              </span>
            )}
            <span className={`text-xs font-bold uppercase tracking-widest opacity-50 ${styles.text}`}>
              {entry.no_show ? 'No-show' : `${entry.minutes_late ?? 0} min${entry.minutes_late !== 1 ? 's' : ''} late`}
            </span>
            <span className={`text-xs font-bold uppercase tracking-widest opacity-50 ${styles.text}`}>
              {EVENT_LABELS[entry.event_type] ?? entry.event_type}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 mb-10">
          <ShareButton id={params.id} />
          <Link href="/submit" className="btn-secondary flex-1 text-center py-3">
            Submit Another
          </Link>
          <Link href="/dashboard" className="btn-secondary flex-1 text-center py-3">
            Dashboard →
          </Link>
        </div>

        {/* Score breakdown */}
        <div className="border-2 border-navy p-6 mb-6">
          <h2 className="text-base font-bold text-navy mb-6 uppercase tracking-widest text-xs"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            How the score was calculated
          </h2>
          <ScoreBreakdown scores={scores} />
        </div>

        <div className="text-center text-xs text-gray-400 uppercase tracking-widest">
          See how {entry.offender_name} compares to everyone else —{' '}
          <Link href="/dashboard" className="text-ember hover:underline font-bold">
            View dashboard
          </Link>
        </div>
      </main>
    </div>
  )
}
