import Dysmsapi, * as DysmsapiNs from "@alicloud/dysmsapi20170525";
import * as OpenApi from "@alicloud/openapi-client";

export interface SmsSendResult {
  ok: boolean;
  bizId?: string;
  reason?: string;
}

export interface SmsSender {
  sendVerificationCode(phone: string, code: string): Promise<SmsSendResult>;
}

const SmsClientCtor =
  (Dysmsapi as unknown as { default?: typeof DysmsapiNs.default }).default ??
  (Dysmsapi as unknown as typeof DysmsapiNs.default);

const SendSmsRequestCtor =
  (DysmsapiNs as unknown as { SendSmsRequest?: typeof DysmsapiNs.SendSmsRequest })
    .SendSmsRequest ?? DysmsapiNs.SendSmsRequest;

class AliyunSmsSender implements SmsSender {
  private readonly client: InstanceType<typeof SmsClientCtor>;
  private readonly signName: string;
  private readonly templateCode: string;

  constructor() {
    const accessKeyId = process.env.SMS_ACCESS_KEY_ID;
    const accessKeySecret = process.env.SMS_ACCESS_KEY_SECRET;
    const regionId = process.env.SMS_REGION_ID || "cn-hangzhou";
    const signName = process.env.SMS_SIGN_NAME;
    const templateCode = process.env.SMS_TEMPLATE_CODE;
    if (!accessKeyId || !accessKeySecret || !signName || !templateCode) {
      throw new Error(
        "Aliyun SMS env vars missing: SMS_ACCESS_KEY_ID / SMS_ACCESS_KEY_SECRET / " +
          "SMS_SIGN_NAME / SMS_TEMPLATE_CODE are required.",
      );
    }
    const config = new OpenApi.Config({
      accessKeyId,
      accessKeySecret,
      regionId,
      endpoint: `dysmsapi.${regionId}.aliyuncs.com`,
    });
    this.client = new SmsClientCtor(config);
    this.signName = signName;
    this.templateCode = templateCode;
  }

  async sendVerificationCode(phone: string, code: string): Promise<SmsSendResult> {
    const req = new SendSmsRequestCtor({
      phoneNumbers: phone,
      signName: this.signName,
      templateCode: this.templateCode,
      templateParam: JSON.stringify({ code }),
    });
    const resp = await this.client.sendSms(req);
    const body = resp.body;
    if (body?.code === "OK") {
      return { ok: true, bizId: body.bizId };
    }
    return { ok: false, reason: body?.message || body?.code || "unknown" };
  }
}

class DevBypassSmsSender implements SmsSender {
  async sendVerificationCode(phone: string, code: string): Promise<SmsSendResult> {
    console.log(`[sms:dev-bypass] phone=${phone} code=${code} (not sent)`);
    return { ok: true, bizId: "dev-bypass" };
  }
}

let cached: SmsSender | undefined;

export function isDevBypassEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.SMS_DEV_BYPASS === "1";
}

export function getSmsSender(): SmsSender {
  if (cached) return cached;
  cached = isDevBypassEnabled() ? new DevBypassSmsSender() : new AliyunSmsSender();
  return cached;
}

// Test seam.
export function setSmsSenderForTesting(sender: SmsSender | undefined): void {
  cached = sender;
}

export function generateVerificationCode(): string {
  // 6-digit zero-padded numeric code.
  return Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
}
