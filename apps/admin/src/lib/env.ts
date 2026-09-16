import { z } from "zod";
const environmentSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL:z.string().url().refine((value)=>!value.includes("your-project.supabase.co")&&!value.includes("replace-me.supabase.co"),"replace the Supabase URL placeholder"),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:z.string().min(16).refine((value)=>!value.includes("replace_me"),"replace the Supabase key placeholder"),
  SUPABASE_SECRET_KEY:z.string().min(16).refine((value)=>!value.includes("replace_me"),"replace the secret key placeholder").optional(), ADMIN_ORIGIN:z.string().url(),
  APP_ENV:z.enum(["development","test","preview","production"]),
  EMAIL_DELIVERY_ENABLED:z.enum(["true","false"]).default("false"), EMAIL_PROVIDER:z.enum(["console","resend"]).default("console"), RESEND_API_KEY:z.string().min(16).optional(), EMAIL_FROM:z.string().optional(), EMAIL_WEBHOOK_SIGNING_SECRET:z.string().min(32).optional(), EMAIL_WEBHOOK_ENDPOINT_TOKEN:z.string().min(24).optional(),
}).superRefine((value,ctx)=>{if(value.APP_ENV==="production"&&(!value.RESEND_API_KEY||value.EMAIL_PROVIDER!=="resend"||value.EMAIL_DELIVERY_ENABLED!=="true"||!value.EMAIL_FROM||!value.EMAIL_WEBHOOK_SIGNING_SECRET||!value.EMAIL_WEBHOOK_ENDPOINT_TOKEN)){ctx.addIssue({code:"custom",path:["EMAIL_DELIVERY_ENABLED"],message:"production requires Resend delivery, sender, webhook secret, and endpoint token"})}});
export type Environment=z.infer<typeof environmentSchema>;
export function readEnvironment():{configured:true;value:Environment}|{configured:false;issues:string[]}{const result=environmentSchema.safeParse(process.env);if(result.success)return{configured:true,value:result.data};return{configured:false,issues:result.error.issues.map((issue)=>`${issue.path.join(".")}: ${issue.message}`)}}
export function canDeliverProductionEmail(env:Environment){return env.APP_ENV==="production"&&env.EMAIL_DELIVERY_ENABLED==="true"&&env.EMAIL_PROVIDER!=="console"}
