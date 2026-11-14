import { ConnectionResolver } from './connection.js';
import { SessionSource } from './opencode.js';
import { createService } from './service.js';

const token = process.env.OPENCHAMBER_SERVICE_TOKEN;
const port = Number(process.env.OPENCHAMBER_SERVICE_PORT);
if (!token || !Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Start this service through OpenChamber.');
const resolver = new ConnectionResolver();
const server = createService(token, {
  capture: async target => new SessionSource(await resolver.resolve()).capture(target),
  connection: async () => ({ version: (await resolver.resolve()).version, transport: 'host-opencode' }),
});
server.listen(port, '127.0.0.1');
process.once('SIGTERM', () => server.close());
