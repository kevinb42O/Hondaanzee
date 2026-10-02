const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { HOTSPOTS, SERVICES } = require('./place-data.cjs');

// This script only prepares SQL. It never connects to Supabase or uploads media.
// A repeat import inserts missing identities only; it never replaces drafts.
const prepareAdminImport = (hotspots, services) => {
  const rows = [
    ...hotspots.map(content => ({ kind: 'hotspot', content })),
    ...services.map(content => ({ kind: 'service', content })),
  ];
  const payload = JSON.stringify(rows);
  const sha256 = crypto.createHash('sha256').update(payload).digest('hex');
  // Ordinary SQL literals, with quotes doubled. No executable interpolation.
  const literal = `'${payload.replaceAll("'", "''")}'`;
  const delimiter = `$haz_seed_${sha256}$`;
  if (payload.includes(delimiter)) throw new Error('Unsafe SQL delimiter.');
  const sql = `-- Exact legacy catalog import; SHA-256 ${sha256}
-- Does not modify existing identities/revisions, image URLs or Storage.
begin;
set local standard_conforming_strings = on;
do ${delimiter}
declare
  v_row jsonb;
  v_place_id uuid;
  v_revision_id uuid;
begin
  for v_row in select value from jsonb_array_elements(${literal}::jsonb) loop
    v_place_id := null;
    insert into public.content_places(kind, legacy_id, slug, city_slug)
      values (v_row->>'kind', (v_row->'content'->>'id')::bigint,
        v_row->'content'->>'slug', v_row->'content'->>'city')
      on conflict (kind, legacy_id) do nothing returning id into v_place_id;
    if v_place_id is not null then
      insert into public.content_place_revisions(place_id, revision_number, content, source)
        values (v_place_id, 1, v_row->'content', 'legacy_import')
        returning id into v_revision_id;
      update public.content_places set draft_revision_id = v_revision_id,
        published_revision_id = v_revision_id where id = v_place_id;
    end if;
  end loop;
end;
${delimiter};
commit;
`;
  return { rows, sha256, sql };
};

if (require.main === module) {
  const { rows, sha256, sql } = prepareAdminImport(HOTSPOTS, SERVICES);
  const outputIndex = process.argv.indexOf('--output');
  if (outputIndex !== -1) {
    const target = process.argv[outputIndex + 1];
    if (!target || target.startsWith('--')) throw new Error('Provide an output filename.');
    fs.writeFileSync(path.resolve(target), sql, { flag: 'wx', mode: 0o600 });
  }
  console.log(JSON.stringify({ places: rows.length, hotspots: HOTSPOTS.length,
    services: SERVICES.length, sha256, written: outputIndex !== -1 }));
}

module.exports = { prepareAdminImport };
