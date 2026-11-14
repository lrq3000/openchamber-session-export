import type { IncomingMessage, ServerResponse } from 'node:http';

export async function readBody(request: IncomingMessage): Promise<Record<string, any>> {
  const chunks: Buffer[] = []; let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 64000) throw new Error('The request exceeds the 64 KB bridge limit.');
    chunks.push(Buffer.from(chunk));
  }
  const value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('The request must contain a JSON object.');
  return value;
}
export function sendJson(response: ServerResponse, status: number, value: unknown): void {
  const text = JSON.stringify(value);
  response.writeHead(Buffer.byteLength(text) > 1024 * 1024 ? 413 : status, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
  response.end(Buffer.byteLength(text) > 1024 * 1024 ? '{"error":"Transfer metadata exceeds its safety limit."}' : text);
}
