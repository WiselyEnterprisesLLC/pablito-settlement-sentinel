#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const planPath = path.join(proofDir, 'end-to-end-run-plan.latest.json');
const approvalPath = path.join(proofDir, 'end-to-end-run-approval.draft.md');

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function successfulAceServiceProofs() {
  if (!fs.existsSync(proofDir)) return [];

  return fs.readdirSync(proofDir)
    .filter((name) => /^ace-service-proof\.[^.]+\.\d{8}T\d{9}Z\.json$/.test(name))
    .map((name) => ({ file: `proof/${name}`, proof: readJsonIfPresent(path.join(proofDir, name)) }))
    .filter((item) => item.proof?.ok === true)
    .map((item) => ({
      file: item.file,
      serviceId: item.proof.serviceId,
      httpStatus: item.proof.httpStatus,
      generatedAt: item.proof.generatedAt,
    }));
}

function markdownList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

const settlementBundle = readJsonIfPresent(path.join(proofDir, 'settlement-evidence-bundle.latest.json'));
const sapReadiness = readJsonIfPresent(path.join(proofDir, 'sap-mainnet-registration-readiness.latest.json'));
const sapGate = readJsonIfPresent(path.join(proofDir, 'sap-live-gate.latest.json'));
const aceProofs = successfulAceServiceProofs();
const aceServices = [...new Set(aceProofs.map((proof) => proof.serviceId).filter(Boolean))].sort();
const aceReady = aceServices.length >= 3;
const acePaymentReady = settlementBundle?.status === 'partial-live-ace-x402-evidence-bundled';
const sapReadyForPreview = sapReadiness?.status === 'ready-for-controlled-no-send-registration-preview';

const plan = {
  generatedAt: new Date().toISOString(),
  status: 'ready-to-request-controlled-live-run-after-sap-preview',
  bountyValidity: 'not a live-run proof; this is the exact plan for the missing atomic workflow evidence',
  safety: {
    signsWallet: false,
    sendsTransaction: false,
    spendsFunds: false,
    publishesPublicly: false,
    submitsBounty: false,
    storesSecretMaterial: false,
    mutatesNetwork: false,
  },
  currentSeparateEvidence: {
    sapRegistration: {
      status: sapReadyForPreview ? 'ready-for-no-send-preview' : 'not-ready',
      evidenceFiles: [
        'proof/sap-registration.preview.latest.json',
        'proof/sap-live-gate.latest.json',
        'proof/sap-mainnet-registration-readiness.latest.json',
      ],
      candidateWallet: sapGate?.candidateWallet || null,
      programAddress: sapGate?.sdk?.programAddress || null,
    },
    aceServices: {
      status: aceReady ? 'three-distinct-services-captured' : 'incomplete',
      distinctServiceIds: aceServices,
      proofFiles: aceProofs.map((proof) => proof.file),
    },
    acePayment: {
      status: acePaymentReady ? 'partial-live-ace-x402-payment-captured' : 'missing',
      evidenceFile: acePaymentReady ? 'proof/settlement-evidence-bundle.latest.json' : null,
      transaction: settlementBundle?.aceX402Payment?.transaction || null,
      orderState: settlementBundle?.aceX402Payment?.orderState || null,
    },
  },
  whySeparateEvidenceIsNotEnough: [
    'The listing asks for a complete autonomous workflow from trigger to execution to payment.',
    'Current SAP preview, Ace service proofs, and Ace x402 payment proof were captured as separate controlled steps.',
    'A strong final submission needs one request id and one evidence bundle that ties trigger, tool selection, service execution, payment artifact, and deliverable together.',
  ],
  recommendedAtomicRun: {
    category: 'Ace Data Cloud',
    requestIdShape: 'oobe-ace-live-run-YYYYMMDDTHHMMSSZ',
    trigger: 'A public-safe workflow request asking Pablito to inspect a small business lead/form handoff and produce a bounded fix plan.',
    runSteps: [
      'Preflight balances, configured tokens, public URLs, and SAP identity state.',
      'Select SAP/x402/Ace capability based on the request and record why that capability was chosen.',
      'Call one or more Ace Data Cloud services using public-safe input only.',
      'Attach the existing approved Ace x402 payment artifact if sponsor accepts it, or perform one new minimal payment only after explicit cost approval.',
      'Generate the public-safe deliverable and hash it.',
      'Write one final live-run evidence JSON that links every proof file, amount, service id, timestamp, and deliverable hash.',
      'Run public release checks again before any repo/X/Superteam action.',
    ],
    preferredCostMode: acePaymentReady
      ? 'reuse-existing-approved-Ace-x402-payment-artifact-if-accepted'
      : 'new-minimal-approved-x402-payment',
    maxCostModeNote: 'No max cost is approved here. Any new service call, payment, or signature needs a separate explicit cap.',
  },
  approvalRequiredBeforeAtomicRun: [
    'Choose whether the run may reuse the existing Ace x402 payment artifact or must perform a fresh minimal payment.',
    'Approve exact service calls and input text.',
    'Approve maximum service/payment cost if any new paid call is needed.',
    'Approve any SAP registration or wallet signature step separately.',
    'Approve public repo/X/Superteam actions separately after the run is captured.',
  ],
  finalEvidenceFileShape: {
    filePattern: 'proof/end-to-end-live-run.YYYYMMDDTHHMMSSZ.json',
    requiredFields: [
      'requestId',
      'triggerSummary',
      'sapIdentityEvidence',
      'capabilitySelectionReason',
      'aceServiceProofFiles',
      'paymentEvidenceFile',
      'paymentTransactionOrReceipt',
      'deliverableHash',
      'safetyReview',
      'manualInterventionCountDuringRun',
      'reviewerClaimLevel',
    ],
  },
  blockersBeforeFinalSubmission: [
    'SAP mainnet registration evidence remains missing.',
    'The current Ace payment/service proofs need to be tied into one atomic run or sponsor-confirmed as sufficient.',
    'Public repo has not been created.',
    'X walkthrough has not been posted.',
    'Superteam submission has not been sent.',
  ],
};

