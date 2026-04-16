import type { Metadata } from 'next'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { VERDICT_LABELS } from '../../../lib/scoring'
import VerdictBadge from '../../components/VerdictBadge'

export const metadata: Metadata = {
  title: 'Hall of Fame',
  description: 'The 25 most egregious acts of lateness ever submitted.',
}

export const revalidate = 300

async function getTopEntries() {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('final_score', { ascending: false })
    .limit(25)

  if (error) return []
  return data ?? []
}

const EVENT_LABELS: Record<string, string> = {
  casual: 'Casual hangout',
  dinner_home: 'Dinner at home',
  restaurant: 'Restaurant',
  movie: 'Movie / Theatre',
  concert: 'Concert / Sports',
  escape_room: 'Escape room',
  flight: 'Flight',
  wedding: 'Wedding',
  professional: 'Professional',
}

const NOTICE_LABELS: Record<string, string> = {
  over_1hr: '>1 hr before',
  '30_60min': '30–60 min before',
  '10_30min': '10–30 min before',
  under_10min: '<10 min before',
  after_agreed: 'After the agreed time',
}

export default async function HallOfFamePage() {
  const entries = await getTopEntries()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b-2 border-navy">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-navy hover:text-ember transition-colors"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            My Friends Are Late
          </Link>
          <Link href="/submit" className="btn-primary py-2 px-5 text-xs">
            Submit →
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-10 pt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-ember mb-3">Hall of Fame</p>
          <h1 className="text-4xl font-bold text-navy" style={{ fontFamily: 'Syne, sans-serif' }}>
            The 25 Worst Offenders
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            The most egregious acts of lateness ever submitted. Ranked by Tardiness Score.
          </p>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">🏆</p>
            <p className="text-xl font-semibold text-gray-600 mb-2">Nobody here yet</p>
            <p className="mb-6">Submit an entry to claim the inaugural spot.</p>
            <Link href="/submit" className="btn-primary">
              Submit an Entry
            </Link>
          </div>
        ) : (
          <div className="space-y-0 border-2 border-navy divide-y-2 divide-navy">
            {entries.map((entry, i) => {
              const isExceeded = entry.final_score >= 120
              return (
                <div
                  key={entry.id}
                  className="p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4">
                      <span className="text-2xl font-black text-gray-200 w-8 shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-3 flex-wrap mb-1">
                          <h2 className="text-lg font-bold text-navy">{entry.offender_name}</h2>
                          <VerdictBadge
                            verdict={entry.verdict}
                            score={entry.final_score}
                            isExceeded={isExceeded}
                            size="sm"
                          />
                        </div>
                        <p className="text-sm text-gray-500">
                          {entry.event_description
                            ? `${entry.event_description} · ${EVENT_LABELS[entry.event_type] ?? entry.event_type}`
                            : EVENT_LABELS[entry.event_type] ?? entry.event_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-3xl font-black text-ember">
                        {isExceeded ? '120+' : entry.final_score}
                      </p>
                      <p className="text-xs text-gray-400">score</p>
                    </div>
                  </div>

                  {/* Detail chips */}
                  <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                      {entry.no_show
                        ? 'No-show'
                        : `${entry.minutes_late ?? 0} min${entry.minutes_late !== 1 ? 's' : ''} late`}
                    </span>
                    {entry.gave_notice ? (
                      <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                        Notice: {NOTICE_LABELS[entry.notice_timing ?? ''] ?? 'gave notice'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-600">
                        No notice given
                      </span>
                    )}
                    {entry.gave_excuse ? (
                      <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
                        Excuse: {entry.excuse_category?.replace(/_/g, ' ') ?? 'unknown'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-orange-50 text-orange-700">
                        No excuse
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-1 rounded-full ${
                        entry.forgiven === 'yes_completely' || entry.forgiven === 'mostly'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {entry.forgiven === 'yes_completely'
                        ? 'Forgiven'
                        : entry.forgiven === 'mostly'
                        ? 'Mostly forgiven'
                        : entry.forgiven === 'holding_grudge'
                        ? 'Grudge held'
                        : 'Unresolved'}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                      {new Date(entry.created_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  {entry.extra_context && (
                    <p className="mt-3 text-sm text-gray-400 italic border-l-2 border-gray-100 pl-3">
                      &ldquo;{entry.extra_context}&rdquo;
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
