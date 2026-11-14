// src/plugin-entry.ts
import { fileURLToPath } from "node:url";

// src/plugin-server.ts
import { createHash as createHash2, randomBytes, randomUUID as randomUUID3, timingSafeEqual } from "node:crypto";
import { rm } from "node:fs/promises";
import { createServer } from "node:http";
import { join as join3 } from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";

// src/private-channel.ts
import { createHash, randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { lstat, mkdir, readFile, realpath, rename, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
var UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
var exec = promisify(execFile);
async function channelPath(packageDirectory, hostPID = process.ppid, home = homedir()) {
  if (!Number.isInteger(hostPID) || hostPID <= 0) throw new Error("A managed host process identity is required.");
  const canonical = await realpath(packageDirectory);
  const packageKey = createHash("sha256").update(process.platform === "win32" ? canonical.toLowerCase() : canonical).digest("hex");
  return { root: join(home, ".openchamber-session-export", "bridges", packageKey, String(hostPID)), packageKey };
}
async function privateDirectory(directory) {
  await mkdir(directory, { recursive: true, mode: 448 });
  const metadata = await lstat(directory);
  const canonical = resolve(await realpath(directory)), supplied = resolve(directory);
  if (!metadata.isDirectory() || metadata.isSymbolicLink() || (process.platform === "win32" ? canonical.toLowerCase() !== supplied.toLowerCase() : canonical !== supplied)) throw new Error("The private transfer directory is not a regular canonical directory.");
  if (process.platform !== "win32") {
    if (metadata.uid !== process.getuid?.() || (metadata.mode & 63) !== 0) throw new Error("The private transfer directory must belong to this user and have mode 0700.");
  } else {
    const script = "$ErrorActionPreference='Stop';$p=$env:SESSION_EXPORT_PRIVATE_DIR;$sid=[Security.Principal.WindowsIdentity]::GetCurrent().User;$a=New-Object Security.AccessControl.DirectorySecurity;$a.SetOwner($sid);$a.SetAccessRuleProtection($true,$false);$r=New-Object Security.AccessControl.FileSystemAccessRule($sid,'FullControl','ContainerInherit,ObjectInherit','None','Allow');$a.AddAccessRule($r);Set-Acl -LiteralPath $p -AclObject $a";
    await exec("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", Buffer.from(script, "utf16le").toString("base64")], {
      windowsHide: true,
      timeout: 1e4,
      env: { PATH: process.env.PATH, SYSTEMROOT: process.env.SYSTEMROOT, SESSION_EXPORT_PRIVATE_DIR: directory }
    });
  }
}
async function writePrivateJson(path, value) {
  const temporary = `${path}.${randomUUID()}.partial`;
  await writeFile(temporary, JSON.stringify(value), { flag: "wx", mode: 384 });
  await rename(temporary, path);
}
async function readJsonFile(path, limit) {
  const metadata = await lstat(path);
  if (!metadata.isFile() || metadata.isSymbolicLink() || metadata.size > limit) throw new Error("A transfer control file is unsafe or exceeds its documented size limit.");
  return JSON.parse(await readFile(path, "utf8"));
}

// src/plugin-imports.ts
import { open, stat as stat2 } from "node:fs/promises";
import { basename, dirname, join as join2 } from "node:path";
import { isDeepStrictEqual } from "node:util";

// src/portable-attachments.ts
import { readFile as readFile2, stat } from "node:fs/promises";
import { extname } from "node:path";
import { pathToFileURL as pathToFileURL2 } from "node:url";

// src/portable-session.ts
import { randomUUID as randomUUID2 } from "node:crypto";
import { pathToFileURL } from "node:url";
var MAX_IMPORT_JSON_BYTES = 64 * 1024 * 1024;
var messageTypes = /* @__PURE__ */ new Set(["user", "assistant", "synthetic", "system", "skill", "shell", "compaction", "idle", "agent-switched", "model-switched", "location-switched"]);
var fresh = (prefix) => prefix + randomUUID2().replaceAll("-", "");
var referenceKeys = /* @__PURE__ */ new Set(["sessionID", "sessionId", "messageID", "messageId", "parentID", "keepID"]);
function portableFileKey(path) {
  const value = path.replaceAll("\\", "/").replace(/^\/([a-zA-Z]:\/)/, "$1");
  return /^[a-zA-Z]:\//.test(value) ? value.toLowerCase() : value;
}
function prepareSessionCopies(sources, directory, assets = /* @__PURE__ */ new Map()) {
  const ids = /* @__PURE__ */ new Map(), warnings = [];
  const assetPaths = new Map([...assets].map(([path, destination]) => [portableFileKey(path), destination]));
  const register = (id, prefix) => {
    if (typeof id !== "string" || !id.startsWith(prefix) || ids.has(id)) throw new Error("Missing or duplicate session/message identity in the archive.");
    ids.set(id, fresh(prefix));
  };
  for (const source of sources) {
    register(source.info?.id, "ses_");
    if (!Array.isArray(source.messages)) throw new Error("A session transcript is not an array.");
    for (const message of source.messages) register(message.id, "msg_");
    for (const message of source.messages) {
      if (message.type === "shell" && typeof message.shellID === "string" && !ids.has(message.shellID)) register(message.shellID, "sh_");
      for (const part of message.type === "assistant" ? message.content ?? [] : []) if (part.type === "tool" && typeof part.id === "string" && !ids.has(part.id)) ids.set(part.id, fresh("tool_"));
    }
    const instructionKeys = /* @__PURE__ */ new Set();
    for (const entry of source.instructions ?? []) {
      if (!entry || typeof entry.key !== "string" || !/^[a-z0-9][a-z0-9._-]*$/.test(entry.key) || entry.value === void 0) throw new Error("An archived instruction key/value is not supported by the native API.");
      if (instructionKeys.has(entry.key)) throw new Error("Duplicate archived instruction keys would overwrite one another.");
      instructionKeys.add(entry.key);
      if (Buffer.byteLength(JSON.stringify(entry.value)) > 256 * 1024) throw new Error("An instruction (including a pinned message) exceeds the native 256 KiB entry limit. Keep a complete archive for consultation.");
    }
  }
  const rewriteReferences = (value, pins = false) => {
    if (typeof value === "string") return pins ? ids.get(value) ?? value : value;
    if (Array.isArray(value)) return value.map((item) => rewriteReferences(item, pins));
    if (!value || typeof value !== "object") return value;
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      pins ? ids.get(key) ?? key : key,
      pins || referenceKeys.has(key) ? rewriteReferences(item, true) : rewriteReferences(item)
    ]));
  };
  const rewriteFile = (file) => {
    const path = file?.source?.path;
    if (typeof path === "string" && assetPaths.has(portableFileKey(path))) file.source.path = assetPaths.get(portableFileKey(path));
    for (const target of [file, file?.source]) if (typeof target?.uri === "string") {
      const direct = assetPaths.get(portableFileKey(target.uri));
      if (direct) {
        target.uri = pathToFileURL(direct).href;
        continue;
      }
      if (!target.uri.startsWith("file:")) continue;
      try {
        const url = new URL(target.uri);
        if (url.host && url.host !== "localhost") continue;
        const original = portableFileKey(decodeURIComponent(url.pathname));
        const mapped = assetPaths.get(original);
        if (mapped) target.uri = pathToFileURL(mapped).href;
      } catch {
      }
    }
  };
  const sessions = sources.map((source) => {
    const copied = structuredClone(source), info = copied.info;
    info.id = ids.get(source.info.id);
    if (source.info.parentID) {
      if (!ids.has(source.info.parentID)) warnings.push("An external parent was detached; only archived sessions can be restored.");
      info.parentID = ids.get(source.info.parentID);
    }
    for (const key of ["permissions", "revert", "fork", "subpath"]) delete info[key];
    info.location = { directory };
    info.title = `${source.info.title ?? "Session"} (imported)`;
    if (info.time) {
      delete info.time.busy;
      delete info.time.archived;
    }
    info.metadata = rewriteReferences(info.metadata ?? {});
    const pins = info.metadata?.openchamber?.context_obligatory_messages;
    if (pins) info.metadata.openchamber.context_obligatory_messages = rewriteReferences(pins, true);
    info.metadata.session_export = { sourceSessionID: source.info.id, importedAt: (/* @__PURE__ */ new Date()).toISOString() };
    let unfinished = 0;
    for (const message of copied.messages) {
      if (!messageTypes.has(message.type)) throw new Error(`Unsupported message type: ${String(message.type).slice(0, 80)}. The original ZIP has not been changed.`);
      message.id = ids.get(message.id);
      message.metadata = rewriteReferences(message.metadata);
      if (Array.isArray(message.files)) for (const file of message.files) rewriteFile(file);
      if (message.type === "location-switched") message.location = { directory };
      if (message.type === "shell") {
        message.shellID = ids.get(message.shellID) ?? fresh("sh_");
        if (message.status === "running") {
          message.metadata = { ...message.metadata, session_export: { originallyRunning: true, originalTime: message.time } };
          message.status = "killed";
          message.time = { ...message.time, completed: Date.now() };
          warnings.push("A running shell record will be preserved as an interrupted copy. No process is resumed.");
        }
      }
      if (message.type === "compaction" && message.status === "running") {
        warnings.push("A running compaction will be preserved as a failed/interrupted copy; its partial summary remains in metadata and the original archive.");
        message.metadata = { ...message.metadata, session_export: { originallyRunning: true, partialSummary: message.summary } };
        message.status = "failed";
        message.error = { type: "unknown", message: "Compaction interrupted in the source session." };
        delete message.summary;
      }
      if (message.type === "assistant") {
        for (const part of message.content ?? []) {
          if (!["text", "reasoning", "tool"].includes(part.type)) throw new Error("An unfamiliar assistant content type cannot be restored by the official importer.");
          if (part.type !== "tool") continue;
          part.id = ids.get(part.id) ?? fresh("tool_");
          for (const item of part.state?.content ?? []) if (item?.type === "file") rewriteFile(item);
          if (["running", "streaming"].includes(part.state?.status)) {
            message.metadata = { ...message.metadata, session_export: { ...message.metadata?.session_export, interruptedTools: [...message.metadata?.session_export?.interruptedTools ?? [], { id: part.id, state: part.state, time: part.time }] } };
            part.state = { ...part.state, status: "error", input: typeof part.state.input === "object" ? part.state.input : {}, error: { type: "aborted", message: "This tool was interrupted in the source session; it was not executed during import." } };
            part.time = { ...part.time, completed: Date.now() };
          }
        }
        if (message.time?.completed === void 0) {
          unfinished++;
          message.metadata = { ...message.metadata, session_export: { ...message.metadata?.session_export, originallyUnfinished: true, originalTime: message.time } };
          message.time = { ...message.time, completed: Date.now() };
          message.error = { type: "aborted", message: "Interrupted in the source session; sealed for import without resuming execution." };
          delete message.retry;
        }
      }
    }
    if (unfinished) warnings.push(`${unfinished} unfinished assistant message(s) will be sealed as interrupted copies. Original records remain in the ZIP.`);
    return { ...copied, sourceID: source.info.id };
  });
  const ordered = [], pending = [...sessions], imported = /* @__PURE__ */ new Set();
  while (pending.length) {
    const index = pending.findIndex((session2) => !session2.info.parentID || imported.has(session2.info.parentID));
    if (index < 0) throw new Error("The archived session tree contains a cycle.");
    const [session] = pending.splice(index, 1);
    ordered.push(session);
    imported.add(session.info.id);
  }
  return { sessions: ordered, warnings };
}

