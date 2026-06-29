/** Settings placeholder (Phase 5). Console exclusions + verify-email land in Slice G. */
'use client'

import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

export default function SettingsPage() {
  const dict = useDictionary()
  return (
    <main className="flex flex-col gap-2 p-6">
      <h1 className="font-heading text-2xl font-semibold">{dict.app.profile.settings}</h1>
      <p className="text-muted-foreground">Próximamente.</p>
    </main>
  )
}
