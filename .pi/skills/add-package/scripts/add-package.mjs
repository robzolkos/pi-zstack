#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const packageArg = process.argv[2]?.trim();

if (!packageArg || ['-h', '--help'].includes(packageArg)) {
  console.error('Usage: node .pi/skills/add-package/scripts/add-package.mjs <npm-package-name>');
  process.exit(packageArg ? 0 : 1);
}

const packageName = packageArg.replace(/^npm:/, '');

if (!isValidNpmPackageName(packageName)) {
  console.error(`Invalid npm package name: ${packageArg}`);
  process.exit(1);
}

function isValidNpmPackageName(name) {
  return /^(?:@[a-z0-9][a-z0-9._~-]*\/[a-z0-9][a-z0-9._~-]*|[a-z0-9][a-z0-9._~-]*)$/.test(name);
}

function npmView(field) {
  try {
    const stdout = execFileSync('npm', ['view', packageName, field, '--json'], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    }).trim();
    return stdout ? JSON.parse(stdout) : undefined;
  } catch (error) {
    if (field === 'version') throw error;
    return undefined;
  }
}

function sortUnique(values) {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function toArray(value) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

function resourcePath(resource) {
  return path.posix.join('node_modules', packageName, String(resource).replace(/^\.\//, ''));
}

function readJson(file) {
  return JSON.parse(readFileSync(path.join(root, file), 'utf8'));
}

function writeJson(file, value) {
  writeFileSync(path.join(root, file), `${JSON.stringify(value, null, 2)}\n`);
}

const version = npmView('version');
const piManifest = npmView('pi') ?? {};

const packageJson = readJson('package.json');
packageJson.dependencies ??= {};
packageJson.dependencies[packageName] = `^${version}`;
packageJson.bundledDependencies = sortUnique([...(packageJson.bundledDependencies ?? []), packageName]);
packageJson.pi ??= {};

for (const key of ['extensions', 'skills', 'prompts', 'themes']) {
  const resources = toArray(piManifest[key]).map(resourcePath);
  if (resources.length > 0) {
    packageJson.pi[key] = sortUnique([...(packageJson.pi[key] ?? []), ...resources]);
  }
}

writeJson('package.json', packageJson);

const packagesPath = path.join(root, 'packages.txt');
const packagesText = readFileSync(packagesPath, 'utf8');
const packageLine = `npm:${packageName}`;
const packageLines = packagesText.split(/\r?\n/);
const headerLines = packageLines.filter((line) => line.trim().startsWith('#') || line.trim() === '');
const existingPackageLines = packageLines
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));
const updatedPackageLines = sortUnique([...existingPackageLines, packageLine]);
writeFileSync(packagesPath, `${headerLines.join('\n').replace(/\n+$/, '')}\n${updatedPackageLines.join('\n')}\n`);

const readmePath = path.join(root, 'README.md');
const readme = readFileSync(readmePath, 'utf8');
const packageNames = updatedPackageLines
  .filter((line) => line.startsWith('npm:'))
  .map((line) => line.slice('npm:'.length));
const readmeList = packageNames
  .map((name) => `- [\`${name}\`](https://www.npmjs.com/package/${encodeURIComponent(name).replace('%40', '@').replace('%2F', '/')})`)
  .join('\n');
const updatedReadme = readme.replace(
  /Current packages:\n\n(?:- .*\n?)+/,
  `Current packages:\n\n${readmeList}\n`,
);
if (updatedReadme === readme && !readme.includes(`\`${packageName}\``)) {
  console.error('Could not update README.md package list.');
  process.exit(1);
}
writeFileSync(readmePath, updatedReadme);

if (existsSync(path.join(root, 'package-lock.json'))) {
  execFileSync('npm', ['install', '--package-lock-only', '--ignore-scripts', '--fund=false', '--audit=false'], {
    cwd: root,
    stdio: 'inherit',
  });
}

console.log(`Added npm:${packageName} (^${version}) to pi-zstack.`);
if (Object.keys(piManifest).length === 0) {
  console.log('No published pi manifest was found; package.json pi resource paths were not changed.');
}
