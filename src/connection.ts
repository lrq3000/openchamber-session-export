import type { Connection } from './opencode.js';

/** Use the approved host connection on every OS; never guess an OpenCode instance from settings, ports or credentials. */
export class ConnectionResolver {
  constructor(private environment: NodeJS.ProcessEnv = process.env) {}

  async resolve(): Promise<Connection> {
    const address = this.environment.OPENCHAMBER_OPENCODE_URL;
    const token = this.environment.OPENCHAMBER_SERVICE_TOKEN;
    if (!address || !token) throw new Error('OpenChamber OpenCode access is unavailable. Use OpenChamber >=2.7.1 and approve this extension’s service and OpenCode access.');
    // Match the supplied spelling, not URL's permissive normalization (127.1, whitespace, credentials and alternate paths).
    const match = /^http:\/\/(?:127\.0\.0\.1|\[::1\]):([0-9]{1,5})\/?$/.exec(address);
    if (!match || match[0] !== address || Number(match[1]) < 1 || Number(match[1]) > 65535 || token.length > 8192 || /[^\x21-\x7e]/.test(token)) throw new Error('The host-provided OpenChamber connection is invalid. No fallback discovery was attempted.');
    // The native allowlist excludes /api/info. Unknown is explicit, never the host version masquerading as OpenCode's.
    return { url: new URL(address).href, version: null, token };
  }
}
