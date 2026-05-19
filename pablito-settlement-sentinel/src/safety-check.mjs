#!/usr/bin/env node

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { runDryRunDemo } from './dry-run-demo.mjs';

const root = path.resolve(import.meta.dirname, '..');

function collectFiles(relativeDir, extensions = new Set(['.md', '.json'])) {
  const absoluteDir = path.join(root, relativeDir);
  if (!fs.existsSync(absoluteDir)) return [];

  const found = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const relativePath = path.join(relativeDir, entry.name);
    if (entry.isDirectory()) {
      found.push(...collectFiles(relativePath, extensions));
    } else if (extensions.has(path.extname(entry.name))) {
      found.push(relativePath);
    }
  }
  return found;
}

const filesToScan = [
  'README.md',
  'package.json',
  'agent.manifest.draft.json',
  'docs/live-action-gate.md',
  'NEXT_LIVE_STEPS.md',
  ...collectFiles('proof'),
  ...collectFiles('public'),
  'src/dry-run-demo.mjs',
  'src/sap-sdk-dry-run-adapter.mjs',
  'src/write-sap-live-gate.mjs',
  'src/write-sap-registration-readiness.mjs',
  'src/write-end-to-end-run-plan.mjs',
  'src/write-competitive-scorecard.mjs',
  'src/write-race-mode-dashboard.mjs',
  'src/write-legitimate-usage-campaign.mjs',
  'src/write-atomic-run-evidence-template.mjs',
  'src/write-proof-page.mjs',
  'src/write-public-submission-copy.mjs',
  'src/write-public-url-status.mjs',
  'src/write-sap-identity-status.mjs',
  'src/write-p0-live-action-brief.mjs',
  'src/write-public-repo-export.mjs',
  'src/public-safe-deliverable.mjs',
];

const uniqueFilesToScan = [...new Set(filesToScan)].sort();

const forbiddenSecretPatterns = [
  ['private', '[_-]?', 'key'].join(''),
  ['seed', '\\s+', 'phrase'].join(''),
  'mnemonic',
  'BEGIN (RSA|OPENSSH|EC|PRIVATE) KEY',
  ['api', '[_-]?', 'key', '\\s*[:=]\\s*[\'\"][A-Za-z0-9_\\-]{16,}'].join(''),
  ['wallet', '\\.', 'json'].join(''),
  ['Keypair', '\\.', 'fromSecretKey'].join(''),
].map((pattern) => new RegExp(pattern, 'i'));

