import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '../../../../lib/supabase'
import { calculateScore, calculateMinutesLate, EVENT_DURATION_MINUTES, NOTICE_TYPE_SCORES } from '../../../../lib/scoring'
import type { FormData, EventDuration, NoticeType, NoticeTiming, NoticeMethod } from '../../../../lib/types'

// Map the consolidated notice_type back to legacy DB columns
function mapNoticeType(noticeType: NoticeType): {
  gave_notice: boolean
  notice_timing: NoticeTiming | null
  notice_method: NoticeMethod | null
} {
  switch (noticeType) {
    case 'no_contact':
      return { gave_notice: false, notice_timing: null, notice_method: 'none' }
    case 'called_early':
      return { gave_notice: true, notice_timing: '30_60min', notice_method: 'phone_call' }
    case 'called_late':
      return { gave_notice: true, notice_timing: 'under_10min', notice_method: 'phone_call' }
    case 'texted_early':
      return { gave_notice: true, notice_timing: '30_60min', notice_method: 'text' }
    case 'texted_late':
      return { gave_notice: true, notice_timing: 'under_10min', notice_method: 'text' }
    case 'after_arriving':
      return { gave_notice: true, notice_timing: 'after_agreed', notice_method: 'text' }
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: FormData = await req.json()

    if (!body.offender_name?.trim()) {
      return NextResponse.json({ error: 'Offender name is required' }, { status: 400 })
    }
    if (!body.event_type || !body.agreed_time || !body.event_duration || !body.offender_role) {
      return NextResponse.json({ error: 'Missing required event fields' }, { status: 400 })
    }
    if (!body.no_show && !body.actual_arrival) {
      return NextResponse.json({ error: 'Arrival time is required unless no-show' }, { status: 400 })
    }

    const scores = calculateScore(body)
    if (!scores) {
      return NextResponse.json({ error: 'Could not calculate score' }, { status: 400 })
    }

    const minutesLate = body.no_show
      ? EVENT_DURATION_MINUTES[body.event_duration as EventDuration]
      : calculateMinutesLate(body.agreed_time, body.actual_arrival)

    const noticeFields = body.notice_type ? mapNoticeType(body.notice_type as NoticeType) : {
      gave_notice: false,
      notice_timing: null,
      notice_method: null,
    }

    const gaveExcuse = !!body.excuse_type && body.excuse_type !== 'none'

    const { data, error } = await supabase
      .from('entries')
      .insert({
        offender_name: body.offender_name.trim(),
        relationship: null,
        offender_role: body.offender_role,
        event_description: body.event_description || null,
        event_type: body.event_type,
        agreed_time: body.agreed_time,
        event_duration: body.event_duration,
        people_waiting: 1,
        actual_arrival: body.no_show ? null : body.actual_arrival,
        no_show: body.no_show,
        minutes_late: minutesLate,
        gave_notice: noticeFields.gave_notice,
        notice_timing: noticeFields.notice_timing,
        notice_method: noticeFields.notice_method,
        repeat_offender: body.repeat_offender,
        gave_excuse: gaveExcuse,
        excuse_text: null,
        excuse_category: gaveExcuse ? body.excuse_type : null,
        excuse_convincing: null,
        could_have_avoided: gaveExcuse ? body.could_have_avoided || null : null,
        apologised: body.apologised || null,
        annoyance_level: body.annoyance_level,
        event_impact: null,
        forgiven: body.forgiven,
        will_do_again: null,
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
