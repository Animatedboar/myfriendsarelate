'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FormData } from '../../../lib/types'
import StepOne from './StepOne'
import StepTwo from './StepTwo'
import StepThree from './StepThree'

const INITIAL_DATA: FormData = {
  offender_name: '',
  relationship: '',
  offender_role: '',
  event_description: '',
  event_type: '',
  event_duration: '',
  people_waiting: 1,
  agreed_time: '',
  actual_arrival: '',
  no_show: false,
  notice_type: '',
  repeat_offender: '',
  excuse_type: '',
  could_have_avoided: '',
  apologised: '',
  annoyance_level: 5,
  event_impact: '',
  forgiven: '',
  extra_context: '',
}

const STEPS = [
  { title: 'The Offender & Event',   subtitle: 'Set the scene.' },
  { title: 'What Happened',          subtitle: 'The facts, as you experienced them.' },
  { title: 'The Excuse & Your Take', subtitle: 'Their defence. Your reaction.' },
]

function isStepValid(step: number, data: FormData): boolean {
  switch (step) {
    case 0:
      return (
        !!data.offender_name.trim() &&
        !!data.relationship &&
        !!data.offender_role &&
        !!data.event_type &&
        !!data.event_duration &&
        !!data.people_waiting
      )
    case 1:
      return (
        !!data.agreed_time &&
        (data.no_show || !!data.actual_arrival) &&
        !!data.notice_type &&
        !!data.repeat_offender
      )
    case 2:
      return (
        !!data.excuse_type &&
        (data.excuse_type === 'none' || !!data.could_have_avoided) &&
        !!data.apologised &&
        !!data.event_impact &&
        !!data.forgiven
      )
    default:
      return false
  }
}

export default function SubmitForm() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(INITIAL_DATA)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (updates: Partial<FormData>) => {
    setData((prev) => ({ ...prev, ...updates }))
  }

  const valid = isStepValid(step, data)
  const isLast = step === STEPS.length - 1

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Submission failed')
      }
      const { id } = await res.json()
      router.push(`/result/${id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const current = STEPS[step]

  return (
    <div className="max-w-2xl mx-auto">

      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center flex-1">
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all duration-200 ${
                    i < step
                      ? 'bg-ember border-ember text-white'
                      : i === step
                      ? 'bg-navy border-navy text-white'
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  {i < step ? '✓' : i + 1}
                </div>
                <span className={`text-xs font-bold uppercase tracking-widest hidden sm:block ${
                  i === step ? 'text-navy' : 'text-gray-300'
                }`}>
                  {s.title}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className="flex-1 h-0.5 bg-gray-100 mx-4 overflow-hidden">
                  <div
                    className="h-full bg-ember transition-all duration-300"
                    style={{ width: i < step ? '100%' : '0%' }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step header */}
      <div className="mb-8 pb-6 border-b-2 border-navy">
        <p className="text-xs font-bold uppercase tracking-widest text-ember mb-1">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="text-2xl font-bold text-navy" style={{ fontFamily: 'Syne, sans-serif' }}>
          {current.title}
        </h2>
        <p className="text-gray-400 mt-1 text-sm">{current.subtitle}</p>
      </div>

      {/* Step content */}
      <div className="mb-10">
        {step === 0 && <StepOne data={data} onChange={handleChange} />}
        {step === 1 && <StepTwo data={data} onChange={handleChange} />}
        {step === 2 && <StepThree data={data} onChange={handleChange} />}
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 border-2 border-red-300 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t-2 border-gray-100">
        <button
          type="button"
          onClick={() => setStep((s) => s - 1)}
          disabled={step === 0}
          className="btn-ghost disabled:opacity-0 disabled:pointer-events-none"
        >
          ← Back
        </button>

        {isLast ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!valid || submitting}
            className="btn-primary"
          >
            {submitting ? 'Submitting…' : 'Get the Verdict →'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            disabled={!valid}
            className="btn-primary"
          >
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
