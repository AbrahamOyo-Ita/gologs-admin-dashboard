alter table public.invitations add column role_key text not null default 'virtual_assistant';
alter table public.invitations add constraint invitations_role_key_check check (role_key in ('super_admin','admin','publisher','content_editor','marketing_manager','virtual_assistant','analyst','support_agent','auditor'));
create index invitations_workspace_role_idx on public.invitations(workspace_id,role_key);
