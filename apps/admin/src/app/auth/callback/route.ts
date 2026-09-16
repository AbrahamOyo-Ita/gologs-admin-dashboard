import {NextResponse,type NextRequest} from "next/server";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export async function GET(request:NextRequest){
  const code=request.nextUrl.searchParams.get("code");
  const tokenHash=request.nextUrl.searchParams.get("token_hash");
  const type=request.nextUrl.searchParams.get("type") as "magiclink"|null;
  const next=request.nextUrl.searchParams.get("next");
  let failed=false;
  if(code||tokenHash){const supabase=await createSupabaseServerClient();const result=code?await supabase.auth.exchangeCodeForSession(code):tokenHash&&type?await supabase.auth.verifyOtp({token_hash:tokenHash,type}):{error:new Error("Missing auth token")};failed=Boolean(result.error);}
  const destination=new URL(failed?"/login":next?.startsWith("/")?next:"/",request.url);if(failed)destination.searchParams.set("error","auth_callback_failed");return NextResponse.redirect(destination);
}
