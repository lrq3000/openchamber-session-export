import { createReadStream, createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { once } from 'node:events';
import { Readable, type Duplex } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import parser, { type Token } from 'stream-json/parser.js';
import pick from 'stream-json/filters/pick.js';
import stringer from 'stream-json/stringer.js';

export type JsonPath = readonly (string | number)[];
export type JsonSelector = (path: (string | number | null)[], token: Token) => boolean;
export type JsonScalar = string | number | boolean | null;
const BUFFER_BYTES = 64 * 1024;
const stringifier = () => stringer.asStream({ useKeyValues: true });

/** Disk-backed JSON, with unpacked value tokens. Selecting text never assembles its complete string in memory. */
export class JsonDocument {
  constructor(readonly path: string) {}

  static async capture(source: AsyncIterable<string | Uint8Array>, path: string): Promise<JsonDocument> {
    await mkdir(dirname(path), { recursive: true });
    await pipeline(Readable.from(source, { objectMode: false, highWaterMark: BUFFER_BYTES }), createWriteStream(path, { flags: 'wx', mode: 0o600 }));
    const document = new JsonDocument(path);
    // Validate the complete source before treating it as captured evidence. Failed staging is retained, never published.
    for await (const _ of document.tokens()) { /* Validation consumes tokens, not a giant assembled value. */ }
    return document;
  }

  async *tokens(path: JsonPath | JsonSelector = []): AsyncGenerator<Token> {
    const input = createReadStream(this.path, { highWaterMark: BUFFER_BYTES });
    const parsed = parser.asStream({ packKeys: true, streamKeys: false, packStrings: false, packNumbers: false });
    const selected = typeof path === 'function' ? pick.asStream({ filter: (stack, token) => path(stack, token) }) : path.length ? pick.asStream({ filter: stack => stack.length === path.length && path.every((key, index) => stack[index] === key) }) : undefined;
    const output = selected ?? parsed;
    let failure: unknown;
    const completed = (selected ? pipeline(input, parsed, selected) : pipeline(input, parsed)).catch(error => { failure = error; });
    try {
      for await (const token of output) yield token as Token;
      await completed;
      if (failure) throw failure;
    } finally {
      // Early scalar selection intentionally ends the pipeline; do not leave a read-ahead parser or descriptor alive.
      input.destroy(); parsed.destroy(); selected?.destroy(); await completed;
    }
  }

  async kind(path: JsonPath = []): Promise<'object' | 'array' | 'string' | 'number' | 'boolean' | 'null' | undefined> {
    for await (const token of this.tokens(path)) {
      if (token.name === 'startObject') return 'object';
      if (token.name === 'startArray') return 'array';
      if (token.name === 'startString') return 'string';
      if (token.name === 'startNumber') return 'number';
      if (token.name === 'trueValue' || token.name === 'falseValue') return 'boolean';
      if (token.name === 'nullValue') return 'null';
    }
    return undefined;
  }

  /** Only schema-sized control fields use this helper; evidence strings use text()/json() instead. */
  async scalar(path: JsonPath, maxBytes = 8192): Promise<JsonScalar | undefined> {
    let text = '', bytes = 0, kind = '';
    for await (const token of this.tokens(path)) {
      if (token.name === 'startObject' || token.name === 'startArray') return undefined;
      if (token.name === 'startString' || token.name === 'startNumber') kind = token.name;
      if (token.name === 'stringChunk' || token.name === 'numberChunk') {
        bytes += Buffer.byteLength(token.value);
        if (bytes > maxBytes) throw new Error('A JSON control field exceeds its metadata size limit.');
        text += token.value;
      }
      if (token.name === 'endString') return text;
      if (token.name === 'endNumber') return Number(text);
      if (token.name === 'trueValue' || token.name === 'falseValue' || token.name === 'nullValue') return token.value;
    }
    if (kind) throw new Error('A JSON control value ended unexpectedly.');
    return undefined;
  }

  async *text(path: JsonPath): AsyncGenerator<string> {
    let string = false;
    for await (const token of this.tokens(path)) {
      if (token.name === 'startString') { string = true; continue; }
      if (token.name === 'stringChunk' && string) yield token.value;
      else if (token.name === 'endString' && string) return;
      else throw new Error('The selected JSON value is not text.');
    }
  }

  /** Select small reference strings at any depth; oversized/non-string values remain in the evidence, not in inventory metadata. */
  async *stringsWhere(select: JsonSelector, maxBytes = 4096): AsyncGenerator<string> {
    let text = '', bytes = 0, string = false;
    for await (const token of this.tokens((stack, token) => token.name === 'startString' && select(stack, token))) {
      if (token.name === 'startString') { text = ''; bytes = 0; string = true; }
      else if (token.name === 'stringChunk' && string) { bytes += Buffer.byteLength(token.value); if (bytes <= maxBytes) text += token.value; else text = ''; }
      else if (token.name === 'endString' && string) { if (bytes <= maxBytes) yield text; string = false; }
    }
  }

  async *json(path: JsonPath = []): AsyncGenerator<string> {
    const input = Readable.from(this.tokens(path)), output = stringifier();
    output.setEncoding('utf8');
    let failure: unknown;
    const completed = pipeline(input, output).catch(error => { failure = error; });
    try {
      for await (const chunk of output) yield String(chunk);
      await completed; if (failure) throw failure;
    } finally { input.destroy(); output.destroy(); await completed; }
  }

  /** Split one array in a single pass. Each item is staged before yielding, so even one enormous message stays disk-backed. */
  async *array(path: JsonPath, directory: string): AsyncGenerator<JsonDocument> {
    await mkdir(directory, { recursive: true });
    let array = false, ended = false, depth = 0, index = 0;
    let writer: Duplex | undefined, itemPath = '', completed: Promise<void> | undefined, failure: unknown;
    const prefix = randomUUID();
    try {
      for await (const token of this.tokens(path)) {
        if (!array) {
          if (token.name !== 'startArray') throw new Error('The selected JSON page is not an array.');
          array = true; continue;
        }
        if (!writer && token.name === 'endArray') { ended = true; break; }
        if (!writer) {
          itemPath = join(directory, `${prefix}-${index++}.json`); writer = stringifier(); failure = undefined;
          completed = pipeline(writer, createWriteStream(itemPath, { flags: 'wx', mode: 0o600 })).catch(error => { failure = error; });
        }
        if (['startObject', 'startArray', 'startString', 'startNumber'].includes(token.name)) depth++;
        if (['endObject', 'endArray', 'endString', 'endNumber'].includes(token.name)) depth--;
        if (failure) throw failure;
        if (!writer.write(token)) await once(writer, 'drain');
        if (depth === 0) {
          writer.end(); await completed; if (failure) throw failure;
          writer = undefined; completed = undefined;
          yield new JsonDocument(itemPath);
        }
      }
      if (!array || !ended || writer) throw new Error('The selected JSON array is missing or incomplete.');
    } finally { writer?.destroy(); await completed; }
  }
}
