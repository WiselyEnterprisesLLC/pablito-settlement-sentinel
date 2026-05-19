#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const docsDir = path.join(root, 'docs');
const outPath = path.join(proofDir, 'listing-requirements-check.latest.json');

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function fileExists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
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

function status(value, evidence, nextAction, required = true) {
  return { status: value, required, evidence, nextAction };
}

const listing = readJsonIfPresent(path.join(docsDir, 'superteam-listing.json'));
const completionGap = readJsonIfPresent(path.join(proofDir, 'completion-gap.latest.json'));
const releaseCheck = readJsonIfPresent(path.join(proofDir, 'public-release-check.latest.json'));
const settlementBundle = readJsonIfPresent(path.join(proofDir, 'settlement-evidence-bundle.latest.json'));
const sapIdentity = readJsonIfPresent(path.join(proofDir, 'sap-identity-status.latest.json'));
const e2eLive = readJsonIfPresent(path.join(proofDir, 'end-to-end-live-run.latest.json'));
const publicSummary = readJsonIfPresent(path.join(root, '.public-export', 'pablito-settlement-sentinel', 'PUBLIC_EXPORT_SUMMARY.json'))
  || readJsonIfPresent(path.join(root, 'PUBLIC_EXPORT_SUMMARY.json'));
const sapGate = readJsonIfPresent(path.join(proofDir, 'sap-live-gate.latest.json'));
const sapReadiness = readJsonIfPresent(path.join(proofDir, 'sap-mainnet-registration-readiness.latest.json'));
const e2eRunPlan = readJsonIfPresent(path.join(proofDir, 'end-to-end-run-plan.latest.json'));
const aceProofs = successfulAceServiceProofs();
const distinctAceServices = [...new Set(aceProofs.map((proof) => proof.serviceId).filter(Boolean))].sort();
const aceThreeServicesSatisfied = distinctAceServices.length >= 3;
const acePaymentBundled = settlementBundle?.status === 'partial-live-ace-x402-evidence-bundled';
const aceOnChainProofCount = settlementBundle?.aceX402Payments?.onChainProofCount || 0;
const publicExportRedFlagFree = releaseCheck?.redFlagCount === 0;
const publicRepoStaged = fileExists('.public-export/pablito-settlement-sentinel/PUBLIC_EXPORT_SUMMARY.json');
const publicRepoPublished = Boolean(publicSummary?.repositoryUrl);
const categoryDecisionExists = fileExists('proof/category-route-decision.md');
const sapRegistered = ['registered-live-identity-found', 'sap-identity-visible-in-explorer'].includes(sapIdentity?.status);
const atomicRunCaptured = e2eLive?.ok === true;
const xPostUrl = process.env.X_POST_URL || '';
const xPostPublished = /^https:\/\/x\.com\/Pablito_WE\/status\/\d+$/i.test(xPostUrl);

const commonRequirements = {
  listingOpen: status(
    listing?.status === 'OPEN' ? 'satisfied-captured' : 'needs-refresh',
    listing ? `Captured listing status: ${listing.status}; deadline: ${listing.deadline || 'unknown'}. Live page should be checked again before final submit.` : 'No local listing snapshot.',
    'Refresh listing page immediately before final public submission.',
  ),
  publicGithubRepository: status(
    publicRepoPublished ? 'published' : publicExportRedFlagFree && publicRepoStaged ? 'staged-not-published' : 'not-ready',
    publicRepoPublished
      ? `Public repository is live: ${publicSummary.repositoryUrl}; commit: ${publicSummary.repositoryCommit || 'unknown'}.`
      : publicExportRedFlagFree
      ? `Public export is staged with ${releaseCheck.redFlagCount} red flags and ${releaseCheck.placeholderFileCount} placeholder file(s).`
      : 'Public export/release check is missing or not clean.',
    publicRepoPublished ? 'Use repo URL/commit in X walkthrough and Superteam submission.' : 'Publish the scoped export only after explicit approval; then fill final repo URL and commit hash.',
  ),
  xSubmissionPost: status(
    xPostPublished ? 'posted' : 'missing-public-post',
    xPostPublished
      ? `X walkthrough post is live: ${xPostUrl}.`
      : fileExists('proof/x-walkthrough-draft.md') ? 'X walkthrough draft exists, but no public post has been made.' : 'No X walkthrough draft found.',
    xPostPublished ? 'Use the X post URL in the Superteam submission.' : 'After public repo exists, approve and post walkthrough tagging @OOBEonSol and @AceDataCloud.',
  ),
  demoWalkthrough: status(
    'draft-ready-needs-public-link',
    fileExists('public/oobe-ace-proof.html') ? 'HTML proof page and X walkthrough draft exist in staged export.' : 'No staged demo/walkthrough artifact found.',
    'Publish repo and use the X thread/video/walkthrough to show discovery, service use, execution, payment, and autonomy.',
  ),
  categoryDeclared: status(
    categoryDecisionExists ? 'recommended-not-final' : 'missing',
    categoryDecisionExists ? 'Recommendation exists: Ace Data Cloud category primary.' : 'No category decision file found.',
    'State Ace Data Cloud category in the final X post and Superteam submission unless sponsor says to use another route.',
  ),
};

