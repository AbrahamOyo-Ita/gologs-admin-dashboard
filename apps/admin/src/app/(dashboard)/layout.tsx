import {AdminShell} from "@/components/admin-shell";
import {createSupabaseServerClient} from "@/lib/supabase/server";
export const dynamic="force-dynamic";
export default async function DashboardLayout({children}:{children:React.ReactNode}){
  let viewer={name:"GO operator",email:""};
  try{const supabase=await createSupabaseServerClient();const {data:{user}}=await supabase.auth.getUser();if(user){const email=user.email??"";const {data:profile}=await supabase.from("profiles").select("display_name").eq("id",user.id).maybeSingle();const metadata=user.user_metadata as Record<string,unknown>|undefined;const metadataName=typeof metadata?.full_name==="string"?metadata.full_name.trim():"";viewer={name:profile?.display_name||metadataName||email.split("@")[0]||"GO operator",email}}}catch{/* The shell still renders a safe identity fallback while auth refreshes. */}
  return <AdminShell viewer={viewer}>{children}</AdminShell>
}
