import jwt, { type JwtPayload } from "jsonwebtoken";

export type TokenKind = "user" | "agent";

export interface AuthPayload {
  sub: string;
  kind: TokenKind;
}

const DEFAULT_EXPIRES_IN = "24h";
const MIN_SECRET_BYTES = 32;

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < MIN_SECRET_BYTES) {
    throw new Error(
      `JWT_SECRET is missing or shorter than ${MIN_SECRET_BYTES} bytes. ` +
        "Generate one with: openssl rand -base64 32",
    );
  }
  return secret;
}

function getExpiresIn(): string {
  return process.env.JWT_EXPIRES_IN || DEFAULT_EXPIRES_IN;
}

function sign(payload: AuthPayload): string {
  return jwt.sign(payload, getSecret(), {
    algorithm: "HS256",
    expiresIn: getExpiresIn(),
  } as jwt.SignOptions);
}

export function signUserToken(userId: string): string {
  return sign({ sub: userId, kind: "user" });
}

export function signAgentToken(agentId: string): string {
  return sign({ sub: agentId, kind: "agent" });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret(), { algorithms: ["HS256"] });
    if (typeof decoded === "string") return null;
    const { sub, kind } = decoded as JwtPayload & Partial<AuthPayload>;
    if (typeof sub !== "string" || (kind !== "user" && kind !== "agent")) {
      return null;
    }
    return { sub, kind };
  } catch {
    return null;
  }
}