const aceCategory = {
  sapMainnetRegistration: status(
    sapRegistered ? 'satisfied-live-proof' : 'missing-live-proof',
    sapRegistered
      ? `SAP registration transaction captured: ${sapIdentity.liveRegistration?.signature || 'see proof/sap-registration.live.latest.json'}.`
      : sapReadiness
      ? `Readiness packet exists for program ${sapGate?.sdk?.programAddress || 'unknown'} and wallet ${sapGate?.candidateWallet || 'unknown'}; no provider connection or transaction evidence yet.`
      : sapGate
        ? `No-sign plan exists for program ${sapGate.sdk?.programAddress || 'unknown'} and wallet ${sapGate.candidateWallet || 'unknown'}.`
        : 'No SAP live gate plan found.',
    sapRegistered
      ? 'Attach proof/sap-registration.live.latest.json and proof/sap-identity-status.latest.json; keep refreshing Explorer indexing snapshots.'
      : sapReadiness
      ? 'Use proof/sap-mainnet-registration-approval.draft.md for the next controlled no-send provider-preview gate.'
      : 'Run a controlled SAP mainnet registration preview, then execute only after exact approval for wallet/sign/fee/send.',
  ),
  completeAutomatedWorkflow: status(
    atomicRunCaptured ? 'satisfied-live-proof' : 'partial-live-proof-needs-single-run',
    atomicRunCaptured
      ? `Atomic live run captured: ${e2eLive.requestId || 'see proof/end-to-end-live-run.latest.json'}.`
      : e2eRunPlan
      ? 'Dry-run proves the shape; separate Ace service/x402 proofs exist; the atomic run plan now specifies the one request-id-scoped proof still needed.'
      : 'Dry-run proves the shape; live Ace service proofs and x402 artifact exist separately. The exact listing asks for trigger -> execution -> payment without manual input.',
    atomicRunCaptured
      ? 'Attach proof/end-to-end-live-run.latest.json and public deliverable hash.'
      : e2eRunPlan
      ? 'Use proof/end-to-end-run-approval.draft.md after SAP preview/registration approval to capture one clean live/autonomous run.'
      : 'Capture one clean live/autonomous run log tying trigger, tool/SAP selection, Ace service execution, and payment artifact together.',
  ),
  aceAccount: status(
    aceThreeServicesSatisfied ? 'functionally-satisfied-private-account-not-published' : 'needs-proof',
    aceThreeServicesSatisfied ? 'Successful Ace API service proofs imply an Ace account/API credential was used; account details are intentionally private.' : 'Ace account/service usage proof incomplete.',
    'Do not publish account details; cite service proof summaries only.',
  ),
  x402AceFacilitatorWithSynapseRpc: status(
    aceOnChainProofCount >= 3 ? 'satisfied-three-base-proofs' : acePaymentBundled ? 'partial-live-proof' : 'missing-live-proof',
    aceOnChainProofCount >= 3
      ? `Three Ace x402 Base payment proofs captured; SAP identity is ${sapRegistered ? 'registered' : 'not yet registered'}.`
      : acePaymentBundled
      ? 'Ace x402 payment artifact exists with Base transaction and order state; more proof is needed before claiming three on-chain proofs.'
      : 'No bundled Ace x402 artifact found.',
    aceOnChainProofCount >= 3 ? 'Attach proof/ace-x402-onchain-batch.latest.json.' : 'Capture the remaining legitimate low-cost Ace x402 proofs.',
  ),
  threeDistinctAceServices: status(
    aceThreeServicesSatisfied ? 'satisfied' : 'missing',
    aceThreeServicesSatisfied ? `Captured distinct services: ${distinctAceServices.join(', ')}.` : `Captured only ${distinctAceServices.length} distinct service(s).`,
    aceThreeServicesSatisfied ? 'No more Ace services needed unless sponsor asks for paid-order evidence per service.' : 'Capture additional distinct Ace service proofs.',
  ),
};

