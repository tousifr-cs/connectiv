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

# Native WebRTC ICE config (optional — see TURN Server Setup Guide below)
# Without a TURN server, P2P video calls only work when both peers are on
# compatible NATs. For production, deploy coturn (see infra/coturn/) or use a
# cloud TURN provider and fill in the values below.
RTC_STUN_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
RTC_TURN_URLS=turn:turn.example.com:3478?transport=udp,turns:turn.example.com:5349?transport=tcp
RTC_TURN_USERNAME=replace-with-turn-username
RTC_TURN_CREDENTIAL=replace-with-turn-password
RTC_FORCE_RELAY_AFTER_MS=10000

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

## TURN Server Setup Guide

TURN (Traversal Using Relays around NAT) relays media traffic when peers cannot connect directly. Without a TURN server, P2P video calls will fail for users behind symmetric NATs, corporate firewalls, or carrier-grade NATs (common on mobile networks).

### How It Works

1. Both peers attempt a direct P2P connection via STUN
2. If direct connection fails, the browser falls back to the TURN relay
3. The `RTC_FORCE_RELAY_AFTER_MS` env var (recommended: 10000; code default: 8000 when unset) tells the client to create a relay-only connection as a backup ~10 seconds after the initial attempt, if the P2P connection hasn't been established
4. The `/api/rtc-config` endpoint serves the ICE server list to authenticated clients

### Option A: Self-Hosted coturn (Recommended)

A Docker Compose setup for [coturn](https://github.com/coturn/coturn) is included at `infra/coturn/`.

#### 1. Configure your domain

Set a DNS A record pointing `turn.yourdomain.com` to your server's public IP.

#### 2. Generate a shared secret

```bash
openssl rand -base64 32
# Example output: 7X3kP9mQ2rL5vN8wB1cE4hJ6sY0tU2oA
```

#### 3. Edit `infra/coturn/turnserver.conf`

Replace `replace-with-long-random-secret` with your generated secret and update the realm:

```ini
realm=turn.yourdomain.com
server-name=turn.yourdomain.com
static-auth-secret=7X3kP9mQ2rL5vN8wB1cE4hJ6sY0tU2oA
```

#### 4. Open firewall ports

| Port | Protocol | Purpose |
|------|----------|---------|
| 3478 | TCP/UDP | TURN (non-TLS) |
| 5349 | TCP/UDP | TURNS (TLS) |
| 49152-65535 | UDP | Relay data (configurable in turnserver.conf) |

#### 5. Start coturn

```bash
docker compose -f infra/coturn/docker-compose.yml up -d
```

#### 6. Set environment variables

```env
RTC_STUN_URLS=stun:turn.yourdomain.com:3478
RTC_TURN_URLS=turn:turn.yourdomain.com:3478?transport=udp,turns:turn.yourdomain.com:5349?transport=tcp
RTC_TURN_USERNAME=                  # Leave blank for coturn auth-secret; set username for lt-cred-mech or cloud providers
RTC_TURN_CREDENTIAL=7X3kP9mQ2rL5vN8wB1cE4hJ6sY0tU2oA
# ^ Leave USERNAME blank — coturn's auth-secret mode derives the username
# from timestamp:username. The app's auth-secret flow is NOT yet implemented
# on the client side, so for now use long-lived credentials or set a static
# username/password pair in turnserver.conf instead.
```

> **Note on auth-secret mode:** coturn's `use-auth-secret` generates time-limited credentials from a shared secret. The current client code sends a static username/password. If using auth-secret mode, set `RTC_TURN_USERNAME` to a fixed value and configure `lt-cred-mech` with a user database in `turnserver.conf` instead:
> ```ini
> lt-cred-mech
> user=proconnectiv:7X3kP9mQ2rL5vN8wB1cE4hJ6sY0tU2oA
> ```

### Option B: Cloud TURN Provider

Several services offer managed TURN servers. These are easier to set up but incur per-GB data charges.

#### [Twilio Network Traversal Service](https://www.twilio.com/docs/stun-turn)

Pros: Generous free tier, globally distributed. Cons: Requires a Twilio account.

1. Create a [Twilio account](https://www.twilio.com/try-twilio)
2. Get your Account SID and Auth Token from the console
3. Deploy a thin server endpoint that exchanges them for TURN credentials

Since the current app expects static env vars, you can either:
- Create a simple `/api/rtc-config` endpoint override (not recommended for security)
- Or use a static TURN server from another provider (see below)

#### [Metered TURN](https://www.metered.ca/turn)

Offers a free tier with up to 50 GB/month. Provides static credentials.

> ⚠️ Metered assigns a **custom subdomain** per account (e.g., `us-west-3.turn.metered.ca`).
> Do not use the generic `turn.metered.ca` — create an account and copy your actual endpoint from the dashboard.

```env
# Replace with your actual Metered subdomain from the dashboard
RTC_TURN_URLS=turn:YOUR_SUBDOMAIN.turn.metered.ca:80?transport=udp,turns:YOUR_SUBDOMAIN.turn.metered.ca:443?transport=tcp
RTC_TURN_USERNAME=your-metered-username
RTC_TURN_CREDENTIAL=your-metered-credential
```

#### [Xirsys](https://xirsys.com)

Provides a free developer tier with monthly bandwidth limits. Offers static credentials via a dashboard.

### Verifying Your TURN Server

1. Start the app and open Chrome DevTools
2. Make any authenticated API call and check the Network tab for `/api/rtc-config`
3. Verify the response includes your TURN server:

```json
{
  "iceServers": [
    { "urls": "stun:stun.l.google.com:19302" },
    {
      "urls": ["turn:turn.example.com:3478?transport=udp", "turns:turn.example.com:5349?transport=tcp"],
      "username": "proconnectiv",
      "credential": "***"
    }
  ],
  "forceRelayAfterMs": 10000,
  "hasTurn": true
}
```

4. Open the browser's `chrome://webrtc-internals` during a P2P call
5. Check the **ICE Candidate Pair** table — look for `relay` type candidates that indicate TURN is being used

### Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| `/api/rtc-config` returns empty `iceServers` | TURN env vars not set | Add `RTC_TURN_URLS`, `RTC_TURN_USERNAME`, `RTC_TURN_CREDENTIAL` |
| `hasTurn: false` in `/api/rtc-config` | TURN URLs not detected | Ensure URLs start with `turn:` or `turns:` |
| `ServerReflexive` candidates only, no `relay` candidates | TURN unreachable | Check firewall ports (3478, 5349, 49152-65535) and DNS resolution |
| `ICE failed` in WebRTC internals | Both P2P and TURN failed | Verify TURN credentials and server uptime |
| TURN auth errors in coturn logs | Credential mismatch | Check `turnserver.conf` user/secret matches env vars |

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
