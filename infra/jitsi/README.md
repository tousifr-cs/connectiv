# Self-Hosted Jitsi + coturn

This app expects self-hosted Jitsi for `/video-call/:roomId` and issues JWTs from
`POST /api/rooms/:roomId/jitsi-token`.

## 1) Deploy Jitsi

Use the official docker stack:

- https://github.com/jitsi/docker-jitsi-meet

Set Jitsi auth to JWT in your Jitsi environment:

- `ENABLE_AUTH=1`
- `AUTH_TYPE=jwt`
- `JWT_APP_ID=<same as JITSI_JWT_APP_ID>`
- `JWT_APP_SECRET=<same as JITSI_JWT_APP_SECRET>`

The domain should match `JITSI_DOMAIN` used by this app (for example `meet.example.com`).

App-side env examples are in `infra/jitsi/.env.app.example`.

## 2) Deploy coturn

Run coturn on a public IP and configure it with `infra/coturn/turnserver.conf.example`.
You can run coturn with Docker using `infra/coturn/docker-compose.yml`.

This template is configured for:

- time-limited credentials (`use-auth-secret`)
- `credential-lifetime=86400`
- bandwidth and allocation hard limits:
  - `max-bps=512000`
  - `user-quota=10`
  - `total-quota=100`

Open ports:

- `3478` UDP/TCP
- `5349` TCP (for turns)
- relay range `49152-65535` UDP

## 3) Wire TURN into this app

Set these app env vars:

- `RTC_TURN_URLS`
- `RTC_TURN_USERNAME`
- `RTC_TURN_CREDENTIAL`
- optional `RTC_FORCE_RELAY_AFTER_MS`

For shared-secret TURN auth, your backend should mint temporary username/password pairs from the same `static-auth-secret` and return them to clients. If you keep static app-side TURN credentials, do not use `use-auth-secret`.

The app serves normalized ICE config from `GET /api/rtc-config`.

## 4) ICE behavior

Native WebRTC hook (`client/src/hooks/use-webrtc.ts`) behavior:

1. Start with `iceTransportPolicy: "all"` (direct P2P first).
2. If TURN is configured and not connected within `RTC_FORCE_RELAY_AFTER_MS`, retry with `iceTransportPolicy: "relay"`.

Jitsi behavior:

- `p2p.enabled: true`
- `p2p.useStunTurn: true`

TURN relay decisions for Jitsi are controlled by your Jitsi + coturn deployment.

## 5) Verification checklist

1. `POST /api/rooms/:roomId/jitsi-token` returns `{ token, domain, roomName }`.
2. Browser opens `https://<JITSI_DOMAIN>/external_api.js`.
3. In `chrome://webrtc-internals`, candidates include `typ relay` on restrictive networks.
4. Two participants can connect across different networks (mobile data vs home Wi-Fi).
