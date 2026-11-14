import { randomBytes, randomUUID } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, open, realpath } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { basename } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { readBody, sendJson } from './http.js';

interface Grant { id: string; path: string; origin: string; base: string; secure: boolean; expires: number; fingerprint: string; cookie?: string }
const fingerprint = (metadata: Awaited<ReturnType<typeof lstat>>) => [metadata.dev, metadata.ino, metadata.size, metadata.mtimeMs].join(':');

/** Separate capabilities authorize one immutable archive, never the SDK service or arbitrary files. */
export class Companion {
  private tickets = new Map<string, Grant>();
  private grants = new Map<string, Grant>();
  async issue(path: string, servicePort: number, privateUrl?: string): Promise<{ url: string; expiresAt: number }> {
    const url = new URL(privateUrl || `http://127.0.0.1:${servicePort}/companion`);
    if (privateUrl && (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || !url.pathname.endsWith('/companion'))) throw new Error('Use a private HTTPS URL ending in /companion, with no credentials, query or fragment. Configure its proxy separately.');
    this.expire();
    if (this.tickets.size + this.grants.size >= 32) throw new Error('Too many pending downloads. Wait for their five-minute authorization window to expire.');
    const metadata = await lstat(path), canonical = await realpath(path);
    if (!metadata.isFile() || metadata.isSymbolicLink()) throw new Error('The exported archive is no longer available.');
    const grant: Grant = { id: randomUUID(), path: canonical, fingerprint: fingerprint(metadata), expires: Date.now() + 5 * 60 * 1000, origin: url.origin, base: url.pathname, secure: url.protocol === 'https:' };
    const ticket = randomBytes(32).toString('hex'); this.tickets.set(ticket, grant);
    url.hash = ticket;
    return { url: url.toString(), expiresAt: grant.expires };
  }
  private expire() {
    for (const map of [this.tickets, this.grants]) for (const [key, grant] of map) if (grant.expires < Date.now()) map.delete(key);
  }
  async handle(request: IncomingMessage, response: ServerResponse, pathname: string): Promise<boolean> {
    if (!pathname.startsWith('/companion')) return false;
    this.expire();
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    try {
      if (pathname === '/companion' && request.method === 'GET') {
        const nonce = randomBytes(16).toString('base64');
        response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Content-Security-Policy': `default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'` });
        response.end(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Download session archive</title><style>body{font:1rem/1.6 system-ui;max-width:38rem;margin:3rem auto;padding:0 1rem}a{display:inline-block;padding:.7rem 1rem}#error{color:#b42318}[hidden]{display:none}</style><h1>Download session archive</h1><p id="status">Checking download authorization…</p><p id="error" role="alert"></p><a id="download" hidden>Download ZIP</a><p>This archive may contain private information. An ordinary ZIP is not encrypted.</p><script nonce="${nonce}">(async()=>{
          const ticket=location.hash.slice(1),base=location.pathname.replace(/\\/$/,'');
          history.replaceState(null,'',base);
          try{const response=await fetch(base+'/redeem',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticket})});
          const result=await response.json();if(!response.ok)throw Error(result.error||'Authorization failed.');
          const link=document.querySelector('#download');link.href=base+'/'+result.id+'/archive.zip';link.hidden=false;
          document.querySelector('#status').textContent='Ready. This download link expires after five minutes.';
          }catch(error){document.querySelector('#status').textContent='Download unavailable';document.querySelector('#error').textContent=error.message+' Return to Session Export or use Files.'}
        })();</script></html>`);
        return true;
      }
      if (pathname === '/companion/redeem' && request.method === 'POST') {
        const { ticket } = await readBody(request), grant = this.tickets.get(ticket);
        if (!grant) throw new Error('This download authorization expired or has already been used.');
        const origin = request.headers.origin;
        const localOrigin = `http://${request.headers.host}`;
        if (!origin || origin !== grant.origin && origin !== localOrigin) throw new Error('Download authorization must be redeemed by its own page.');
        this.tickets.delete(ticket); grant.cookie = randomBytes(32).toString('hex'); this.grants.set(grant.id, grant);
        response.setHeader('Set-Cookie', `session_export_${grant.id}=${grant.cookie}; HttpOnly; SameSite=Strict; Path=${grant.base}/${grant.id}/; Max-Age=300${grant.secure ? '; Secure' : ''}`);
        sendJson(response, 200, { id: grant.id }); return true;
      }
      const match = /^\/companion\/([a-f0-9-]+)\/archive\.zip$/.exec(pathname);
      if (match && ['GET', 'HEAD'].includes(request.method ?? '')) {
        const grant = this.grants.get(match[1]);
        if (!grant || !request.headers.cookie?.split(';').map(value => value.trim()).includes(`session_export_${grant.id}=${grant.cookie}`)) throw new Error('Download authorization is missing or expired.');
        const file = await open(grant.path, 'r');
        try {
        // Validate and stream the same open handle. Checking a pathname and
        // reopening it would allow a replacement between authorization and read.
        const metadata = await file.stat();
        if (!metadata.isFile() || metadata.isSymbolicLink() || fingerprint(metadata) !== grant.fingerprint) throw new Error('The archive changed after this download was prepared.');
        let start = 0, end = metadata.size - 1, status = 200;
        const range = request.headers.range;
        if (range) {
          const bytes = /^bytes=(\d*)-(\d*)$/.exec(range);
          if (!bytes || !bytes[1] && !bytes[2]) { response.writeHead(416).end(); return true; }
          start = bytes[1] ? Number(bytes[1]) : Math.max(0, metadata.size - Number(bytes[2]));
          end = bytes[1] && bytes[2] ? Math.min(end, Number(bytes[2])) : end;
          if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= metadata.size) { response.writeHead(416, { 'Content-Range': `bytes */${metadata.size}` }).end(); return true; }
          status = 206; response.setHeader('Content-Range', `bytes ${start}-${end}/${metadata.size}`);
        }
        const name = basename(grant.path);
        response.writeHead(status, {
          'Content-Type': 'application/zip', 'Content-Length': end - start + 1, 'Accept-Ranges': 'bytes',
          'Content-Disposition': `attachment; filename="session-export.zip"; filename*=UTF-8''${encodeURIComponent(name)}`,
        });
        if (request.method === 'HEAD') response.end();
        else await pipeline(file.createReadStream({ start, end, autoClose: false }), response);
        } finally { await file.close(); }
        return true;
      }
      sendJson(response, 404, { error: 'Unknown companion route.' }); return true;
    } catch (error) {
      if (!response.headersSent) sendJson(response, 401, { error: error instanceof Error ? error.message : 'Download unavailable.' });
      else response.destroy();
      return true;
    }
  }
}
