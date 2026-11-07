/** Preserve evolving OpenCode JSON fields at the boundary rather than projecting them into a lossy UI model. */
export type RecordData = Record<string, any>;
export interface ExportTarget { sessionID: string; directory: string; title?: string }
export interface CapturedSession {
  info: RecordData; messages: RecordData[]; events: RecordData[];
  log: { available: boolean; watermark?: number; error?: string };
  changed: boolean; active: boolean | null;
}
export interface Capture {
  target: ExportTarget; startedAt: string; endedAt: string; serverVersion: string;
  sessions: CapturedSession[]; warnings: string[];
}
export interface AssetCandidate {
  id: string; path: string; name: string; sessions: string[]; size: number;
  status: 'available' | 'missing' | 'refused'; reason?: string;
  fingerprint?: { dev: number; ino: number; size: number; mtimeMs: number };
}
export interface PreparedExport { id: string; target: ExportTarget; assets: AssetCandidate[]; warnings: string[]; assetCount?: number }
export interface ExportOptions { includeFiles?: boolean; selectedAssetIDs?: string[]; outputDirectory?: string }
export interface JobStatus {
  id: string; target: ExportTarget; state: 'running' | 'ready' | 'failed'; progress: string;
  prepared?: PreparedExport; path?: string; size?: number; warnings?: string[]; error?: string;
}
