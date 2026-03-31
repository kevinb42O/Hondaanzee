import type { VercelRequest, VercelResponse } from '@vercel/node';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from '../utils/supabasePublicConfig';

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/reports?select=id&limit=1`, {
      headers: {
        apikey: SUPABASE_PUBLISHABLE_KEY,
        Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      },
    });

    if (!response.ok) {
      return res.status(response.status).json({ ok: false });
    }

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ ok: false });
  }
}
