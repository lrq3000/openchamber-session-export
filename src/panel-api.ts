import type { HostClient } from '@openchamber/sdk';
import type { RecordData } from './types.js';

export async function serviceRequest(host: HostClient, path: string, method: 'GET' | 'POST' = 'GET', data?: unknown, query?: Record<string, string>): Promise<RecordData> {
  const response = await host.serviceRequest({ path, method, query, ...(data === undefined ? {} : { body: JSON.stringify(data) }) });
  let value: RecordData;
  try { value = JSON.parse(response.body); } catch { throw new Error('The extension service returned invalid metadata.'); }
  if (response.status < 200 || response.status >= 300) throw new Error(value.error ?? 'The extension service is unavailable.');
  return value;
}
export const pause = () => new Promise(resolve => setTimeout(resolve, 250));
export const formatBytes = (bytes: number) => bytes < 1024 ? `${bytes} B` : bytes < 1024 ** 2 ? `${(bytes / 1024).toFixed(1)} KiB` : bytes < 1024 ** 3 ? `${(bytes / 1024 ** 2).toFixed(1)} MiB` : `${(bytes / 1024 ** 3).toFixed(2)} GiB`;
