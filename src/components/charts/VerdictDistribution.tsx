'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { VERDICT_LABELS } from '../../../lib/scoring'
import type { VerdictKey } from '../../../lib/types'

const COLORS: Record<VerdictKey, string> = {
  saint: '#10b981',
  fashionably_late: '#f59e0b',
  chronic_offender: '#f97316',
  disrespecter: '#ef4444',
  repeat_criminal: '#dc2626',
  time_terrorist: '#1f2937',
}

interface Props {
  data: { verdict: VerdictKey; count: number }[]
}

const ORDER: VerdictKey[] = [
  'saint',
  'fashionably_late',
  'chronic_offender',
  'disrespecter',
  'repeat_criminal',
  'time_terrorist',
]

export default function VerdictDistribution({ data }: Props) {
  const sorted = ORDER.map((v) => ({
    verdict: v,
    label: VERDICT_LABELS[v].replace('The ', ''),
    count: data.find((d) => d.verdict === v)?.count ?? 0,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={sorted} margin={{ top: 4, right: 4, bottom: 4, left: 0 }}>
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          interval={0}
          angle={-20}
          textAnchor="end"
          height={48}
        />
        <YAxis tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          formatter={(value: number) => [value, 'Entries']}
          contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
          {sorted.map((entry) => (
            <Cell key={entry.verdict} fill={COLORS[entry.verdict]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
