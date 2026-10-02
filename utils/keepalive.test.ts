import { createServer, get } from 'node:http';
import { once } from 'node:events';
import { afterEach, describe, expect, it, vi } from 'vitest';
import handler from '../api/keepalive.ts';

afterEach(() => vi.unstubAllGlobals());

async function request() {
  const server = createServer((req, res) => void handler(req, res));
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('Missing test server address');
  try {
    return await new Promise<{ status: number; type: string | undefined; body: unknown }>((resolve, reject) => {
      get(`http://127.0.0.1:${address.port}`, response => {
        let raw = '';
        response.setEncoding('utf8');
        response.on('data', chunk => { raw += chunk; });
        response.on('error', reject);
        response.on('end', () => {
          try { resolve({ status: response.statusCode!, type: response.headers['content-type'], body: JSON.parse(raw) }); }
          catch (error) { reject(error); }
        });
      }).on('error', reject);
    });
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
}

describe('keepalive HTTP endpoint', () => {
  it('returns a JSON success over a real Node HTTP response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('[]', { status: 200 })));
    expect(await request()).toEqual({ status: 200, type: 'application/json; charset=utf-8', body: { ok: true } });
  });
  it('preserves the upstream failure status without leaking its body', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('Private upstream details', { status: 503 })));
    expect(await request()).toMatchObject({ status: 503, body: { ok: false } });
  });
  it('returns a JSON failure when the upstream request throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network unavailable')));
    expect(await request()).toMatchObject({ status: 500, body: { ok: false } });
  });
});
