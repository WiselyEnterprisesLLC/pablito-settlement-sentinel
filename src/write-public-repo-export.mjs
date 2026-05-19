#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const exportRoot = path.join(root, '.public-export', 'pablito-settlement-sentinel');

const fileAllowList = [
  'README.md',
  'SUBMISSION_SCOPE.md',
  'agent.manifest.draft.json',
  'package.json',
];

const dirAllowList = [
  'docs',
  'proof',
  'public',
  'src',
];

const excludedPathParts = new Set([
  '.git',
  '.public-export',
  '_archive',
  'node_modules',
]);

const excludedBasenames = new Set([
  'ACE_ACCOUNT_AND_X402_SETUP.md',
  'HANDOFF_TO_LOCAL_CODEX.md',
  'LOCAL_CODEX_QA_AND_NEXT_GATES.md',
  'NEXT_LIVE_STEPS.md',
  'package-lock.json',
]);

const sensitiveNamePatterns = [
  /\.env$/i,
  /credential/i,
  /secret/i,
  /token/i,
  /private/i,
  /wallet-secret/i,
];

function ensureInside(parent, child) {
  const relative = path.relative(parent, child);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`Refusing path outside ${parent}: ${child}`);
  }
}

function rmDirSafe(dir) {
  ensureInside(path.join(root, '.public-export'), dir);
  fs.rmSync(dir, { recursive: true, force: true });
}

function shouldSkip(relativePath) {
  const parts = relativePath.split(/[\\/]+/).filter(Boolean);
  if (parts.some((part) => excludedPathParts.has(part))) return true;
  const base = path.basename(relativePath);
  if (excludedBasenames.has(base)) return true;
  if (sensitiveNamePatterns.some((pattern) => pattern.test(relativePath))) return true;
  return false;
}

function copyFile(relativePath) {
  if (shouldSkip(relativePath)) return false;
  const source = path.join(root, relativePath);
  const target = path.join(exportRoot, relativePath);
  if (!fs.existsSync(source) || !fs.statSync(source).isFile()) return false;
  ensureInside(root, source);
  ensureInside(exportRoot, target);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  return true;
}

function walk(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(root, absolute).replace(/\\/g, '/');
    if (shouldSkip(relative)) continue;
    if (entry.isDirectory()) {
      files.push(...walk(absolute, base));
    } else if (entry.isFile()) {
      files.push(relative);
    }
  }
  return files;
}

function writeSummary(copied, skipped) {
  const repositoryUrl = process.env.PUBLIC_REPOSITORY_URL || '';
  const repositoryCommit = process.env.PUBLIC_REPOSITORY_COMMIT || '';
  const published = Boolean(repositoryUrl);
  const summary = {
    generatedAt: new Date().toISOString(),
    status: published ? 'public-repo-published' : 'public-repo-export-staged-not-published',
    repositoryUrl: repositoryUrl || null,
    repositoryCommit: repositoryCommit || null,
    exportPath: '.public-export/pablito-settlement-sentinel',
    copiedCount: copied.length,
    skippedCount: skipped.length,
    skipped,
    safetyBoundary: {
      publishesPublicly: published,
      createsRepo: false,
      signsWallet: false,
      spendsFunds: false,
      storesSecrets: false,
    },
    nextExternalStep: published
      ? 'Use repository URL and commit in the X walkthrough and Superteam submission.'
      : 'Create public GitHub repository only after final private-data review and explicit approval.',
  };
  fs.writeFileSync(
    path.join(exportRoot, 'PUBLIC_EXPORT_SUMMARY.json'),
    `${JSON.stringify(summary, null, 2)}\n`,
    'utf8',
  );
}

fs.mkdirSync(path.dirname(exportRoot), { recursive: true });
rmDirSafe(exportRoot);
fs.mkdirSync(exportRoot, { recursive: true });

const copied = [];
const skipped = [];

for (const relativePath of fileAllowList) {
  if (copyFile(relativePath)) copied.push(relativePath);
}

for (const dirName of dirAllowList) {
  for (const relativePath of walk(path.join(root, dirName))) {
    if (copyFile(relativePath)) copied.push(relativePath);
    else skipped.push(relativePath);
  }
}

writeSummary(copied.sort(), skipped.sort());

console.log(`Staged public repo export: ${exportRoot}`);
console.log(`Copied ${copied.length} file(s).`);
