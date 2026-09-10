# The Sommelier's Ledger

A practice tool for the **Court of Master Sommeliers deductive tasting grid** — the formal method
candidates are examined on, where you work a wine through fixed phases under time pressure and
commit to a conclusion about what is in the glass.

Tasting blind is a timed exercise, and the timing is the hard part. This app runs the clock, keeps
the grid in front of you, and saves each completed sheet so you can go back and see how your calls
held up once you knew the answer.

## The tasting flow

One wine, five phases, then save. The two timer presets are the exam formats — four minutes for a
single wine, seven and a half for a longer sitting — and the per-phase splits follow from that.

| Phase                  | What you record                                                   | 4 min | 7.5 min |
| ---------------------- | ----------------------------------------------------------------- | ----: | ------: |
| **Sight**              | Clarity, brightness, concentration, viscosity, colour, hue        |   30s |     56s |
| **Nose**               | Condition, intensity, fruit and wood character, age assessment    |  120s |    225s |
| **Palate**             | Sweetness, acid, tannin, alcohol, body, finish                    |   30s |     56s |
| **Initial conclusion** | Old/New World, climate, age range, candidate grapes and countries |   30s |     56s |
| **Final conclusion**   | The call: grape, country, region, quality level, vintage          |   30s |     56s |

The nose gets four times the budget of any other phase, which is the method's own weighting, not an
arbitrary one — it is where the most information is available and the most candidates get ruled out.

After the final conclusion comes **Save**: notes, an optional photograph of the label, and the sheet
is written to your archive. Timing is entirely optional; leaving the timer off gives you the same
grid with no clock.

**Sight and palate are single-select** — one answer per attribute. **The nose is multi-select**,
because a wine genuinely does smell of several things at once. That difference runs all the way
through the data model: `nose` is `Record<string, string[]>` where every other phase is
`Record<string, string>`.

## Stack

Deliberately small. No state library, no component library driving the look, no API layer beyond
Next's own route handlers.

- **Next.js 15** (App Router), React 19, TypeScript, ESM
- **Prisma 6 + PostgreSQL** — two models, `User` and `Tasting`; the sheet itself is `Json` columns
- **Hand-written SCSS**, BEM-ish, organised as `@use` modules behind one `abstracts` barrel
- **JWT in an HttpOnly cookie** for auth; `scrypt` from node's `crypto` for password hashing
- **Zod** for request validation, **@mantine/form** for form state — but the form _components_ are
  local, in `src/components/form/`
- **Resend** for password-reset email
- **Manrope + Lora** via `next/font/google`; Tabler for icons

Conventions: pnpm, node 24, tabs at 4, single quotes, 120 columns. It is deliberately **not** a
monorepo — one app, one database, one port.

## Getting started

Requires node 24, pnpm via corepack, and a PostgreSQL database.

```sh
corepack enable
pnpm install
cp .env.example .env           # then fill in the values below
pnpm exec prisma migrate dev   # create the tables
pnpm start                     # http://localhost:3002
```

### Environment

| Variable              | Notes                                                                |
| --------------------- | -------------------------------------------------------------------- |
| `DATABASE_URL`        | Postgres connection string                                           |
| `JWT_SECRET`          | Signs the auth cookie. `openssl rand -base64 48`                     |
| `RESEND_API_KEY`      | Password-reset email. Reset is the only feature that needs it        |
| `RESEND_TEST_EMAIL`   | Optional — redirects all reset mail here instead of the real address |
| `NEXT_PUBLIC_APP_URL` | Base URL used to build reset links. Defaults to `localhost:3002`     |

## How it fits together

- `src/app/tastings/` — one route per phase, each a thin page around a client component
- `src/components/layout/TastingPhaseLayout.tsx` — the shell every phase renders inside: header,
  sidebar, heading, footer. It owns the phase title so the desktop heading and the phone header
  strip cannot disagree
- `src/components/tasting/TastingContext.tsx` — the in-progress tasting, held in React state
- `src/components/*/[phase]Fields.ts` — attribute keys and labels as plain data, no component
  imports. The sidebar reads them and `TastingPhaseLayout` imports the sidebar, so anything richer
  would close an import cycle
- `src/components/tasting/conclusionFields.ts` — one definition of "how many answers count as
  done", read by both the phase pages and the sidebar, so a phase cannot report 100% while the
  sidebar disagrees
- `src/app/api/` — auth and tastings route handlers
- `src/styles/abstracts/` — tokens, mixins and the type scale, forwarded through `_index.scss`

One layout constraint worth naming, because it explains code that otherwise looks paranoid: the
tasting shell is **viewport-locked**. `.tasting-phase-main` scrolls with `overflow: auto` and the
footer is pinned across its bottom edge, so a dropdown that reaches past the footer is clipped by
the scroll container — and no `z-index` escapes a clip. `useDropPlacement` measures the space that
is actually left and shrinks the menu to fit, flipping it upward only when there is too little room
to show a useful number of options.

### Three things worth knowing

**The tasting exists only in memory until you save it.** `TastingContext` is plain React state —
no `localStorage`, no draft row, nothing on the server. A refresh loses the session, which is why
the provider installs a `beforeunload` guard while a tasting is in progress and why "Start over"
can say, truthfully, that there is nothing to come back to. This is a defensible choice for an
exercise that is meant to be finished in four minutes, but it is a choice: any feature that wants
to survive a reload has to add persistence first, not assume it.

**Phase completion is a high-water mark, not "has answers".** A phase turns green in the sidebar
once you have moved _past_ it, tracked as `furthestPhase` on the tasting. The obvious alternatives
are both wrong: "has any answer" turns green on the first click, and "has every answer" never turns
green at all, because leaving an attribute blank is a legitimate call — a wine with no wood aromas
has nothing to record under wood. Advancing is the only signal that actually means the taster
considers the phase finished. It only moves forward, so stepping back to review does not
un-complete anything.

**The timer is anchored to a wall-clock deadline, not decremented per tick.** `Timer.tsx` stamps
`Date.now() + duration` on mount and re-derives the remaining seconds twice a second, rather than
counting a `setInterval` down. Mobile browsers throttle background intervals and iOS suspends them
outright on screen lock, so a per-tick clock silently stalls — on a timed exercise, the one failure
that invalidates the whole point. It also re-syncs on `visibilitychange`, so foregrounding the tab
catches up instantly. The amber warning is proportional (`max(5s, 25%)`), because four of the five
phases run for 30 seconds and a flat 60-second threshold would be on from the first tick.

## Commands

| Command                  | What it does                          |
| ------------------------ | ------------------------------------- |
| `pnpm start`             | Dev server on 3002 (`PORT` overrides) |
| `pnpm build`             | Production build                      |
| `pnpm start:prod`        | Serve the production build            |
| `pnpm lint`              | eslint                                |
| `pnpm format`            | prettier                              |
| `pnpm exec tsc --noEmit` | Typecheck                             |

## Still to do

- **The label photograph is not persisted.** The save page captures it and shows a preview, but it
  is a client-side `FileReader` data URL that never reaches the API — it is lost on save. Wiring it
  up means picking a storage target first.
- **`isArchived` exists on the model with no UI behind it.** Archiving is a schema decision that was
  never finished.
- **No `db:*` scripts.** Migrations are run through `pnpm exec prisma` directly.
- **No tests.** The phase-completion and timer logic are the parts that would most repay them.
