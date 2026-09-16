import {NextResponse} from "next/server";
import {createHash} from "node:crypto";
import {z} from "zod";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
const schema=z.object({email:z.email().transform((value)=>value.trim().toLowerCase()),source:z.string().max(80).default("gologs.com.ng"),consent:z.literal(true),policyVersion:z.string().max(40).default("2026-09-01")});
const cors={"Access-Control-Allow-Origin":"https://www.gologs.com.ng","Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"content-type","Cache-Control":"no-store"};
export function OPTIONS(){return new NextResponse(null,{status:204,headers:cors})}
export async function POST(request:Request){
 const parsed=schema.safeParse(await request.json().catch(()=>({})));if(!parsed.success)return NextResponse.json({ok:false,error:"Enter a valid email and consent to updates."},{status:400,headers:cors});
 try{const db=createSupabaseAdminClient();const {data:workspace,error:workspaceError}=await db.from("workspaces").select("id").eq("slug","go-operations").maybeSingle();if(workspaceError||!workspace)throw workspaceError??new Error("Workspace unavailable");const hash=createHash("sha256").update(parsed.data.email).digest("hex");const {data:subscriber,error}=await db.from("subscribers").upsert({workspace_id:workspace.id,email_normalized:parsed.data.email,email_hash:hash,status:"pending",source:parsed.data.source,acquisition:{domain:"gologs.com.ng"}},{onConflict:"workspace_id,email_hash"}).select("id").single();if(error)throw error;const {error:consentError}=await db.from("consent_events").insert({subscriber_id:subscriber.id,event_type:"subscribe",source:parsed.data.source,policy_version:parsed.data.policyVersion});if(consentError)throw consentError;return NextResponse.json({ok:true},{headers:cors})}catch(error){console.error("public_newsletter_signup_failed",error instanceof Error?error.message:JSON.stringify(error));return NextResponse.json({ok:false,error:"Subscription is temporarily unavailable."},{status:503,headers:cors})}
}
