# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Bread and Butter is a personal finance challenge tracker built with React. Users create savings challenges, log progress, and track streaks. Moderators (coaches) monitor user activity and engagement. Deployed to GitHub Pages at `/bread-and-butter/`.

## Commands

- `npm run dev` — start Vite dev server with HMR
- `npm run build` — typecheck with `tsc -b` then build with Vite
- `npm run lint` — ESLint across the project
- `npm run preview` — preview the production build locally

No test framework is configured.

## Architecture

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 (via `@tailwindcss/vite` plugin). Icons from `lucide-react`. Routing via `react-router-dom` v7. Backend via Firebase (`firebase` v12) — Auth + Firestore.

**Backend:** Firebase project `bread-and-butter-b8b7b` (config in `src/lib/firebase.ts`, exporting `auth` and `db`). All user, challenge, finance, threshold, and check-in data is persisted to Firestore. Only theme (`bb-theme`) and font (`bb-font`) preferences are stored in `localStorage`.

**Firestore layout:**
- `users/{uid}` — `AppUser` profile doc
- `users/{uid}/challenges/{challengeId}` — per-user challenges
- `users/{uid}/settings/finances` — `UserFinances`
- `users/{uid}/checkInLogs/{logId}` — moderator check-in notes on a user
- `moderatorSettings/{moderatorId}/thresholds/{userId}` — per-user `CheckInThreshold`

**State management:** Single React Context (`src/context/AppContext.tsx`, type defined in `src/context/appContextDef.ts`, consumer hook in `src/context/useApp.ts`) provides all app state — auth, challenges, finances, theme, font, thresholds, and check-in logs. `onAuthStateChanged` hydrates state on load; `onSnapshot` on the `users` collection keeps `allUsers` live for moderators.

**Auth model:** Firebase email/password auth. Sign-up requires a code:
- `role: "moderator"` — must provide master code `BREADANDBUTTER2026` (hardcoded in `AppContext.signUp`). On creation, a moderator gets a generated `coachCode` (last-name slice + uid slice).
- `role: "user"` — must provide a valid `coachCode` matching an existing moderator; the moderator's uid is stored as `moderatorId` on the user doc.

**Role-based routing:** Two roles — `user` and `moderator`. The `RequireAuth` wrapper in `App.tsx` gates routes by role and redirects mismatches. Routes:
- `/login` — `Login` page (public)
- `/` — `Dashboard` (user only)
- `/challenges` — `Challenges` catalog (user only)
- `/moderator` — `ModeratorDashboard` (moderator only)
- `*` — redirect to `/`

`BrowserRouter` uses `basename="/bread-and-butter/"`. `Chrome` wraps authed pages with `Navbar` and (for users) `MoneyTallyBar`.

**Key data types** (`src/types/`):
- `challenge.ts` — `Challenge` (goal, saved, progress logs, computed `daysLeft`), `ProgressLog`, `ChallengeTemplate` (catalog blueprints), `UserFinances` (weekly income, tax rate, weekly investment)
- `user.ts` — `AppUser` (role, streak, `moderatorId`, `coachCode`), `CheckInThreshold` (`warningDays`/`inactiveDays`, default 2/4), `CheckInLog`, plus `makeInitials`, `getActivityStatus` (`active`/`warning`/`inactive`), `getDaysSinceActive`
- `fonts.ts` — `FontChoice`

**Streak logic:** `logProgress` in `AppContext` updates the user's `lastActiveDate`, `streak`, and `longestStreak` based on whether the prior `lastActiveDate` was today, yesterday, or earlier.

**Theming:** Three themes (`dark` | `light` | `sepia`) applied via `data-theme` on `<html>`; font via `data-font`. CSS variables drive colors.

**Components** (`src/components/`): `Navbar`, `MoneyTallyBar`, `HeroSection`, `StatsBar`, `ChallengeCard`, `ChallengeTracker`, `ChallengesSection`, `StartChallengeModal`, `HowItWorks`, `MotivationBanner`, `AccountabilityBanner`.

**Challenge templates:** Predefined catalog entries live in `src/data/sampleData.ts`.

**Deployment:** `.github/workflows/deploy.yml` builds on push to `main` and deploys `dist/` to the `gh-pages` branch via `peaceiris/actions-gh-pages`. The workflow copies `dist/index.html` to `dist/404.html` so GitHub Pages can serve SPA routes. The Vite `base` is set to `/bread-and-butter/`.
