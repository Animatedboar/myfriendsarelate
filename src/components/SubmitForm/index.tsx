'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { FormData } from '../../../lib/types'
import { calculateScore } from '../../../lib/scoring'
import StepOffender from './StepOffender'
import StepEvent from './StepEvent'
import StepLateness from './StepLateness'
import StepExcuse from './StepExcuse'
import StepReaction from './StepReaction'

const INITIAL_DATA: FormData = {
  offender_name: '',
  relationship: '',
  offender_role: '',
  event_description: '',
  event_type: '',
  agreed_time: '',
  event_duration: '',
  people_waiting: 1,
  actual_arrival: '',
  no_show: false,
  gave_notice: false,
  notice_timing: '',
  notice_method: '',
  repeat_offender: '',
  gave_excuse: false,
  excuse_text: '',
  excuse_category: '',
  excuse_convincing: 5,
  could_have_avoided: '',
  apologised: '',
  annoyance_level: 5,
  event_impact: '',
  forgiven: '',
  will_do_again: '',
  extra_context: '',
}

const STEPS = [
  { title: 'About the Offender', subtitle: 'Who we are judging today.' },
  { title: 'About the Event', subtitle: 'Context is everything.' },
  { title: 'About the Lateness', subtitle: "The facts, as you experienced them." },
  { title: 'About the Excuse', subtitle: 'Their defence, if any.' },
  { title: 'Your Reaction', subtitle: 'The human cost.' },
]

function isStepValid(step: number, data: FormData): boolean {
  switch (step) {
    case 0:
      return !!data.offender_name.trim() && !!data.relationship && !!data.offender_role
    case 1:
      return !!data.event_type && !!data.agreed_time && !!data.event_duration
    case 2:
      return (data.no_show || !!data.actual_arrival) && !!data.repeat_offender
    case 3:
      return !!data.apologised
    case 4:
      return !!data.event_impact && !!data.forgiven && !!data.will_do_again
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

  const liveScore = calculateScore(data)

  const handleNext = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

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

  const currentStep = STEPS[step]
  const valid = isStepValid(step, data)
  const isLast = step === STEPS.length - 1

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {STEPS.map((s, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 ${
                  i < step
                    ? 'bg-ember text-white'
                    : i === step
                    ? 'bg-navy text-white ring-4 ring-navy/20'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {i < step ? '✓' : i + 1}
              </div>
            </div>
          ))}
        </div>
        <div className="relative h-1.5 bg-gray-100 rounded-full mt-2">
          <div
            className="absolute top-0 left-0 h-full bg-ember rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step header */}
      <div className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-ember mb-1">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 className="text-2xl font-bold text-navy">{currentStep.title}</h2>
        <p className="text-gray-500 mt-1">{currentStep.subtitle}</p>
      </div>

      {/* Step content */}
      <div className="mb-10">
        {step === 0 && <StepOffender data={data} onChange={handleChange} />}
        {step === 1 && <StepEvent data={data} onChange={handleChange} />}
        {step === 2 && <StepLateness data={data} onChange={handleChange} />}
        {step === 3 && <StepExcuse data={data} onChange={handleChange} />}
        {step === 4 && (
          <StepReaction data={data} onChange={handleChange} liveScore={liveScore} />
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
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
            onClick={handleNext}
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
