import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { phoneSchema, sendVerificationCode } from "@/lib/sms-flow";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({ phone: phoneSchema });

export async function POST(req: NextRequest): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_PHONE" }, { status: 400 });
  }
  const result = await sendVerificationCode(parsed.data.phone);
  if (!result.ok) {
    if (result.error === "RATE_LIMITED") {
      return NextResponse.json(
        { ok: false, error: result.error, retryAfter: result.retryAfter },
        { status: 429 },
      );
    }
    return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
