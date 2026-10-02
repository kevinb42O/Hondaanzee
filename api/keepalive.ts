import type { IncomingMessage, ServerResponse } from 'node:http';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../utils/supabasePublicConfig';

export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  const send = (status: number, ok: boolean) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.end(JSON.stringify({ ok }));
  };
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
    });

    if (!response.ok) {
      return send(response.status, false);
    }

    return send(200, true);
  } catch {
    return send(500, false);
  }
}
