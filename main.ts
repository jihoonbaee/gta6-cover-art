import { cpSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(process.env.MAKEFUN_OUTPUT_DIR || '/output');
mkdirSync(output, { recursive: true });
cpSync(resolve(root, 'app'), resolve(output, 'app'), { recursive: true });
const screenshots = resolve(output, 'screenshots');
mkdirSync(screenshots, { recursive: true });
try { cpSync(resolve(root, 'screenshots'), screenshots, { recursive: true }); } catch (error) { if (error.code !== 'ENOENT') throw error; }
const dossier = await buildDossier(output, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000
});
writeFileSync(resolve(output, 'dossier.json'), Buffer.from(dossier));
