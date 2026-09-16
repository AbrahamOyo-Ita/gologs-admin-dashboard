import {NextResponse} from "next/server";
import {z} from "zod";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
import {readEnvironment} from "@/lib/env";
import {verifyResendWebhookSignature} from "@/lib/webhooks/resend";

export const runtime="nodejs";
export const dynamic="force-dynamic";

const eventSchema=z.object({type:z.string().min(1).max(120),created_at:z.string().optional(),data:z.record(z.string(),z.unknown()).default({}),id:z.string().optional()}).passthrough();
const json=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});

export async function POST(request:Request,{params}:{params:Promise<{endpointToken:string}>}){
  const environment=readEnvironment();
  if(!environment.configured) return json({error:"Webhook unavailable"},503);
  const {EMAIL_WEBHOOK_SIGNING_SECRET,EMAIL_WEBHOOK_ENDPOINT_TOKEN}=environment.value;
  const {endpointToken}=await params;
  if(!EMAIL_WEBHOOK_SIGNING_SECRET||!EMAIL_WEBHOOK_ENDPOINT_TOKEN||endpointToken!==EMAIL_WEBHOOK_ENDPOINT_TOKEN) return json({error:"Not found"},404);
  const body=await request.text();
  if(body.length>256_000) return json({error:"Payload too large"},413);
  const id=request.headers.get("svix-id")??request.headers.get("webhook-id")??"";
  const timestamp=request.headers.get("svix-timestamp")??request.headers.get("webhook-timestamp")??"";
  const signature=request.headers.get("svix-signature")??request.headers.get("webhook-signature")??"";
  if(!verifyResendWebhookSignature({body,secret:EMAIL_WEBHOOK_SIGNING_SECRET,id,timestamp,signature})) return json({error:"Invalid signature"},401);
  let event:z.infer<typeof eventSchema>;
  try{event=eventSchema.parse(JSON.parse(body))}catch{return json({error:"Invalid payload"},400)}
  const providerEventId=id||event.id||String(event.data.email_id??event.data.id??"");
  if(!providerEventId) return json({error:"Missing event id"},400);
  try{
    const supabase=createSupabaseAdminClient();
    const {data:workspace,error:workspaceError}=await supabase.from("workspaces").select("id").eq("slug","go-operations").single();
    if(workspaceError||!workspace) return json({error:"Webhook unavailable"},503);
    const {error}=await supabase.from("provider_events").insert({workspace_id:workspace.id,provider:"resend",provider_event_id:providerEventId,event_type:event.type,payload:event,signature_verified:true});
    if(error?.code==="23505") return json({ok:true,duplicate:true});
    if(error) throw error;
    const {error:jobError}=await supabase.from("background_jobs").upsert({workspace_id:workspace.id,job_type:"provider_event.normalize",idempotency_key:providerEventId,payload:{provider:"resend",provider_event_id:providerEventId},max_attempts:8},{onConflict:"workspace_id,job_type,idempotency_key",ignoreDuplicates:true});
    if(jobError) console.error("[webhook] job enqueue failed",{providerEventId,eventType:event.type});
    return json({ok:true},202);
  }catch(error){console.error("[webhook] persistence failed",{providerEventId,eventType:event.type,error:error instanceof Error?error.message:"unknown"});return json({error:"Webhook unavailable"},503)}
}

export async function OPTIONS(){return new NextResponse(null,{status:204,headers:{Allow:"POST, OPTIONS"}})}
