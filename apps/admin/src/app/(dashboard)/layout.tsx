import {AdminShell} from "@/components/admin-shell";
import {createSupabaseServerClient} from "@/lib/supabase/server";
import {DEMO_MODE_AUTO_EXPIRES_AT,isDemoMode} from "@/lib/demo-mode";
export const dynamic="force-dynamic";
export default async function DashboardLayout({children}:{children:React.ReactNode}){
  const demoMode=isDemoMode();
  if(demoMode)return <AdminShell viewer={{name:"Demo operator",email:"Read-only showcase"}}><div className="mb-5 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950"><strong>Demo mode:</strong> public read-only sample data. Authentication and write actions remain protected. Automatically closes {new Date(DEMO_MODE_AUTO_EXPIRES_AT).toLocaleString("en-US",{timeZone:"America/Los_Angeles",dateStyle:"medium",timeStyle:"short"})} Pacific.</div>{children}</AdminShell>;
  let viewer={name:"GO operator",email:""};
  try{const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(user){const email=user.email??"";const {data:profile}=await supabase.from("profiles").select("display_name").eq("id",user.id).maybeSingle();const metadata=user.user_metadata as Record<string,unknown>|undefined;const metadataName=typeof metadata?.full_name==="string"?metadata.full_name.trim():"";viewer={name:profile?.display_name||metadataName||email.split("@")[0]||"GO operator",email}}}catch{/* The shell still renders a safe identity fallback while auth refreshes. */}
  return <AdminShell viewer={viewer}>{children}</AdminShell>
}
