# ProConnectiv

A marketplace platform for paid, verified conversations with creators and influencers. Users can browse creator profiles, request connections through various session types (video calls, audio consultations, DM bundles, deep dives), and manage interactions through a full-featured dashboard.

## Features

- **Creator Discovery** — Browse, search, and filter creators by market sector with a responsive sidebar layout
- **Creator Profiles & Connection Requests** — View detailed creator profiles and submit connection requests with session type selection, dynamic pricing, and escrow-backed fees
- **Creator Onboarding** — Multi-step form for new creators to set up profiles with custom pricing tiers and image upload
- **Creator Dashboard** — Overview of earnings, pending connection requests, upcoming sessions, and reminders
- **Firebase Authentication** — Google sign-in with server-side token verification
- **Video Calls** — Self-hosted Jitsi rooms with JWT auth and optional native WebRTC fallback tooling
- **Recall AI Integration** — Meeting bot integration for session recording (requires `RECALL_API_KEY`)
- **AI Prompt Testing** — PromptFoo configuration for testing AI-powered prompts

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite 7, Tailwind CSS, shadcn/ui (New York) |
| Routing | Wouter |
| Data Fetching | TanStack React Query |
| Forms | React Hook Form + Zod validation |
| Animations | Framer Motion, CSS keyframe animations |
| Backend | Express 5, TypeScript |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Firebase (client) + Firebase Admin (server verification) |
| Real-time | Self-hosted Jitsi + WebSocket signaling (legacy native WebRTC) |
| File Uploads | Multer |
| Build | Vite (client), esbuild (server), tsx (dev) |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Firebase project with Authentication enabled

### Environment Variables

Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/proconnectiv
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=your-private-key
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
RECALL_API_KEY=your-recall-api-key        # Optional: for meeting bot integration
JITSI_DOMAIN=meet.example.com
JITSI_JWT_APP_ID=proconnectiv
JITSI_JWT_APP_SECRET=replace-with-jitsi-app-secret
VITE_JITSI_DOMAIN=meet.example.com

# Native WebRTC ICE config (optional but recommended)
RTC_STUN_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
RTC_TURN_URLS=turn:turn.example.com:3478?transport=udp,turns:turn.example.com:5349?transport=tcp
RTC_TURN_USERNAME=replace-with-turn-username
RTC_TURN_CREDENTIAL=replace-with-turn-password
RTC_FORCE_RELAY_AFTER_MS=8000

# Password signup OTP (Nodemailer / SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM="ProConnectiv <noreply@example.com>"
# Optional: separate secret for OTP HMAC (defaults to JWT_SECRET if set)
OTP_SECRET=long-random-string
```

In **development**, if `SMTP_HOST` is unset, signup OTPs are printed to the server console so you can test without configuring mail.

### Installation

```bash
npm install
```

### Database Setup

Push the Drizzle schema to your PostgreSQL database:

```bash
npm run db:push
```

The database is automatically seeded with sample creators on first server start.

### Development

```bash
npm run dev
```

This starts both the Vite dev server (frontend) and Express server (backend) with hot reload.

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── client/src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/           # shadcn/ui primitives
│   │   ├── CreatorCard.tsx
│   │   ├── Navbar.tsx
│   │   └── video-player.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── use-auth.tsx
│   │   ├── use-creators.ts
│   │   └── use-webrtc.ts
│   ├── lib/              # Utilities and config
│   ├── pages/            # Route pages
│   │   ├── Auth.tsx
│   │   ├── BecomeCreator.tsx
│   │   ├── CreatorProfile.tsx
│   │   ├── Creators.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Home.tsx
│   │   ├── Request.tsx
│   │   └── VideoCall.tsx
│   └── index.css         # Global styles and animations
├── server/
│   ├── routes.ts         # API routes and WebSocket signaling
│   ├── storage.ts        # Database access layer
│   ├── firebase-admin.ts # Firebase Admin SDK setup
│   └── recall-ai.ts      # Recall AI meeting bot integration
├── shared/
│   ├── schema.ts         # Drizzle ORM schema and Zod validators
│   └── routes.ts         # Typed API route definitions
└── promptfooconfig.yaml  # AI prompt testing configuration
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/creators` | List creators (supports `?search=` and `?platform=` query params) |
| `GET` | `/api/creators/:id` | Get a single creator by ID |
| `POST` | `/api/creators` | Create a new creator profile |
| `GET` | `/api/me/creator` | Get the authenticated user's creator profile |
| `POST` | `/api/auth/sync` | Sync Firebase user to the database |
| `POST` | `/api/upload` | Upload an image (max 5MB, JPEG/PNG/WebP/GIF) |
| `GET` | `/api/rtc-config` | Returns ICE servers and relay fallback timing |
| `POST` | `/api/rooms/:roomId/jitsi-token` | Returns JWT + room metadata for self-hosted Jitsi |
| `WS` | `/ws` | WebSocket endpoint for WebRTC signaling |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push Drizzle schema to database |
| `npm run test:prompts` | Run PromptFoo AI prompt tests |
| `npm run test:prompts:view` | View PromptFoo test results UI |

## Design System

The UI uses a dark theme with neon green (`#00fc40`) as the primary accent color. Key design utilities defined in `index.css`:

- **`.btn-gradient-fade`** — Animated gradient button with a slowly shifting green effect
- **`.text-glow`** — Neon green text shadow
- **`.border-glow`** — Neon green box shadow
- **`.glass-card`** — Frosted glass card with backdrop blur

## License

MIT
