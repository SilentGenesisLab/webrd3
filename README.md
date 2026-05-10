# webrd3

**webrd3** is a real-time IM customer-service system maintained by **SilentGenesisLab**.

It exposes two front-ends on top of a single Next.js 14 App Router codebase:

- `/chat` — end-user chat surface for contacting customer service
- `/agent` — internal console where service agents handle conversations

## Tech stack

- **Framework**: Next.js 14 (App Router) + React 18 + TypeScript (strict)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL via Prisma v6
- **Realtime**: Socket.IO (server + client)
- **Queue**: BullMQ on top of Redis
- **Storage**: Alibaba Cloud OSS (`ali-oss`)
- **Auth**: JWT (`jsonwebtoken`)
- **SMS**: Aliyun SMS (regional, Chinese mainland)
- **Validation**: Zod
- **Testing**: Vitest
- **Tooling**: pnpm, ESLint, Prettier
- **Container**: Docker (multi-stage, Next.js standalone output)

## Repository layout

```
app/
  (user)/chat/page.tsx        # end-user chat surface
  (agent)/agent/page.tsx      # agent console
  api/health/route.ts         # GET /api/health -> { ok: true }
  layout.tsx
  page.tsx
lib/                          # prisma / socket / oss clients (filled in later tasks)
prisma/                       # schema.prisma + migrations (filled in T1)
workers/                      # BullMQ workers (filled in T2)
public/
```

## Local development

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env template and fill in real values locally (do NOT commit .env)
cp .env.example .env

# 3. Run the dev server
pnpm dev
# -> http://localhost:3000
```

## Required environment variables

See [`.env.example`](.env.example). Sensitive credentials (OSS keys, DB passwords,
JWT secret, SMS keys) **must never be committed** — they are injected on the
deployment server only.

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string consumed by Prisma |
| `REDIS_URL` | Redis connection string consumed by BullMQ |
| `JWT_SECRET` | HMAC secret for signing access tokens |
| `OSS_ACCESS_KEY_ID` / `OSS_ACCESS_KEY_SECRET` | Alibaba Cloud OSS credentials |
| `OSS_BUCKET` / `OSS_ENDPOINT` / `OSS_PUBLIC_DOMAIN` | OSS bucket configuration |
| `SMS_ACCESS_KEY_ID` / `SMS_ACCESS_KEY_SECRET` | Aliyun SMS credentials |
| `SMS_SIGN_NAME` / `SMS_TEMPLATE_CODE` / `SMS_REGION_ID` | Aliyun SMS template metadata |
| `NEXT_PUBLIC_WS_URL` | WebSocket endpoint exposed to the browser |

## Branch model

```
main              ← production-ready, merged from uat only
  └── uat         ← integration branch, PR target
       └── feature/<task-id>  ← engineer branches
```

## License

Proprietary — internal SilentGenesisLab project.
