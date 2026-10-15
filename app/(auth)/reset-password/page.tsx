/**
 * `/reset-password?id=<uuid>` — landing for the backend's password-reset email (the
 * native apps request it too, so this web page is where every platform's link ends).
 * The `id` is the backend `resetId`; the form validates it before rendering.
 */
import { ResetPasswordForm } from '@/features/auth'

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string | string[] }>
}) {
  const { id } = await searchParams
  const resetId = typeof id === 'string' ? id : null

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <ResetPasswordForm resetId={resetId} />
    </main>
  )
}
