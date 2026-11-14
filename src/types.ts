/** Preserve evolving OpenCode JSON fields at the boundary rather than projecting them into a lossy UI model. */
export type RecordData = Record<string, any>;
export interface ExportTarget { sessionID: string; directory: string; title?: string }
export interface CapturedSession {
  info: RecordData; messages: RecordData[]; events: RecordData[];
  log: { available: boolean; watermark?: number; error?: string };
  changed: boolean; active: boolean | null;
}
export interface Capture {
  target: ExportTarget; startedAt: string; endedAt: string; serverVersion: string | null;
  sessions: CapturedSession[]; warnings: string[];
}
/** Backend-only handles: evidence remains in these files, never in an iframe response or whole-chat array. */
export interface CaptureSnapshot {
  root: string; target: ExportTarget; startedAt: string; endedAt: string; serverVersion: string | null;
  sessionCount: number; messageCount: number; warnings: string[]; warningCount: number;
}
export interface SessionRecord {
  id: string; parentID?: string; title: string; infoPath: string; messagesPath: string; messageIndex: string;
  messageCount: number; active: boolean | null; changed: boolean;
  eventsPath?: string; log: CapturedSession['log'];
}
export interface AssetCandidate {
  id: string; path: string; name: string; sessions: string[]; size: number;
  /** Backend index of every referring session; the bridge returns only a bounded origin preview. */
  sessionIndex?: string; sourceSessionCount?: number; additionalSessionCount?: number;
  status: 'available' | 'missing' | 'refused'; reason?: string;
  fingerprint?: { dev: number; ino: number; size: number; mtimeMs: number };
}
export interface PreparedExport { id: string; target: ExportTarget; assets: AssetCandidate[]; warnings: string[]; assetCount?: number; warningCount?: number }
export interface ExportOptions { includeFiles?: boolean; selectedAssetIDs?: string[]; outputDirectory?: string; outputFile?: string }
export interface JobStatus {
  id: string; target: ExportTarget; state: 'running' | 'ready' | 'failed'; progress: string;
  prepared?: PreparedExport; path?: string; size?: number; warnings?: string[]; warningCount?: number; error?: string;
  destination?: 'selected' | 'cancelled' | 'unavailable';
}