// src/portable-attachments.ts
var mimeTypes = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".pdf": "application/pdf", ".txt": "text/plain", ".md": "text/markdown" };
async function hydrateAttachments(sources, contents, destinations, sourceBytes) {
  const index = new Map([...contents].map(([source, path]) => [portableFileKey(source), { source, path }]));
  let budget = sourceBytes;
  const hydrate = async (file) => {
    if (file.type === "text") return;
    let reference = file.source?.path;
    const uri = file.source?.uri ?? file.uri;
    if (!reference && typeof uri === "string" && index.has(portableFileKey(uri))) reference = uri;
    if (!reference && typeof uri === "string" && uri.startsWith("file:")) {
      const url = new URL(uri);
      if (url.host && url.host !== "localhost") throw new Error("Network attachment references are not restored.");
      reference = decodeURIComponent(url.pathname);
    }
    const entry = typeof reference === "string" ? index.get(portableFileKey(reference)) : void 0;
    if (typeof file.data !== "string") {
      if (!entry) throw new Error("An attachment has no embedded bytes or selected archived file. Export it with that file selected; no source path or remote URL will be read during import.");
      const size = (await stat(entry.path)).size, encodedSize = Math.ceil(size / 3) * 4;
      if (budget + encodedSize > MAX_IMPORT_JSON_BYTES) throw new Error("Hydrated attachments exceed the 64 MiB import JSON safety budget.");
      budget += encodedSize;
      file.data = (await readFile2(entry.path)).toString("base64");
    }
    if (typeof file.mime !== "string") file.mime = mimeTypes[extname(String(file.name ?? reference ?? "")).toLowerCase()] ?? "application/octet-stream";
    if (entry) file.source = { type: "uri", uri: pathToFileURL2(destinations.get(entry.source)).href };
    else if (!["uri", "inline"].includes(file.source?.type)) file.source = { type: "inline" };
  };
  for (const source of sources) for (const message of source.messages) {
    for (const file of message.files ?? []) await hydrate(file);
  }
}

