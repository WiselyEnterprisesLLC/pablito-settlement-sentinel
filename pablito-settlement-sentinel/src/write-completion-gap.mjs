#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const outPath = path.join(proofDir, 'completion-gap.latest.json');
const acePreviewPath = path.join(proofDir, 'ace-x402-requirements.preview.latest.json');
const aceLivePaymentPath = path.join(proofDir, 'ace-x402-live-payment.latest.json');
const aceOrderEvidencePath = path.join(proofDir, 'ace-order-evidence.latest.json');
const aceServiceProofLatestPath = path.join(proofDir, 'ace-service-proof.latest.json');
const settlementBundlePath = path.join(proofDir, 'settlement-evidence-bundle.latest.json');
const publicReleaseCheckPath = path.join(proofDir, 'public-release-check.latest.json');
const categoryRouteDecisionPath = path.join(proofDir, 'category-route-decision.md');
const synapseSnapshotPath = path.join(proofDir, 'synapse-explorer-snapshot.latest.json');
const sapReadinessPath = path.join(proofDir, 'sap-mainnet-registration-readiness.latest.json');
const e2eRunPlanPath = path.join(proofDir, 'end-to-end-run-plan.latest.json');

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

const acePreview = readJsonIfPresent(acePreviewPath);
const aceLivePayment = readJsonIfPresent(aceLivePaymentPath);
const aceOrderEvidence = readJsonIfPresent(aceOrderEvidencePath);
const aceServiceProofLatest = readJsonIfPresent(aceServiceProofLatestPath);
const settlementBundle = readJsonIfPresent(settlementBundlePath);
const publicReleaseCheck = readJsonIfPresent(publicReleaseCheckPath);
const synapseSnapshot = readJsonIfPresent(synapseSnapshotPath);
const sapReadiness = readJsonIfPresent(sapReadinessPath);
const e2eRunPlan = readJsonIfPresent(e2eRunPlanPath);
const aceRequirementsCaptured = (acePreview?.status === 'captured-402-requirements-no-sign-no-spend' && acePreview?.ok === true) || aceLivePayment?.ok === true;
const aceLivePaymentHelperReady = Boolean(aceLivePayment) || fs.existsSync(path.join(root, 'src', 'ace-x402-pay-live.mjs'));
const aceLivePaymentSettled = aceLivePayment?.ok === true && aceLivePayment?.safety?.spendsFunds === true && aceLivePayment?.paymentResponseHeaderPresent === true;
const acePaymentResponse = aceLivePayment?.paymentResponse || {};
const aceOrderState = aceLivePayment?.responsePublicSummary?.fields?.state || null;
const acePaymentTransaction = acePaymentResponse.transaction || null;
const aceOrderEvidenceSatisfied = aceOrderEvidence?.ok === true && aceOrderEvidence?.documentedPaymentStateSatisfied === true;
const settlementEvidenceBundled = settlementBundle?.status === 'partial-live-ace-x402-evidence-bundled';
const publicReleaseRedFlagFree = publicReleaseCheck?.redFlagCount === 0;
const categoryRouteDecisionExists = fs.existsSync(categoryRouteDecisionPath);
const aceServiceProofs = fs.existsSync(proofDir)
  ? fs.readdirSync(proofDir)
    .filter((name) => /^ace-service-proof\.[^.]+\.\d{8}T\d{9}Z\.json$/.test(name))
    .map((name) => ({ name, proof: readJsonIfPresent(path.join(proofDir, name)) }))
    .filter((item) => item.proof?.ok === true)
  : [];
const aceServiceAttempts = fs.existsSync(proofDir)
  ? fs.readdirSync(proofDir)
    .filter((name) => /^ace-service-proof\.[^.]+\.\d{8}T\d{9}Z\.json$/.test(name))
    .map((name) => ({ name, proof: readJsonIfPresent(path.join(proofDir, name)) }))
    .filter((item) => item.proof)
  : [];