const generalCategory = {
  sapMainnetRegistration: status(
    'missing-live-proof',
    sapGate ? 'No-sign SAP registration plan exists; no mainnet registration proof yet.' : 'No SAP live gate plan found.',
    'Same SAP registration requirement as Ace category.',
  ),
  completeAutomatedWorkflow: status(
    'partial-live-proof-needs-single-run',
    'Dry-run exists; live end-to-end run remains missing.',
    'Capture one clean trigger -> execution -> payment workflow.',
  ),
  escrowWithSynapseRpc: status(
    'missing-live-proof',
    'Current live payment artifact is Ace x402 facilitator/Base USDC, not SAP on-chain escrow volume.',
    'Only pursue if sponsor says this is necessary or if a cheap, legitimate escrow path is confirmed.',
  ),
  aiCapability: status(
    'satisfied-for-ace-partial-for-general',
    'Ace OpenAI/Gemini/SERP proof shows AI/data capability; general route still needs SAP/Sentinel context.',
    'For general route, tie AI capability to SAP/Sentinel workflow evidence.',
  ),
  synapseSentinel: status(
    'missing-live-proof',
    'Synapse Sentinel route notes exist, but no legitimate Sentinel service call has been captured.',
    'Capture one Sentinel usage proof only if quick/cheap/officially identifiable.',
  ),
};

const submissionPackage = {
  xPostMustIncludeShortDemo: commonRequirements.demoWalkthrough,
  xPostMustTagOobeAndAce: status(
    'draft-ready-not-posted',
    'X walkthrough draft includes the needed structure; final post still needs real public links.',
    'Approve exact X text after public repo exists.',
  ),
  xPostMustExplainAgentProblem: status(
    'draft-ready-not-posted',
    'Draft explains Pablito Settlement Sentinel and the workflow leak/problem.',
    'Review final text before posting.',
  ),
  xPostMustStateCategory: commonRequirements.categoryDeclared,
  xPostMustShareGithubRepo: commonRequirements.publicGithubRepository,
};

const maxPayoutStrategy = {
  recommendation: 'Optimize for first place in Ace Data Cloud category; add Sentinel/SAP bonus proof only if it is fast and does not delay the Ace submission.',
  rationale: [
    'Both listed categories have the same prize shape: 1st 700 USDC, 2nd 500 USDC.',
    'The listing says a participant can win in only one category, so doing both does not double the payout.',
    'Ace category is strongest because three Ace services and one Ace x402 payment artifact are already captured.',
    'General category still needs escrow volume and Sentinel proof, which are heavier and less complete.',
  ],
};

const summary = {
  generatedAt: new Date().toISOString(),
  listing: listing
    ? {
      id: listing.id,
      title: listing.title,
      status: listing.status,
      deadline: listing.deadline,
      rewardAmount: listing.rewardAmount,
      token: listing.token,
      submissionsSeenOnLocalSnapshot: listing._count?.Comments ?? null,
    }
    : null,
  overallVerdict: 'not-yet-submission-complete',
  highestExpectedValuePath: 'Ace Data Cloud category primary; optional Sentinel bonus only if cheap and quick.',
  maxPayoutStrategy,
  commonRequirements,
  aceCategory,
  generalCategory,
  submissionPackage,
  minimalRemainingForStrongAceSubmission: [
    sapRegistered ? null : 'SAP mainnet registration proof.',
    atomicRunCaptured ? null : 'One clean end-to-end autonomous run tying trigger, SAP/tool selection, Ace service execution, and x402 payment evidence.',
    aceOnChainProofCount >= 3 ? null : 'Clear Synapse/SAP/RPC linkage explanation for the Ace facilitator path, or sponsor confirmation that current Ace facilitator evidence is sufficient.',
    publicRepoPublished ? null : 'Public GitHub repo from the red-flag-free export.',
    'Approved X walkthrough post with required tags/category/repo/demo.',
    'Final Superteam submission through the approved public route.',
  ].filter(Boolean),
};

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`Wrote listing requirements check: ${outPath}`);
