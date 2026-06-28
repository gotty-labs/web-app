import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import { env } from '@/lib/config/env'

import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

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
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  )
}