// src/plugin-imports.ts
var PluginImports = class {
  constructor(root, instanceID, native) {
    this.root = root;
    this.instanceID = instanceID;
    this.native = native;
  }
  root;
  instanceID;
  native;
  states = /* @__PURE__ */ new Map();
  locks = /* @__PURE__ */ new Set();
  tasks = /* @__PURE__ */ new Set();
  writes = /* @__PURE__ */ new Map();
  directory(id) {
    return join2(this.root, "jobs", id);
  }
  persist(id, state) {
    const snapshot = structuredClone(state);
    const next = (this.writes.get(id) ?? Promise.resolve()).catch(() => {
    }).then(() => writePrivateJson(join2(this.directory(id), "state.json"), snapshot));
    this.writes.set(id, next);
    void next.finally(() => {
      if (this.writes.get(id) === next) this.writes.delete(id);
    }).catch(() => {
    });
    return next;
  }
  remember(id, state) {
    if (this.states.size >= 32) {
      const evicted = [...this.states.keys()].find((key) => !this.tasks.has(key) && !this.locks.has(key));
      if (evicted) this.states.delete(evicted);
      else throw new Error("Too many active native import jobs.");
    }
    this.states.set(id, state);
  }
  async status(id) {
    const state = this.states.get(id) ?? await readJsonFile(join2(this.directory(id), "state.json"), 256 * 1024);
    if (state.instanceID !== this.instanceID || state.state === "running" && !this.tasks.has(id) || state.state === "preparing" && !this.locks.has(id)) {
      return {
        ...state,
        state: "failed",
        uncertainSessions: state.inFlight?.phase === "import" ? [state.inFlight.sessionID] : state.uncertainSessions,
        error: "The plugin restarted or its instance changed. Inspect the recorded created/candidate session IDs; no mutation was replayed.",
        progress: "Interrupted import requires inspection"
      };
    }
    if (this.tasks.has(id) && state.state !== "running") return { ...structuredClone(state), state: "running", progress: "Recording the final import outcome" };
    return structuredClone(state);
  }
  async prepare(id) {
    if (this.locks.has(id)) throw new Error("An operation for this import is already in progress.");
    this.locks.add(id);
    try {
      const reservation = await open(join2(this.directory(id), "prepare.lock"), "wx", 384);
      await reservation.close();
      const state = { instanceID: this.instanceID, state: "preparing", progress: "Preparing import copies", sessions: [], warnings: [], finalized: [] };
      this.remember(id, state);
      await this.persist(id, state);
      try {
        const directory = this.directory(id), spec = await readJsonFile(join2(directory, "spec.json"), 512 * 1024);
        if (typeof spec.directory !== "string" || !Array.isArray(spec.files) || !spec.files.length || spec.files.length > 512 || !Array.isArray(spec.assets)) throw new Error("Invalid private import specification.");
        const sources = [];
        let bytes = 0;
        for (const file of spec.files) {
          if (!/^source-[0-9]+\.json$/.test(file)) throw new Error("Invalid private session filename.");
          bytes += (await stat2(join2(directory, file))).size;
          if (bytes > MAX_IMPORT_JSON_BYTES) throw new Error("Session JSON exceeds the 64 MiB import safety limit.");
          sources.push(await readJsonFile(join2(directory, file), MAX_IMPORT_JSON_BYTES));
        }
        const contents = new Map(spec.assetContents ?? []), assets = new Map(spec.assets);
        for (const path of contents.values()) if (dirname(path) !== directory || !/^entry-[a-f0-9-]+$/.test(basename(path))) throw new Error("Invalid private archived file source.");
        await hydrateAttachments(sources, contents, assets, bytes);
        const prepared = prepareSessionCopies(sources, spec.directory, assets);
        state.mainSessionID = prepared.sessions.find((session) => session.sourceID === spec.mainSourceID)?.info.id ?? prepared.sessions[0].info.id;
        let preparedBytes = 0;
        for (const [number, session] of prepared.sessions.entries()) {
          preparedBytes += Buffer.byteLength(JSON.stringify(session));
          if (preparedBytes > MAX_IMPORT_JSON_BYTES || Buffer.byteLength(this.payload(session)) > MAX_IMPORT_JSON_BYTES) throw new Error("Adapted session JSON exceeds the 64 MiB import safety limit.");
          await writePrivateJson(join2(directory, `prepared-${number}.json`), session);
        }
        await writePrivateJson(join2(directory, "prepared-index.json"), { count: prepared.sessions.length, instanceID: this.instanceID });
        state.state = "prepared";
        state.progress = "Ready for confirmation";
        state.warnings = prepared.warnings.slice(0, 25);
        await this.persist(id, state);
        return structuredClone(state);
      } catch (error) {
        state.state = "failed";
        state.error = error instanceof Error ? error.message : "Preparation failed.";
        await this.persist(id, state);
        throw error;
      }
    } finally {
      this.locks.delete(id);
    }
  }
  async start(id) {
    if (this.locks.has(id)) throw new Error("An operation for this import is already in progress.");
    this.locks.add(id);
    try {
      const state = this.states.get(id) ?? await this.status(id);
      if (state.instanceID !== this.instanceID || state.state !== "prepared" || state.cancelRequested) throw new Error("This import is no longer a confirmed, prepared job on the same plugin instance.");
      if (this.tasks.size >= 2) throw new Error("Wait for the current native imports to finish.");
      state.state = "running";
      state.progress = "Importing new sessions";
      this.remember(id, state);
      this.tasks.add(id);
      try {
        await this.persist(id, state);
      } catch (error) {
        this.tasks.delete(id);
        throw error;
      }
      void this.run(id, state).finally(() => this.tasks.delete(id));
      return structuredClone(state);
    } finally {
      this.locks.delete(id);
    }
  }
  async cancel(id) {
    if (this.locks.has(id)) throw new Error("Wait for the current job transition before cancelling.");
    this.locks.add(id);
    try {
      const state = this.states.get(id) ?? await this.status(id);
      if (state.instanceID !== this.instanceID) throw new Error("The original plugin instance is unavailable; inspect its journal.");
      state.cancelRequested = true;
      if (state.state === "prepared") {
        state.state = "cancelled";
        state.progress = "Cancelled before native import";
      }
      this.remember(id, state);
      await this.persist(id, state);
      return structuredClone(state);
    } finally {
      this.locks.delete(id);
    }
  }
  close() {
    for (const state of this.states.values()) state.cancelRequested = true;
  }
  payload(session) {
    return JSON.stringify({ info: session.info, messages: session.messages, location: session.info.location });
  }
  async run(id, state) {
    const directory = this.directory(id);
    try {
      const index = await readJsonFile(join2(directory, "prepared-index.json"), 8192);
      if (index.instanceID !== this.instanceID) throw new Error("The prepared import belongs to a different plugin instance.");
      for (let number = 0; number < index.count; number++) {
        if (state.cancelRequested) break;
        const session = await readJsonFile(join2(directory, `prepared-${number}.json`), MAX_IMPORT_JSON_BYTES);
        state.progress = `Importing session ${number + 1} of ${index.count}`;
        state.inFlight = { sessionID: session.info.id, phase: "import" };
        await this.persist(id, state);
        if (state.cancelRequested) {
          delete state.inFlight;
          break;
        }
        try {
          const result = await this.native("/api/experimental/session/import", "POST", this.payload(session));
          await result.body?.cancel();
          state.sessions.push(session.info.id);
        } catch (error) {
          try {
            const result = await this.native(`/api/session/${session.info.id}`), info = await result.json();
            if ((info.data ?? info).id === session.info.id) state.sessions.push(session.info.id);
            else state.uncertainSessions = [session.info.id];
          } catch {
            state.uncertainSessions = [session.info.id];
          }
          throw error;
        }
        state.inFlight = { sessionID: session.info.id, phase: "verify" };
        await this.persist(id, state);
        await this.verify(session);
        for (const [entryNumber, entry] of (session.instructions ?? []).entries()) {
          if (state.cancelRequested) break;
          state.inFlight = { sessionID: session.info.id, phase: "instructions", key: entry.key };
          await this.persist(id, state);
          if (state.cancelRequested) break;
          const result = await this.native(`/api/experimental/session/${session.info.id}/instructions/entries/${entry.key}`, "PUT", JSON.stringify({ value: entry.value }));
          await result.body?.cancel();
          await writePrivateJson(join2(directory, `instruction-${number}-${entryNumber}.json`), { sessionID: session.info.id, key: entry.key, completed: true });
        }
        if (!state.cancelRequested) {
          if (session.instructions?.length) {
            const result = await this.native(`/api/experimental/session/${session.info.id}/instructions/entries`), entries = await result.json();
            const values = new Map((entries.data ?? entries).map((entry) => [entry.key, entry.value]));
            for (const entry of session.instructions) if (!isDeepStrictEqual(values.get(entry.key), entry.value)) throw new Error("Instruction read-back does not match the prepared copy.");
          }
          state.finalized.push(session.info.id);
        }
        delete state.inFlight;
        await this.persist(id, state);
      }
      state.state = state.cancelRequested ? "cancelled" : "ready";
      state.progress = state.cancelRequested ? "Cancelled; already-created sessions and files were preserved. Instruction finalization may be incomplete." : "New sessions imported and verified";
    } catch (error) {
      state.state = "failed";
      state.error = error instanceof Error ? error.message : "Native import failed.";
      state.progress = "Import stopped; inspect created and uncertain session IDs before preparing another import";
    }
    try {
      await this.persist(id, state);
    } catch {
      state.state = "failed";
      state.error = "The final import journal could not be saved. Inspect the recorded session IDs before another import.";
    }
  }
  async verify(session) {
    const response = await this.native(`/api/session/${session.info.id}`), body = await response.json(), info = body.data ?? body;
    if (info.id !== session.info.id || info.parentID !== session.info.parentID || info.location?.directory !== session.info.location.directory || !isDeepStrictEqual(info.metadata?.openchamber?.context_obligatory_messages, session.info.metadata?.openchamber?.context_obligatory_messages)) throw new Error("Imported session identity, location, parent or pins did not match the prepared copy.");
    let cursor, count = 0;
    const seen = /* @__PURE__ */ new Set();
    do {
      const query = cursor ? `cursor=${encodeURIComponent(cursor)}&limit=100` : "order=asc&limit=100";
      const result = await this.native(`/api/session/${session.info.id}/message?${query}`), page = await result.json();
      const messages = page.data ?? page;
      if (!Array.isArray(messages)) throw new Error("Imported transcript verification returned an unsupported page.");
      for (const actual of messages) {
        const expected = session.messages[count++];
        if (!expected || actual.id !== expected.id || actual.type !== expected.type) throw new Error("The official importer omitted or reordered a message. Created sessions were preserved for inspection.");
        for (const field of ["text", "summary", "content", "files", "output", "time", "agent", "model", "status", "reason", "error", "native", "tokens", "cost", "shellID", "command", "exit", "agents", "skills", "description", "metadata"]) if (expected[field] !== void 0 && !isDeepStrictEqual(actual[field], expected[field])) throw new Error(`The official importer changed message ${field}. Inspect the new session and original ZIP.`);
      }
      cursor = page.cursor?.next;
      if (cursor && seen.has(cursor)) throw new Error("Imported transcript verification repeated a cursor.");
      if (cursor) seen.add(cursor);
    } while (cursor);
    if (count !== session.messages.length) throw new Error("Imported transcript count does not match the prepared copy.");
  }
};

