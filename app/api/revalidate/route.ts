/**
 * On-demand revalidation webhook (backend → web). The backend calls this when a
 * game is created/updated/removed so the affected static page (and the sitemap)
 * refresh immediately instead of waiting for the time-based revalidate.
 *
 * Auth: a shared secret in the `gt-revalidate-secret` header (set `REVALIDATE_SECRET`
 * in the server env — NOT `NEXT_PUBLIC_`). If unset, every call is rejected.
 *
 * Body: `{ type: "UPSERT" | "DELETE", slug, id }`. Both types revalidate the
 * game's tag (a DELETE then 404s on next render) and the sitemap tag.
 */
import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const bodySchema = z.object({
  type: z.enum(['UPSERT', 'DELETE']),
  slug: z.string(),
  id: z.string(),
})

export async function POST(request: Request): Promise<NextResponse> {
  // Server-only secret read DIRECTLY from the environment — NOT via `lib/config/env`
  // (that module validates the public `NEXT_PUBLIC_*` vars and is bundled for the
  // client, where a non-public secret is always `undefined`). This route handler only
  // ever runs on the server, so `process.env` is the correct, leak-free source.
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || request.headers.get('gt-revalidate-secret') !== secret) {
    return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
  }

  let body: z.infer<typeof bodySchema>
  try {
    body = bodySchema.parse(await request.json())
  } catch {
    return NextResponse.json({ error: 'INVALID_BODY' }, { status: 400 })
  }

  revalidateTag(`game:${body.slug}`, 'max')
  revalidateTag('game-sitemap', 'max')

  return NextResponse.json({
    revalidated: true,
    slug: body.slug,
    type: body.type,
  })
}
