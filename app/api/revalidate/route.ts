/**
 * On-demand revalidation webhook (backend → web). The backend calls this when a
 * game is created/updated/removed so the affected static page (and the sitemap)
 * refresh immediately instead of waiting for the time-based revalidate.
 *
 * Auth: a shared secret in the `jg-revalidate-secret` header (set `REVALIDATE_SECRET`
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
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || request.headers.get('jg-revalidate-secret') !== secret) {
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
