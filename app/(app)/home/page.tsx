/**
 * Home feed placeholder (Phase 5, Slice A). Proves the `(app)` shell works end to
 * end: it only renders once `AuthGate` reports an authenticated session, and reads
 * the current user from `useSession()`. Slice C replaces this with the real
 * Netflix-style feed (rows of `GameCarousel`).
 */
'use client'

import { Button } from '@/components/ui/button'
import { useSession } from '@/features/auth'

export default function HomePage() {
  const { user, signOut } = useSession()

  return (
    <main className="mx-auto flex min-h-svh max-w-5xl flex-col items-start justify-center gap-4 px-6">
      <h1 className="font-heading text-2xl font-semibold">
        {user?.nickname ? `¡Hola, ${user.nickname}!` : 'Home'}
      </h1>
      <p className="text-muted-foreground">
        El feed llega en el siguiente slice. La sesión está activa.
      </p>
      <Button variant="outline" onClick={() => signOut()}>
        Cerrar sesión
      </Button>
    </main>
  )
}
