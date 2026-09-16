import {createHmac,timingSafeEqual} from "node:crypto";

export const RESEND_WEBHOOK_TOLERANCE_SECONDS=300;

function decodeSecret(secret:string){
  if(secret.startsWith("whsec_")) return Buffer.from(secret.slice(6),"base64");
  return Buffer.from(secret,"utf8");
}

export function verifyResendWebhookSignature(input:{body:string;secret:string;id:string;timestamp:string;signature:string;nowMs?:number}){
  const timestamp=Number(input.timestamp);
  if(!input.id||!input.signature||!Number.isInteger(timestamp)) return false;
  const age=Math.abs((input.nowMs??Date.now())/1000-timestamp);
  if(age>RESEND_WEBHOOK_TOLERANCE_SECONDS) return false;
  const expected=createHmac("sha256",decodeSecret(input.secret)).update(`${input.id}.${input.timestamp}.${input.body}`).digest();
  return input.signature.split(" ").some((candidate)=>{
    const [version,value]=candidate.split(",",2);
    if(version!=="v1"||!value) return false;
    try{const actual=Buffer.from(value,"base64"); return actual.length===expected.length&&timingSafeEqual(actual,expected)}catch{return false}
  });
}
