#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const outPath = path.join(proofDir, 'p0-live-action-brief.md');

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

const sapStatus = readJsonIfPresent(path.join(proofDir, 'sap-identity-status.latest.json'));
const urlStatus = readJsonIfPresent(path.join(proofDir, 'public-url-status.latest.json'));
const race = readJsonIfPresent(path.join(proofDir, 'race-mode-dashboard.latest.json'));
const readiness = readJsonIfPresent(path.join(proofDir, 'sap-mainnet-registration-readiness.latest.json'));

const lines = [
  '# P0 Live Action Brief',
  '',
  '**Status:** action brief only. This does not approve signing, transaction broadcast, spend, posting, repo creation, or Superteam submission.',
  '',
  '## Why now',
  '',
  'The bounty ranks real usage/activity. The current package is strong prep, but the biggest blocker is still SAP mainnet identity. Without that, the run is not fully credible for the listing.',
  '',
  '## Read-only status',
  '',
  `- Public URL status: ${urlStatus?.status || 'unknown'}`,
  `- SAP identity status: ${sapStatus?.status || 'unknown'}`,
  `- Race status: ${race?.status || 'unknown'}`,
  `- SAP readiness: ${readiness?.status || 'unknown'}`,
  '',
  '## Next live gate',
  '',
  'Complete SAP mainnet registration preview, then registration if the preview is clean and explicitly approved.',
  '',
  '## Approval needed',
  '',
  '- Wallet/provider to use.',
  '- Maximum fee/rent cap.',
  '- Confirmation of Solana mainnet.',
  '- Stop-before-signing preview first.',
  '- Separate approval before broadcast.',
  '',
  '## After SAP identity',
  '',
  '1. Re-run Synapse Explorer snapshot.',
  '2. Generate `proof/sap-identity-status.latest.json` with visible agent evidence.',
  '3. Run one atomic Ace workflow with one request id.',
  '4. Publish scoped repo and X walkthrough after review.',
  '5. Run approved legitimate Ace usage batches until deadline.',
  '',
  '## Current hard stop',
  '',
  sapStatus?.status === 'sap-identity-visible-in-explorer'
    ? 'SAP identity appears visible. Move to post-registration proof review and atomic run planning.'
    : 'SAP identity is not visible yet. Do not claim SAP mainnet registration until registration proof exists.',
  '',
];

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outPath, `${lines.join('\n')}\n`, 'utf8');
console.log(`Wrote P0 live action brief: ${outPath}`);
