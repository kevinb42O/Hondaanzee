import { z } from 'zod';
import { getSupabaseAdmin, handleOptions, json } from '../_shared/http.ts';

Deno.serve(async req => {
  const options = handleOptions(req); if (options) return options;
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);
  const db = getSupabaseAdmin();
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '') || '';
  const { data: { user }, error: authError } = await db.auth.getUser(token);
  if (authError || !user) return json({ error: 'Log eerst in met je account.' }, 401);
  try {
    const raw = await req.text();
    if (raw.length > 1024) return json({ error: 'Het verzoek is te groot.' }, 413);
    const parsed = z.object({ action: z.literal('delete'), email: z.email().max(254), confirmation: z.literal('VERWIJDER') }).strict().safeParse(JSON.parse(raw));
    if (!parsed.success || parsed.data.email.toLowerCase() !== user.email?.toLowerCase()) return json({ error: 'Vul je e-mailadres en VERWIJDER in om je account te verwijderen.' }, 400);
    const adminEmail = (Deno.env.get('REPORT_ADMIN_EMAIL') || 'admin@hondaanzee.be').toLowerCase();
    if (user.email?.toLowerCase() === adminEmail) return json({ error: 'Een beheeraccount kan hier niet worden verwijderd.' }, 403);
    const { error } = await db.auth.admin.deleteUser(user.id);
    if (error) throw error;
    return json({ ok: true });
  } catch (error) {
    console.error('member-account failed', { type: error instanceof Error ? error.name : 'unknown' });
    return json({ error: 'Je account kon niet worden verwijderd. Probeer opnieuw.' }, 500);
  }
});
