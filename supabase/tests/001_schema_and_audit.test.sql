begin;
select plan(5);
select has_table('public','workspaces','workspaces exists');
select has_table('public','audit_events','audit_events exists');
select col_is_pk('public','audit_events','id','audit event ids are primary keys');
select policies_are('public','news_articles',array['news_create','news_edit','news_member_read','published_articles_public_read'],'article policies are explicit');
select throws_ok($$update public.audit_events set action='tampered'$$,'42501','audit events are append-only','audit updates are rejected');
select * from finish();
rollback;
