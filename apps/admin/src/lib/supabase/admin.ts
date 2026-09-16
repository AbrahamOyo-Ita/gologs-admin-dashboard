import {createClient} from "@supabase/supabase-js";
import {readEnvironment} from "@/lib/env";

export function createSupabaseAdminClient(){
  const environment=readEnvironment();
  if(!environment.configured || !environment.value.SUPABASE_SECRET_KEY){
    throw new Error("Supabase server secret is not configured");
  }
  return createClient(environment.value.NEXT_PUBLIC_SUPABASE_URL,environment.value.SUPABASE_SECRET_KEY,{auth:{autoRefreshToken:false,persistSession:false,detectSessionInUrl:false}});
}
