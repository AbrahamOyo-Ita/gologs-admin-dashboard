import {createHash,randomInt} from "node:crypto";
import {readEnvironment} from "@/lib/env";
import {OTP_RESEND_SECONDS} from "@/lib/auth/constants";

export const OTP_EXPIRY_MINUTES=10;
export {OTP_RESEND_SECONDS};
export const OTP_MAX_ATTEMPTS=5;
export const OTP_REQUEST_DELAY_MS=220;

export function normalizeEmail(value:string){return value.trim().toLowerCase()}
export function maskEmail(email:string){const [local,domain]=email.split("@");if(!local||!domain)return email;return `${local.slice(0,1)}${"*".repeat(Math.max(2,Math.min(5,local.length-1)))}@${domain}`}
export function createOtp(){return String(randomInt(100000,1000000))}
export function hashOtp(code:string){return createHash("sha256").update(code).digest("hex")}
export async function waitForEnumerationResistance(){await new Promise((resolve)=>setTimeout(resolve,OTP_REQUEST_DELAY_MS))}

export async function deliverOtpEmail(email:string,code:string){
  const environment=readEnvironment();
  if(!environment.configured) throw new Error("Environment is not configured");
  const {EMAIL_DELIVERY_ENABLED,EMAIL_PROVIDER,RESEND_API_KEY,EMAIL_FROM}=environment.value;
  if(EMAIL_PROVIDER==="resend" && EMAIL_DELIVERY_ENABLED==="true" && RESEND_API_KEY){
    const safeEmail=email.replace(/[&<>\"']/g,(char)=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]??char));
    const html=`<!doctype html><html><body style="margin:0;background:#f4f7fc;font-family:Arial,sans-serif;color:#0e1e38"><div style="padding:40px 16px"><div style="max-width:520px;margin:auto;background:#fff;border:1px solid #dbe5f2;border-radius:20px;overflow:hidden"><div style="padding:28px 32px;background:#032254;color:#fff"><div style="font-size:24px;font-weight:800;letter-spacing:-2px">GO</div><div style="margin-top:6px;color:#b9d6ff;font-size:12px">Secure operations console</div></div><div style="padding:32px"><p style="margin:0 0 10px;color:#095fc7;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">Verify your email</p><h1 style="margin:0;font-size:26px">Your GO Admin code</h1><p style="color:#63738b;line-height:1.6">Enter this code to continue signing in${safeEmail?` as ${safeEmail}`:""}:</p><div style="margin:24px 0;padding:18px;text-align:center;background:#f4f7fc;border:1px solid #dbe5f2;border-radius:14px;font-size:34px;font-weight:800;letter-spacing:8px;color:#032254">${code}</div><p style="margin:0;color:#708198;font-size:12px">This code expires in ${OTP_EXPIRY_MINUTES} minutes. If you did not request it, you can safely ignore this email.</p></div></div></div></body></html>`;
    const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:EMAIL_FROM??"GO Admin <admin@go.example>",to:[email],subject:"Your GO Admin verification code",html,text:`Your GO Admin verification code is ${code}. It expires in ${OTP_EXPIRY_MINUTES} minutes.`})});
    if(!response.ok){const detail=await response.json().catch(()=>null) as {message?:string}|null;throw new Error(`Email provider rejected the message (${response.status})${detail?.message?`: ${detail.message}`:""}`)}
    return;
  }
  if(environment.value.APP_ENV!=="production"){
    console.info(`[GO Admin OTP] ${email}: ${code}`);
    return;
  }
  throw new Error("Email delivery is not enabled");
}

export async function deliverInvitationEmail(email:string,roleLabel:string,capabilities:string[]){
  const environment=readEnvironment();if(!environment.configured)throw new Error("Environment is not configured");
  const {EMAIL_DELIVERY_ENABLED,EMAIL_PROVIDER,RESEND_API_KEY,EMAIL_FROM}=environment.value;
  const list=capabilities.map((capability)=>`<li style="margin:6px 0;color:#334a68">${capability}</li>`).join("");
  const html=`<!doctype html><html><body style="margin:0;background:#f4f7fc;font-family:Arial,sans-serif;color:#0e1e38"><div style="padding:40px 16px"><div style="max-width:540px;margin:auto;background:#fff;border:1px solid #dbe5f2;border-radius:20px;overflow:hidden"><div style="padding:28px 32px;background:#032254;color:#fff"><div style="font-size:24px;font-weight:800;letter-spacing:-2px">GO</div><div style="margin-top:6px;color:#b9d6ff;font-size:12px">Operations console invitation</div></div><div style="padding:32px"><p style="margin:0 0 10px;color:#095fc7;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase">You’re invited</p><h1 style="margin:0;font-size:26px">Join GO Operations</h1><p style="color:#63738b;line-height:1.6">You’ve been invited to collaborate with the GO team. Your assigned role is:</p><div style="padding:14px 16px;background:#eaf3ff;border-radius:12px;color:#032254;font-weight:700">${roleLabel}</div><h2 style="margin:26px 0 8px;font-size:15px;color:#032254">Your permissions</h2><ul style="padding-left:22px;margin:0 0 24px">${list}</ul><a href="${environment.value.ADMIN_ORIGIN}/login" style="display:inline-block;padding:13px 18px;border-radius:10px;background:#095fc7;color:#fff;text-decoration:none;font-weight:700;font-size:14px">Open GO Admin</a><p style="margin:24px 0 0;color:#708198;font-size:12px;line-height:1.5">Use your invited email to request a secure verification code. GO never sends passwords by email. This invitation expires in 7 days.</p></div></div></div></body></html>`;
  const text=`You’re invited to GO Operations as ${roleLabel}.\n\nPermissions:\n${capabilities.map((capability)=>`- ${capability}`).join("\n")}\n\nOpen ${environment.value.ADMIN_ORIGIN}/login and request a secure verification code with your invited email. This invitation expires in 7 days.`;
  if(EMAIL_PROVIDER==="resend"&&EMAIL_DELIVERY_ENABLED==="true"&&RESEND_API_KEY){const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${RESEND_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({from:EMAIL_FROM??"GO Admin <admin@go.example>",to:[email],subject:"You’re invited to GO Operations",html,text})});if(!response.ok){const detail=await response.json().catch(()=>null) as {message?:string}|null;throw new Error(`Email provider rejected the invitation (${response.status})${detail?.message?`: ${detail.message}`:""}`)}return;}
  if(environment.value.APP_ENV!=="production"){console.info(`[GO Admin invitation] ${email} · ${roleLabel}`);return;}
  throw new Error("Email delivery is not enabled");
}
