import type { Metadata } from 'next'
import Link from 'next/link'
import SubmitForm from '../../components/SubmitForm'

export const metadata: Metadata = {
  title: 'Submit an Entry',
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
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

      <main className="max-w-3xl mx-auto px-6 py-14 flex-1 w-full">
        <div className="mb-12">
          <p className="text-xs font-bold uppercase tracking-widest text-ember mb-3">File a report</p>
          <h1 className="text-4xl font-bold text-navy" style={{ fontFamily: 'Syne, sans-serif' }}>
            Tell us what happened.
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Three steps. Two minutes. One verdict.</p>
        </div>
        <SubmitForm />
      </main>

      <footer className="border-t-2 border-navy mt-16 py-6">
        <div className="max-w-3xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400 uppercase tracking-widest font-medium">
          <span>My Friends Are Late</span>
          <div className="flex gap-8">
            <Link href="/dashboard" className="hover:text-navy transition-colors">Dashboard</Link>
            <Link href="/hall-of-fame" className="hover:text-navy transition-colors">Hall of Fame</Link>
            <Link href="/submit" className="hover:text-navy transition-colors">Submit</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
