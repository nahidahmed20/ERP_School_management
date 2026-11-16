import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const buildRoot = resolve(projectRoot, 'public/build');
const manifestPath = resolve(buildRoot, 'manifest.json');

if (!existsSync(manifestPath)) {
    throw new Error('Vite build did not create public/build/manifest.json.');
}

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
const missingFiles = [];

for (const [source, entry] of Object.entries(manifest)) {
    for (const file of [entry.file, ...(entry.css ?? []), ...(entry.assets ?? [])]) {
        if (file && !existsSync(resolve(buildRoot, file))) {
            missingFiles.push(`${source} -> ${file}`);
        }
    }
}

if (missingFiles.length > 0) {
    throw new Error(`Vite manifest references missing build files:\n${missingFiles.join('\n')}`);
}

if (existsSync(resolve(projectRoot, 'public/hot'))) {
    throw new Error('public/hot still exists; production would use the Vite dev server.');
}

console.log(`Production build verified: ${Object.keys(manifest).length} manifest entries in public/build.`);
console.log('Next: commit and push the source changes and public/build/, then run the cPanel deploy script.');
