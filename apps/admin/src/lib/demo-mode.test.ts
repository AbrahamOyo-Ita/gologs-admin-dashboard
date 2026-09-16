import {afterEach,describe,expect,it,vi} from "vitest";
import {DEMO_MODE_AUTO_EXPIRES_AT,isDemoMode} from "./demo-mode";

afterEach(()=>vi.unstubAllEnvs());

describe("demo mode",()=>{
  it("opens automatically before the demo deadline",()=>{expect(isDemoMode(Date.parse(DEMO_MODE_AUTO_EXPIRES_AT)-1)).toBe(true)});
  it("closes automatically after the demo deadline",()=>{expect(isDemoMode(Date.parse(DEMO_MODE_AUTO_EXPIRES_AT))).toBe(false)});
  it("can be disabled immediately",()=>{vi.stubEnv("DEMO_MODE","false");expect(isDemoMode(0)).toBe(false)});
});
