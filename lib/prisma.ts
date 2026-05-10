import { PrismaClient } from "@prisma/client";

// In dev, Next.js hot-reload re-evaluates this module on every change, which
// would otherwise spawn a new PrismaClient (and a new connection pool) per
// reload. We keep a single instance on globalThis so the dev server stays
// stable. In production we never assign to globalThis, so each process gets
// exactly one client as expected.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
