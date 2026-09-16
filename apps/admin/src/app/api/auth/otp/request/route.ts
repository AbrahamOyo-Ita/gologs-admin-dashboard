import {NextResponse} from "next/server";
import {z} from "zod";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
import {createOtp,deliverOtpEmail,hashOtp,normalizeEmail,OTP_EXPIRY_MINUTES,OTP_RESEND_SECONDS,waitForEnumerationResistance} from "@/lib/auth/otp";

const schema=z.object({email:z.email()});
export async function POST(request:Request){
  const noStore={headers:{"Cache-Control":"no-store, max-age=0"}};
  const started=Date.now();
  const body=await request.json().catch(()=>({}));
  const parsed=schema.safeParse(body);
  if(!parsed.success)return NextResponse.json({error:"Enter a valid email address."},{status:400,...noStore});
  const email=normalizeEmail(parsed.data.email);
  try{
    const supabase=createSupabaseAdminClient();
    const {data:allowlisted,error:allowlistError}=await supabase.from("admin_emails").select("email").eq("email",email).maybeSingle();
    if(allowlistError) throw allowlistError;
    const {data:recent}=await supabase.from("otp_codes").select("created_at").eq("email",email).gte("created_at",new Date(Date.now()-60*60*1000).toISOString()).order("created_at",{ascending:false});
    await waitForEnumerationResistance();
    if(!allowlisted){return NextResponse.json({error:"This email isn't authorized for admin access."},{status:403,...noStore})}
    if((recent?.length??0)>=5)return NextResponse.json({error:"Too many code requests. Try again later."},{status:429,...noStore});
    const latest=recent?.[0]?.created_at?new Date(recent[0].created_at).getTime():0;
    if(latest && Date.now()-latest<OTP_RESEND_SECONDS*1000){const retryAfter=Math.max(1,Math.ceil((OTP_RESEND_SECONDS*1000-(Date.now()-latest))/1000));return NextResponse.json({error:`Please wait ${retryAfter} seconds before requesting another code.`,retryAfter},{status:429,...noStore});}
    const code=createOtp();
    const {error}=await supabase.from("otp_codes").insert({email,code_hash:hashOtp(code),expires_at:new Date(Date.now()+OTP_EXPIRY_MINUTES*60*1000).toISOString()});
    if(error)throw error;
    await deliverOtpEmail(email,code);
    return NextResponse.json({ok:true,email},{...noStore});
  }catch(error){
    console.error("otp_request_failed",{duration_ms:Date.now()-started,error:error instanceof Error?error.message:JSON.stringify(error)});
    return NextResponse.json({error:"We couldn't send a verification code right now. Try again shortly."},{status:503,...noStore});
  }
}
