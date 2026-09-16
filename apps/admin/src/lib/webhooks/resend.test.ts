import {createHmac} from "node:crypto";
import {describe,expect,it} from "vitest";
import {verifyResendWebhookSignature} from "./resend";

describe("Resend webhook verification",()=>{
  const secret="whsec_"+Buffer.from("production-test-secret").toString("base64");
  const body='{"type":"email.delivered"}';
  const id="msg_test_123";
  const timestamp="1700000000";
  const signature="v1,"+createHmac("sha256",Buffer.from("production-test-secret")).update(`${id}.${timestamp}.${body}`).digest("base64");
  it("accepts a valid Svix signature",()=>expect(verifyResendWebhookSignature({body,secret,id,timestamp,signature,nowMs:1700000000000})).toBe(true));
  it("rejects tampered bodies and stale timestamps",()=>{
    expect(verifyResendWebhookSignature({body:body+" ",secret,id,timestamp,signature,nowMs:1700000000000})).toBe(false);
    expect(verifyResendWebhookSignature({body,secret,id,timestamp,signature,nowMs:1700001000000})).toBe(false);
  });
});
