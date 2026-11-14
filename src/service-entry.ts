import { ConnectionResolver } from './connection.js';
import { SessionSource } from './opencode.js';
import { createService } from './service.js';
import { PluginClient } from './plugin-client.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { homedir } from 'node:os';
import { channelPath } from './private-channel.js';

const token = process.env.OPENCHAMBER_SERVICE_TOKEN;
const port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
if (!token || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Start this service through OpenChamber.');
const resolver = new ConnectionResolver();
const packageDirectory = typeof __dirname === 'string' ? __dirname : dirname(fileURLToPath(import.meta.url));
const plugin = () => PluginClient.connect(packageDirectory);
async function start(): Promise<void> {
  const dataDirectory = process.env.OPENCHAMBER_SERVICE_DATA_DIR ?? join(homedir(), '.openchamber-session-export', 'service-data', (await channelPath(packageDirectory)).packageKey);
  const server = createService(token!, {
    capture: async (target, options) => {
      let connection;
      try { connection = (await plugin()).connection(); }
      catch {
        if (options?.profile === 'resume') throw new Error('Approve the bundled OpenCode plugin and open this project before preparing a resume snapshot.');
        connection = await resolver.resolve();
      }
      return new SessionSource(connection).capture(target, options);
    },
    connection: async () => {
      try { return { version: (await plugin()).connection().version, transport: 'bundled-plugin' }; }
      catch { return { version: (await resolver.resolve()).version, transport: 'host-opencode' }; }
    },
  }, { plugin, dataDirectory });
  server.listen(port, '127.0.0.1');
  process.once('SIGTERM', () => server.close());
}
void start().catch(() => { console.error('Session Export could not initialize its private service directory.'); process.exitCode = 1; });
