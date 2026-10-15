/**
 * Layout for the standalone, session-less auth zone (`/reset-password`, the target
 * of the backend's reset email). It is its own root layout on purpose: unlike `(app)`
 * there is NO `SessionProvider`/`AuthGate` (a reset link must not silently start a
 * guest session or raise the auth modal), and unlike the marketing zone it's
 * noindex and detects the system locale (dynamic render is fine here, never SSG'd).
 */
import { Toaster } from '@/components/ui/sonner'
import { ErrorProvider } from '@/contexts/error-provider'
import { getDictionary } from '@/lib/i18n'
import { I18nProvider } from '@/lib/i18n/contexts/i18n-provider'
import { getServerLocale } from '@/lib/i18n/server'

import { rootHtmlClassName, rootMetadata, RootContent } from '../_shared'

import '../globals.css'

export const metadata = {
  ...rootMetadata,
  robots: { index: false, follow: false },
}

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale()
  const dictionary = await getDictionary(locale)

  return (
    <html lang={locale} className={rootHtmlClassName}>
      <body className="flex min-h-full flex-col">
        <RootContent>
          <I18nProvider locale={locale} dictionary={dictionary}>
            <ErrorProvider>
              {children}
              <Toaster theme="dark" position="top-center" />
            </ErrorProvider>
          </I18nProvider>
        </RootContent>
      </body>
    </html>
  )
}
