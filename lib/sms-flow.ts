import { z } from "zod";
import { getRedis } from "./redis";
import { generateVerificationCode, getSmsSender, isDevBypassEnabled } from "./sms";

export const phoneSchema = z
  .string()
  .regex(/^1\d{10}$/, "phone must be a Chinese mainland mobile (11 digits, leading 1)");

export const CODE_TTL_SECONDS = 5 * 60;
export const RESEND_LOCK_SECONDS = 60;
export const DEV_BYPASS_CODE = "123456";

export type SendResult =
  | { ok: true }
  | { ok: false; error: "RATE_LIMITED"; retryAfter: number }
  | { ok: false; error: "SMS_PROVIDER_FAILURE"; reason: string };

export async function sendVerificationCode(phone: string): Promise<SendResult> {
  const redis = getRedis();
  const lockKey = `sms:lock:${phone}`;
  const codeKey = `sms:code:${phone}`;

  const ttl = await redis.ttl(lockKey);
  if (ttl > 0) {
    return { ok: false, error: "RATE_LIMITED", retryAfter: ttl };
  }

  const code = isDevBypassEnabled() ? DEV_BYPASS_CODE : generateVerificationCode();

  if (!isDevBypassEnabled()) {
    const result = await getSmsSender().sendVerificationCode(phone, code);
    if (!result.ok) {
      return { ok: false, error: "SMS_PROVIDER_FAILURE", reason: result.reason ?? "unknown" };
    }
  } else {
    await getSmsSender().sendVerificationCode(phone, code);
  }

  await redis.set(codeKey, code, "EX", CODE_TTL_SECONDS);
  await redis.set(lockKey, "1", "EX", RESEND_LOCK_SECONDS);
  return { ok: true };
}

export type VerifyResult = { ok: true } | { ok: false; error: "INVALID_CODE" };

export async function verifyAndConsumeCode(phone: string, code: string): Promise<VerifyResult> {
  if (isDevBypassEnabled() && code === DEV_BYPASS_CODE) {
    // Still consume any stored code for the phone so the bypass is opt-in by env, not by code.
    await getRedis().del(`sms:code:${phone}`);
    return { ok: true };
  }
  const redis = getRedis();
  const stored = await redis.get(`sms:code:${phone}`);
  if (!stored || stored !== code) {
    return { ok: false, error: "INVALID_CODE" };
  }
  await redis.del(`sms:code:${phone}`);
  return { ok: true };
}
