import bcrypt from "bcryptjs";
import { AgentStatus, PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_SEED !== "1") {
  // Production-seed guard: the placeholder credentials below must never reach
  // a production database without an explicit, intentional opt-in. DevOps is
  // responsible for resetting these credentials after the first production
  // deploy (tracked in T9).
  throw new Error(
    "Refusing to seed in production without ALLOW_PROD_SEED=1. " +
      "Production deploys are expected to reset these credentials immediately.",
  );
}

const SALT_ROUNDS = 12;

const prisma = new PrismaClient();

interface AgentSeed {
  username: string;
  displayName: string;
  // Plaintext value used only to derive the bcrypt hash below. After T2, the
  // hash is what is persisted; the plaintext is documented in README under
  // "Local development" purely so that engineers can sign in to the dev
  // server. DevOps MUST rotate these on the production server.
  plaintextPassword: string;
}

const seeds: AgentSeed[] = [
  { username: "agent01", displayName: "客服 01", plaintextPassword: "Agent01@2026" },
  { username: "agent02", displayName: "客服 02", plaintextPassword: "Agent02@2026" },
  { username: "agent03", displayName: "客服 03", plaintextPassword: "Agent03@2026" },
];

async function main(): Promise<void> {
  for (const seed of seeds) {
    const passwordHash = await bcrypt.hash(seed.plaintextPassword, SALT_ROUNDS);
    const agent = await prisma.agent.upsert({
      where: { username: seed.username },
      update: { passwordHash },
      create: {
        username: seed.username,
        displayName: seed.displayName,
        passwordHash,
        status: AgentStatus.OFFLINE,
      },
    });
    console.log(`[seed] agent ready: ${agent.username} (${agent.id})`);
  }
}

main()
  .catch((err: unknown) => {
    console.error("[seed] failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
