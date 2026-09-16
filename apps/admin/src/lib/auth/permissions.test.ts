import {describe,expect,it} from "vitest";
import {assertCapability,hasCapability,PermissionDeniedError} from "./permissions";
describe("permission policy",()=>{
  it("denies a VA high-risk capabilities",()=>{for(const capability of ["news.publish","campaign.send","subscriber.export","member.invite"] as const)expect(hasCapability(["virtual_assistant"],capability)).toBe(false)});
  it("allows publisher approval authority",()=>{expect(hasCapability(["publisher"],"news.publish")).toBe(true);expect(hasCapability(["publisher"],"campaign.send")).toBe(true)});
  it("fails closed",()=>{expect(()=>assertCapability(["analyst"],"subscriber.export")).toThrow(PermissionDeniedError)});
});
