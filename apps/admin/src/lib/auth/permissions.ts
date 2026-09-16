export const capabilities=["analytics.read","audit.read","audit.export","campaign.create","campaign.review","campaign.send","content.settings","feature_flags.manage","integration.manage","jobs.read","media.create","media.delete","member.invite","member.manage","news.create","news.review","news.publish","subscriber.read","subscriber.manage","subscriber.export","system.read"] as const;
export type Capability=(typeof capabilities)[number];
const all=new Set<Capability>(capabilities);
export const roleCapabilities={
  super_admin:all, admin:new Set<Capability>(capabilities.filter((value)=>value!=="integration.manage")),
  publisher:new Set<Capability>(["analytics.read","campaign.create","campaign.review","campaign.send","media.create","news.create","news.review","news.publish","subscriber.read"]),
  content_editor:new Set<Capability>(["media.create","news.create","news.review"]), marketing_manager:new Set<Capability>(["analytics.read","campaign.create","campaign.review","campaign.send","media.create","subscriber.read","subscriber.manage"]),
  virtual_assistant:new Set<Capability>(["campaign.create","media.create","news.create","news.review","subscriber.read"]), analyst:new Set<Capability>(["analytics.read","jobs.read","system.read"]),
  support_agent:new Set<Capability>(["subscriber.read","subscriber.manage"]), auditor:new Set<Capability>(["audit.read","system.read"]),
} as const;
export type BuiltInRole=keyof typeof roleCapabilities;
export function hasCapability(roles:readonly BuiltInRole[],capability:Capability){return roles.some((role)=>roleCapabilities[role].has(capability))}
export function assertCapability(roles:readonly BuiltInRole[],capability:Capability):void{if(!hasCapability(roles,capability))throw new PermissionDeniedError(capability)}
export class PermissionDeniedError extends Error{constructor(public readonly capability:Capability){super(`Permission required: ${capability}`);this.name="PermissionDeniedError"}}
