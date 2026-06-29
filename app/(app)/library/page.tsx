/** Library placeholder (Phase 5). Real whitelist/library views land in Slice F. */
'use client'

import { useDictionary } from '@/lib/i18n/hooks/use-i18n'

export default function LibraryPage() {
  const dict = useDictionary()
  return (
    <main className="flex flex-col gap-2 p-6">
      <h1 className="font-heading text-2xl font-semibold">{dict.app.nav.library}</h1>
      <p className="text-muted-foreground">Próximamente.</p>
    </main>
  )
}
