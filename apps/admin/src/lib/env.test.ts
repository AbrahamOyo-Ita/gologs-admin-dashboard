import {describe,expect,it,vi} from "vitest";
import {readEnvironment} from "./env";

describe("environment validation",()=>{
  it("rejects copied Supabase placeholders instead of calling a fake host",()=>{
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL","https://your-project.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY","sb_publishable_replace_me");
    vi.stubEnv("ADMIN_ORIGIN","http://localhost:3000");
    vi.stubEnv("APP_ENV","development");
    expect(readEnvironment().configured).toBe(false);
    vi.unstubAllEnvs();
  });
});
