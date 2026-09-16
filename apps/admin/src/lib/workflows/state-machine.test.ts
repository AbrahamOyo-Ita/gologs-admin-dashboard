import {describe,expect,it} from "vitest";
import {canTransitionArticle,canTransitionCampaign} from "./state-machine";
describe("editorial workflow",()=>{it("requires approval",()=>{expect(canTransitionArticle("draft","published")).toBe(false);expect(canTransitionArticle("approved","published")).toBe(true)})});
describe("campaign workflow",()=>{
  it("does not restart sent campaigns",()=>expect(canTransitionCampaign("sent","sending")).toBe(false));
  it("supports pause and resume",()=>{expect(canTransitionCampaign("sending","paused")).toBe(true);expect(canTransitionCampaign("paused","sending")).toBe(true)});
});
