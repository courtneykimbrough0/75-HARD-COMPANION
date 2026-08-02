# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A mobile-first, fully offline Progressive Web App for tracking the 75 Hard challenge (two 45-minute workouts with one outdoor, 128 oz water, 10 pages reading, strict diet, and a daily progress photo). Everything is stored locally on-device in IndexedDB — there is no backend, no account, no remote sync, and no API calls to design around.

## Commands

```bash
npm run dev       # start the Vite dev server
npm run build     # tsc -b (type-check via project references) && vite build
npm run lint       # oxlint
npm run preview   # serve the production build locally
```

There is no test suite in this repo (no vitest/jest config, no test files). Don't assume one exists.

## Architecture

**Data flow: repository → hooks → routes/components.** All persistence goes through `src/db/repository.ts`, which is the only module allowed to read/write Dexie tables directly outside of `src/db/hooks.ts`. Components never call `db.*` directly — they call `useLiveQuery`-based hooks from `src/db/hooks.ts` for reads and repository functions for writes, so the UI reactively re-renders on any IndexedDB change.

- `src/db/schema.ts` — the Dexie (`SeventyFiveHardDB`) class defining tables: `dailyLogs`, `workoutRecords`, `waterLogs`, `photos`, `weeklyPlans`, `appMeta`.
- `src/db/db.ts` — singleton `db` instance plus `ensureAppMetaSeeded()`, which lazily backfills default `appMeta` rows (memoized via a module-level promise so it only runs once).
- `src/db/repository.ts` — all read/write operations and the day-rollover/reset state machine (see below).
- `src/db/hooks.ts` — `useLiveQuery`-based React hooks (`useAppMeta`, `useTodayLog`, `useWorkoutsForDate`, etc.) and `useDayRollover()`, which is invoked once from `AppShell` and re-runs catch-up evaluation on mount and whenever the tab becomes visible again (handles the app being closed/backgrounded across day boundaries).

**Day pass/fail evaluation is decoupled from "today."** `catchUpEvaluation()` in `repository.ts` walks forward day-by-day from `lastEvaluatedDate` (in `appMeta`) up to (not including) today, scoring each day against `isDayFullyCompliant()` (`src/lib/logic/dayEvaluation.ts`) combined with `validateDayWorkouts()` (`src/lib/logic/workoutValidators.ts`). A day with no logged data at all still counts as a fail. On the first failing day it stops, marks that day `fail`, and sets `pendingResetReason` in `appMeta` — the dashboard then shows `ResetConfirmationBanner` and holds off on any further evaluation until the user confirms `resetToDayOne()`. Passing days increment `currentDayCounter` and advance `lastEvaluatedDate` one at a time.

**Workout validity is a derived, day-level concept**, not a per-session flag. Each `WorkoutRecord` session independently satisfies `workout1Complete`/`workout2Complete` (duration ≥ 45 min) as a `DailyLog` checklist flag, but the day only "passes" workouts when `validateDayWorkouts()` additionally confirms both sessions are ≥3 hours apart (`WORKOUT_MIN_SPACING_HOURS`) and at least one is outdoor. This means a day can show both checklist items checked in the UI while still failing compliance — see the amber warning in `src/routes/Dashboard.tsx`.

**Domain constants and pure logic live in `src/lib/logic/`**, separate from persistence and components: `constants.ts` (targets/thresholds), `dateUtils.ts` (local-calendar-day string handling — dates are stored as `YYYY-MM-DD` local strings, never UTC/ISO, to avoid timezone drift on day boundaries), `dayEvaluation.ts`, `waterLogic.ts`, `workoutValidators.ts`. These are plain functions with no Dexie/React dependency — keep them that way so evaluation logic stays testable/reasoned-about independent of storage.

**Routing is flat and shell-wrapped**: `App.tsx` mounts every route under a single `AppShell` (`src/components/layout/AppShell.tsx`), which triggers `useDayRollover()` once and renders `BottomNav` for the six screens (dashboard, workouts, water, photo, history, planner). Unknown paths redirect to `/dashboard`.

**Path alias**: `@/*` maps to `src/*` (configured in both `vite.config.ts` and `tsconfig.app.json`) — use it instead of relative `../../` imports.

**PWA/offline**: `vite-plugin-pwa` (Workbox) generates the manifest and service worker from config in `vite.config.ts`; `devOptions.enabled: true` means the service worker is also active in dev.

**Styling**: Tailwind CSS v4 via `@tailwindcss/vite` (no separate `tailwind.config.js` — v4 configures via CSS/plugin).
