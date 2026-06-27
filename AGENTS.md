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
- **Shared code in `lib/`:** `lib/api/` (transport), `lib/domain/` (the backend contract:
  `enums.ts`, `models/`, `inputs/` — ONE source of truth, never scatter it), `lib/config/`.
- **Feature-specific code in `features/<name>/`** (feature-sliced):
  - feature root = client logic; `server/` = server-only modules; `ui/` = React components.
  - `index.ts` = public barrel. **Do NOT re-export `server/` from the barrel** (keeps
    `next/headers` etc. out of client bundles).
  - Pattern set by `features/auth/`; reuse for `features/game/`, `features/library/`, …

## Naming
- **kebab-case** files, named after the primary export/role. A file whose main export is a
  Provider is `*-provider.tsx` (NOT `*-context.tsx`).
- Non-routable colocated helpers under `app/` use a leading underscore (`_shared.ts`).

## Domain & validation (Zod)
- **Zod is the single source of truth:** define the schema, infer the type (`z.infer`). Never
  hand-write a type that duplicates a schema.
- Use **Zod 4 top-level validators** (`z.email()`, `z.uuid()`, `z.url()`), not the deprecated
  `z.string().email()`.
- Mirror the backend contract **exactly**; don't add fields the backend doesn't send yet
  (mark pending ones with a `NOTE`). Keep ISO dates as `z.string()` — don't over-validate.

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

## Next.js 16 / React 19 gotchas
- `fetch` is **NOT cached by default**. Pass `next: { revalidate, tags }` for ISR/SEO reads;
  leave unset for always-fresh app data. A single `no-store`/`revalidate:0` makes the whole route dynamic.
- `cookies()` is **async** (`await cookies()`); dynamic `params` is a **Promise** (`await params`).
- Read client/external state with **`useSyncExternalStore`**, not setState-in-effect (the
  `react-hooks/set-state-in-effect` rule will flag it). Use `<Context value>` directly (no `.Provider`).

## Environment
- Reference each `NEXT_PUBLIC_*` var by its **full static name** so Next inlines it; validate at
  module load and **fail fast** (`lib/config/env.ts`).
- Committed `.env.development`/`.env.production` hold empty placeholders; real/localhost values go
  in `.env*.local` (gitignored). Don't write `.env*` via tooling — a hook blocks it.

## Verification (do this before claiming "done")
- Run **`npx tsc --noEmit`**, **`npx eslint .`** (whole project), and **`npx next build`**.
- After moving/renaming files: **purge caches first** —
  `find . -name "*.tsbuildinfo" -not -path "./node_modules/*" -delete && rm -rf .next` — then
  re-run clean. A cached `tsc` can report green over a broken/zombie file.
- ESLint does NOT catch broken imports (those are type errors) — **`tsc` is the guard** for that.
- `git mv` no-ops on untracked files; after a move, confirm the source is actually gone on disk
  (`git status --short`).
