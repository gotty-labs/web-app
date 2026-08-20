# Gotty Design System — conventions for building with these components

Gotty is a **dark-only** product with a **violet/indigo** accent. The components are
shadcn/ui (radix-nova style), compiled from the Gotty web app and exposed on
`window.GottyDS.*`.

## Wrapping & setup (required)

- **Wrap your design's root in `className="dark"`.** The theme is dark-only; without the
  `dark` class the light token set applies and the result looks off-brand:
  `<div className="dark bg-background text-foreground">…</div>`.
- Styling comes entirely from `styles.css` (it `@import`s the compiled `_ds_bundle.css` —
  design tokens + Tailwind utilities + the dark variant). Load it; there is no other setup.
- Icons are `lucide-react`.

## Styling idiom — Tailwind v4 utilities backed by semantic tokens

Style your layout/glue with Tailwind utility classes that map to the design tokens.
**Always use the semantic token utilities, never raw colors** (`bg-primary`, never
`bg-violet-600`). Core families that exist in this build:

| Purpose          | Classes                                                            |
| ---------------- | ----------------------------------------------------------------- |
| Surfaces         | `bg-background` `bg-card` `bg-muted` `bg-popover`                  |
| Text             | `text-foreground` `text-muted-foreground` `text-card-foreground`  |
| Accent (violet)  | `bg-primary` `text-primary-foreground` `bg-secondary`             |
| Status           | `bg-destructive`                                                  |
| Borders / radius | `border` `border-border` `rounded-md` `rounded-lg` `ring-ring`    |
| Layout           | `flex` `grid` `gap-*` (never `space-y-*`); `size-*` for equal w/h |

shadcn (radix-nova) component rules: forms use `Field` / `FieldGroup` / `FieldLabel`
(+ `InputGroup` for inputs with addons), never raw `Input` + `Label`; 2–7 mutually
exclusive options use `ToggleGroup`; buttons have NO loading prop (compose `Spinner`
+ `disabled`); icons inside `Button` use `data-icon="inline-start|inline-end"`;
`Dialog` / `Sheet` need a `*Title`; toasts via `Sonner` / `toast()`; empty states use
`Empty`.

## Where the truth lives

- Tokens, utilities, and the dark variant: read `styles.css` and the `_ds_bundle.css` it imports.
- Per-component API and usage: each `<Name>.d.ts` (`<Name>Props`) and `<Name>.prompt.md`.

## Idiomatic snippet

```tsx
<div className="dark bg-background text-foreground flex flex-col gap-4 p-6">
  <Card>
    <CardHeader>
      <CardTitle>Elden Ring</CardTitle>
      <CardDescription>Action RPG</CardDescription>
    </CardHeader>
    <CardContent className="flex items-center gap-2">
      <Badge variant="secondary">Released</Badge>
      <Button>View</Button>
    </CardContent>
  </Card>
</div>
```
