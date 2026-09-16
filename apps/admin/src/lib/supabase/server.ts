import {createServerClient} from "@supabase/ssr";
import {cookies} from "next/headers";
import {readEnvironment} from "@/lib/env";

export async function createSupabaseServerClient(){
  const environment=readEnvironment();
  if(!environment.configured) throw new Error("Supabase is not configured");
  const cookieStore=await cookies();
  return createServerClient(environment.value.NEXT_PUBLIC_SUPABASE_URL,environment.value.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{
    getAll(){return cookieStore.getAll()},
    setAll(cookiesToSet){try{cookiesToSet.forEach(({name,value,options})=>cookieStore.set(name,value,options))}catch{/* Server Components cannot write cookies; proxy handles refresh. */}},
  }});
}
