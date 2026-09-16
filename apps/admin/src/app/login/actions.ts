"use server";
import {redirect} from "next/navigation";
import type {Route} from "next";
import {z} from "zod";
import {createSupabaseServerClient} from "@/lib/supabase/server";
const schema=z.object({email:z.email(),password:z.string().min(12).max(128),next:z.string().startsWith("/").default("/")});
export type LoginState={error?:string};
export async function signIn(_:LoginState,formData:FormData):Promise<LoginState>{const parsed=schema.safeParse(Object.fromEntries(formData));if(!parsed.success)return{error:"Enter a valid email and password."};const supabase=await createSupabaseServerClient();const {error}=await supabase.auth.signInWithPassword({email:parsed.data.email,password:parsed.data.password});if(error)return{error:"Sign-in failed. Check your details or contact an administrator."};redirect(parsed.data.next as Route)}
