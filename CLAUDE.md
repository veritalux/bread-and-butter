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

**Stack:** React 19 + TypeScript + Vite + Tailwind CSS v4 (via `@tailwindcss/vite` plugin). Icons from `lucide-react`. Routing via `react-router-dom` v7.

**State management:** Single React Context (`src/context/AppContext.tsx`) provides all app state — auth, challenges, finances, theme, and font preferences. All state is persisted to `localStorage` with `bb-` prefixed keys (e.g., `bb-current-user`, `bb-challenges-{userId}`).

**Auth model:** No backend. Users log in by email against a list of sample users (`src/data/sampleUsers.ts`) plus any locally-registered accounts stored in localStorage. Sign-up creates users in localStorage only.

**Role-based routing:** Two roles — `user` and `moderator`. The `RequireAuth` wrapper in `App.tsx` gates routes by role. Users see Dashboard (`/`) and Challenges (`/challenges`). Moderators see the Moderator Dashboard (`/moderator`).

**Key data types** (`src/types/`):
- `Challenge` — savings challenge with goal, progress, and progress logs
- `ChallengeTemplate` — predefined challenge blueprints for the challenge catalog
- `AppUser` — user profile with role, streak data, and optional moderator assignment
- `UserFinances` — weekly income, tax rate, investment amount

**Deployment:** GitHub Actions workflow builds on push to `main` and deploys `dist/` to the `gh-pages` branch. The Vite `base` is set to `/bread-and-butter/`.
