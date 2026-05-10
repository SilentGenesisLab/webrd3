import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signUserToken } from "@/lib/jwt";
import { phoneSchema, verifyAndConsumeCode } from "@/lib/sms-flow";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const bodySchema = z.object({
  phone: phoneSchema,
  code: z.string().regex(/^\d{6}$/, "code must be 6 digits"),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "INVALID_REQUEST" }, { status: 400 });
  }
  const { phone, code } = parsed.data;

  const verify = await verifyAndConsumeCode(phone, code);
  if (!verify.ok) {
    return NextResponse.json({ ok: false, error: "INVALID_CODE" }, { status: 401 });
  }

  const user = await prisma.user.upsert({
    where: { phone },
    update: {},
    create: { phone },
    select: {
      id: true,
      phone: true,
      nickname: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const token = signUserToken(user.id);
  return NextResponse.json({ ok: true, token, user });
}
