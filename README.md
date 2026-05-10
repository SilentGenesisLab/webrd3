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
prisma/
  schema.prisma               # IM core models (User/Agent/Conversation/Message)
  migrations/                 # generated SQL migrations (T1: init_im_schema)
  seed.ts                     # seeds three placeholder agent accounts
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

## Database setup

Once `DATABASE_URL` is pointed at a reachable PostgreSQL instance:

```bash
# Generate the typed Prisma client (also runs as part of postinstall in CI).
pnpm db:generate

# Apply migrations in development (runs migrations + regenerates the client).
pnpm db:migrate

# Apply migrations in production / CI (idempotent, no schema-drift checks).
pnpm db:deploy

# Seed the three placeholder agent accounts (agent01 / agent02 / agent03).
pnpm db:seed
```

### Schema overview (T1 — `init_im_schema`)

| Model | Purpose | Key indexes |
|---|---|---|
| `User` | End user (logs in by phone). | `phone` unique |
| `Agent` | Customer-service agent. | `username` unique, `status` |
| `Conversation` | 1-to-1 user/agent thread. | `(userId, status)`, `(agentId, status)`, `(status, lastMessageAt)` |
| `Message` | Conversation message (TEXT/IMAGE/SYSTEM). | `(conversationId, createdAt)` |

**Application-layer invariants** (intentionally not enforced at the DB level so
they can be relaxed without a destructive migration):

1. A `User` may have at most one `Conversation` whose `status != CLOSED`.
2. When `Message.senderType = USER`, `Message.senderId` MUST equal `Conversation.userId`.
3. When `Message.senderType = AGENT`, `Message.senderId` MUST equal `Conversation.agentId`.

The auth module (T2) will replace the seeded plaintext passwords with bcrypt
hashes; until then `agent01/02/03` exist purely to make local development and
the QA gate runnable.

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
