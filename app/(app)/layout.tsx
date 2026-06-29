/**
 * Layout for the authenticated `(app)` zone (`/home` and descendants).
 *
 * This is the one place locale detection is allowed to force dynamic rendering
 * (`getServerLocale` reads `headers()`): the app zone is never statically generated,
 * so it's safe here — unlike the root layout or the SEO zone (see AGENTS.md i18n).
 *
 * Provider order (outer→inner): I18n (dict as a prop, so it doesn't re-detect on the
 * client) → Session (hydrates from localStorage) → Tooltip → AuthGate (renders the
 * undismissable AuthModal until authenticated). The Toaster is a global sibling,
 * pinned to dark because the app forces `<html class="dark">` without next-themes.
 */
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthGate, SessionProvider } from '@/features/auth'
import { getDictionary } from '@/lib/i18n'
import { I18nProvider } from '@/lib/i18n/contexts/i18n-provider'
import { getServerLocale } from '@/lib/i18n/server'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale()
  const dictionary = await getDictionary(locale)

  return (
    <I18nProvider locale={locale} dictionary={dictionary}>
      <SessionProvider>
        <TooltipProvider>
          <AuthGate>{children}</AuthGate>
          <Toaster theme="dark" position="top-center" />
        </TooltipProvider>
      </SessionProvider>
    </I18nProvider>
  )
}
