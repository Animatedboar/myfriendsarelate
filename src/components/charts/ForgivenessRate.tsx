'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { ExcuseCategory } from '../../../lib/types'

const LABELS: Record<ExcuseCategory | 'no_excuse', string> = {
  emergency: 'Emergency',
  traffic: 'Traffic',
  work: 'Work',
  forgot: 'Forgot',
  overslept: 'Overslept',
  other: 'Other',
  no_excuse: 'No excuse',
}

interface Props {
  data: { excuse_category: ExcuseCategory | 'no_excuse'; forgiven_rate: number; count: number }[]
}

function rateColor(rate: number): string {
  if (rate >= 70) return '#10b981'
  if (rate >= 40) return '#f59e0b'
  return '#ef4444'
}

export default function ForgivenessRate({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.forgiven_rate - a.forgiven_rate)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={sorted.map((d) => ({ ...d, label: LABELS[d.excuse_category] }))}
        layout="vertical"
        margin={{ top: 4, right: 48, bottom: 4, left: 72 }}
      >
        <XAxis
          type="number"
          domain={[0, 100]}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `${v}%`}
        />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={68} />
        <Tooltip
          formatter={(value: number) => [`${value}%`, 'Forgiveness rate']}
          contentStyle={{ border: '2px solid #1B2A4A', borderRadius: 0, fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}
          cursor={{ fill: 'rgba(27,42,74,0.04)' }}
        />
        <Bar dataKey="forgiven_rate">
          {sorted.map((entry) => (
            <Cell key={entry.excuse_category} fill={rateColor(entry.forgiven_rate)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
