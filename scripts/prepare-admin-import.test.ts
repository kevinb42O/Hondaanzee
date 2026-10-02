import { describe, expect, it } from 'vitest';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { prepareAdminImport } = require('./prepare-admin-import.cjs');
const { HOTSPOTS, SERVICES } = require('./place-data.cjs');

describe('legacy catalog import', () => {
  it('keeps every complete source object and its ordered image references', () => {
    const { rows } = prepareAdminImport(HOTSPOTS, SERVICES);
    expect(rows).toHaveLength(157);
    for (const [kind, source] of [['hotspot', HOTSPOTS], ['service', SERVICES]]) {
      const imported = rows.filter(row => row.kind === kind).map(row => row.content);
      expect(JSON.stringify(imported)).toBe(JSON.stringify(source));
    }
  });

  it('quotes SQL content safely without dollar delimiters colliding with text', () => {
    const hostileText = "Owner's photo \\ path $$; DROP TABLE public.reports; --";
    const { sql, sha256 } = prepareAdminImport([{ ...HOTSPOTS[0], description: hostileText }], []);
    const literal = sql.match(/jsonb_array_elements\('((?:[^']|'')*)'::jsonb\)/)?.[1];
    expect(literal).toBeDefined();
    expect(JSON.parse(literal!.replaceAll("''", "'"))[0].content.description).toBe(hostileText);
    expect(sql).toContain(`do $haz_seed_${sha256}$`);
    expect(sql).toContain('set local standard_conforming_strings = on;');
  });

});
