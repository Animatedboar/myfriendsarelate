import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'My Friends Are Late',
    template: '%s | My Friends Are Late',
  },
  description:
    'Lateness is never just about time. Submit an instance of a friend being late and get a Tardiness Score — a data-driven verdict on exactly how bad it was.',
  openGraph: {
    title: 'My Friends Are Late',
    description: 'Get a data-driven verdict on how late your friend actually was.',
    siteName: 'My Friends Are Late',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-white">{children}</body>
    </html>
  )
}
