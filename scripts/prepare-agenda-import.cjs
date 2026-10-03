const { EVENT_DEFAULTS } = require('./place-data.cjs').loadTsModule('data/eventDefaults.ts');
const literal = value => `'${String(value).replaceAll("'", "''")}'`;
function agendaImportSql(events = EVENT_DEFAULTS) {
 return events.map(event => `do $import$ declare e uuid;r uuid;existing jsonb; begin
 select id into e from public.content_events where slug=${literal(event.slug)};
 if e is null then
 insert into public.content_events(legacy_id,slug)values(${event.id},${literal(event.slug)})returning id into e;
 insert into public.content_event_revisions(event_id,revision_number,content,source)values(e,1,${literal(JSON.stringify(event))}::jsonb,'legacy_import')returning id into r;
 update public.content_events set draft_revision_id=r,published_revision_id=r where id=e;
 else
 select content into existing from public.content_event_revisions where id=(select published_revision_id from public.content_events where id=e);
 if existing is distinct from ${literal(JSON.stringify(event))}::jsonb then raise exception 'AGENDA_IMPORT_DIVERGED';end if;
 end if;
 insert into public.analytics_event_coverage(event_slug,started_at)values(${literal(event.slug)},now())on conflict do nothing;
 end $import$;`).join('\n');
}
module.exports = { agendaImportSql };
if(require.main===module)process.stdout.write(agendaImportSql());