const approvalMarkdown = `# End-to-End Live Run Approval Packet - Draft Only

**Status:** DRAFT ONLY. This file does not approve a wallet signature, payment, service spend, public post, public repo, or bounty submission.

## Goal

Capture the missing atomic workflow proof for the OOBE x Ace bounty: trigger -> SAP/tool selection -> Ace service execution -> payment evidence -> deliverable.

## Current separate evidence

- **SAP:** ${sapReadyForPreview ? 'ready for controlled no-send preview, but no mainnet identity proof yet.' : 'not ready for preview.'}
- **Ace services:** ${aceReady ? `captured ${aceServices.length} distinct services: ${aceServices.join(', ')}.` : `captured ${aceServices.length} distinct service(s).`}
- **Ace x402 payment:** ${acePaymentReady ? `captured Base transaction ${settlementBundle?.aceX402Payment?.transaction || 'recorded in bundle'} with order state ${settlementBundle?.aceX402Payment?.orderState || 'recorded'}.` : 'not captured.'}

## Why this is still needed

${markdownList(plan.whySeparateEvidenceIsNotEnough)}

## Proposed run shape

${markdownList(plan.recommendedAtomicRun.runSteps)}

## Approval needed before execution

${markdownList(plan.approvalRequiredBeforeAtomicRun)}

## Hard rule

No new paid call, wallet signature, transaction broadcast, public repo, X post, or Superteam submission happens from this packet alone.

## Approval phrase shape

\`\`\`text
YES OOBE ACE ATOMIC RUN
Reuse existing Ace payment artifact: yes/no
Fresh payment max:
Service calls approved:
Input approved:
SAP registration already handled: yes/no
Public posting approved now: no
\`\`\`
`;

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');
fs.writeFileSync(approvalPath, approvalMarkdown, 'utf8');
console.log(`Wrote end-to-end run plan: ${planPath}`);
console.log(`Wrote end-to-end run approval draft: ${approvalPath}`);
