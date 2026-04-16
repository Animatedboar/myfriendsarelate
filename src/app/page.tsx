import Link from 'next/link'
import { supabase } from '../../lib/supabase'
import { VERDICT_LABELS } from '../../lib/scoring'
import type { VerdictKey } from '../../lib/types'

async function getQuickStats() {
  try {
    const { data: avgData } = await supabase.from('entries').select('final_score, verdict')
    if (!avgData || avgData.length === 0) return { total: 0, avg: 0, topVerdict: null }
    const avg = Math.round((avgData.reduce((s, e) => s + e.final_score, 0) / avgData.length) * 10) / 10
    const verdictCounts: Partial<Record<VerdictKey, number>> = {}
    for (const e of avgData) {
      verdictCounts[e.verdict as VerdictKey] = (verdictCounts[e.verdict as VerdictKey] ?? 0) + 1
    }
    const topVerdict = Object.entries(verdictCounts).sort((a, b) => b[1]! - a[1]!)[0]?.[0] as VerdictKey | undefined
    return { total: avgData.length, avg, topVerdict: topVerdict ?? null }
  } catch {
    return { total: 0, avg: 0, topVerdict: null }
  }
}

const VERDICT_TIERS: [VerdictKey, string, string, string][] = [
  ['saint',           '0–15',   'bg-emerald-50  border-emerald-200 text-emerald-800', 'text-emerald-400'],
  ['fashionably_late','16–30',  'bg-amber-50    border-amber-200   text-amber-800',   'text-amber-400'],
  ['chronic_offender','31–50',  'bg-orange-50   border-orange-200  text-orange-800',  'text-orange-400'],
  ['disrespecter',    '51–70',  'bg-red-50      border-red-200     text-red-800',     'text-red-400'],
  ['repeat_criminal', '71–89',  'bg-red-100     border-red-300     text-red-900',     'text-red-500'],
  ['time_terrorist',  '90–120+','bg-gray-950    border-gray-800    text-red-400',     'text-red-700'],
]

