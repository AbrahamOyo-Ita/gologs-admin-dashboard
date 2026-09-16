-- Run once for the first production operator after creating the Auth user.
do $bootstrap$
declare
  uid uuid;
  wid uuid;
  rid uuid;
  cap text;
  caps text[] := array['analytics.read','audit.read','audit.export','campaign.create','campaign.review','campaign.send','content.settings','feature_flags.manage','integration.manage','jobs.read','media.create','media.delete','member.invite','member.manage','news.create','news.review','news.publish','subscriber.read','subscriber.manage','subscriber.export','system.read'];
begin
  select id into uid from auth.users where lower(email)=lower('oyoitaabraham@gmail.com') limit 1;
  select id into wid from public.workspaces where slug='go-operations' limit 1;
  if uid is null or wid is null then raise exception 'Auth user or workspace missing'; end if;
  insert into public.profiles(id,display_name) values(uid,'Oyoita Abraham') on conflict(id) do update set display_name=excluded.display_name,updated_at=now();
  foreach cap in array caps loop
    insert into public.permissions(capability,description) values(cap,'GO Admin capability: '||cap) on conflict(capability) do nothing;
  end loop;
  insert into public.roles(workspace_id,key,name,is_system) values(wid,'super_admin','Super admin',true) on conflict (workspace_id,key) do update set name=excluded.name returning id into rid;
  insert into public.role_permissions(role_id,permission_id) select rid,id from public.permissions on conflict do nothing;
  insert into public.memberships(workspace_id,user_id,status,last_accessed_at) values(wid,uid,'active',now()) on conflict(workspace_id,user_id) do update set status='active',last_accessed_at=now(),updated_at=now();
  insert into public.membership_roles(membership_id,role_id) select m.id,rid from public.memberships m where m.workspace_id=wid and m.user_id=uid on conflict do nothing;
end $bootstrap$;
