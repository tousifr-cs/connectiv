# ProConnectiv

## Overview

ProConnectiv is a platform for paid, verified conversations with social media creators and influencers. Users can browse creator profiles, submit connection requests tied to a social profile URL (Twitter/X, Instagram, LinkedIn, Facebook), and pay via cryptocurrency (planned: escrow via NOWPayments). The platform verifies profile ownership by having creators add a unique code to their social media bio.

**Current state:** The app has a creator browsing/discovery frontend with a PostgreSQL-backed API. Payment processing, authentication, escrow, inbox/messaging, and session management features are referenced in the design but not yet fully implemented.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend

- **Framework:** React 18 with TypeScript
- **Routing:** Wouter (lightweight client-side router)
- **State/Data Fetching:** TanStack React Query for server state management
- **UI Components:** shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Animations:** Framer Motion for entry animations and hover effects
- **Icons:** Lucide React
- **Build Tool:** Vite with React plugin
- **Path aliases:** `@/` maps to `client/src/`, `@shared/` maps to `shared/`

**Design Language:**

- Dark-first theme with pure black (`#000000`) background
- Neon green (`#00FF00`) as primary accent color
- Glass-morphism card surfaces with subtle white opacity borders
- Font: Inter (primary), JetBrains Mono (code)

**Pages:**

- `/` — Home page with platform intro, profile URL input, FAQ
- `/creators` — Browse/search creators grid
- `/creator/:id` — Individual creator profile
- `/request` — Connection request form (referenced but partially implemented)

### Backend

- **Runtime:** Node.js with Express 5
- **Language:** TypeScript, executed via tsx
- **API Pattern:** RESTful JSON API under `/api/` prefix
- **Route definitions:** Shared route contracts in `shared/routes.ts` using Zod schemas
- **Development:** Vite dev server middleware for HMR; serves built static files in production

**API Endpoints:**

- `GET /api/creators` — List creators (optional `search` and `platform` query params)
- `GET /api/creators/:id` — Get single creator by ID

### Data Storage

- **Database:** PostgreSQL via `DATABASE_URL` environment variable
- **ORM:** Drizzle ORM with `drizzle-zod` for schema-to-validation integration
- **Schema location:** `shared/schema.ts` (shared between client and server)
- **Migrations:** Drizzle Kit with `drizzle-kit push` command (`db:push` script)
- **Connection:** `pg` Pool in `server/db.ts`

**Current Schema:**

- `creators` table: id, username, displayName, bio, socialHandle, socialPlatform, price, imageUrl, isVerified, availability
- Database is seeded on startup if empty (seed data in `server/routes.ts`)

### Shared Code (`shared/` directory)

- `schema.ts` — Drizzle table definitions, Zod insert schemas, TypeScript types
- `routes.ts` — API route contract definitions with Zod validation, URL builder utility

### Build & Deployment

- **Dev:** `npm run dev` runs tsx with Vite middleware for HMR
- **Build:** Custom `script/build.ts` — Vite builds client to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Production:** `npm start` runs the built Node server which serves static files
- **Type checking:** `npm run check` runs tsc with no emit

### Storage Pattern

- `IStorage` interface in `server/storage.ts` defines the data access contract
- `DatabaseStorage` class implements it with Drizzle queries
- Exported as singleton `storage` instance

## External Dependencies

### Required Services

- **PostgreSQL Database** — Required. Connection via `DATABASE_URL` environment variable. Used for all persistent data storage.

### Key npm Packages

- **drizzle-orm / drizzle-kit** — ORM and migration tooling for PostgreSQL
- **express v5** — HTTP server framework
- **@tanstack/react-query** — Client-side data fetching and caching
- **zod / drizzle-zod** — Schema validation shared between client and server
- **framer-motion** — Animation library for UI transitions
- **shadcn/ui ecosystem** — Radix UI primitives, class-variance-authority, tailwind-merge, clsx
- **wouter** — Client-side routing
- **connect-pg-simple** — PostgreSQL session store (imported but sessions not yet implemented)

### Planned Integrations (referenced in design docs but not yet implemented)

- **NOWPayments** — Cryptocurrency payment processing with escrow
- **Social media verification** — Bio code verification for Twitter, Instagram, LinkedIn, Facebook
- **Video/messaging platform** — For conducting sessions between requesters and creators