const forbiddenRuntimePatterns = [
  /sendTransaction\s*\(/,
  /\.register\s*\(/,
  /preparePayment\s*\(/,
  /\.settle\s*\(/,
  /connect\s*\(.*wallet/i,
  /fetch\s*\(\s*['"]https?:/i,
  /tweet|postToX|publish_x|submitBounty/i,
];

const forbiddenPublicOverclaimPatterns = [
  /\b(completed|executed|settled|submitted|registered)\s+(a\s+)?live\s+(SAP|x402|payment|settlement|mainnet|bounty)/i,
  /\b(real|live)\s+(x402|SAP)\s+(payment|settlement|transaction)\s+(completed|executed|confirmed|submitted)/i,
  /\bbounty[- ]valid\s+(payment\s+)?volume\s+(completed|generated|achieved|proven)/i,
  /\b2,?400\s+USD\s+prize\b/i,
  /\$2,400\s+prize\s+to\s+(us|me|Pablito|Wisely)\b/i,
  /\b(guaranteed|secured|locked[- ]in)\s+(payout|prize|reward)\b/i,
  /\b2,?400\s+USDC\s+(won|earned|paid|received|secured)\b/i,
];

const forbiddenPrivateInfoPatterns = [
  /paul@[a-z0-9.-]+/i,
  /paul\s+wisely/i,
  /openclaw\/(memory|config|runtime|logs)/i,
  /\/home\/node\/\.openclaw\/(?!workspace\/bounty-oobe-ace-agent)/i,
];

const pendingLiveProofClaimPatterns = [
  /\bsubmitted\b/i,
  /\bwon\b/i,
  /\bpaid\b/i,
  /\blive\s+tx\b/i,
  /\blive\s+transaction\b/i,
  /\bsettlementTxSignature\s*[:=]\s*['"][1-9A-HJ-NP-Za-km-z]{64,}['"]/i,
  /\btx\s+signature\s*[:=]\s*['"][1-9A-HJ-NP-Za-km-z]{64,}['"]/i,
  /\b[1-9A-HJ-NP-Za-km-z]{80,88}\b/,
];

function lineIsExplicitlyMockOrDryRun(line) {
  return /mock|dry[- ]run|placeholder|pending/i.test(line);
}

function extractJsonFence(markdown) {
  const match = markdown.match(/```json\s*([\s\S]*?)\s*```/i);
  return match ? match[1] : null;
}

function validateBlankLiveEvidenceTemplate() {
  const file = 'proof/live-evidence-template.md';
  const absolutePath = path.join(root, file);
  if (!fs.existsSync(absolutePath)) return [];

  const errors = [];
  const content = fs.readFileSync(absolutePath, 'utf8');
  const jsonText = extractJsonFence(content);
  if (!jsonText) {
    return [`${file}: missing fenced JSON template`];
  }

  let template;
  try {
    template = JSON.parse(jsonText);
  } catch (error) {
    return [`${file}: fenced JSON template is invalid JSON: ${error.message}`];
  }

  const allowedNonNullPaths = new Map([
    ['status', 'blank-template-not-live-evidence'],
    ['bounty.listingTitle', 'Autonomous Agent Bounty: OOBE × Ace Data Cloud'],
    ['bounty.listedRewardAmount', '2,400 USDC prize pool / listed reward amount'],
  ]);

  function visit(value, dottedPath) {
    if (allowedNonNullPaths.has(dottedPath)) {
      if (value !== allowedNonNullPaths.get(dottedPath)) {
        errors.push(`${file}: ${dottedPath} changed from the approved template constant`);
      }
      return;
    }

    if (Array.isArray(value)) {
      if (value.length !== 0) {
        errors.push(`${file}: ${dottedPath} must remain an empty array until live approval/evidence exists`);
      }
      return;
    }

    if (value && typeof value === 'object') {
      for (const [key, nestedValue] of Object.entries(value)) {
        visit(nestedValue, dottedPath ? `${dottedPath}.${key}` : key);
      }
      return;
    }

    if (value !== null) {
      errors.push(`${file}: ${dottedPath} must remain null until live approval/evidence exists`);
    }
  }

  visit(template, '');
  return errors;
}

let failed = false;
for (const file of uniqueFilesToScan) {
  const content = fs.readFileSync(path.join(root, file), 'utf8');
  for (const pattern of forbiddenSecretPatterns) {
    if (pattern.test(content)) {
      console.error(`Secret-safety check failed in ${file}: ${pattern}`);
      failed = true;
    }
  }

  if (file.startsWith('src/')) {
    for (const pattern of forbiddenRuntimePatterns) {
      if (pattern.test(content)) {
        console.error(`Mutation-safety check failed in ${file}: ${pattern}`);
        failed = true;
      }
    }
  }

  if (file.startsWith('proof/') || file.startsWith('public/')) {
    for (const pattern of forbiddenPublicOverclaimPatterns) {
      if (pattern.test(content)) {
        console.error(`Public/proof overclaim check failed in ${file}: ${pattern}`);
        failed = true;
      }
    }

    for (const pattern of forbiddenPrivateInfoPatterns) {
      if (pattern.test(content)) {
        console.error(`Public/proof private-info check failed in ${file}: ${pattern}`);
        failed = true;
      }
    }

    if (content.includes('PENDING LIVE PROOF')) {
      const lines = content.split(/\r?\n/);
      lines.forEach((line, index) => {
        if (lineIsExplicitlyMockOrDryRun(line)) return;
        for (const pattern of pendingLiveProofClaimPatterns) {
          if (pattern.test(line)) {
            console.error(`Pending-live-proof claim guard failed in ${file}:${index + 1}: ${pattern}`);
            failed = true;
          }
        }
      });
    }
  }
}

for (const error of validateBlankLiveEvidenceTemplate()) {
  console.error(`Live-evidence template guard failed: ${error}`);
  failed = true;
}

const demo = runDryRunDemo();
assert.equal(demo.safety.spendsFunds, false, 'demo must not spend funds');
assert.equal(demo.safety.signsWallet, false, 'demo must not sign wallet');
assert.equal(demo.safety.connectsAccount, false, 'demo must not connect accounts');
assert.equal(demo.safety.publishesPublicly, false, 'demo must not publish');
assert.equal(demo.safety.artificialVolume, false, 'demo must not create artificial volume');
assert.equal(demo.safety.importsSapSdk, false, 'demo must not import SDK in dry run');
assert.equal(demo.workflow.settlementProof.publicProof.settlementTxSignature, null, 'dry-run settlement tx must be null');
assert.equal(demo.workflow.aiServiceCall.mocked, true, 'AI service call must be labeled mocked');
assert.equal(demo.workflow.publicDeliverable.publicSafety.claimsLivePayment, false, 'deliverable must not claim live payment');
assert.ok(demo.mockedVsLive.liveRequired.length >= 5, 'live blockers must remain explicit');

if (failed) process.exit(1);
console.log('Safety check passed: no obvious secrets, signing/spend/public-post code, or live-payment claims in scaffold.');
