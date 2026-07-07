<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# JustGame web — project conventions

Follow Conventions so every
feature looks the same. When in doubt, read the official Next.js (`node_modules/next/dist/docs/`)
or shadcn docs first — this stack is ahead of training data.

## Architecture (the big picture)

- Three zones: **`(marketing)`** = static landing `/` + SEO `/games/[slug]` (public, ISR);
  **`(app)`** = `/home` + descendants (always authenticated). Use App Router **route groups**.
- Build the **domain/business layer before UI**, feature by feature.
- The browser talks to the backend **directly** for data (token in `Authorization`); a tiny
  **BFF** (`app/api/auth/*`) exists ONLY for operations that must touch the httpOnly cookie.

## File structure

- **No `src/`** — root-based (`app/`, `lib/`, `features/`, `components/`).
- **Organize by artifact TYPE** into conventionally-named folders, everywhere (NO `ui/` folder):
  `components/` (React components) · `contexts/` (context + provider) · `hooks/` (React hooks) ·
  `services/` (API clients / use-cases / loaders / transport) · `stores/` (state stores) ·
  `utils/` (pure helpers) · `config/` (constants) · `server/` (server-only) · `middlewares/`.
- **Shared code in `lib/`:** `lib/api/` (transport), `lib/domain/` (the backend contract:
  `enums.ts`, `models/`, `inputs/` — ONE source of truth, never scatter it), `lib/config/`,
  `lib/i18n/` (see i18n section). These cohesive infra modules keep flat logic files, but their
  React artifacts still go in `contexts/` + `hooks/`.
- **Feature code in `features/<name>/`** (feature-sliced), split into the type folders above.
  `index.ts` = public barrel; **do NOT re-export `server/`** from it (keeps `next/headers` out of
  client bundles). Pattern set by `features/auth/`; reuse for `features/game/`, `features/library/`, …
- Top-level shared `components/`, `hooks/`, `contexts/`, `middlewares/` for cross-feature pieces.

## Naming

- **kebab-case** files, named after the primary export/role.
- **Hooks** are files named `use-*.ts(x)` and live in a `hooks/` folder (one hook concept per file).
- **Contexts/providers** live in `contexts/`; a Provider file is `*-provider.tsx` (NOT
  `*-context.tsx`). Export the raw `Context` so the matching `use*` hook (in `hooks/`) consumes it.
- Non-routable colocated helpers under `app/` use a leading underscore (`_shared.ts`); a `_folder`
  is non-routable in the App Router.

## Domain & validation (Zod)

- **Zod is the single source of truth:** define the schema, infer the type (`z.infer`). Never
  hand-write a type that duplicates a schema.
- Use **Zod 4 top-level validators** (`z.email()`, `z.uuid()`, `z.url()`), not the deprecated
  `z.string().email()`.
- Mirror the backend contract **exactly**; don't add fields the backend doesn't send yet
  (mark pending ones with a `NOTE`). Keep ISO dates as `z.string()` — don't over-validate.

## Dates & time (Luxon)

- **Always use Luxon** (`luxon`, pinned exact) for ANY date/time work — parsing, comparison,
  arithmetic, formatting. **NEVER the native `Date`** (`new Date()`, `Date.now()`, `Date.parse`,
  `toLocale*`). `DateTime.fromISO(...)` to parse; `setLocale(locale).toLocaleString(...)` to
  format; `Duration` for spans.
- The domain layer keeps dates as ISO **strings** (see Zod section); converting to `DateTime` is
  a presentation-edge concern. Game formatters live in `features/game/utils/format.ts` — extend
  that hub instead of formatting inline.

## HTTP & errors

- Two contracts, never mix them:
  - **`apiRequest`** (`lib/api/client.ts`) → JustGame backend (`/api/v1`): injects `jg-*`
    headers + `Authorization`, unwraps the `ApiResponse`/`ApiError` envelope, throws `ApiException`.
  - **`bffRequest`** (`lib/api/bff-client.ts`) → our own `/api/*` route handlers: plain JSON,
    throws `BffError`.
- Everything from the backend goes through **`unwrap()`** (validates `.data`, fails loud at the
  boundary). Always consume `.data`.
- **Branch on the numeric `internalCode`, NEVER on `reason`** (free text). Both `ApiException`
  and `BffError` carry `internalCode`.
- Authenticated data calls use **`authedRequest`** (direct to backend + single-flight refresh).
  Never re-implement token injection or 401-refresh per feature.

## Auth / session

- **Hybrid token storage:** access token (~2h) in `localStorage` (working copy); full session
  incl. refresh token (~6m) in an **httpOnly cookie** set by the BFF. Never expose the refresh
  token to JS. Web is always authenticated (no guest flow — blocked on WEB, 50080).

