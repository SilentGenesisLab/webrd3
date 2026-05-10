import { NextResponse, type NextRequest } from "next/server";
import { verifyToken, type AuthPayload } from "./jwt";

export interface UserAuth {
  userId: string;
}

export interface AgentAuth {
  agentId: string;
}

function unauthorized(message: string): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

function extractBearer(req: NextRequest): string | null {
  const header = req.headers.get("authorization");
  if (!header) return null;
  const [scheme, token] = header.split(" ", 2);
  if (scheme !== "Bearer" || !token) return null;
  return token;
}

function authenticate(req: NextRequest): AuthPayload | null {
  const token = extractBearer(req);
  if (!token) return null;
  return verifyToken(token);
}

export function requireUser(req: NextRequest): UserAuth | NextResponse {
  const payload = authenticate(req);
  if (!payload) return unauthorized("UNAUTHORIZED");
  if (payload.kind !== "user") return unauthorized("WRONG_TOKEN_KIND");
  return { userId: payload.sub };
}

export function requireAgent(req: NextRequest): AgentAuth | NextResponse {
  const payload = authenticate(req);
  if (!payload) return unauthorized("UNAUTHORIZED");
  if (payload.kind !== "agent") return unauthorized("WRONG_TOKEN_KIND");
  return { agentId: payload.sub };
}
