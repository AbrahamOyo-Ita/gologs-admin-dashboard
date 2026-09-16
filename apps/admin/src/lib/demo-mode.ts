export const DEMO_MODE_AUTO_EXPIRES_AT="2026-09-17T00:00:00.000Z";

export function isDemoMode(now=Date.now()){
  if(process.env.DEMO_MODE==="false")return false;
  if(process.env.DEMO_MODE==="true")return true;
  return now<Date.parse(DEMO_MODE_AUTO_EXPIRES_AT);
}
