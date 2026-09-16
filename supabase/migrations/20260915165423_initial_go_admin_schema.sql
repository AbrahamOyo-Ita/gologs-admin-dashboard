begin;

create extension if not exists pgcrypto with schema extensions;
create schema if not exists app_private;
revoke all on schema app_private from public, anon, authenticated;

create type public.article_status as enum ('draft','in_review','approved','scheduled','published','archived','rejected');
create type public.campaign_status as enum ('draft','in_review','approved','scheduled','preparing','sending','paused','sent','cancelled','failed');
create type public.subscriber_status as enum ('active','pending','unsubscribed','bounced','complained','suppressed');
create type public.job_status as enum ('pending','running','succeeded','failed','cancelled');

create table public.workspaces (
  id uuid primary key default gen_random_uuid(), name text not null check (char_length(name) between 2 and 120),
  slug text not null unique check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), timezone text not null default 'America/Los_Angeles',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade, display_name text not null check (char_length(display_name) between 1 and 120),
  avatar_path text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.memberships (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, status text not null default 'active' check(status in ('active','suspended')),
  last_accessed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(workspace_id,user_id)
);
create table public.permissions (id uuid primary key default gen_random_uuid(), capability text not null unique check(capability ~ '^[a-z_]+\.[a-z_]+$'), description text not null, created_at timestamptz not null default now());
create table public.roles (
  id uuid primary key default gen_random_uuid(), workspace_id uuid references public.workspaces(id) on delete cascade, key text not null,
  name text not null, is_system boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique nulls not distinct(workspace_id,key)
);
create table public.role_permissions (role_id uuid not null references public.roles(id) on delete cascade, permission_id uuid not null references public.permissions(id) on delete cascade, primary key(role_id,permission_id));
create table public.membership_roles (membership_id uuid not null references public.memberships(id) on delete cascade, role_id uuid not null references public.roles(id) on delete cascade, primary key(membership_id,role_id));
create table public.invitations (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, email_normalized text not null,
  token_hash text not null unique, invited_by uuid not null references auth.users(id), expires_at timestamptz not null, accepted_at timestamptz,
  created_at timestamptz not null default now(), check(expires_at>created_at)
);

create table public.categories (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, name text not null, slug text not null, created_at timestamptz not null default now(), unique(workspace_id,slug));
create table public.tags (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, name text not null, slug text not null, created_at timestamptz not null default now(), unique(workspace_id,slug));
create table public.media_assets (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, storage_path text not null,
  filename text not null, mime_type text not null, byte_size bigint not null check(byte_size>0), width integer, height integer, alt_text text,
  sha256 text not null, owner_id uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(workspace_id,sha256)
);
create table public.media_variants (id uuid primary key default gen_random_uuid(), asset_id uuid not null references public.media_assets(id) on delete cascade, storage_path text not null unique, width integer not null, height integer not null, format text not null, byte_size bigint not null check(byte_size>0), created_at timestamptz not null default now());
create table public.news_articles (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, slug text not null,
  title text not null check(char_length(title) between 1 and 180), excerpt text not null default '' check(char_length(excerpt)<=400), status public.article_status not null default 'draft',
  category_id uuid references public.categories(id) on delete set null, hero_asset_id uuid references public.media_assets(id) on delete restrict,
  author_id uuid not null references auth.users(id), version integer not null default 1 check(version>0), scheduled_at timestamptz, published_at timestamptz,
  canonical_url text, seo_title text check(char_length(seo_title)<=70), meta_description text check(char_length(meta_description)<=170),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), archived_at timestamptz, unique(workspace_id,slug)
);
create table public.news_revisions (
  id uuid primary key default gen_random_uuid(), article_id uuid not null references public.news_articles(id) on delete cascade, revision integer not null,
  title text not null, excerpt text not null, body jsonb not null check(jsonb_typeof(body)='object'), change_summary text, created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(), unique(article_id,revision)
);
create table public.article_tags (article_id uuid not null references public.news_articles(id) on delete cascade, tag_id uuid not null references public.tags(id) on delete cascade, primary key(article_id,tag_id));
create table public.redirects (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, from_path text not null, to_path text not null, created_at timestamptz not null default now(), unique(workspace_id,from_path));
create table public.media_usage (asset_id uuid not null references public.media_assets(id) on delete restrict, resource_type text not null, resource_id uuid not null, field_name text not null, created_at timestamptz not null default now(), primary key(asset_id,resource_type,resource_id,field_name));

