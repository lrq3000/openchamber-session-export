import { build } from 'esbuild';

await build({ entryPoints: ['src/panel.ts'], outfile: 'openchamber/panel/app.js', bundle: true, format: 'iife', target: 'es2022', logLevel: 'warning' });
await build({ entryPoints: ['src/service-entry.ts'], outfile: 'openchamber/service.cjs', bundle: true, platform: 'node', format: 'cjs', target: 'node22', logLevel: 'warning' });
