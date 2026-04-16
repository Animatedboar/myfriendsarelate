import type { Metadata } from 'next'
import Link from 'next/link'
import SubmitForm from '../../components/SubmitForm'

export const metadata: Metadata = {
  title: 'Submit an Entry',
  description: 'Tell us what happened. We\'ll tell you exactly how bad it was.',
}

export default function SubmitPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-navy font-bold text-lg hover:text-ember transition-colors">
            My Friends Are Late
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-navy transition-colors">
            Dashboard →
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <SubmitForm />
      </main>
    </div>
  )
}