export default async function HomePage() {
  const stats = await getQuickStats()

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="border-b-2 border-navy">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <span className="font-bold text-navy tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
            My Friends Are Late
          </span>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-gray-400 hover:text-navy transition-colors hidden sm:block font-medium">
              Dashboard
            </Link>
            <Link href="/hall-of-fame" className="text-sm text-gray-400 hover:text-navy transition-colors hidden sm:block font-medium">
              Hall of Fame
            </Link>
            <Link href="/submit" className="btn-primary py-2 px-5 text-xs">
              Submit →
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden border-b-2 border-navy bg-navy">
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        <div className="relative max-w-6xl mx-auto px-6 py-24 sm:py-32">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-widest text-ember mb-8">
              A social experiment in punctuality
            </p>
            <h1 className="text-6xl sm:text-8xl font-bold text-white leading-[0.9] tracking-tight mb-8"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              Lateness is never just about time.
            </h1>
            <p className="text-lg text-white/60 max-w-xl mb-10 leading-relaxed">
              15 minutes late to a 30-minute coffee is a 50/100.
              The same 15 minutes to a 4-hour dinner party? 6/100.
              Context is everything.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/submit" className="inline-flex items-center justify-center px-8 py-4 bg-ember text-white font-semibold hover:bg-ember-600 transition-colors uppercase tracking-wide text-sm">
                Submit a Late Friend →
              </Link>
              <Link href="/dashboard" className="inline-flex items-center justify-center px-8 py-4 bg-transparent text-white border-2 border-white/30 font-semibold hover:border-white transition-colors uppercase tracking-wide text-sm">
                See the Data
              </Link>
            </div>
          </div>

          {/* Floating verdict card */}
          <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 select-none pointer-events-none">
            <div className="border-2 border-red-500 p-8 bg-red-950/50">
              <div className="text-xs font-bold uppercase tracking-widest text-red-400 mb-2">Tardiness Score</div>
              <div className="text-9xl font-bold text-red-400 leading-none" style={{ fontFamily: 'Syne, sans-serif' }}>94</div>
              <div className="text-2xl font-bold text-red-400 mt-2" style={{ fontFamily: 'Syne, sans-serif' }}>The Time Terrorist</div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      {stats.total > 0 && (
        <section className="border-b-2 border-navy bg-ember">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-4">
            <p className="text-white/80 text-xs font-bold uppercase tracking-widest">Live data</p>
            <div className="flex gap-8">
              <div className="text-center">
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{stats.total}</span>
                <span className="text-white/70 text-xs ml-2 font-medium">entries</span>
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>{stats.avg}</span>
                <span className="text-white/70 text-xs ml-2 font-medium">avg score</span>
              </div>
              {stats.topVerdict && (
                <div className="text-center hidden sm:block">
                  <span className="text-white/70 text-xs mr-2 font-medium">most common:</span>
                  <span className="text-sm font-bold text-white">{VERDICT_LABELS[stats.topVerdict]}</span>
                </div>
              )}
            </div>
            <Link href="/dashboard" className="text-white/80 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors">
              Full dashboard →
            </Link>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="border-b-2 border-navy">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-baseline gap-6 mb-16">
            <h2 className="text-4xl font-bold text-navy" style={{ fontFamily: 'Syne, sans-serif' }}>How it works</h2>
            <div className="flex-1 border-t-2 border-navy/10" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 border-2 border-navy">
            {[
              {
                n: '01',
                title: 'Tell us what happened',
                body: 'Three short steps. The offender, the event, the excuse. Takes about two minutes.',
              },
              {
                n: '02',
                title: 'Get your Tardiness Score',
                body: 'Five factors — relative lateness, event severity, their role, the excuse, the notice given — weighted and combined.',
              },
              {
                n: '03',
                title: 'Share the verdict',
                body: 'Screenshot it. Send it to the group chat. Let the data speak for itself.',
              },
            ].map((item, i) => (
              <div key={item.n} className={`p-8 ${i < 2 ? 'border-b-2 sm:border-b-0 sm:border-r-2 border-navy' : ''}`}>
                <div className="text-5xl font-bold text-navy/10 mb-6" style={{ fontFamily: 'Syne, sans-serif' }}>{item.n}</div>
                <h3 className="text-lg font-bold text-navy mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verdicts */}
      <section className="border-b-2 border-navy bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex items-baseline gap-6 mb-16">
            <h2 className="text-4xl font-bold text-navy" style={{ fontFamily: 'Syne, sans-serif' }}>The Six Verdicts</h2>
            <div className="flex-1 border-t-2 border-navy/10" />
            <p className="text-sm text-gray-400 font-medium hidden sm:block">From petty infraction to unforgivable act.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-navy border-2 border-navy">
            {VERDICT_TIERS.map(([verdict, range, cls, rangeCls]) => (
              <div key={verdict} className={`p-6 flex items-start justify-between gap-4 ${cls}`}>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-50 mb-2">{range}</p>
                  <p className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif' }}>{VERDICT_LABELS[verdict]}</p>
                </div>
                <span className={`text-3xl font-bold opacity-30 ${rangeCls}`} style={{ fontFamily: 'Syne, sans-serif' }}>
                  {range.split('–')[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8">
          <div>
            <h2 className="text-4xl sm:text-5xl font-bold text-navy leading-tight" style={{ fontFamily: 'Syne, sans-serif' }}>
              Someone was late<br />to you recently,<br />weren&apos;t they.
            </h2>
          </div>
          <div className="shrink-0">
            <p className="text-gray-400 text-sm mb-6 max-w-xs">
              A text message doesn&apos;t undo the lateness. But it changes the experience of waiting for it.
            </p>
            <Link href="/submit" className="btn-primary px-10 py-4 text-sm">
              Get the Verdict →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-navy py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 uppercase tracking-widest font-medium">
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
