This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Public landing and discovery

The public landing and discovery pages are published in English and Spanish, each at
its own fixed URL, regardless of the browser language (no detection, cookies or
redirects):

| Page      | English     | Spanish        |
| --------- | ----------- | -------------- |
| Landing   | `/`         | `/es`          |
| Discovery | `/discover` | `/es/discover` |

- Both routes of a pair render the same shared component with a fixed locale
  (`app/(marketing)/_components/landing-page.tsx`, `discovery-page.tsx`); copy comes
  from the `en`/`es` dictionaries. Pages stay static/ISR and server-rendered.
- Each page sets `<html lang>` (via the `(en)`/`(es)` root layouts), a translated title
  and description, its own canonical and reciprocal hreflang (`en`, `es`, `x-default` →
  English) built by `languageAlternates()` in `lib/i18n/paths.ts`.
- The footer has a crawlable «English / Español» link switcher. On Spanish pages the
  discover, legal and support links point to their `/es` versions; app entry points
  always go to `/home`.
- All of these URLs, with their alternates, are listed in sitemap chunk 0; game chunks
  keep 2,000 games each.
- Discovery selection membership: `features/game/config/discovery.ts` (canonical game
  slugs). Guidance: `app.discovery` in each dictionary. Live catalogue facts and covers:
  `features/game/services/discovery.ts`, using the existing public SEO clients in the
  page locale and the 78-hour ISR fallback. Backend failures propagate; a missing game
  is omitted rather than linked to a 404. Review selections when changing or removing
  a configured game. No new backend API or advertising-only feature flag is used.
- These improvements do not guarantee AdSense approval. Request another review only
  after publishing and checking the actual public pages.

## Guest session recovery

When refresh confirms that a guest session is invalid, the client clears it and the
existing `AuthGate` starts a new guest session automatically. Members keep the explicit
expiry acknowledgement. Stale token failures cannot expire a replacement session;
temporary network/server errors and maintenance do not trigger guest recreation.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
