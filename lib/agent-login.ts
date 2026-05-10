import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { signAgentToken } from "./jwt";

export interface AgentLoginInput {
  username: string;
  password: string;
}

export interface AgentPublic {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  status: string;
  maxConcurrent: number;
  createdAt: Date;
  updatedAt: Date;
}

export type AgentLoginResult =
  | { ok: true; token: string; agent: AgentPublic }
  | { ok: false; error: "INVALID_CREDENTIALS" }
  | { ok: false; error: "INSECURE_PASSWORD_NOT_INITIALIZED" };

const BCRYPT_PREFIXES = ["$2a$", "$2b$", "$2y$"];

function isBcryptHash(hash: string): boolean {
  return BCRYPT_PREFIXES.some((p) => hash.startsWith(p));
}

export async function loginAgent({ username, password }: AgentLoginInput): Promise<AgentLoginResult> {
  const agent = await prisma.agent.findUnique({ where: { username } });
  if (!agent) {
    // Run a dummy bcrypt compare to keep response time roughly constant and not
    // leak whether the username exists. The literal hash is for "wrong-password".
    await bcrypt.compare(password, "$2b$12$CwTycUXWue0Thq9StjUM0uJ8.wPxiyjYz.qfPWAmTH0zg6q9XpYjC");
    return { ok: false, error: "INVALID_CREDENTIALS" };
  }
  if (!isBcryptHash(agent.passwordHash)) {
    return { ok: false, error: "INSECURE_PASSWORD_NOT_INITIALIZED" };
  }
  const matches = await bcrypt.compare(password, agent.passwordHash);
  if (!matches) {
    return { ok: false, error: "INVALID_CREDENTIALS" };
  }
  const { passwordHash: _drop, ...publicAgent } = agent;
  void _drop;
  const token = signAgentToken(agent.id);
  return { ok: true, token, agent: publicAgent };
}
