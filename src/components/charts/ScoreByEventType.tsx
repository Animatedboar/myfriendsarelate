'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import type { EventType } from '../../../lib/types'

const EVENT_LABELS: Record<EventType, string> = {
  casual: 'Casual',
  dinner_home: 'Dinner',
  restaurant: 'Restaurant',
  movie: 'Movie',
  concert: 'Concert',
  escape_room: 'Escape Room',
  flight: 'Flight',
  wedding: 'Wedding',
  professional: 'Professional',
}

interface Props {
  data: { event_type: EventType; avg_score: number; count: number }[]
}

function scoreColor(score: number): string {
  if (score < 30) return '#10b981'
  if (score < 50) return '#f59e0b'
  if (score < 70) return '#f97316'
  return '#ef4444'
}

export default function ScoreByEventType({ data }: Props) {
  const sorted = [...data].sort((a, b) => b.avg_score - a.avg_score)

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={sorted.map((d) => ({ ...d, label: EVENT_LABELS[d.event_type] }))}
        layout="vertical"
        margin={{ top: 4, right: 48, bottom: 4, left: 80 }}
      >
        <XAxis type="number" domain={[0, 120]} tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} />
        <YAxis type="category" dataKey="label" tick={{ fontSize: 11, fill: '#6b7280' }} tickLine={false} axisLine={false} width={76} />
        <Tooltip
          formatter={(value: number) => [value, 'Avg Score']}
          contentStyle={{ border: '2px solid #1B2A4A', borderRadius: 0, fontSize: 12, fontFamily: 'DM Sans, sans-serif' }}
          cursor={{ fill: 'rgba(27,42,74,0.04)' }}
        />
        <Bar dataKey="avg_score">
          {sorted.map((entry) => (
            <Cell key={entry.event_type} fill={scoreColor(entry.avg_score)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
