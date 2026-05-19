#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const exportRoot = path.join(root, '.public-export', 'pablito-settlement-sentinel');
const proofDir = path.join(root, 'proof');
const outPath = path.join(proofDir, 'public-release-check.latest.json');

const textExtensions = new Set(['.md', '.json', '.mjs', '.js', '.html', '.txt']);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];

  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(absolute));
    } else if (textExtensions.has(path.extname(entry.name))) {
      files.push(absolute);
    }
  }
  return files;
}

function relativeToExport(filePath) {
  return path.relative(exportRoot, filePath).replace(/\\/g, '/');
}

const redFlagPatterns = [
  { id: 'windows_user_path', pattern: /C:\\Users\\paulw/i },
  { id: 'openclaw_private_path', pattern: /\/home\/node\/\.openclaw\/(?!workspace\/bounty-oobe-ace-agent)/i },
  { id: 'ssh_material_path', pattern: /\.ssh[\\/]/i },
  { id: 'known_personal_email', pattern: /\b(paulwisely@gmail\.com|paul@wiselyenterprisesllc\.com|pwisely@superior-bulk\.com)\b/i },
  { id: 'pem_secret_block', pattern: /BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY/i },
  { id: 'openai_secret_shape', pattern: /\bsk-[A-Za-z0-9_-]{20,}\b/ },
  { id: 'xox_secret_shape', pattern: /\bxox[a-z]-[A-Za-z0-9-]{20,}\b/i },
  { id: 'bearer_secret_shape', pattern: /Bearer\s+[A-Za-z0-9._~+/=-]{24,}/i },
];

const placeholderPatterns = [
  /\[[A-Z0-9_./ -]{4,}\]/g,
  /\[pending[:\] ]/gi,
  /PUBLIC_REPO_URL/g,
  /COMMIT_HASH/g,
  /X_OR_VIDEO_URL/g,
];

const files = walk(exportRoot);
const redFlags = [];
const placeholders = [];

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = relativeToExport(file);

  for (const { id, pattern } of redFlagPatterns) {
    if (pattern.test(content)) {
      redFlags.push({ file: relativePath, id });
    }
  }

  if (!relativePath.startsWith('src/')) {
    for (const pattern of placeholderPatterns) {
      const matches = content.match(pattern) || [];
      if (matches.length) {
        placeholders.push({
          file: relativePath,
          count: matches.length,
          pattern: pattern.source,
        });
      }
    }
  }
}

const placeholderFiles = [...new Set(placeholders.map((item) => item.file))].sort();
const status = redFlags.length
  ? 'blocked-red-flags-found'
  : placeholderFiles.length
    ? 'staged-review-needed-placeholders-present'
    : 'ready-for-publication-approval';

const summary = {
  generatedAt: new Date().toISOString(),
  status,
  exportPath: '.public-export/pablito-settlement-sentinel',
  scannedFileCount: files.length,
  redFlagCount: redFlags.length,
  redFlags,
  placeholderFileCount: placeholderFiles.length,
  placeholderFiles,
  safetyBoundary: {
    publishesPublicly: false,
    createsRepo: false,
    signsWallet: false,
    spendsFunds: false,
    storesSecrets: false,
  },
  nextAction: redFlags.length
    ? 'Remove red-flagged content before publishing.'
    : placeholderFiles.length
      ? 'Review placeholder files. Some placeholders are expected in drafts; final public submission links must be filled before posting/submitting.'
      : 'Ready for explicit approval to create/publish the public repository.',
};

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`Wrote public release check: ${outPath}`);

if (redFlags.length) {
  process.exitCode = 1;
}