## Internationalization (i18n) — `lib/i18n/`

- Locales: `en` (default) + `es`, detected from the user's SYSTEM (`Accept-Language` on the server
  via `getServerLocale`, `navigator` on the client via `getClientLocale`). **No user toggle, no
  locale in the URL** (homogeneous routing) — the Next docs' dictionaries pattern WITHOUT `[lang]`.
- Translations are **JSON** in `lib/i18n/dictionaries/<locale>.json` — the single source of copy
  for EVERYTHING (errors + UI). `getDictionary(locale)` dynamically imports + Zod-validates them
  (fail-loud on missing keys); the `Dictionary` type is inferred from that schema.
- Map any thrown error to copy via `getErrorMessage(error, dict)` (takes the dictionary, NOT a
  locale) — the single place errors become UI text. Client UI uses `useErrorMessage()` /
  `useDictionary()` from `<I18nProvider>` (`lib/i18n/contexts/`, hooks in `lib/i18n/hooks/`).
- `jg-language` is sourced from the detected locale (`authedRequest` sends the client locale;
  `DEFAULT_LANGUAGE` is `en`).
- **SSR/SEO caveat:** never call `getServerLocale()` (reads `headers()`) in the ROOT layout — it
  forces dynamic rendering and breaks SSG of the SEO zone. Mount `I18nProvider` (dict passed as a
  prop) in the `(app)` layout; the static marketing zone passes the SEO-strategy locale.
- **SEO language = Option B (per-locale URLs, SEO zone only):** en at `/games/[slug]`, es at
  `/es/games/[slug]` (two thin pages sharing `GameDetail` + `buildGameMetadata`). Pages emit
  hreflang (`alternates.canonical` + `alternates.languages`); the sitemap is localized
  (`alternates.languages` → one `<url>`/game) + chunked via `generateSitemaps` (45k, under 50k).
  `generateStaticParams` returns `[]` (render on-demand; avoid 2×N build fetches). The `(app)` zone
  stays noindex + homogeneous (system locale, same URL).

## Next.js 16 / React 19 gotchas

- `fetch` is **NOT cached by default**. Pass `next: { revalidate, tags }` for ISR/SEO reads;
  leave unset for always-fresh app data. A single `no-store`/`revalidate:0` makes the whole route dynamic.
- `cookies()` is **async** (`await cookies()`); dynamic `params` is a **Promise** (`await params`).
- Read client/external state with **`useSyncExternalStore`**, not setState-in-effect (the
  `react-hooks/set-state-in-effect` rule will flag it). Use `<Context value>` directly (no `.Provider`).
- `revalidateTag(tag, "max")` **requires the 2nd arg** (cache-life profile; `"max"` =
  stale-while-revalidate) — the single-arg form is deprecated. `export const revalidate` must be a
  literal (statically analyzable). Tag cached `fetch`es via `next: { tags }` to target them.

## Images

- **Always use `<AppImage>`** (`components/app-image.tsx`) for remote/content images — NEVER raw
  `<img>` or `next/image` directly. It wraps `next/image` and shows a violet (`text-primary`) spinner
  while loading. Pass `wrapperClassName` to size the wrapper (`absolute inset-0` for `fill` images).
  Tiny decorative badge icons (≈14px) may stay on `next/image` (a spinner would overflow them).
- Remote hosts must be allowed in `next.config` `images.remotePatterns` (game covers AND console covers).

## Environment

- Reference each `NEXT_PUBLIC_*` var by its **full static name** so Next inlines it; validate at
  module load and **fail fast** (`lib/config/env.ts`).
- Committed `.env.development`/`.env.production` hold empty placeholders; real/localhost values go
  in `.env*.local` (gitignored). Don't write `.env*` via tooling — a hook blocks it.

## Verification (do this before claiming "done")

- Run **`npx tsc --noEmit`**, **`npx eslint .`** (whole project), and **`npx next build`**.
- **NEVER silence a lint rule** with `eslint-disable` / `// eslint-disable-next-line` (or `@ts-ignore`).
  Fix the root cause instead — e.g. a `jsx-a11y/alt-text` false positive from `{...props}` is fixed by
  destructuring `alt` and passing it explicitly, not by disabling the rule.
- After moving/renaming files: **purge caches first** —
  `find . -name "*.tsbuildinfo" -not -path "./node_modules/*" -delete && rm -rf .next` — then
  re-run clean. A cached `tsc` can report green over a broken/zombie file.
- ESLint does NOT catch broken imports (those are type errors) — **`tsc` is the guard** for that.
- `git mv` no-ops on untracked files; after a move, confirm the source is actually gone on disk
  (`git status --short`).
