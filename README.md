# The Sommelier's Ledger

A practice tool for the **Court of Master Sommeliers deductive tasting grid** — the formal method
candidates are examined on, where you work a wine through fixed phases under time pressure and
commit to a conclusion about what is in the glass. The grid follows the **2024 CMS Americas
Advanced and Master Sommelier deductive tasting format**. The app is not affiliated with or endorsed
by the Court of Master Sommeliers.

Tasting blind is a timed exercise, and the timing is the hard part. This app runs the clock, keeps
the grid in front of you, and saves each completed sheet so you can go back and see how your calls
held up once you knew the answer.

## The tasting flow

One wine, five phases, then save. The two presets are the exam paces per wine: **4:00** for
Advanced and Master (six wines in 25 minutes) and **11:15** for Certified (four wines in 45
minutes). There are two clocks:

- **Guided** gives each phase its own share and moves you on when it runs out. The split is the
  app's own scaffolding for learning to pace — the exam has no per-phase times — with half for the
  nose, where most candidates are ruled out, and an eighth for each other phase. Each phase's
  deadline is stamped the first time it is opened, so stepping Back finds its clock where it was
  rather than full again; a phase whose time has run out shows 00:00 but does not move you on twice.
- **Exam** runs one clock for the whole wine, as the exam does. You move between phases yourself;
  when the total runs out you go to Save from wherever you are. The deadline is stamped when Start
  is pressed and carried in the tasting context, so every phase page counts down to the same moment.

Either clock can be **paused**, which covers the sheet — it is for stepping away, not for thinking
time — and resuming pushes every deadline back by the time spent paused (`src/data/timerClock.ts`).
The time-up beep is on by default; on iOS it only sounds because Start (and the first tap on each
page) starts the audio from a tap, and it still follows the silent switch.

A first visit to Start shows a short how-it-works and starts untimed; after that, Start remembers
the last settings in this browser.

The table shows the guided split. The timer is stored as `timerSeconds` and `timerMode`.

| Phase                  | What you record (2024 grid)                                                                                            | 4:00 | 11:15 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---: | ----: |
| **Sight**              | Clarity, intensity of color, primary and secondary color(s), rim variation and staining (reds), tearing, gas           | 0:30 |  1:24 |
| **Nose**               | Minor faults, aromatic intensity, age, fruit and fruit condition, non-fruit, earth, mineral, oak                       | 2:00 |  5:39 |
| **Palate**             | Sweetness, acidity, alcohol, body, tannin (reds) or phenolic bitterness (whites), texture, balance, finish, complexity | 0:30 |  1:24 |
| **Initial conclusion** | Possible grapes, climate, possible countries, age range                                                                | 0:30 |  1:24 |
| **Final conclusion**   | The call: grape or blend, country, region and appellation, quality level and style where appropriate, vintage          | 0:30 |  1:24 |

After the final conclusion comes **Save**: notes, an optional photo, and the sheet
is written to your archive. Timing is entirely optional; leaving the timer off gives you the same
grid with no clock.

**Reveal and score.** Once the bottle is unwrapped, the taster enters the wine from the label on
the saved tasting (or straight away on Save) and the call is scored against it, field by field:
grape, country, region and appellation, quality level and vintage. An exact match scores a point;
a near miss (vintage within two years, or the right region with a different appellation) shows as
_close_ but scores nothing; a blank call is a miss; and a field the label doesn't have drops out of
the total. The reveal is stored apart from the call (`Tasting.reveal`), and the rules live in
`src/components/archives/revealScore.ts`, pinned by its tests. The start page's field is a
_label_ for the taster's records ("Flight 3, wine 2"), not the wine, which would give the answer
away.

**Most attributes take one answer.** The nose is multi-select, because a wine genuinely does smell
of several things at once, and so is secondary color on sight. That runs through the data model:
`nose` is `Record<string, string[]>`, `sight` allows a list for Secondary Color(s), and palate is
`Record<string, string>`. The grid lives as plain data in `src/components/*/[phase]Fields.ts` and
`conclusionFields.ts`, pinned by `gridFields.test.ts`. On the nose, each grid heading lists the
official terms first, then the app's more specific descriptors (Cherry, Violet, Graphite…).

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
| `STORAGE_DRIVER`      | `local` (default) or `r2` — where label photos are stored            |
| `UPLOAD_DIR`          | Local driver only. Defaults to `./uploads`                           |
| `R2_*`                | R2 driver only: account id, access key pair, bucket name             |

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
- `src/lib/storage.ts` — label photo storage. The browser resizes the photo to a 1200px JPEG, asks
  `/api/photos/sign` for a key, PUTs it (to `/api/photos/upload` on local disk, straight to a
  private R2 bucket on `r2`), then saves the tasting with the key; the save route checks the file
  arrived. Keys embed the owner's id, so `/api/photos/<key>` serves a photo to its owner only. On
  R2 the bucket needs a CORS rule allowing `PUT` from the app's origin

One layout constraint worth naming, because it explains code that otherwise looks paranoid: the
tasting shell is **viewport-locked**. `.tasting-phase-main` scrolls with `overflow: auto` and the
footer is pinned across its bottom edge, so a dropdown that reaches past the footer is clipped by
the scroll container — and no `z-index` escapes a clip. `useDropPlacement` measures the space that
is actually left and shrinks the menu to fit, flipping it upward only when there is too little room
to show a useful number of options.

### Four things worth knowing

**The tasting exists only in memory until you save it.** `TastingContext` is plain React state —
no `localStorage`, no draft row, nothing on the server. A refresh loses the session, which is why
the provider installs a `beforeunload` guard while a tasting is in progress and why "Start over"
can say, truthfully, that there is nothing to come back to. This is a defensible choice for an
exercise that is meant to be finished in four minutes, but it is a choice: any feature that wants
to survive a reload has to add persistence first, not assume it.

**An answer is written to the tasting the moment it is committed, never on the way out.** Every
choice, chip and note goes straight into `TastingContext` as it changes. Nothing is held in the
page and flushed on Next, because Next is not the only way out: the phase timer navigates with a
bare `router.push`, and so do Back and the sidebar, so anything a page was holding back is lost
without a word. The one deliberate exception is the search boxes on the nose and the two
conclusions. Their text only becomes an answer when it is picked from the dropdown, entered, or
added; a half-typed word is not a call, so losing it when time runs out is intended.

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
catches up instantly. The amber warning is proportional (`max(5s, 25%)`), because at the 4:00 pace four of
the five guided phases run for 30 seconds and a flat 60-second threshold would be on from the first tick.

## Commands

| Command                  | What it does                          |
| ------------------------ | ------------------------------------- |
| `pnpm start`             | Dev server on 3002 (`PORT` overrides) |
| `pnpm build`             | Production build                      |
| `pnpm start:prod`        | Serve the production build            |
| `pnpm lint`              | eslint                                |
| `pnpm format`            | prettier                              |
| `pnpm exec tsc --noEmit` | Typecheck                             |
| `pnpm test`              | Run the tests once (Vitest)           |
| `pnpm test:watch`        | Re-run the tests on every change      |

## Still to do

- **Orphaned label photos are never cleaned up.** A photo is uploaded before its tasting is saved,
  so one whose save then fails for good stays in storage with no row pointing at it.
- **No `db:*` scripts.** Migrations are run through `pnpm exec prisma` directly.

## License

Copyright © 2024–2026 Marisha Deroubaix. All rights reserved. Published for viewing and evaluation
only — see [LICENSE](LICENSE).
