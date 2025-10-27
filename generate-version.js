import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagePath = join(__dirname, 'package.json');
const versionFilePath = join(__dirname, 'src', 'version.ts');

const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
const version = pkg.version;

const content = `export const APP_VERSION = '${version}';\n`;

writeFileSync(versionFilePath, content);

console.log(`Generated version file with version ${version}`);
