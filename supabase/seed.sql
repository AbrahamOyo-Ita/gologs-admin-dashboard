-- NONPRODUCTION FIXTURE DATA. Never apply this seed to a production project.
insert into public.workspaces(id,name,slug,timezone) values ('00000000-0000-4000-8000-000000000001','GO Demo Workspace','go-demo','America/Los_Angeles') on conflict do nothing;

insert into public.permissions(capability,description) values
('analytics.read','Read privacy-safe analytics'),('audit.read','Read audit events'),('audit.export','Export audit events'),
('campaign.create','Create and edit campaign drafts'),('campaign.review','Review campaign drafts'),('campaign.send','Schedule and send approved campaigns'),
('content.settings','Manage structured landing content'),('feature_flags.manage','Manage feature flags'),('integration.manage','Manage provider credentials'),
('jobs.read','Read background job status'),('media.create','Upload media'),('media.delete','Delete unused media'),('member.invite','Invite members'),
('member.manage','Manage memberships and roles'),('news.create','Create and edit news drafts'),('news.review','Submit and review news'),
('news.publish','Publish approved news'),('subscriber.read','Read masked subscriber data'),('subscriber.manage','Manage subscriber lifecycle'),
('subscriber.export','Export subscribers'),('system.read','Read system health') on conflict(capability) do nothing;

insert into public.roles(id,workspace_id,key,name,is_system) values
('10000000-0000-4000-8000-000000000001',null,'super_admin','Super admin',true),
('10000000-0000-4000-8000-000000000002',null,'admin','Admin',true),
('10000000-0000-4000-8000-000000000003',null,'publisher','Publisher',true),
('10000000-0000-4000-8000-000000000004',null,'content_editor','Content editor',true),
('10000000-0000-4000-8000-000000000005',null,'marketing_manager','Marketing manager',true),
('10000000-0000-4000-8000-000000000006',null,'virtual_assistant','Virtual assistant',true),
('10000000-0000-4000-8000-000000000007',null,'analyst','Analyst',true),
('10000000-0000-4000-8000-000000000008',null,'support_agent','Support agent',true),
('10000000-0000-4000-8000-000000000009',null,'auditor','Auditor',true) on conflict do nothing;

insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r cross join public.permissions p where r.key='super_admin' on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.capability=any(array['campaign.create','media.create','news.create','news.review','subscriber.read']) where r.key='virtual_assistant' on conflict do nothing;
insert into public.role_permissions(role_id,permission_id)
select r.id,p.id from public.roles r join public.permissions p on p.capability=any(array['analytics.read','campaign.create','campaign.review','campaign.send','media.create','news.create','news.review','news.publish','subscriber.read']) where r.key='publisher' on conflict do nothing;
