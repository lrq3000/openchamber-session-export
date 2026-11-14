import { build } from 'esbuild';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

/** Keep full upstream notices inside the bundles so Git, folder and installer distributions all retain them. */
async function licenseBanner(packages) {
  const notices = await Promise.all(packages.map(async name => {
    const license = await readFile(new URL(`../node_modules/${name}/LICENSE`, import.meta.url), 'utf8');
    return `${name}\n${license.replace(/\r\n/g, '\n').trim()}`;
  }));
  return `/*! Bundled third-party licenses\n\n${notices.join('\n\n')}\n*/`;
}

await build({ entryPoints: ['src/panel.ts'], outfile: 'openchamber/panel/app.js', bundle: true, format: 'iife', target: 'es2022', logLevel: 'warning', banner: { js: await licenseBanner(['@openchamber/sdk']) } });
await build({ entryPoints: ['src/service-entry.ts'], outfile: 'openchamber/service.cjs', bundle: true, platform: 'node', format: 'cjs', target: 'node22', logLevel: 'warning', define: { 'import.meta.url': '""' }, banner: { js: await licenseBanner(['yazl', 'yauzl', 'pend', 'buffer-crc32', 'stream-json', 'stream-chain']) } });
await mkdir('openchamber/plugin', { recursive: true });
await build({ entryPoints: ['src/plugin-entry.ts'], outfile: 'openchamber/plugin/index.js', bundle: true, platform: 'node', format: 'esm', target: 'node22', logLevel: 'warning' });
await writeFile('openchamber/plugin/package.json', JSON.stringify({ name: 'openchamber-session-export-backend', private: true, type: 'module', exports: { '.': './index.js' } }, null, 2) + '\n');
