# design-sync notes — JustGame Design System

Project: **JustGame Design System** (`87dff220-9beb-41db-ada1-219ad71bfed9`) ·
https://claude.ai/design/p/87dff220-9beb-41db-ada1-219ad71bfed9

## Repo shape gotchas (this is a Next.js APP, not a published component library)

- **No `dist`/exports → synth-entry mode.** The converter discovers from source (`srcDir: components/ui`).
- **Self-package symlink required.** The converter reads `node_modules/<pkg>/package.json`; this app isn't
  installed in its own `node_modules`, so before building create:
  `ln -sfn "$(pwd)" node_modules/justgame-web` (gitignored; **recreate on every clone / re-sync**).
  Remove it after the sync — left in place it can confuse the app's own tsc/Next (a self-referential package).
- **Scope = shadcn primitives only** (`components/ui/**` → 145 exports, since each shadcn file fans out into
  sub-components: Card→CardHeader/Title/…). The domain components (`features/game/**`) are intentionally
  EXCLUDED: they're coupled to `next/link`, `next/navigation`, and the i18n provider, so they'd floor-card
  or break in the standalone design renderer.

## Styling — Tailwind must be COMPILED

- shadcn styles via Tailwind utility classes that don't exist until compiled. `cssEntry` points at a
  compiled stylesheet, NOT `app/globals.css` (which is just `@import 'tailwindcss'` directives).
- **Regenerate before every sync:** `npx @tailwindcss/cli@4 -i ./app/globals.css -o ./.design-sync/.cache/tailwind.css`
  (~130 KB: tokens + utilities + dark variant). It's under `.cache/` (gitignored), so it MUST be regenerated.

## Dark-only

- The app forces `<html class="dark">`. The standalone design renderer has no `.dark` ancestor, so the
  `conventions.md` header tells the design agent to wrap its root in `className="dark"` for the brand theme.

## First run (DONE — floor-card tier)

- **Render check SKIPPED** (no chromium installed; user opted out — floor cards are typographic/deterministic).
- **Floor cards everywhere** — components ship fully functional (bundle + `.d.ts` + `.prompt.md`); no authored
  `previews/*.tsx`. Rich previews are authorable incrementally on any later re-sync.

## Second run (DONE — high-fidelity previews, 2026-06-29)

**All 144 of 145 components now have authored, render-verified previews** (`previews/*.tsx`, all graded
`good`; 167 cells). Only **Toaster** stays a floor card — it can't render statically (Sonner shows nothing
until `toast()` fires imperatively, and the bundle exports only `Toaster`, not `toast`). Validate is clean:
145/145 render, 0 bad, 0 `[GRID_OVERFLOW]`, 0 `[SYNC_STALE]`. Uploaded to the pinned project.

Patterns established (reuse on re-sync):
- Every preview root is `className="dark bg-background text-foreground"` (dark-only, no `.dark` ancestor in
  the renderer). Imports use the repo alias `@/components/ui/<file>` — resolves to the shipped bundle.
- Overlay families (Dialog/Sheet/Select/Popover/Tooltip/DropdownMenu) render in the OPEN state with
  `className="dark"` ALSO on the `*Content` (Radix portals to `document.body`, outside the wrapper) and carry
  `cfg.overrides.<Name> = {cardMode:"single"}`. Badge/Button carry `{cardMode:"column"}` (wide variant rows).
- Sidebar family wraps in `<SidebarProvider>` with `<Sidebar collapsible="none">` to render inline.
- Avatar images use an inline SVG data-URI (external URLs don't load in headless chromium).

How the build was actually run (because the full `package-build` hangs — see the CRITICAL section above):
no-preview full build for the scaffold → `preview-rebuild.mjs` in ≤12-component batches for all 144 (applies
the cardMode overrides + patches `_ds_sync.json`) → `package-validate` → atomic upload (deletes `[]`, same 145
components). The `previews.mjs` fork now lets the full build complete too, but it's slow (~40 min) and degraded
past ~75 previews, so the scoped-batch path stayed the workhorse this run.

## CRITICAL: full `package-build` hangs when many previews are present (run 2 finding, 2026-06-29)

- **Symptom:** `package-build.mjs` (and therefore the `resync.mjs` driver) compiles previews sequentially in
  `lib/previews.mjs buildPreviews` (a `for…await esbuild.build()` loop). After ~23 sequential `build()` calls
  in one process the esbuild **service deadlocks** — the build sits at 0% CPU forever, right after the
  `previews: N user-owned` log and before the `[DTS] N/145` emit loop. 5 previews = fine; 37/72 = hang.
  Each `build()` is also slow (~10s) because every preview `bundle:true`s `lucide-react`.
- **Root cause is the per-process esbuild service, NOT any specific preview** — a no-preview full build
  completes in <4s with all 145 `.d.ts` + `.stories-map.json`.
- **Workaround that works (use it every re-sync until the tool is fixed):**
  1. Move authored previews aside, run the full `package-build` with ZERO previews → get `_ds_bundle.js`,
     `styles.css`, 145 `.d.ts`, `.stories-map.json`, floor `_preview/*.js`, and a (floor-card) `_ds_sync.json`.
  2. Restore previews. Compile them with `lib/preview-rebuild.mjs --components <≤12 names>` in **small batches**
     — each batch is a FRESH process (fresh esbuild service) so the ~23-call deadlock never triggers.
  3. `package-capture.mjs --components <batch>` to grade.
  - For the FINAL anchor: after all previews are compiled via preview-rebuild, the on-disk `_ds_sync.json`
    must be regenerated to reflect authored render-hashes. preview-rebuild re-keys per the skill; verify the
    anchor matches disk (validate prints `[SYNC_STALE]` if not) before upload.
- **FIXED in run 2 via fork:** `.design-sync/overrides/previews.mjs` (declared in `cfg.libOverrides`) calls
  `esbuild.stop()` every 15 preview builds, which tears down + respawns the service and avoids the deadlock.
  The full `package-build` and `resync.mjs` driver now complete normally. Caveat: still slow (~17s/preview,
  ~40 min for a full 144-preview build) because every preview `bundle:true`s `lucide-react` — a further
  optimization would externalize lucide. The fork needs `.design-sync/node_modules` →`../.ds-sync/node_modules`
  (gitignored symlink, recreate per clone) so it can resolve `esbuild`; its `common.mjs` import is repointed to
  `../../.ds-sync/lib/common.mjs`. On re-sync, diff the fork against the bundled `lib/previews.mjs` and merge
  upstream changes.

## Re-sync risks (what can silently go stale)

- The compiled `.cache/tailwind.css` and the `node_modules/justgame-web` symlink are both gitignored → must be
  regenerated/recreated each time (steps above) or the build fails / ships unstyled.
- If new shadcn primitives are added to `components/ui/`, they're picked up automatically (synth scan).
- Node 22 / npm used. Converter deps staged in `.ds-sync/` (gitignored) — re-copy from the skill base dir.
- `bg-accent` utility isn't emitted (no component uses it) — omitted from the conventions table on purpose.
