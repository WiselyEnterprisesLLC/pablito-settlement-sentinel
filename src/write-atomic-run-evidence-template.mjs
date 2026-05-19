#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const outPath = path.join(proofDir, 'end-to-end-live-run.template.json');

const template = {
  status: 'blank-template-not-live-evidence',
  requestId: null,
  category: 'Ace Data Cloud Usage',
  startedAt: null,
  finishedAt: null,
  manualInterventionCountDuringRun: null,
  triggerSummary: null,
  sapIdentityEvidence: {
    registeredWallet: null,
    agentPda: null,
    registrationTransaction: null,
    explorerUrl: null,
    snapshotFile: null,
  },
  capabilitySelection: {
    selectedCapability: null,
    selectedServices: [],
    reason: null,
  },
  aceServiceExecutions: [],
  paymentEvidence: {
    paymentPath: null,
    evidenceFile: null,
    transactionOrReceipt: null,
    amount: null,
    asset: null,
  },
  deliverable: {
    title: null,
    publicSafeSummary: null,
    file: null,
    sha256: null,
  },
  autonomyEvidence: {
    preflightFile: null,
    runLogFile: null,
    approvalPacketFile: null,
    unexpectedPauses: [],
  },
  safetyReview: {
    containsSecrets: null,
    containsPrivateData: null,
    artificialVolume: null,
    publicClaimsReviewed: null,
  },
  reviewerClaimLevel: [
    'Fill only after approved live run evidence exists.',
    'Do not claim final bounty completion from this blank template.',
  ],
};

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
console.log(`Wrote atomic live-run evidence template: ${outPath}`);