create table public.newsletter_templates (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, name text not null, blocks jsonb not null check(jsonb_typeof(blocks)='array'), created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.campaigns (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, name text not null, subject text not null,
  preview_text text not null default '', status public.campaign_status not null default 'draft', template_id uuid references public.newsletter_templates(id) on delete set null,
  created_by uuid not null references auth.users(id), idempotency_key uuid not null default gen_random_uuid() unique, scheduled_at timestamptz, started_at timestamptz, completed_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.campaign_revisions (id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade, revision integer not null, blocks jsonb not null check(jsonb_typeof(blocks)='array'), plain_text text not null, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), unique(campaign_id,revision));
create table public.campaign_approvals (id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade, revision integer not null, reviewer_id uuid not null references auth.users(id), decision text not null check(decision in ('approved','rejected')), reason text, created_at timestamptz not null default now());

create table public.subscribers (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, email_normalized text not null,
  email_hash text not null, status public.subscriber_status not null default 'pending', source text not null, acquisition jsonb not null default '{}'::jsonb,
  confirmed_at timestamptz, unsubscribed_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(workspace_id,email_hash)
);
create table public.subscriber_tags (subscriber_id uuid not null references public.subscribers(id) on delete cascade, tag_id uuid not null references public.tags(id) on delete cascade, primary key(subscriber_id,tag_id));
create table public.consent_events (id uuid primary key default gen_random_uuid(), subscriber_id uuid not null references public.subscribers(id) on delete restrict, event_type text not null, policy_version text not null, source text not null, occurred_at timestamptz not null default now(), metadata jsonb not null default '{}'::jsonb);
create table public.suppressions (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, email_hash text not null, reason text not null, created_at timestamptz not null default now(), created_by uuid references auth.users(id), unique(workspace_id,email_hash));
create table public.segments (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, name text not null, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.segment_rules (id uuid primary key default gen_random_uuid(), segment_id uuid not null references public.segments(id) on delete cascade, version integer not null, rules jsonb not null check(jsonb_typeof(rules)='object'), created_at timestamptz not null default now(), unique(segment_id,version));
create table public.campaign_recipients (id uuid primary key default gen_random_uuid(), campaign_id uuid not null references public.campaigns(id) on delete cascade, subscriber_id uuid not null references public.subscribers(id) on delete restrict, status text not null default 'pending', provider_message_id text, created_at timestamptz not null default now(), unique(campaign_id,subscriber_id));
create table public.deliveries (id uuid primary key default gen_random_uuid(), recipient_id uuid not null references public.campaign_recipients(id) on delete cascade, event_type text not null, provider_event_id text not null unique, occurred_at timestamptz not null, received_at timestamptz not null default now());
create table public.link_events (id uuid primary key default gen_random_uuid(), recipient_id uuid not null references public.campaign_recipients(id) on delete cascade, url text not null, occurred_at timestamptz not null, provider_event_id text not null unique);
create table public.provider_events (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, provider text not null, provider_event_id text not null, event_type text not null, payload jsonb not null, signature_verified boolean not null, received_at timestamptz not null default now(), processed_at timestamptz, unique(provider,provider_event_id));

create table public.analytics_events (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, event_name text not null, schema_version integer not null, occurred_at timestamptz not null, anonymous_id_hash text, session_id uuid, properties jsonb not null default '{}'::jsonb, consent_state text not null);
create table public.daily_aggregates (workspace_id uuid not null references public.workspaces(id) on delete cascade, day date not null, metric text not null, dimensions jsonb not null default '{}'::jsonb, value numeric not null, calculated_at timestamptz not null default now(), primary key(workspace_id,day,metric,dimensions));
create table public.annotations (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, occurred_on date not null, title text not null, description text, created_by uuid not null references auth.users(id), created_at timestamptz not null default now());
create table public.saved_reports (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, name text not null, definition jsonb not null, owner_id uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());

create table public.audit_events (
  id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete restrict, actor_id uuid references auth.users(id) on delete set null,
  impersonator_id uuid references auth.users(id) on delete set null, action text not null, resource_type text not null, resource_id uuid,
  request_id uuid not null, session_id uuid, ip_metadata jsonb not null default '{}'::jsonb, user_agent text, result text not null, reason text,
  risk_level text not null default 'normal' check(risk_level in ('normal','elevated','high')), changes jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(), previous_hash text, event_hash text not null
);
create table public.security_events (id uuid primary key default gen_random_uuid(), workspace_id uuid references public.workspaces(id) on delete restrict, actor_id uuid references auth.users(id) on delete set null, event_type text not null, risk_level text not null, metadata jsonb not null default '{}'::jsonb, occurred_at timestamptz not null default now());
create table public.integrations (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, provider text not null, status text not null, encrypted_config bytea, created_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(workspace_id,provider));
create table public.webhook_endpoints (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, provider text not null, path_token_hash text not null unique, signing_secret_ciphertext bytea not null, enabled boolean not null default true, created_at timestamptz not null default now());
create table public.webhook_deliveries (id uuid primary key default gen_random_uuid(), endpoint_id uuid not null references public.webhook_endpoints(id) on delete cascade, provider_event_id text not null, signature_verified boolean not null, status text not null, attempts integer not null default 0, next_retry_at timestamptz, last_error text, received_at timestamptz not null default now(), unique(endpoint_id,provider_event_id));
create table public.background_jobs (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, job_type text not null, idempotency_key text not null, status public.job_status not null default 'pending', payload jsonb not null default '{}'::jsonb, attempts integer not null default 0, max_attempts integer not null default 5, run_at timestamptz not null default now(), locked_at timestamptz, last_error text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(workspace_id,job_type,idempotency_key));
create table public.notifications (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, user_id uuid not null references auth.users(id) on delete cascade, type text not null, title text not null, body text not null, read_at timestamptz, created_at timestamptz not null default now());
create table public.feature_flags (id uuid primary key default gen_random_uuid(), workspace_id uuid not null references public.workspaces(id) on delete cascade, key text not null, enabled boolean not null default false, targeting jsonb not null default '{}'::jsonb, updated_by uuid not null references auth.users(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(workspace_id,key));
create table public.organization_settings (workspace_id uuid primary key references public.workspaces(id) on delete cascade, settings jsonb not null default '{}'::jsonb, updated_by uuid not null references auth.users(id), updated_at timestamptz not null default now());

create index memberships_user_active_idx on public.memberships(user_id,workspace_id) where status='active';
create index news_articles_publication_idx on public.news_articles(workspace_id,status,published_at desc);
create index news_articles_author_idx on public.news_articles(workspace_id,author_id,updated_at desc);
create index campaigns_status_schedule_idx on public.campaigns(workspace_id,status,scheduled_at);
create index subscribers_status_created_idx on public.subscribers(workspace_id,status,created_at desc);
create index analytics_events_workspace_time_idx on public.analytics_events(workspace_id,occurred_at desc);
create index audit_events_workspace_time_idx on public.audit_events(workspace_id,occurred_at desc);
create index audit_events_resource_idx on public.audit_events(workspace_id,resource_type,resource_id,occurred_at desc);
create index jobs_claim_idx on public.background_jobs(status,run_at) where status in ('pending','failed');

create function app_private.has_capability(target_workspace uuid,target_capability text) returns boolean language sql stable security definer set search_path='' as $$
  select exists(select 1 from public.memberships m join public.membership_roles mr on mr.membership_id=m.id join public.role_permissions rp on rp.role_id=mr.role_id join public.permissions p on p.id=rp.permission_id where m.workspace_id=target_workspace and m.user_id=(select auth.uid()) and m.status='active' and p.capability=target_capability);
$$;
revoke all on function app_private.has_capability(uuid,text) from public; grant execute on function app_private.has_capability(uuid,text) to authenticated;

create function app_private.prepare_audit_hash() returns trigger language plpgsql security definer set search_path='' as $$
declare prior text; begin
  perform pg_advisory_xact_lock(hashtextextended(new.workspace_id::text,0));
  select event_hash into prior from public.audit_events where workspace_id=new.workspace_id order by occurred_at desc,id desc limit 1;
  new.previous_hash:=prior;
  new.event_hash:=encode(extensions.digest(coalesce(prior,'')||new.id::text||new.workspace_id::text||new.action||new.resource_type||new.occurred_at::text||new.changes::text,'sha256'),'hex');
  return new;
end $$;
revoke all on function app_private.prepare_audit_hash() from public,anon,authenticated;
create trigger audit_hash_before_insert before insert on public.audit_events for each row execute function app_private.prepare_audit_hash();
create function app_private.block_audit_mutation() returns trigger language plpgsql set search_path='' as $$ begin raise exception 'audit events are append-only' using errcode='42501'; end $$;
revoke all on function app_private.block_audit_mutation() from public,anon,authenticated;
create trigger audit_immutable before update or delete or truncate on public.audit_events for each statement execute function app_private.block_audit_mutation();

do $$ declare item record; begin for item in select schemaname,tablename from pg_tables where schemaname='public' loop execute format('alter table %I.%I enable row level security',item.schemaname,item.tablename); execute format('revoke all on table %I.%I from anon, authenticated',item.schemaname,item.tablename); end loop; end $$;
grant select on public.news_articles,public.news_revisions,public.categories,public.tags,public.article_tags to anon;
create policy published_articles_public_read on public.news_articles for select to anon using(status='published' and published_at<=now());
create policy published_revisions_public_read on public.news_revisions for select to anon using(exists(select 1 from public.news_articles a where a.id=article_id and a.status='published' and a.published_at<=now()));
create policy categories_public_read on public.categories for select to anon using(exists(select 1 from public.news_articles a where a.category_id=id and a.status='published' and a.published_at<=now()));
create policy tags_public_read on public.tags for select to anon using(exists(select 1 from public.article_tags at join public.news_articles a on a.id=at.article_id where at.tag_id=id and a.status='published' and a.published_at<=now()));
create policy article_tags_public_read on public.article_tags for select to anon using(exists(select 1 from public.news_articles a where a.id=article_id and a.status='published' and a.published_at<=now()));

grant select,insert,update on public.news_articles,public.news_revisions,public.article_tags to authenticated;
create policy news_member_read on public.news_articles for select to authenticated using(app_private.has_capability(workspace_id,'news.create') or app_private.has_capability(workspace_id,'news.publish'));
create policy news_create on public.news_articles for insert to authenticated with check(app_private.has_capability(workspace_id,'news.create') and author_id=(select auth.uid()) and status='draft');
create policy news_edit on public.news_articles for update to authenticated using(app_private.has_capability(workspace_id,'news.create')) with check(app_private.has_capability(workspace_id,'news.create') and (status not in ('published') or app_private.has_capability(workspace_id,'news.publish')));

grant select on public.audit_events to authenticated;
create policy audit_authorized_read on public.audit_events for select to authenticated using(app_private.has_capability(workspace_id,'audit.read'));
grant select on public.memberships,public.roles,public.permissions,public.role_permissions,public.membership_roles to authenticated;
create policy membership_self_or_manager on public.memberships for select to authenticated using(user_id=(select auth.uid()) or app_private.has_capability(workspace_id,'member.manage'));
create policy roles_workspace_read on public.roles for select to authenticated using(workspace_id is null or app_private.has_capability(workspace_id,'member.manage'));

commit;
