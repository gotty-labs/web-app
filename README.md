This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

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

## Temporary catalogue access for AdSense review

`features/shell/config/entry-flow.ts` enables
`TEMPORARILY_SKIP_ENTRY_PROMPTS_FOR_ADSENSE` during the initial AdSense review.
Every visitor gets the same behaviour: `/home` starts a regular guest session
without the first-run onboarding or the automatic start-of-visit account prompt.
Search, catalogue sections and game details remain available. Explicit sign-in and
member-only actions still use the existing authentication flow.

This does not write onboarding completion or start-of-visit prompt flags. Their
original behaviour can be restored by setting the constant to `false` and
rebuilding; existing completion flags remain intact.

Before restoring the prompts:

1. Implement normal form-POST login that returns a session cookie, and restore the
   client session from that cookie. The current JSON login and localStorage-only
   initial session cannot be used directly by the AdSense crawler.
2. Create a dedicated ordinary account without personal data and ensure the
   catalogue is accessible with its session without interactive entry prompts.
3. Once AdSense is activated, configure the protected URL, login URL and credentials
   under **Account → Access and authorization → Crawler access**.
4. Verify actual catalogue access before restoring the original entry flow.

Keep this public entry available until that handover works. Approval alone is not
the signal to disable it. Crawler login is pending and is not implemented by this
temporary switch. No user-agent-specific content is served.

References: [initial AdSense connection](https://support.google.com/adsense/answer/7584263)
and [crawler access to protected pages](https://support.google.com/adsense/answer/161351).
