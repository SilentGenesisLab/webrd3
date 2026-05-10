import { AgentStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface AgentSeed {
  username: string;
  displayName: string;
  // TODO(T2): replace plaintext placeholder with bcrypt hash once the auth
  // module lands. The login endpoint will reject any agent whose passwordHash
  // does not start with "$2" (bcrypt prefix), so seeded accounts will need to
  // be re-seeded after T2 ships.
  plaintextPassword: string;
}

const seeds: AgentSeed[] = [
  { username: "agent01", displayName: "客服 01", plaintextPassword: "change_me_1" },
  { username: "agent02", displayName: "客服 02", plaintextPassword: "change_me_2" },
  { username: "agent03", displayName: "客服 03", plaintextPassword: "change_me_3" },
];

async function main(): Promise<void> {
  for (const seed of seeds) {
    const agent = await prisma.agent.upsert({
      where: { username: seed.username },
      update: {},
      create: {
        username: seed.username,
        displayName: seed.displayName,
        passwordHash: seed.plaintextPassword,
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
