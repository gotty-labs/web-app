import type { Metadata } from 'next'
import { Geist_Mono, Montserrat, Pixelify_Sans, Source_Sans_3 } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Agentation } from 'agentation'

import { AnalyticsProvider } from '@/contexts/analytics-provider'
import { env } from '@/lib/config/env'

const sourceSans = Source_Sans_3({
  variable: '--font-source-sans',
  subsets: ['latin'],
})

const montserrat = Montserrat({
  variable: '--font-montserrat',
  subsets: ['latin'],
})

const pixelifySans = Pixelify_Sans({
  variable: '--font-pixelify-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const rootHtmlClassName = `dark ${sourceSans.variable} ${montserrat.variable} ${pixelifySans.variable} ${geistMono.variable} h-full antialiased motion-safe:scroll-smooth`

export const rootMetadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: 'Gotty', template: '%s · Gotty' },
  description: 'Descubre, guarda y sigue tus videojuegos.',
  ...(env.advertising.adsense.clientId
    ? {
        other: {
          'google-adsense-account': env.advertising.adsense.clientId,
        },
      }
    : {}),
}

/** Providers and observability shared by every root layout. */
export function RootContent({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AnalyticsProvider>{children}</AnalyticsProvider>
      <Analytics />
      <SpeedInsights />
      {env.nodeEnv === 'development' && <Agentation />}
    </>
  )
}