const aceDistinctServiceIds = [...new Set(aceServiceProofs.map((item) => item.proof.serviceId).filter(Boolean))].sort();
const aceFailedServiceIds = [...new Set(
  aceServiceAttempts
    .filter((item) => item.proof?.ok !== true)
    .map((item) => `${item.proof.serviceId || 'unknown'}:${item.proof.httpStatus || item.proof.status || 'failed'}`),
)].sort();
const aceServicesSatisfied = aceDistinctServiceIds.length >= 3;

const requirements = [
  {
    id: 'route',
    requirement: 'Confirmed Superteam submission route',
    currentEvidence: categoryRouteDecisionExists
      ? 'Category/route decision file recommends Ace Data Cloud category and normal public Superteam route unless sponsor/platform confirms an agent API route.'
      : 'Public listing saved; agent API route still ambiguous.',
    status: categoryRouteDecisionExists ? 'recommended-awaiting-approval' : 'blocked',
    nextAction: categoryRouteDecisionExists
      ? 'Use proof/category-route-decision.md as the current recommendation; final external route action still needs approval.'
      : 'Wait for sponsor/platform reply or approve normal public Superteam route despite uncertainty.',
    approvalNeeded: true,
  },
  {
    id: 'sap_registration',
    requirement: 'SAP mainnet agent identity evidence',
    currentEvidence: sapReadiness
      ? 'Registration args, live gate, and SAP mainnet readiness packet exist; no wallet/provider connected.'
      : 'Registration args are drafted and previewed in proof/sap-registration.preview.latest.json; no wallet/provider connected.',
    status: 'ready-for-live-preview',
    nextAction: sapReadiness
      ? 'Use proof/sap-mainnet-registration-readiness.latest.json and proof/sap-mainnet-registration-approval.draft.md for the controlled no-send provider preview gate.'
      : 'Public metadata/x402 URLs are deployed and the SAP preview has no placeholder blockers. Next gate is pinned SDK/wallet transaction preview only, then explicit approval before any signing or send.',
    approvalNeeded: true,
  },
  {
    id: 'workflow',
    requirement: 'Complete automated workflow from trigger to execution to payment',
    currentEvidence: e2eRunPlan
      ? 'Deterministic dry-run exists, and the missing atomic run is now specified in proof/end-to-end-run-plan.latest.json.'
      : 'Deterministic dry-run workflow exists.',
    status: 'dry-run-ready',
    nextAction: e2eRunPlan
      ? 'After SAP preview/registration approval, run one request-id-scoped proof tying trigger, SAP/tool selection, Ace execution, payment artifact, and deliverable hash.'
      : 'Replace mocked Ace/Sentinel/service calls with approved live calls and capture evidence.',
    approvalNeeded: true,
  },
  {
    id: 'ace_services',
    requirement: 'At least 3 distinct Ace Data Cloud services if pursuing Ace category',
    currentEvidence: aceRequirementsCaptured
      ? aceLivePaymentSettled
        ? `One Ace order has an x402 payment artifact: HTTP ${aceLivePayment.httpStatus || 'unknown'}, order state ${aceOrderState || 'unknown'}, Base transaction ${acePaymentTransaction || 'recorded in proof'}. GET-order evidence status: ${aceOrderEvidenceSatisfied ? 'verified' : aceOrderEvidence?.httpStatus ? `blocked by Ace HTTP ${aceOrderEvidence.httpStatus}` : 'not captured'}. Distinct Ace API service proofs captured: ${aceDistinctServiceIds.length ? aceDistinctServiceIds.join(', ') : 'none yet'}. Earlier failed service-proof attempts retained for audit: ${aceFailedServiceIds.length ? aceFailedServiceIds.join(', ') : 'none recorded'}.`
        : 'One Ace unpaid order now has captured x402 402 requirements with no signing/spend; live-payment helper and approval packet exist, but still no paid/live Ace service execution and only one service route is identified.'
      : 'One local Ace-style classifier fixture only; Ace x402 requirements preview script exists but still needs a valid ACE_PLATFORM_TOKEN and ACE_X402_ORDER_ID.',
    status: aceServicesSatisfied ? 'live-proof-captured' : aceLivePaymentSettled ? 'partial-live-proof' : 'missing-live-proof',
    nextAction: aceRequirementsCaptured
      ? aceLivePaymentSettled
        ? aceServicesSatisfied
          ? 'Ace category service usage proof is captured. Keep the public-safe proof archives, cite the three successful services, and only run more Ace calls if the sponsor asks for paid-order evidence per service.'
          : aceFailedServiceIds.length
          ? 'Use Ace service-specific/global API credentials from acquired services; the latest no-store runner attempts reached Ace but returned 401, so the provided token is not valid for these service endpoints.'
          : 'Capture two or three distinct Ace API service proofs using API tokens/credits, or create/pay two more low-cost Ace service orders if the judging route specifically requires paid order evidence per service.'
        : 'Run the gated live x402 helper with a one-time Ace Platform Token after the Base wallet has at least 1.33 USDC; then capture live service output and repeat for two more distinct Ace services if pursuing Ace category.'
      : 'Create/login Ace account, create Platform Token, identify low-cost service orders, then run npm run proof:ace-x402-preview to capture 402 requirements without signing/spending.',
    approvalNeeded: !aceServicesSatisfied,
  },
  {
    id: 'sentinel',
    requirement: 'Synapse Sentinel usage if pursuing general category',
    currentEvidence: 'Known listing link and requirement only.',
    status: 'missing-live-proof',
    nextAction: 'Confirm Sentinel service flow and run one legitimate call after approval.',
    approvalNeeded: true,
  },
  {
    id: 'settlement',
    requirement: 'Real non-wash x402/SAP settlement or Ace facilitator evidence',
    currentEvidence: aceRequirementsCaptured
      ? aceLivePaymentSettled
        ? `Ace x402 payment artifact exists with HTTP ${aceLivePayment.httpStatus || 'unknown'}, payment response header present, order state ${aceOrderState || 'unknown'}, and Base transaction ${acePaymentTransaction || 'recorded in proof'}. ${settlementEvidenceBundled ? 'A reviewer-facing settlement evidence bundle now ties this artifact to Ace service usage proof.' : 'The documented GET-order verification endpoint returned ' + (aceOrderEvidence?.httpStatus || 'no result yet') + ' in the latest capture attempt.'}`
        : `Initial Ace x402 requirements captured: Base USDC maxAmountRequired ${acePreview.baseUsdcRequirements?.[0]?.maxAmountRequired || 'unknown'} to ${acePreview.baseUsdcRequirements?.[0]?.payTo || 'unknown'}; live-payment helper and approval appr_20260518022742_wg7log exist, but no receipt, transaction, or settlement yet.`
      : 'x402 headers and settlement proof are modeled; Ace requirements-capture script can fetch the initial 402 response when token/order are available; transaction signature remains null.',
    status: settlementEvidenceBundled ? 'partial-live-proof-bundled' : aceLivePaymentSettled ? 'partial-live-proof' : 'missing-live-proof',
    nextAction: aceRequirementsCaptured
      ? aceLivePaymentSettled
        ? settlementEvidenceBundled
          ? 'Use proof/settlement-evidence-bundle.latest.json as the public-safe citation point, then repeat/extend only where the bounty route requires it.'
          : 'Save the service output proof, connect the stored receipt/order fields to the public evidence packet, and repeat/extend only where the bounty route requires it.'
        : 'Use the gated managed-signer helper for the approved $1.33 Ace x402 payment after wallet balance preflight passes; do not use raw keys or personal fiat funding.'
      : 'First capture Ace 402 requirements with no X-PAYMENT. Then use approved service reason, small cost cap, managed signer route, and evidence capture for any actual settlement.',
    approvalNeeded: true,
  },
  {
    id: 'public_repo',
    requirement: 'Public GitHub repository',
    currentEvidence: publicReleaseCheck
      ? `Public export is staged; release check red flags: ${publicReleaseCheck.redFlagCount}, placeholder files: ${publicReleaseCheck.placeholderFileCount}.`
      : 'Public README and proof packet drafts exist locally.',
    status: publicReleaseRedFlagFree ? 'staged-red-flag-free-needs-approval' : 'ready-after-review',
    nextAction: publicReleaseRedFlagFree
      ? 'Create repo only after Paul approves the exact public repo action; fill final links afterward.'
      : 'Create repo only after public scan and approval.',
    approvalNeeded: true,
  },
  {
    id: 'x_demo',
    requirement: 'X walkthrough tagging OOBE and Ace',
    currentEvidence: 'Draft thread exists.',
    status: 'ready-after-live-proof',
    nextAction: 'Post only after live evidence links are real and public copy is approved.',
    approvalNeeded: true,
  },
  {
    id: 'submission',
    requirement: 'Final Superteam submission',
    currentEvidence: 'Final-shape draft exists with placeholders.',
    status: 'blocked',
    nextAction: 'Submit only after route, live evidence, public repo, and X post are complete and approved.',
    approvalNeeded: true,
  },
];

