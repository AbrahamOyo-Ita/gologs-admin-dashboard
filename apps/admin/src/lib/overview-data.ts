import {createSupabaseServerClient} from "@/lib/supabase/server";
import {readEnvironment} from "@/lib/env";
import {isDemoMode} from "@/lib/demo-mode";

export type OverviewMetricKey = "landing_visitors" | "newsletter_confirmed" | "news_published" | "app_download_clicks" | "gowash_interest" | "gocarry_interest" | "delivery_rate" | "failed_jobs";
export type OverviewMetric = {key:OverviewMetricKey;label:string;definition:string;value:number|null;unit:"count"|"percent"};
export type OverviewData = {status:"ready"|"empty"|"unconfigured"|"unauthenticated"|"unavailable";refreshedAt:string|null;metrics:OverviewMetric[];trafficSeries:(number|null)[];conversionSeries:(number|null)[];serviceMix:{label:string;value:number}[];timezone:string};

const metricDefinitions:Record<OverviewMetricKey,Omit<OverviewMetric,"value">>={
  landing_visitors:{key:"landing_visitors",label:"GO landing visits",definition:"Consent-eligible unique visitors to the GO landing page",unit:"count"},
  newsletter_confirmed:{key:"newsletter_confirmed",label:"GO newsletter joins",definition:"Confirmed GO newsletter subscriptions",unit:"count"},
  news_published:{key:"news_published",label:"GO stories published",definition:"GO news stories first published in the selected window",unit:"count"},
  app_download_clicks:{key:"app_download_clicks",label:"GO app download taps",definition:"Clicks on verified GO app download destinations",unit:"count"},
  gowash_interest:{key:"gowash_interest",label:"GoWash interest",definition:"GO landing CTA clicks for the GoWash service",unit:"count"},
  gocarry_interest:{key:"gocarry_interest",label:"GoCarry interest",definition:"GO landing CTA clicks for the GoCarry service",unit:"count"},
  delivery_rate:{key:"delivery_rate",label:"GO delivery rate",definition:"Delivered newsletter messages divided by accepted sends",unit:"percent"},
  failed_jobs:{key:"failed_jobs",label:"GO failed jobs",definition:"Background jobs awaiting operator action",unit:"count"},
};

function emptyData(status:OverviewData["status"]):OverviewData{return{status,refreshedAt:null,metrics:Object.values(metricDefinitions).map((definition)=>({...definition,value:null})),trafficSeries:Array(8).fill(null),conversionSeries:Array(8).fill(null),serviceMix:[],timezone:"America/Los_Angeles"}}

function demoData():OverviewData{
  const values:Record<OverviewMetricKey,number>={landing_visitors:18420,newsletter_confirmed:1268,news_published:24,app_download_clicks:3910,gowash_interest:2840,gocarry_interest:2175,delivery_rate:97.8,failed_jobs:3};
  return{status:"ready",refreshedAt:new Date().toISOString(),metrics:Object.values(metricDefinitions).map((definition)=>({...definition,value:values[definition.key]})),trafficSeries:[1280,1640,1920,2380,2710,2940,3210,3340],conversionSeries:[82,104,126,151,177,194,211,223],serviceMix:[{label:"GoWash",value:2840},{label:"GoCarry",value:2175},{label:"GO app",value:3910}],timezone:"America/Los_Angeles"};
}

export async function getOverviewData():Promise<OverviewData>{
  if(isDemoMode())return demoData();
  if(!readEnvironment().configured)return emptyData("unconfigured");
  try{
    const supabase=await createSupabaseServerClient();
    const {data:{user}}=await supabase.auth.getUser();
    if(!user)return emptyData("unauthenticated");
    const {data:membership,error:membershipError}=await supabase.from("memberships").select("workspace_id, workspaces(timezone)").eq("user_id",user.id).eq("status","active").limit(1).maybeSingle();
    if(membershipError||!membership)return emptyData("unavailable");
    const workspaceId=String(membership.workspace_id); const workspace=(membership.workspaces as {timezone?:string}|null); const timezone=workspace?.timezone??"America/Los_Angeles";
    const start=new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10);
    const {data:rows,error}=await supabase.from("daily_aggregates").select("day,metric,value,dimensions,calculated_at").eq("workspace_id",workspaceId).gte("day",start).order("day",{ascending:true});
    if(error)return emptyData("unavailable");
    const typedRows=(rows??[]) as {day:string;metric:string;value:number|string;dimensions:Record<string,unknown>;calculated_at:string}[];
    const values=new Map<string,number>(); const calculated=typedRows.map((row)=>row.calculated_at).sort().at(-1)??null;
    for(const row of typedRows){if(!row.dimensions||Object.keys(row.dimensions).length===0)values.set(row.metric,(values.get(row.metric)??0)+Number(row.value))}
    const keyToMetric:Record<OverviewMetricKey,string>={landing_visitors:"go_landing_visitors",newsletter_confirmed:"go_newsletter_confirmed",news_published:"go_news_published",app_download_clicks:"go_app_download_clicks",gowash_interest:"go_gowash_interest",gocarry_interest:"go_gocarry_interest",delivery_rate:"go_delivery_rate",failed_jobs:"go_failed_jobs"};
    const metrics=Object.values(metricDefinitions).map((definition)=>({...definition,value:values.has(keyToMetric[definition.key])?values.get(keyToMetric[definition.key])??null:null}));
    const dayMap=new Map<string,number>(); for(const row of typedRows){if(row.metric==="go_landing_visitors"&&(!row.dimensions||Object.keys(row.dimensions).length===0))dayMap.set(row.day,(dayMap.get(row.day)??0)+Number(row.value))}
    const conversionMap=new Map<string,number>(); for(const row of typedRows){if(row.metric==="go_newsletter_confirmed"&&(!row.dimensions||Object.keys(row.dimensions).length===0))conversionMap.set(row.day,(conversionMap.get(row.day)??0)+Number(row.value))}
    const days=Array.from(new Set(typedRows.map((row)=>row.day))).slice(-8); const trafficSeries=days.map((day)=>dayMap.get(day)??null); const conversionSeries=days.map((day)=>conversionMap.get(day)??null);
    const serviceMix=[{label:"GoWash",value:values.get("go_gowash_interest")??0},{label:"GoCarry",value:values.get("go_gocarry_interest")??0},{label:"GO app",value:values.get("go_app_download_clicks")??0}].filter((item)=>item.value>0);
    return {...emptyData(typedRows.length?"ready":"empty"),status:typedRows.length?"ready":"empty",refreshedAt:calculated,metrics,trafficSeries,conversionSeries,serviceMix,timezone};
  }catch{return emptyData("unavailable")}
}
