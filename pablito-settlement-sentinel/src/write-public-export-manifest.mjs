#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const exportRoot = path.join(root, '.public-export', 'pablito-settlement-sentinel');
const proofDir = path.join(root, 'proof');
const outPath = path.join(proofDir, 'public-export-manifest.latest.json');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(absolute));
    } else {
      files.push(absolute);
    }
  }
  return files;
}

function sha256(filePath) {
  return crypto.createHash('sha256').update(fs.readFileSync(filePath)).digest('hex');
}

function relativeToExport(filePath) {
  return path.relative(exportRoot, filePath).replace(/\\/g, '/');
}

const files = walk(exportRoot)
  .map((filePath) => ({
    path: relativeToExport(filePath),
    bytes: fs.statSync(filePath).size,
    sha256: sha256(filePath),
  }))
  .sort((a, b) => a.path.localeCompare(b.path));

const requiredFiles = [
  'README.md',
  'SUBMISSION_SCOPE.md',
  'PUBLIC_EXPORT_SUMMARY.json',
  'proof/completion-gap.latest.json',
  'proof/settlement-evidence-bundle.latest.json',
  'proof/public-release-check.latest.json',
  'proof/ace-x402-live-payment.latest.json',
  'proof/ace-service-proof.latest.json',
  'proof/dry-run-proof.latest.json',
  'public/README.md',
];

const presentPaths = new Set(files.map((file) => file.path));
const missingRequiredFiles = requiredFiles.filter((file) => !presentPaths.has(file));

const summary = {
  generatedAt: new Date().toISOString(),
  status: missingRequiredFiles.length ? 'manifest-created-missing-required-files' : 'manifest-created',
  note: 'Manifest is generated from the staged export before the manifest itself is copied into the export.',
  exportPath: '.public-export/pablito-settlement-sentinel',
  fileCount: files.length,
  totalBytes: files.reduce((sum, file) => sum + file.bytes, 0),
  missingRequiredFiles,
  safetyBoundary: {
    publishesPublicly: false,
    createsRepo: false,
    signsWallet: false,
    spendsFunds: false,
    storesSecrets: false,
  },
  files,
};

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`Wrote public export manifest: ${outPath}`);

if (missingRequiredFiles.length) {
  process.exitCode = 1;
}
