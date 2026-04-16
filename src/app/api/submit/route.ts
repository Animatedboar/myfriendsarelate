import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { calculateScore, calculateMinutesLate, EVENT_DURATION_MINUTES } from '../../../../lib/scoring'
import type { FormData, EventDuration } from '../../../../lib/types'

export async function POST(req: NextRequest) {
  try {
    const body: FormData = await req.json()

    // Basic validation
    if (!body.offender_name?.trim()) {
      return NextResponse.json({ error: 'Offender name is required' }, { status: 400 })
    }
    if (!body.event_type || !body.agreed_time || !body.event_duration || !body.offender_role) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 })
    }
    if (!body.no_show && !body.actual_arrival) {
      return NextResponse.json({ error: 'Arrival time is required unless no-show' }, { status: 400 })
    }

    // Calculate score server-side
    const scores = calculateScore(body)
    if (!scores) {
      return NextResponse.json({ error: 'Could not calculate score from provided data' }, { status: 400 })
    }

    // Compute minutes_late
    let minutesLate: number
    if (body.no_show) {
      minutesLate = EVENT_DURATION_MINUTES[body.event_duration as EventDuration] ?? 90
    } else {
      minutesLate = calculateMinutesLate(body.agreed_time, body.actual_arrival)
    }

    const { data, error } = await supabase
      .from('entries')
      .insert({
        offender_name: body.offender_name.trim(),
        relationship: body.relationship,
        offender_role: body.offender_role,
        event_description: body.event_description || null,
        event_type: body.event_type,
        agreed_time: body.agreed_time,
        event_duration: body.event_duration,
        people_waiting: body.people_waiting ?? 1,
        actual_arrival: body.no_show ? null : body.actual_arrival,
        no_show: body.no_show,
        minutes_late: minutesLate,
        gave_notice: body.gave_notice,
        notice_timing: body.gave_notice ? body.notice_timing || null : null,
        notice_method: body.gave_notice ? body.notice_method || null : null,
        repeat_offender: body.repeat_offender,
        gave_excuse: body.gave_excuse,
        excuse_text: body.gave_excuse ? body.excuse_text || null : null,
        excuse_category: body.gave_excuse ? body.excuse_category || null : null,
        excuse_convincing: body.gave_excuse ? body.excuse_convincing : null,
        could_have_avoided: body.gave_excuse ? body.could_have_avoided || null : null,
        apologised: body.apologised || null,
        annoyance_level: body.annoyance_level,
        event_impact: body.event_impact,
        forgiven: body.forgiven,
        will_do_again: body.will_do_again,
        extra_context: body.extra_context || null,
        relative_time_score: scores.relativeTimeScore,
        event_type_score: scores.eventTypeScore,
        importance_score: scores.importanceScore,
        excuse_score: scores.excuseScore,
        notice_score: scores.noticeScore,
        final_score: scores.finalScore,
        verdict: scores.verdict,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Supabase insert error:', error)
      return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 })
    }

    return NextResponse.json({ id: data.id })
  } catch (err) {
    console.error('Submit error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
