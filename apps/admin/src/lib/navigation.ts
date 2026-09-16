import { BarChart3, BookOpenText, FileText, HeartPulse, Images, LayoutDashboard, Mail, ScrollText, Settings, Users, UsersRound } from "lucide-react";

export const navigation = [
  {href:"/",label:"Overview",icon:LayoutDashboard}, {href:"/analytics",label:"Analytics",icon:BarChart3},
  {href:"/content",label:"Content",icon:BookOpenText}, {href:"/news",label:"News",icon:FileText},
  {href:"/newsletters",label:"Newsletters",icon:Mail}, {href:"/subscribers",label:"Subscribers",icon:Users},
  {href:"/media",label:"Media library",icon:Images}, {href:"/team",label:"Team & access",icon:UsersRound},
  {href:"/audit",label:"Audit trail",icon:ScrollText},
  {href:"/health",label:"System health",icon:HeartPulse}, {href:"/settings",label:"Settings",icon:Settings},
] as const;

export const moduleDetails = {
  analytics:{title:"Analytics",description:"Understand acquisition, engagement, and conversion with consent-aware data.",action:"Create report",noun:"reports",columns:["Report","Range","Freshness","Owner"]},
  content:{title:"Landing content",description:"Manage approved navigation, contact details, announcements, and feature flags.",action:"Create announcement",noun:"content changes",columns:["Content","Environment","Status","Updated"]},
  news:{title:"News",description:"Draft, review, schedule, and publish stories through a controlled editorial workflow.",action:"New article",noun:"articles",columns:["Article","Status","Author","Publish date"]},
  newsletters:{title:"Newsletters",description:"Prepare campaigns, segment audiences, collect approvals, and monitor delivery.",action:"New campaign",noun:"campaigns",columns:["Campaign","Status","Audience","Schedule"]},
  subscribers:{title:"Subscribers",description:"Support consent, suppression, acquisition, and subscriber lifecycle operations.",action:"Import subscribers",noun:"subscribers",columns:["Subscriber","Status","Source","Consent"]},
  media:{title:"Media library",description:"Upload optimized, accessible assets and understand where each file is used.",action:"Upload media",noun:"assets",columns:["Asset","Type","Usage","Owner"]},
  team:{title:"Team & access",description:"Invite members, assign least-privilege roles, and review privileged access.",action:"Invite member",noun:"members",columns:["Member","Role","Access","Last active"]},
  audit:{title:"Audit trail",description:"Review append-only administrative and security events across the workspace.",action:"Export events",noun:"audit events",columns:["Event","Actor","Result","Time"]},
  health:{title:"System health",description:"Monitor jobs, queues, providers, storage, and data-pipeline freshness.",action:"Refresh checks",noun:"health checks",columns:["Service","Status","Last checked","Detail"]},
  settings:{title:"Settings",description:"Control workspace policy, publishing defaults, retention, and security posture.",action:"Save changes",noun:"settings",columns:["Setting","Value","Policy","Updated"]},
} as const;
export type ModuleKey=keyof typeof moduleDetails;
