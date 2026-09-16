import {createClient} from "@supabase/supabase-js";
import {readEnvironment} from "@/lib/env";

export function createSupabaseAdminClient(){
  const environment=readEnvironment();
  if(!environment.configured){
    console.error("environment_configuration_invalid",{issues:environment.issues});
    throw new Error(`Environment is not configured: ${environment.issues.join("; ")}`);
  }
  if(!environment.value.SUPABASE_SECRET_KEY){
    throw new Error("Supabase server secret is not configured");
  }
  return createClient(environment.value.NEXT_PUBLIC_SUPABASE_URL,environment.value.SUPABASE_SECRET_KEY,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});
}
