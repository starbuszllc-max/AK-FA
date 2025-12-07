# Akorfa Platform

## Overview

Akorfa is a monorepo-based web and mobile platform for human development assessment and social engagement. The system enables users to:

- Complete 7-layer self-assessments (environment, bio, internal, cultural, social, conscious, existential)
- Calculate system stability metrics using a proprietary formula
- Participate in a social feed with posts, reactions, and comments
- Track personal growth through an Akorfa scoring system
- View and manage assessment data through an admin interface

The platform uses a shared scoring engine (`@akorfa/shared`) consumed by both web (Next.js) and mobile (Expo/React Native) applications, with Supabase providing authentication, database, and real-time capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure

**Decision**: Use npm workspaces to share code between web, mobile, and shared packages.

**Rationale**: A single repository simplifies dependency management and enables the shared scoring logic to be imported by both web and mobile clients without publishing to npm. The `@akorfa/shared` package contains TypeScript types and deterministic scoring functions that must remain consistent across platforms.

**Implementation**: The root `package.json` defines workspaces for `shared/`, `web/`, `mobile/`, and `supabase/`. The shared package is built via `npm run build:shared` before the web app starts.

### Frontend Architecture (Web)

**Decision**: Next.js 15 App Router with React Server Components and client components.

**Rationale**: App Router enables server-side rendering, streaming, and simplified data fetching. Client components (`"use client"`) handle interactive forms (assessments, stability calculator, post composer) while server components handle static layouts and initial data loading.

**Key patterns**:
- Dynamic imports for client-heavy components to reduce initial bundle size
- Tailwind CSS for utility-first styling with custom theme (primary indigo, secondary green)
- Reusable UI components (`Button`, `Card`, `Header`) following atomic design principles
- Route groups (`(auth)`) for authentication pages without affecting URL structure

### Backend Architecture (API Routes)

**Decision**: Next.js API routes (Route Handlers) for server-side logic with Supabase admin client.

**Rationale**: Collocating API routes with the frontend simplifies deployment and enables type-safe server actions. The admin client (`supabaseAdmin()`) uses the service role key for privileged operations like inserting posts and incrementing scores.

**Key endpoints**:
- `POST /api/assessments` — Persists 7-layer scores and computes overall Akorfa score
- `POST /api/stability` — Calculates and stores stability metrics
- `POST /api/posts` — Creates posts, user events, and atomically updates user scores via RPC
- `POST /api/reactions` — Creates reactions and increments post like counts via RPC

**Scoring integration**: Each API route imports the shared scoring engine (`@akorfa/shared/dist/scoring`) to compute deltas. For posts, `calculateAkorfaScore({postsCreated:1})` returns a numeric delta that's added to the user's score via `increment_user_score` RPC.

### Authentication & Authorization

**Decision**: Supabase Auth with email/password provider and Row Level Security (RLS).

**Rationale**: Supabase provides JWT-based auth out of the box. RLS policies enforce data isolation at the database level, ensuring users can only read/write their own data (with exceptions for publicly readable content like the feed).

**Implementation**:
- `supabaseClient()` factory creates a browser client with anon key for client-side auth
- `supabaseAdmin()` factory creates a server client with service role key for privileged writes
- Auth trigger creates profile records automatically when users sign up (migration `002_auth_and_rls.sql`)
- Session management via `supabaseClient().auth.getSession()` in client components

### Data Model

**Decision**: Postgres via Supabase with normalized relational schema.

**Tables**:
- `profiles` — User profile with `akorfa_score`, `username`, `bio`, etc.
- `assessments` — 7-layer assessment records with `layer_scores` (JSONB) and `overall_score`
- `posts` — Feed posts with `content`, `layer`, `like_count`, `comment_count`
- `reactions` — Post reactions (many-to-many between users and posts)
- `comments` — Post comments (placeholder, not yet implemented)
- `user_events` — Activity log for scoring (`event_type`, `points_earned`, `metadata`)

**Triggers & RPC functions**:
- `handle_new_user()` trigger creates profile on auth.users insert
- `increment_user_score(p_user_id, p_delta)` atomically updates `profiles.akorfa_score`
- `increment_post_like_count(p_post_id)` atomically updates `posts.like_count`

**Rationale**: JSONB for `layer_scores` enables flexible schema evolution. Atomic RPC functions prevent race conditions when multiple events update the same score simultaneously.

### Shared Scoring Logic

**Decision**: Pure TypeScript functions in `@akorfa/shared` with deterministic output.

**Core functions**:
- `calculateAkorfaScore(input: AkorfaActivityInput): number` — Computes user score from activity metrics (posts, reactions, assessments, challenges)
- `calculateStability(metrics: StabilityMetrics): number` — Implements the stability equation: `S = R * (L + G) / (|L - G| + C - (A * n))`

**Rationale**: Deterministic scoring ensures consistency across web and mobile. Unit tests (`scoring/index.test.ts`) validate correctness. The package is built to CommonJS (`dist/index.js`) for compatibility with Next.js server-side imports.

**Scoring rules** (hardcoded weights):
- Post created: 5 points
- Comment added: 2 points
- Reaction received: 1 point
- Assessment completed: 10 points
- Challenge completed: 15 points
- Streak bonus: 2 points per day (capped at 20)

### Mobile Architecture (Future)

**Decision**: Expo (React Native) with placeholder scaffold.

**Current state**: Minimal `App.tsx` displays a welcome screen. The intent is to import `@akorfa/shared` for scoring and use Supabase client for auth/data.

**Rationale**: Expo provides managed workflow for iOS/Android builds without ejecting. Shared scoring ensures parity with web. Mobile is not yet implemented but the monorepo structure supports it.

## External Dependencies

### Supabase (Primary Backend)

**Purpose**: Authentication, Postgres database, Row Level Security, real-time subscriptions, storage.

**Configuration**:
- Project URL and anon key exposed via `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Service role key (`SUPABASE_SERVICE_ROLE_KEY`) used server-side for privileged writes
- Custom email redirect URL configured for auth callbacks
- CORS enabled for Vercel domain

**Migrations**: SQL files in `supabase/migrations/` define schema, RLS policies, triggers, and RPC functions. Applied via Supabase dashboard SQL editor.

### Vercel (Deployment)

**Purpose**: Hosts Next.js web app with serverless API routes.

**Configuration**: `vercel.json` specifies build command (`npm run build:shared && cd web && npm run build`) and environment variables. Output directory is `web/.next`.

### Next.js 15

**Purpose**: React framework with App Router, server components, and API routes.

**Key features used**:
- App Router for file-based routing
- Server and client components for optimal rendering
- Route Handlers for API endpoints
- Dynamic imports for code splitting

### Tailwind CSS

**Purpose**: Utility-first CSS framework for rapid UI development.

**Customization**: Extended theme in `tailwind.config.js` with Akorfa brand colors (primary indigo `#6366f1`, secondary green `#10b981`, accent orange `#f59e0b`).

### TypeScript

**Purpose**: Type safety across web, mobile, and shared packages.

**Configuration**: Strict mode enabled. Shared package emits type declarations (`dist/index.d.ts`) for consumption by web/mobile.

### Testing Framework

**Purpose**: Jest with `ts-jest` for unit testing shared scoring logic.

**Coverage**: Tests validate `calculateAkorfaScore` and `calculateStability` with sample inputs. Run via `npm run test:shared`.

### Third-Party Packages

- `@supabase/supabase-js` — Supabase client SDK
- `react` & `react-dom` — UI library
- `autoprefixer` & `postcss` — CSS processing for Tailwind
- `expo` & `react-native` — Mobile framework (placeholder)