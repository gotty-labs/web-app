import type { Metadata } from 'next'
import { Geist_Mono, Montserrat, Pixelify_Sans, Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Agentation } from 'agentation'

import { env } from '@/lib/config/env'

import './globals.css'

// Body / UI — neutral, highly legible workhorse (Source Sans Pro is now "Source
// Sans 3" on Google Fonts). Variable font → all weights, no `weight` needed.
const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
})

// Headings (`font-heading`) — geometric display with more presence.
const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
})

const pixelifySans = Pixelify_Sans({
  variable: '--font-pixelify-sans',
  subsets: ['latin'],
})

// Mono token (code / tabular) — rarely surfaced, kept for completeness.
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: 'JustGame', template: '%s · JustGame' },
  description: 'Descubre, guarda y sigue tus videojuegos.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`dark ${sourceSans.variable} ${montserrat.variable} ${pixelifySans.variable} ${geistMono.variable} h-full antialiased motion-safe:scroll-smooth`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
        <SpeedInsights />
        {/* Dev-only visual feedback tool — tree-shaken out of production builds. */}
        {env.nodeEnv === 'development' && <Agentation />}
      </body>
    </html>
  )
}