// src/plugin-server.ts
var instances = /* @__PURE__ */ new Map();
var readRoute = /^\/api\/(?:info|session(?:\/active|\/ses_[a-zA-Z0-9_-]+(?:\/(?:message|context))?)?|experimental\/session\/ses_[a-zA-Z0-9_-]+\/(?:log|instructions\/entries))$/;
async function startPluginBridge(packageDirectory, version) {
  const { root, packageKey } = await channelPath(packageDirectory);
  let instance = instances.get(root);
  if (!instance) {
    instance = start(root, packageKey, version);
    instances.set(root, instance);
    instance.catch(() => instances.delete(root));
  }
  const running = await instance;
  return running.release();
}
async function start(root, packageKey, version) {
  const index = process.argv.indexOf("--port"), port = index >= 0 ? Number(process.argv[index + 1]) : NaN;
  const password = process.env.OPENCODE_PASSWORD || process.env.OPENCODE_SERVER_PASSWORD;
  if (!Number.isInteger(port) || port < 1 || port > 65535 || !password) throw new Error("Session transfer requires an explicitly managed OpenCode port and authentication. No discovery fallback was attempted.");
  const upstream = `http://127.0.0.1:${port}`, authorization = `Basic ${Buffer.from(`opencode:${password}`).toString("base64")}`;
  await privateDirectory(root);
  await privateDirectory(join3(root, "jobs"));
  const token = randomBytes(32).toString("hex"), expected = createHash2("sha256").update(`Bearer ${token}`).digest();
  const instanceID = randomUUID3();
  let references = 0;
  const native = async (path, method = "GET", body) => {
    const response = await fetch(upstream + path, {
      method,
      headers: { Authorization: authorization, "Content-Type": "application/json" },
      redirect: "error",
      signal: AbortSignal.timeout(12e4),
      ...body === void 0 ? {} : { body, duplex: "half" }
    });
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`The official OpenCode API refused ${method} (HTTP ${response.status}). No automatic retry was attempted.`);
    }
    return response;
  };
  const imports = new PluginImports(root, instanceID, native);
  const server = createServer(async (request, response) => {
    const supplied = typeof request.headers.authorization === "string" ? request.headers.authorization : "";
    if (request.headers.origin !== void 0 || !timingSafeEqual(createHash2("sha256").update(supplied).digest(), expected)) return json(response, 401, { error: "A private plugin capability is required." });
    try {
      const url = new URL(request.url ?? "/", upstream);
      if (url.pathname === "/identity" && request.method === "GET") return json(response, 200, descriptor);
      if (request.method === "GET" && readRoute.test(url.pathname)) {
        if (url.pathname.endsWith("/log") && url.searchParams.get("follow") !== "false") throw new Error("Only finite durable-log capture is supported.");
        const result = await native(url.pathname + url.search);
        response.writeHead(200, { "Content-Type": result.headers.get("content-type") ?? "application/json", "Cache-Control": "no-store" });
        if (result.body) await pipeline(Readable.fromWeb(result.body), response);
        else response.end();
        return;
      }
      const match = /^\/imports\/([a-f0-9-]+)\/(prepare|start|status|cancel)$/.exec(url.pathname);
      if (!match || !UUID.test(match[1])) return json(response, 404, { error: "Unknown plugin operation." });
      const [, id, action] = match;
      if (action === "status" && request.method === "GET") return json(response, 200, await imports.status(id));
      if (request.method === "POST" && action === "cancel") return json(response, 200, await imports.cancel(id));
      if (request.method === "POST" && action === "prepare") return json(response, 200, await imports.prepare(id));
      if (request.method === "POST" && action === "start") return json(response, 202, await imports.start(id));
      json(response, 405, { error: "Unsupported plugin method." });
    } catch (error) {
      if (!response.headersSent) json(response, 400, { error: error instanceof Error ? error.message : "Plugin operation failed." });
      else response.destroy();
    }
  });
  await new Promise((resolve2, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve2);
  });
  const descriptor = { schema: 1, hostPID: process.ppid, pid: process.pid, instanceID, packageKey, port: server.address().port, token, version };
  await writePrivateJson(join3(root, "connection.json"), descriptor);
  return {
    release() {
      references++;
      return async () => {
        if (--references) return;
        instances.delete(root);
        imports.close();
        try {
          const current = await readJsonFile(join3(root, "connection.json"), 8192);
          if (current.instanceID === descriptor.instanceID) await rm(join3(root, "connection.json"));
        } catch {
        }
        server.closeAllConnections();
        await new Promise((resolve2) => server.close(() => resolve2()));
      };
    }
  };
}
function json(response, status, value) {
  const result = { ...value };
  delete result.token;
  response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  response.end(JSON.stringify(result));
}

// src/plugin-entry.ts
var plugin_entry_default = {
  id: "openchamber-session-export",
  setup: (context) => startPluginBridge(fileURLToPath(new URL("..", import.meta.url)), context.app.version)
};
export {
  plugin_entry_default as default
};
