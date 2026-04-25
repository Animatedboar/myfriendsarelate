import type { Metadata } from 'next'
import Link from 'next/link'
import VerdictBadge from '../../components/VerdictBadge'
import VerdictDistribution from '../../components/charts/VerdictDistribution'
import ScoreByEventType from '../../components/charts/ScoreByEventType'
import ToleranceCurve from '../../components/charts/ToleranceCurve'
import ForgivenessRate from '../../components/charts/ForgivenessRate'
import { VERDICT_LABELS } from '../../../lib/scoring'
import type { StatsResponse, VerdictKey } from '../../../lib/types'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Live stats from every late friend ever submitted.',
}

export const revalidate = 300

async function getStats(): Promise<StatsResponse | null> {
  try {
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const res = await fetch(`${baseUrl}/api/stats`, { next: { revalidate: 300 } })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

function StatCard({
  label,
  value,
  sub,
  accent,
  small,
}: {
  label: string
  value: string | number
  sub?: string
  accent?: string
  small?: boolean
}) {
  return (
    <div className="border-2 border-navy p-5 sm:p-6 relative overflow-hidden">
      {accent && <div className={`absolute top-0 left-0 right-0 h-1 ${accent}`} />}
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 mt-1">{label}</p>
      <p
        className={`font-bold text-navy leading-tight ${small ? 'text-lg sm:text-xl' : 'text-3xl'}`}
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function SectionHeader({ label, title, action }: { label?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-4 mb-5">
      <div>
        {label && <p className="text-xs font-bold uppercase tracking-widest text-ember mb-1">{label}</p>}
        <h2 className="text-xl font-bold text-navy" style={{ fontFamily: 'Syne, sans-serif' }}>{title}</h2>
      </div>
      <div className="flex-1 border-t-2 border-navy/10" />
      {action}
    </div>
  )
}

function ChartCard({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-navy overflow-hidden">
      <div className="px-5 py-3 border-b-2 border-navy bg-gray-50">
        <h3 className="text-xs font-bold uppercase tracking-widest text-navy">{title}</h3>
      </div>
      <div className="p-5">
        {children}
        {sub && <p className="text-xs text-gray-400 mt-3">{sub}</p>}
      </div>
    </div>
  )
}

export default async function DashboardPage() {
  const stats = await getStats()

  const topVerdict = stats && stats.verdictDistribution.length > 0
    ? [...stats.verdictDistribution].sort((a, b) => b.count - a.count)[0].verdict as VerdictKey
    : null

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Nav */}
      <nav className="border-b-2 border-navy">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="text-xs font-bold uppercase tracking-widest text-navy hover:text-ember transition-colors"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            My Friends Are Late
          </Link>
          <Link href="/submit" className="btn-primary py-2 px-5 text-xs">
            Submit →
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full">
        {/* Page header */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-ember mb-3">Live data</p>
          <h1 className="text-4xl font-bold text-navy" style={{ fontFamily: 'Syne, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Every late friend ever submitted. Updated every 5 minutes.</p>
        </div>

        {!stats || stats.totalEntries === 0 ? (
          <div className="text-center py-24 text-gray-400">
            <p className="text-5xl mb-4">⏱</p>
            <p className="text-xl font-semibold text-gray-600 mb-2">No data yet</p>
            <p className="mb-6">Be the first to submit a late friend.</p>
            <Link href="/submit" className="btn-primary">
              Submit an Entry
            </Link>
          </div>
        ) : (
          <div className="space-y-10">

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 border-2 border-navy divide-x-2 divide-navy">
              <StatCard
                label="Total Entries"
                value={stats.totalEntries}
                accent="bg-navy"
              />
              <StatCard
                label="Average Score"
                value={stats.averageScore}
                sub="out of 120"
                accent="bg-ember"
              />
              <StatCard
                label="Most Common"
                value={topVerdict ? VERDICT_LABELS[topVerdict].replace('The ', '') : '—'}
                sub={topVerdict ? `${stats.verdictDistribution.find(v => v.verdict === topVerdict)?.count ?? 0} entries` : undefined}
                accent="bg-orange-500"
                small
              />
              <StatCard
                label="Time Terrorists"
                value={stats.verdictDistribution.find(v => v.verdict === 'time_terrorist')?.count ?? 0}
                sub="scored 90+"
                accent="bg-red-600"
              />
            </div>

            {/* Charts row 1 */}
            <div>
              <SectionHeader label="Breakdown" title="How the verdicts stack up" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-2 border-navy divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-navy">
                <ChartCard title="Verdict Distribution">
                  <VerdictDistribution data={stats.verdictDistribution} />
                </ChartCard>
                <ChartCard title="Avg Score by Event Type">
                  <ScoreByEventType data={stats.scoreByEventType} />
                </ChartCard>
              </div>
            </div>

            {/* Charts row 2 */}
            <div>
              <SectionHeader label="Patterns" title="What the data says" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-2 border-navy divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-navy">
                <ChartCard
                  title="Tolerance Curve — Annoyance vs. Minutes Late"
                  sub="Average self-reported annoyance (0–10) by how many minutes late."
                >
                  <ToleranceCurve data={stats.toleranceCurve} />
                </ChartCard>
                <ChartCard
                  title="Forgiveness Rate by Excuse Type"
                  sub="% fully or mostly forgiven, by excuse category."
                >
                  <ForgivenessRate data={stats.forgivenessRate} />
                </ChartCard>
              </div>
            </div>

            {/* Top offenders table */}
            {stats.topOffenders.length > 0 && (
              <div>
                <SectionHeader
                  label="Rankings"
                  title="Top 10 Worst Offenders"
                  action={
                    <Link
                      href="/hall-of-fame"
                      className="text-xs font-bold uppercase tracking-widest text-ember hover:text-ember-600 transition-colors shrink-0"
                    >
                      Full Hall of Fame →
                    </Link>
                  }
                />
                <div className="border-2 border-navy overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-navy text-left">
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/50 w-10">#</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/50">Name</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/50 hidden sm:table-cell">Event</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/50 w-20">Score</th>
                        <th className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-white/50 hidden md:table-cell">Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-navy/10">
                      {stats.topOffenders.slice(0, 10).map((entry, i) => (
                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-300 font-black text-base" style={{ fontFamily: 'Syne, sans-serif' }}>
                            {i + 1}
                          </td>
                          <td className="px-4 py-3 font-bold text-navy">{entry.offender_name}</td>
                          <td className="px-4 py-3 text-gray-500 max-w-[180px] truncate hidden sm:table-cell">
                            {entry.event_description ?? entry.event_type.replace(/_/g, ' ')}
                          </td>
                          <td className="px-4 py-3 font-black text-ember text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
                            {entry.final_score >= 120 ? '120+' : entry.final_score}
                          </td>
                          <td className="px-4 py-3 hidden md:table-cell">
                            <VerdictBadge
                              verdict={entry.verdict}
                              score={entry.final_score}
                              isExceeded={entry.final_score >= 120}
                              size="sm"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-navy mt-16 py-6">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 uppercase tracking-widest font-medium">
          <span>My Friends Are Late</span>
          <div className="flex gap-8">
            <Link href="/dashboard" className="hover:text-navy transition-colors">Dashboard</Link>
            <Link href="/hall-of-fame" className="hover:text-navy transition-colors">Hall of Fame</Link>
            <Link href="/submit" className="hover:text-navy transition-colors">Submit</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
