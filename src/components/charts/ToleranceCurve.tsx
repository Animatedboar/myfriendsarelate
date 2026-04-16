'use client'

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface Props {
  data: { bracket: string; avg_annoyance: number; count: number }[]
}

const ORDER = ['0–5', '6–15', '16–30', '31–60', '61–120', '120+']

export default function ToleranceCurve({ data }: Props) {
  const sorted = ORDER.map((bracket) => ({
    bracket,
    avg_annoyance: data.find((d) => d.bracket === bracket)?.avg_annoyance ?? null,
    count: data.find((d) => d.bracket === bracket)?.count ?? 0,
  })).filter((d) => d.count > 0)

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={sorted} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
        <XAxis
          dataKey="bracket"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Minutes Late', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#9ca3af' }}
        />
        <YAxis
          domain={[0, 10]}
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          label={{ value: 'Avg Annoyance', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#9ca3af' }}
        />
        <Tooltip
          formatter={(value: number) => [value, 'Avg Annoyance (0–10)']}
          contentStyle={{ border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="avg_annoyance"
          stroke="#E8543A"
          strokeWidth={2.5}
          dot={{ fill: '#E8543A', r: 4 }}
          connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
