import {NextResponse} from "next/server";
import {createHash,randomBytes} from "node:crypto";
import {z} from "zod";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
import {deliverInvitationEmail} from "@/lib/auth/otp";
import {roleCapabilities} from "@/lib/auth/permissions";
import {isDemoMode} from "@/lib/demo-mode";

const schema=z.object({email:z.email(),roleKey:z.enum(["super_admin","admin","publisher","content_editor","marketing_manager","virtual_assistant","analyst","support_agent","auditor"]).default("virtual_assistant")});
const labels:Record<string,string>={super_admin:"Super admin",admin:"Administrator",publisher:"Publisher",content_editor:"Content editor",marketing_manager:"Marketing manager",virtual_assistant:"Virtual assistant",analyst:"Analyst",support_agent:"Support agent",auditor:"Auditor"};
export async function POST(request:Request){
 const noStore={headers:{"Cache-Control":"no-store"}};if(isDemoMode())return NextResponse.json({error:"Administrative writes are disabled in demo mode."},{status:403,...noStore});const parsed=schema.safeParse(await request.json().catch(()=>({})));if(!parsed.success)return NextResponse.json({error:"Enter a valid work email and role."},{status:400,...noStore});
 try{const auth=await createSupabaseServerClient();const {data:{user}}=await auth.auth.getUser();if(!user)return NextResponse.json({error:"Your session has expired. Sign in again."},{status:401,...noStore});const admin=createSupabaseAdminClient();const {data:membership}=await admin.from("memberships").select("id,workspace_id").eq("user_id",user.id).eq("status","active").limit(1).maybeSingle();if(!membership)return NextResponse.json({error:"Your account is not attached to an active GO workspace."},{status:403,...noStore});const token=randomBytes(32).toString("base64url"),tokenHash=createHash("sha256").update(token).digest("hex");const {error}=await admin.from("invitations").insert({workspace_id:membership.workspace_id,email_normalized:parsed.data.email.trim().toLowerCase(),role_key:parsed.data.roleKey,token_hash:tokenHash,invited_by:user.id,expires_at:new Date(Date.now()+7*24*60*60*1000).toISOString()});if(error)throw error;const capabilities=[...roleCapabilities[parsed.data.roleKey]];await deliverInvitationEmail(parsed.data.email.trim().toLowerCase(),labels[parsed.data.roleKey],capabilities);return NextResponse.json({ok:true},{...noStore})}catch(error){console.error("team_invite_failed",error instanceof Error?error.message:JSON.stringify(error));return NextResponse.json({error:"Unable to create and send the invitation right now."},{status:503,...noStore})}
}
