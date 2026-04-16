import { NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import type { VerdictKey, EventType, ExcuseCategory } from '../../../../lib/types'

export const revalidate = 300 // cache for 5 minutes

export async function GET() {
  try {
    // Fetch all entries (for small-scale MVP; aggregate server-side)
    const { data: entries, error } = await supabase
      .from('entries')
      .select(
        'verdict, final_score, event_type, excuse_category, gave_excuse, forgiven, annoyance_level, minutes_late, created_at, offender_name, event_description, no_show, apologised, id'
      )
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!entries || entries.length === 0) {
      return NextResponse.json({
        totalEntries: 0,
        averageScore: 0,
        verdictDistribution: [],
        scoreByEventType: [],
        toleranceCurve: [],
        forgivenessRate: [],
        topOffenders: [],
      })
    }

    // Total & average
    const totalEntries = entries.length
    const averageScore =
      Math.round((entries.reduce((s, e) => s + e.final_score, 0) / totalEntries) * 10) / 10

    // Verdict distribution
    const verdictCounts: Partial<Record<VerdictKey, number>> = {}
    for (const e of entries) {
      verdictCounts[e.verdict as VerdictKey] = (verdictCounts[e.verdict as VerdictKey] ?? 0) + 1
    }
    const verdictDistribution = Object.entries(verdictCounts).map(([verdict, count]) => ({
      verdict: verdict as VerdictKey,
      count: count!,
    }))

    // Average score by event type
    const byEventType: Record<string, { sum: number; count: number }> = {}
    for (const e of entries) {
      if (!byEventType[e.event_type]) byEventType[e.event_type] = { sum: 0, count: 0 }
      byEventType[e.event_type].sum += e.final_score
      byEventType[e.event_type].count++
    }
    const scoreByEventType = Object.entries(byEventType).map(([event_type, { sum, count }]) => ({
      event_type: event_type as EventType,
      avg_score: Math.round((sum / count) * 10) / 10,
      count,
    }))

    // Tolerance curve: avg annoyance by minutes-late bracket
    const brackets: Record<string, { sum: number; count: number }> = {
      '0–5': { sum: 0, count: 0 },
      '6–15': { sum: 0, count: 0 },
      '16–30': { sum: 0, count: 0 },
      '31–60': { sum: 0, count: 0 },
      '61–120': { sum: 0, count: 0 },
      '120+': { sum: 0, count: 0 },
    }
    for (const e of entries) {
      const m = e.minutes_late ?? 0
      const bracket =
        m <= 5 ? '0–5' : m <= 15 ? '6–15' : m <= 30 ? '16–30' : m <= 60 ? '31–60' : m <= 120 ? '61–120' : '120+'
      brackets[bracket].sum += e.annoyance_level
      brackets[bracket].count++
    }
    const toleranceCurve = Object.entries(brackets)
      .filter(([, { count }]) => count > 0)
      .map(([bracket, { sum, count }]) => ({
        bracket,
        avg_annoyance: Math.round((sum / count) * 10) / 10,
        count,
      }))

    // Forgiveness rate by excuse category
    const forgiveByCategory: Record<string, { forgiven: number; total: number }> = {}
    for (const e of entries) {
      const cat = e.gave_excuse ? (e.excuse_category as ExcuseCategory) ?? 'other' : 'no_excuse'
      if (!forgiveByCategory[cat]) forgiveByCategory[cat] = { forgiven: 0, total: 0 }
      forgiveByCategory[cat].total++
      if (e.forgiven === 'yes_completely' || e.forgiven === 'mostly') {
        forgiveByCategory[cat].forgiven++
      }
    }
    const forgivenessRate = Object.entries(forgiveByCategory).map(
      ([excuse_category, { forgiven, total }]) => ({
        excuse_category: excuse_category as ExcuseCategory | 'no_excuse',
        forgiven_rate: Math.round((forgiven / total) * 100),
        count: total,
      })
    )

    // Top offenders (top 25 by score)
    const topOffenders = await supabase
      .from('entries')
      .select('*')
      .order('final_score', { ascending: false })
      .limit(25)

    return NextResponse.json({
      totalEntries,
      averageScore,
      verdictDistribution,
      scoreByEventType,
      toleranceCurve,
      forgivenessRate,
      topOffenders: topOffenders.data ?? [],
    })
  } catch (err) {
    console.error('Stats error:', err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
