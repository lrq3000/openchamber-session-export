import { samePath } from './attachments.js';
import type { Capture, CapturedSession, ExportTarget, RecordData } from './types.js';
export interface Connection { url: string; version: string }
interface CaptureBudget { remaining: number }

/** All requests are read-only and stay on the verified proxy. No CLI discovery or provider calls are involved. */
export class SessionSource {
  constructor(private connection: Connection, private limits: { maxCaptureBytes?: number } = {}) {}

  async capture(target: ExportTarget): Promise<Capture> {
    if (!/^ses_[a-zA-Z0-9_-]+$/.test(target.sessionID) || !target.directory) throw new Error('A valid session and directory are required.');
    const capture: Capture = { target: { ...target }, startedAt: new Date().toISOString(), endedAt: '', serverVersion: this.connection.version, sessions: [], warnings: [] };
    const budget: CaptureBudget = { remaining: this.limits.maxCaptureBytes ?? 128 * 1024 * 1024 };
    let active: RecordData | undefined;
    try { active = this.unwrap(await this.json('/api/session/active', undefined, budget)); }
    catch { capture.warnings.push('Session activity could not be checked; the capture may be non-atomic.'); }
    const queue = [target.sessionID], seen = new Set<string>();
    for (let index = 0; index < queue.length; index++) {
      const id = queue[index];
      if (seen.has(id)) throw new Error('A cycle or duplicate descendant was found. Retry after the session tree settles.');
      seen.add(id);
      const path = `/api/session/${encodeURIComponent(id)}`;
      const info = this.unwrap(await this.json(path, undefined, budget));
      if (info.id !== id) throw new Error('The server returned a different session identity.');
      if (index === 0 && !samePath(String(info.location?.directory ?? ''), target.directory)) throw new Error('The focused session directory does not match this OpenChamber server.');
      const messages = await this.pages(`${path}/message`, { order: 'asc', limit: '100' }, budget);
      const record: CapturedSession = { info, messages, events: [], active: active ? Boolean(active[id]) : null, changed: false, log: { available: false } };
      // Archived sub-sessions are part of the conversation too. Preserve explicit scopes across every page.
      for (const archived of ['false', 'true']) {
        for (const child of await this.pages('/api/session', { parentID: id, archived, order: 'asc', limit: '100' }, budget)) {
          if (typeof child.id !== 'string' || !/^ses_[a-zA-Z0-9_-]+$/.test(child.id)) throw new Error('Invalid descendant session identity.');
          queue.push(child.id);
        }
      }
      const after = this.unwrap(await this.json(path, undefined, budget));
      record.changed = JSON.stringify(info.time?.updated) !== JSON.stringify(after.time?.updated);
      if (record.active || record.changed) capture.warnings.push(`${id} was active or changed during capture; this is a non-atomic snapshot.`);
      capture.sessions.push(record);
    }
    // Prioritize complete transcripts over optional logs when the shared in-memory evidence budget is nearly exhausted.
    for (const record of capture.sessions) {
      const id = String(record.info.id);
      try {
        record.events = await this.log(id, budget);
        const marker = record.events.find(event => event.type === 'log.synced');
        record.log = { available: true, watermark: marker?.seq };
      } catch (error) {
        record.log.error = error instanceof Error ? error.message : 'Log unavailable';
        capture.warnings.push(`Durable log unavailable for ${id}: ${record.log.error}`);
      }
    }
    capture.endedAt = new Date().toISOString();
    return capture;
  }

  private unwrap(value: RecordData): RecordData { return value.data && !Array.isArray(value.data) ? value.data : value; }

  private async pages(path: string, query: Record<string, string>, budget: CaptureBudget): Promise<RecordData[]> {
    const items: RecordData[] = [], cursors = new Set<string>(), ids = new Set<string>();
    let cursor: string | undefined;
    do {
      // Native v2 cursors carry their ordering; repeating order on a continuation is rejected with InvalidCursorError.
      const pageQuery: Record<string, string> = { ...query, ...(cursor ? { cursor } : {}) };
      if (cursor) delete pageQuery.order;
      const result = await this.json(path, pageQuery, budget);
      if (!Array.isArray(result.data)) throw new Error(`Invalid projected page returned by ${path}.`);
      for (const item of result.data) {
        if (!item || typeof item.id !== 'string' || ids.has(item.id)) throw new Error(`Missing or duplicate identity in ${path}.`);
        ids.add(item.id); items.push(item);
      }
      cursor = result.cursor?.next ?? undefined;
      if (cursor !== undefined) {
        if (typeof cursor !== 'string' || cursors.has(cursor)) throw new Error(`Repeated or invalid cursor in ${path}.`);
        cursors.add(cursor);
      }
    } while (cursor);
    return items;
  }

  private async response(path: string, query: Record<string, string> = {}, timeout = 15000): Promise<Response> {
    const base = new URL(this.connection.url);
    if (!['127.0.0.1', '[::1]', 'localhost'].includes(base.hostname) || base.protocol !== 'http:' || base.username || base.password) throw new Error('Only a verified local OpenChamber proxy is supported.');
    const url = new URL(path, base);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, value);
    const response = await fetch(url, { redirect: 'error', signal: AbortSignal.timeout(timeout), cache: 'no-store' });
    if (!response.ok) { await response.body?.cancel(); throw new Error(`OpenCode GET ${path} returned ${response.status}.`); }
    return response;
  }

  private async json(path: string, query?: Record<string, string>, budget?: CaptureBudget): Promise<RecordData> {
    const response = await this.response(path, query);
    let bytes = 0; const chunks: Buffer[] = [];
    for await (const chunk of response.body!) {
      bytes += chunk.length;
      if (bytes > 64 * 1024 * 1024) throw new Error('An API page exceeds the 64 MiB safety limit.');
      if (budget && bytes > budget.remaining) throw new Error('The capture exceeds its in-memory evidence budget; no partial transcript archive was produced.');
      chunks.push(Buffer.from(chunk));
    }
    if (budget) budget.remaining -= bytes;
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  }

  private async log(id: string, budget: CaptureBudget): Promise<RecordData[]> {
    const response = await this.response(`/api/experimental/session/${encodeURIComponent(id)}/log`, { follow: 'false' }, 120000);
    const events: RecordData[] = []; let buffer = '', bytes = 0;
    const decoder = new TextDecoder();
    for await (const chunk of response.body!) {
      bytes += chunk.length;
      if (bytes > 64 * 1024 * 1024) throw new Error('Durable log exceeds the 64 MiB safety limit.');
      if (bytes > budget.remaining) throw new Error('The remaining capture evidence budget cannot accommodate this optional log.');
      buffer += decoder.decode(chunk, { stream: true }).replace(/\r\n/g, '\n');
      let boundary: number;
      while ((boundary = buffer.indexOf('\n\n')) !== -1) {
        const block = buffer.slice(0, boundary); buffer = buffer.slice(boundary + 2);
        const data = block.split('\n').filter(line => line.startsWith('data:')).map(line => line.slice(5).trimStart()).join('\n');
        if (!data) continue;
        const event = JSON.parse(data);
        if (!event || typeof event.type !== 'string') throw new Error('Unsupported durable log event envelope.');
        events.push(event);
      }
    }
    if (!events.some(event => event.type === 'log.synced')) throw new Error('The durable log ended without a captured watermark.');
    budget.remaining -= bytes;
    return events;
  }
}