const summary = {
  generatedAt: new Date().toISOString(),
  overallStatus: 'prep-advanced-live-completion-still-gated',
  readyNow: [
    'local dry-run proof',
    'no-sign SAP registration argument preview',
    sapReadiness
      ? 'SAP mainnet registration readiness/approval packet generated'
      : 'SAP mainnet readiness packet still needs generation',
    synapseSnapshot
      ? 'read-only Synapse Explorer snapshot captured for before/after SAP registration proof'
      : 'Synapse Explorer read-only snapshot runner installed; run npm run proof:synapse-snapshot',
    'no-sign live-path rehearsal packet',
    e2eRunPlan
      ? 'atomic end-to-end live-run plan generated'
      : 'atomic end-to-end live-run plan still needs generation',
    aceLivePaymentSettled
      ? `Ace x402 payment artifact recorded for one order: HTTP ${aceLivePayment.httpStatus || 'unknown'}, state ${aceOrderState || 'unknown'}, Base transaction ${acePaymentTransaction || 'recorded'}`
      : aceRequirementsCaptured
        ? 'Ace x402 402 requirements captured for one unpaid order, no signing/spend'
        : 'Ace x402 requirements-capture script, blocked until token/order exist',
    aceLivePaymentHelperReady
      ? 'gated Ace x402 live-payment helper installed with managed CDP signer path and approval appr_20260518022742_wg7log'
      : 'Ace x402 live-payment helper not installed',
    settlementEvidenceBundled
      ? 'reviewer-facing settlement evidence bundle ties the approved Ace x402 artifact to Ace service proofs'
      : 'settlement evidence bundle writer installed; run npm run proof:settlement-bundle',
    'public-safe metadata/x402 drafts',
    'reviewer index',
    'risk register',
    categoryRouteDecisionExists
      ? 'category/route decision recommends Ace category and normal public Superteam route'
      : 'category/route decision still needs to be written',
    publicReleaseRedFlagFree
      ? 'public export release check has zero red flags'
      : 'public export release check pending or has red flags',
    'approval packet template',
    'X/submission drafts',
    aceDistinctServiceIds.length
      ? `Ace API service proof runner captured ${aceDistinctServiceIds.length} distinct services: ${aceDistinctServiceIds.join(', ')}`
      : aceServiceProofLatest
        ? `Ace API service proof runner attempted live calls; latest status ${aceServiceProofLatest.httpStatus || aceServiceProofLatest.status}. Needs Ace service-specific/global API token(s), not the rejected credential.`
        : 'Ace API service proof runner installed for OpenAI chat, Gemini chat, and SERP; needs service API token(s) to execute',
  ],
  cannotClaimYet: [
    'SAP mainnet identity',
    ...(aceServicesSatisfied ? [] : ['Ace Data Cloud usage']),
    'Synapse Sentinel usage',
    'full SAP settlement package',
    'public GitHub repository',
    'X walkthrough',
    'Superteam final submission',
    'reward/payment',
  ],
  requirements,
};

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`Wrote completion gap: ${outPath}`);
