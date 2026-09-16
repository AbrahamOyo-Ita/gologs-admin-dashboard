import {NextResponse} from "next/server";
import {z} from "zod";
import {createSupabaseAdminClient} from "@/lib/supabase/admin";
import {hashOtp,normalizeEmail,OTP_MAX_ATTEMPTS} from "@/lib/auth/otp";

const schema=z.object({email:z.email(),code:z.string().regex(/^\d{6}$/),next:z.string().startsWith("/").default("/")});
export async function POST(request:Request){
  const noStore={headers:{"Cache-Control":"no-store, max-age=0"}};
  const parsed=schema.safeParse(await request.json().catch(()=>({})));
  if(!parsed.success)return NextResponse.json({error:"Enter the 6-digit code."},{status:400,...noStore});
  const {email,code,next}=parsed.data; const normalized=normalizeEmail(email);
  try{
    const supabase=createSupabaseAdminClient();
    const {data:otp,error}=await supabase.from("otp_codes").select("id,code_hash,expires_at,attempts,consumed").eq("email",normalized).eq("consumed",false).order("created_at",{ascending:false}).limit(1).maybeSingle();
    if(error||!otp||otp.consumed||new Date(otp.expires_at).getTime()<=Date.now())return NextResponse.json({error:"That code is invalid or expired. Request a new one."},{status:400,...noStore});
    if(otp.attempts>=OTP_MAX_ATTEMPTS)return NextResponse.json({error:"Too many incorrect attempts. Request a new code."},{status:400,...noStore});
    if(hashOtp(code)!==otp.code_hash){
      const attempts=otp.attempts+1; await supabase.from("otp_codes").update({attempts}).eq("id",otp.id).eq("consumed",false);
      return NextResponse.json({error:attempts>=3?`Incorrect code. ${OTP_MAX_ATTEMPTS-attempts} attempts remaining.`:"Incorrect code. Try again."},{status:400,...noStore});
    }
    const {error:updateError}=await supabase.from("otp_codes").update({consumed:true}).eq("id",otp.id).eq("consumed",false);
    if(updateError)throw updateError;
    const {data:link,error:linkError}=await supabase.auth.admin.generateLink({type:"magiclink",email:normalized,options:{redirectTo:`${process.env.ADMIN_ORIGIN??"http://localhost:3000"}/auth/callback?next=${encodeURIComponent(next)}`}});
    if(linkError||!link?.properties?.hashed_token)throw linkError??new Error("Unable to create session link");
    const callback=new URL("/auth/callback",process.env.ADMIN_ORIGIN??"http://localhost:3000"); callback.searchParams.set("token_hash",link.properties.hashed_token); callback.searchParams.set("type","magiclink"); callback.searchParams.set("next",next);
    return NextResponse.json({ok:true,redirectUrl:callback.toString()},{...noStore});
  }catch(error){console.error("otp_verify_failed",error instanceof Error?error.message:"unknown");return NextResponse.json({error:"We couldn't verify that code right now. Try again."},{status:503,...noStore})}
}
