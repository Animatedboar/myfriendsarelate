import type { Metadata } from 'next'
import Link from 'next/link'
import VerdictBadge from '../../components/VerdictBadge'
import VerdictDistribution from '../../components/charts/VerdictDistribution'
import ScoreByEventType from '../../components/charts/ScoreByEventType'
import ToleranceCurve from '../../components/charts/ToleranceCurve'
import ForgivenessRate from '../../components/charts/ForgivenessRate'
import type { StatsResponse } from '../../../lib/types'

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

function StatCard({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: string }) {
  return (
    <div className={`border-2 border-navy p-6 relative overflow-hidden ${accent ? `border-l-4 ${accent}` : ''}`}>
      <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className="text-3xl font-bold text-navy" style={{ fontFamily: 'Syne, sans-serif' }}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-2 border-navy p-6">
      <h2 className="text-xs font-bold uppercase tracking-widest text-navy mb-5">{title}</h2>
      {children}
    </div>
  )
}

export default async function DashboardPage() {
  const stats = await getStats()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b-2 border-navy">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-navy hover:text-ember transition-colors"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            My Friends Are Late
          </Link>
          <Link href="/submit" className="btn-primary py-2 px-5 text-xs">
            Submit →
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-10 pt-2">
          <p className="text-xs font-bold uppercase tracking-widest text-ember mb-3">Live data</p>
          <h1 className="text-4xl font-bold text-navy" style={{ fontFamily: 'Syne, sans-serif' }}>Dashboard</h1>
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
          <div className="space-y-8">
            {/* Top stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard label="Total Entries" value={stats.totalEntries} accent="border-l-navy" />
              <StatCard label="Average Score" value={stats.averageScore} sub="out of 120" accent="border-l-ember" />
              <StatCard
                label="Most Common Verdict"
                value={
                  stats.verdictDistribution.length > 0
                    ? stats.verdictDistribution.sort((a, b) => b.count - a.count)[0].verdict
                        .replace(/_/g, ' ')
                        .replace(/\b\w/g, (c) => c.toUpperCase())
                    : '—'
                }
                accent="border-l-orange-400"
              />
              <StatCard
                label="Time Terrorists"
                value={
                  stats.verdictDistribution.find(v => v.verdict === 'time_terrorist')?.count ?? 0
                }
                sub="scored 90+"
                accent="border-l-red-600"
              />
            </div>

            {/* Charts row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ChartCard title="Verdict Distribution">
                <VerdictDistribution data={stats.verdictDistribution} />
              </ChartCard>
              <ChartCard title="Average Score by Event Type">
                <ScoreByEventType data={stats.scoreByEventType} />
              </ChartCard>
            </div>

            {/* Charts row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ChartCard title="The Tolerance Curve — Annoyance vs. Minutes Late">
                <ToleranceCurve data={stats.toleranceCurve} />
                <p className="text-xs text-gray-400 mt-2">
                  Average self-reported annoyance (0–10) by how many minutes late they were.
                </p>
              </ChartCard>
              <ChartCard title="Forgiveness Rate by Excuse Type">
                <ForgivenessRate data={stats.forgivenessRate} />
                <p className="text-xs text-gray-400 mt-2">
                  % of entries where the person was fully or mostly forgiven, by excuse category.
                </p>
              </ChartCard>
            </div>

            {/* Hall of fame teaser */}
            {stats.topOffenders.length > 0 && (
              <div>
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="text-lg font-bold text-navy">Top 10 Worst Offenders</h2>
                  <Link href="/hall-of-fame" className="text-sm text-ember hover:underline font-medium">
                    See full Hall of Fame →
                  </Link>
                </div>
                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-3 font-semibold text-gray-500">#</th>
                        <th className="px-4 py-3 font-semibold text-gray-500">Name</th>
                        <th className="px-4 py-3 font-semibold text-gray-500">Event</th>
                        <th className="px-4 py-3 font-semibold text-gray-500">Score</th>
                        <th className="px-4 py-3 font-semibold text-gray-500 hidden sm:table-cell">Verdict</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {stats.topOffenders.slice(0, 10).map((entry, i) => (
                        <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 text-gray-400 font-mono">{i + 1}</td>
                          <td className="px-4 py-3 font-semibold text-navy">{entry.offender_name}</td>
                          <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                            {entry.event_description ?? entry.event_type.replace(/_/g, ' ')}
                          </td>
                          <td className="px-4 py-3 font-bold text-ember">
                            {entry.final_score >= 120 ? '120+' : entry.final_score}
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell">
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
    </div>
  )
}
