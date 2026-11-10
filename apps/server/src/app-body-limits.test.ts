import { IncomingMessage, ServerResponse } from 'node:http';
import type { Socket } from 'node:net';
import { Duplex } from 'node:stream';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from './app';
import { loadConfig } from './config';
import type { ServerContext } from './context';

// Isolate HTTP parsing from model services, generated code, and device execution.
vi.mock('./agent/routes', async () => {
  const { Router } = await import('express');
  return { agentRouter: () => Router() };
});
vi.mock('./agent/libraryRoutes', async () => {
  const { Router } = await import('express');
  return { libraryRouter: () => Router() };
});
vi.mock('./buddy', async () => {
  const { Router } = await import('express');
  return { buddyRouter: () => Router() };
});
vi.mock('./gen3d', async () => {
  const { Router } = await import('express');
  return { gen3dRouter: () => Router(), skinsRouter: () => Router() };
});

function post(path: string, body: string): Promise<{ status: number; body: Record<string, unknown> }> {
  const config = loadConfig({ HTTP_PORT: '8787', HTTPS_PORT: '0', MODEL_MODE: 'fixture' });
  const ctx = {
    config,
    bound: {},
    isLocal: () => false,
    registry: { authenticate: () => undefined },
    pairing: { start: () => ({ status: 'pending' }) },
    log: () => {},
  } as unknown as ServerContext;
  const app = createApp(ctx);
  return new Promise((resolve, reject) => {
    // Run the real Express middleware using HTTP streams without binding a port.
    const socket = new Duplex({
      read() {},
      write(_chunk, _encoding, done) { done(); },
    }) as unknown as Socket;
    const req = new IncomingMessage(socket);
    req.method = 'POST';
    req.url = path;
    req.headers = {
      host: 'localhost:8787',
      origin: 'http://localhost:8787',
      'content-type': 'application/json',
      'content-length': String(Buffer.byteLength(body)),
    };
    const res = new ServerResponse(req);
    req.once('error', reject);
    res.once('error', reject);
    req.once('end', () => { req.complete = true; });
    res.end = ((chunk: Buffer | string) => {
      try {
        resolve({ status: res.statusCode, body: JSON.parse(chunk.toString()) });
      } catch (error) { reject(error); }
      finally { socket.destroy(); }
      return res;
    }) as typeof res.end;
    app(req, res);
    req.push(body);
    req.push(null);
  });
}

describe('HTTP JSON body limits', () => {
  it.each(['/api/speech', '/api/speech/', '/api/SPEECH', '/api/speech?source=buddy'])(
    'rejects oversized speech input before the general parser at %s', async (path) => {
      const result = await post(path, JSON.stringify({ text: 'x'.repeat(9 * 1024) }));
      expect(result).toMatchObject({ status: 413, body: { error: 'too_large' } });
    },
  );

  it('keeps authentication in force for a valid small speech body', async () => {
    expect(await post('/api/speech', JSON.stringify({ text: 'Hello' })))
      .toMatchObject({ status: 401, body: { error: 'unauthorized' } });
  });

  it('preserves the larger JSON allowance on other API routes', async () => {
    expect(await post('/api/pair/start', JSON.stringify({ name: 'Browser', kind: 'web', extra: 'x'.repeat(9 * 1024) })))
      .toMatchObject({ status: 201, body: { status: 'pending' } });
  });

  it('returns the existing JSON error for malformed speech input', async () => {
    expect(await post('/api/speech', '{bad JSON'))
      .toMatchObject({ status: 400, body: { error: 'bad_request' } });
  });
});
