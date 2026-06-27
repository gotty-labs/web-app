/**
 * Public SEO game detail — static + ISR (the SEO data layer; visual design lands
 * in Phase 5). Under the `(marketing)` route group → URL stays `/games/[slug]`.
 *
 * Pipeline (see memory `seo-rendering-strategy`):
 *  - `generateStaticParams` pre-renders known games at build (from `/game/sitemaps`).
 *  - `dynamicParams = true` renders unknown/new slugs on-demand → no redeploy needed.
 *  - `revalidate` + the `/api/revalidate` webhook keep pages fresh.
 *  - No token, no `getServerLocale` here → stays static (renders in the default locale
 *    for crawlers; the en/es SEO decision is the pending breakpoint).
 *
 * Resilient to a not-yet-built backend: data loaders catch failures so the build
 * succeeds (prerenders nothing, falls back to on-demand) until the endpoints ship.
 */
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPublicGame, getSitemapEntries } from "@/features/game/services/seo";
import { env } from "@/lib/config/env";

export const revalidate = 3600; // must be a literal for static analysis
export const dynamicParams = true;

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const entries = await getSitemapEntries();
    return entries.map((entry) => ({ slug: entry.slug }));
  } catch {
    return [];
  }
}

async function loadGame(slug: string) {
  try {
    return await getPublicGame(slug);
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const game = await loadGame(slug);
  if (!game) return {};

  const url = `${env.siteUrl}/games/${slug}`;
  return {
    title: game.name,
    description: game.description,
    alternates: { canonical: url },
    openGraph: {
      title: game.name,
      description: game.description,
      url,
      images: game.media?.cover ? [game.media.cover] : undefined,
    },
  };
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const game = await loadGame(slug);
  if (!game) notFound();

  // Minimal placeholder render — styled in Phase 5.
  return (
    <main>
      <h1>{game.name}</h1>
      {game.description ? <p>{game.description}</p> : null}
    </main>
  );
}
