import type { Metadata } from 'next'
import Link from 'next/link'
import SubmitForm from '../../components/SubmitForm'

export const metadata: Metadata = {
  title: 'Submit an Entry',
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b-2 border-navy">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-navy hover:text-ember transition-colors"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            My Friends Are Late
          </Link>
          <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-navy transition-colors">
            Dashboard →
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-14">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-ember mb-3">File a report</p>
          <h1 className="text-4xl font-bold text-navy" style={{ fontFamily: 'Syne, sans-serif' }}>
            Tell us what happened.
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Three steps. Two minutes. One verdict.</p>
        </div>
        <SubmitForm />
      </main>
    </div>
  )
}
