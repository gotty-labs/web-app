This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Public discovery

`/discover` exposes small, explained game selections in English only, without a
language selector, an account or a guest session. It shares the marketing
design and existing public game endpoints; `/home` keeps the interactive app flow.

- Selection membership: `features/game/config/discovery.ts` (canonical game slugs).
- Original guidance: `app.discovery` in the English dictionary. The shared dictionary
  contract retains the Spanish copy, but discovery always loads English.
- Live catalogue facts and covers: `features/game/services/discovery.ts`, using the
  existing public SEO clients and 78-hour ISR fallback. Backend failures propagate;
  a missing game is omitted rather than linked to a 404. Review selections when
  changing or removing a configured game.
- The route renders its content and links on the server, declares its own canonical,
  and appears once in sitemap chunk 0. Landing headers and footers in any language
  link to `/discover`. There is no `/es/discover` route. No new backend API or
  advertising-only feature flag is used.
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
