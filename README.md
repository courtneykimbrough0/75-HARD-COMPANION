# 75 Hard Companion

A mobile-first, fully offline Progressive Web App for tracking the 75 Hard challenge: two 45-minute workouts (one outdoor), 128 oz of water, 10 pages of reading, strict diet compliance, and a daily progress photo — all stored locally on-device with no backend, account, or remote sync.

## Screens

- **Dashboard** (`/dashboard`) — today's day counter and 6-item checklist, with auto-detected day pass/fail and a manual reset-to-Day-1 flow.
- **Workouts** (`/workouts`) — 45-minute session timer (start/pause/stop), outdoor flag, and a live check of the 3-hour spacing rule between sessions.
- **Water** (`/water`) — quick-add buttons (8/16/24/32 oz) toward the 128 oz daily target.
- **Photo** (`/photo`) — in-app camera capture saved directly to IndexedDB.
- **History** (`/history`) — full lifetime compliance calendar and progress photo gallery, across all attempts.
- **Planner** (`/planner`) — weekly meal plan text and per-day workout scheduling.

## Tech Stack

- Vite + React + TypeScript
- Dexie.js (IndexedDB) with `dexie-react-hooks` for reactive local storage
- `vite-plugin-pwa` (Workbox) for the manifest and offline service worker
- Tailwind CSS v4
- Native `getUserMedia` for camera capture

## Development

```bash
npm install
npm run dev       # start the dev server
npm run build     # type-check and produce a production build
npm run preview   # serve the production build locally
```

All data is stored in the browser's IndexedDB — there is no server component.
