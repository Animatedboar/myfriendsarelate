import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { VERDICT_LABELS } from '../../lib/scoring'
import type { VerdictKey } from '../../lib/types'

async function getQuickStats() {
  try {
    const { count } = await supabase
      .from('entries')
      .select('*', { count: 'exact', head: true })

    const { data: avgData } = await supabase
      .from('entries')
      .select('final_score, verdict')

    if (!avgData || avgData.length === 0) return { total: 0, avg: 0, topVerdict: null }

    const avg = Math.round(avgData.reduce((s, e) => s + e.final_score, 0) / avgData.length * 10) / 10

    const verdictCounts: Partial<Record<VerdictKey, number>> = {}
    for (const e of avgData) {
      verdictCounts[e.verdict as VerdictKey] = (verdictCounts[e.verdict as VerdictKey] ?? 0) + 1
    }
    const topVerdict = Object.entries(verdictCounts).sort((a, b) => b[1]! - a[1]!)[0]?.[0] as VerdictKey | undefined

    return { total: count ?? 0, avg, topVerdict: topVerdict ?? null }
  } catch {
    return { total: 0, avg: 0, topVerdict: null }
  }
}

export default async function HomePage() {
  const stats = await getQuickStats()

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="text-navy font-bold text-lg">My Friends Are Late</span>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-gray-500 hover:text-navy transition-colors hidden sm:block">
              Dashboard
            </Link>
            <Link href="/hall-of-fame" className="text-sm text-gray-500 hover:text-navy transition-colors hidden sm:block">
              Hall of Fame
            </Link>
            <Link href="/submit" className="btn-primary text-sm px-4 py-2">
              Submit an Entry
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <p className="inline-block text-xs font-bold uppercase tracking-widest text-ember mb-6 bg-ember/5 px-3 py-1.5 rounded-full">
          A social experiment in punctuality
        </p>
        <h1 className="text-5xl sm:text-6xl font-black text-navy leading-tight mb-6 tracking-tight">
          Lateness is never just<br />about time.
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          15 minutes late to a 30-minute coffee is a 50/100. The same 15 minutes to a 4-hour dinner party? 6/100.{' '}
          <span className="text-navy font-semibold">Context is everything.</span>
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/submit" className="btn-primary text-base px-8 py-3.5">
            Submit a Late Friend →
          </Link>
          <Link href="/dashboard" className="btn-secondary text-base px-8 py-3.5">
            See the Data
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl font-black text-navy text-center mb-12">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Tell us what happened',
                body: 'Answer 22 quick questions about the offender, the event, the lateness, and the excuse. Takes about 3 minutes.',
              },
              {
                step: '02',
                title: 'Get your Tardiness Score',
                body: 'Our formula weighs five factors — relative lateness, event severity, their role, the excuse, and the notice given — and hands down a verdict.',
              },
              {
                step: '03',
                title: 'Share the verdict',
                body: "Screenshot it. Send it to the late friend. Forward it to the group chat. Let the data speak for itself.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-4xl font-black text-ember/20 mb-3">{item.step}</div>
                <h3 className="text-lg font-bold text-navy mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verdict tiers */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-black text-navy text-center mb-3">The Verdicts</h2>
        <p className="text-gray-400 text-center text-sm mb-10">From petty infraction to unforgivable act.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(
            [
              ['saint', '0–15', 'bg-emerald-50 border-emerald-200 text-emerald-700'],
              ['fashionably_late', '16–30', 'bg-amber-50 border-amber-200 text-amber-700'],
              ['chronic_offender', '31–50', 'bg-orange-50 border-orange-200 text-orange-700'],
              ['disrespecter', '51–70', 'bg-red-50 border-red-200 text-red-700'],
              ['repeat_criminal', '71–89', 'bg-red-100 border-red-300 text-red-800'],
              ['time_terrorist', '90–120+', 'bg-gray-950 border-gray-800 text-red-400'],
            ] as [VerdictKey, string, string][]
          ).map(([verdict, range, cls]) => (
            <div key={verdict} className={`rounded-xl border p-4 ${cls}`}>
              <div className="text-xs font-bold opacity-50 mb-1">{range}</div>
              <div className="font-bold text-sm">{VERDICT_LABELS[verdict]}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Live stats strip */}
      {stats.total > 0 && (
        <section className="bg-navy text-white py-12">
          <div className="max-w-4xl mx-auto px-6">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-white/40 mb-8">
              Live from the database
            </p>
            <div className="grid grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-black text-ember">{stats.total}</p>
                <p className="text-sm text-white/60 mt-1">entries submitted</p>
              </div>
              <div>
                <p className="text-4xl font-black text-ember">{stats.avg}</p>
                <p className="text-sm text-white/60 mt-1">average score</p>
              </div>
              <div>
                <p className="text-lg font-black text-ember leading-tight">
                  {stats.topVerdict ? VERDICT_LABELS[stats.topVerdict] : '—'}
                </p>
                <p className="text-sm text-white/60 mt-1">most common verdict</p>
              </div>
            </div>
            <div className="text-center mt-8">
              <Link href="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors">
                See full dashboard →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center">
        <h2 className="text-3xl font-black text-navy mb-4">Someone was late to you recently, weren&apos;t they.</h2>
        <p className="text-gray-500 mb-8">
          A text message doesn&apos;t undo the lateness. But it does change the experience of waiting for it.
        </p>
        <Link href="/submit" className="btn-primary text-base px-8 py-3.5">
          Get the Verdict →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
          <span>My Friends Are Late</span>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-navy transition-colors">Dashboard</Link>
            <Link href="/hall-of-fame" className="hover:text-navy transition-colors">Hall of Fame</Link>
            <Link href="/submit" className="hover:text-navy transition-colors">Submit</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
