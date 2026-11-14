import { fileURLToPath } from 'node:url';
import { startPluginBridge } from './plugin-server.js';

// OpenChamber installs a built, self-contained plugin folder. Node built-ins
// remain external; no package-manager installation is needed on the host.
export default {
  id: 'openchamber-session-export',
  setup: (context: { app: { version: string } }) => startPluginBridge(fileURLToPath(new URL('..', import.meta.url)), context.app.version),
};
