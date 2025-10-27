import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packagePath = join(__dirname, 'package.json');

const pkg = JSON.parse(readFileSync(packagePath, 'utf-8'));
const currentVersion = pkg.version;

const [major, minor, patch] = currentVersion.split('.').map(Number);

let newMajor = major;
let newMinor = minor;
let newPatch = patch + 1;

if (newPatch >= 100) {
  newPatch = 0;
  newMinor += 1;
}

if (newMinor >= 100) {
  newMinor = 0;
  newMajor += 1;
}

const newVersion = `${newMajor}.${newMinor}.${newPatch}`;

pkg.version = newVersion;

writeFileSync(packagePath, JSON.stringify(pkg, null, 2) + '\n');

console.log(`Version bumped from ${currentVersion} to ${newVersion}`);
