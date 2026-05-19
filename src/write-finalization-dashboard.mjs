#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const dashboardJsonPath = path.join(proofDir, 'finalization-dashboard.latest.json');
const dashboardMdPath = path.join(proofDir, 'finalization-dashboard.latest.md');
const approvalPacketPath = path.join(proofDir, 'final-publication-approval.packet.md');

function readJsonIfPresent(relativePath) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));
  } catch {
    return null;
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function newestArchivedEndToEndRun() {
  if (!fs.existsSync(proofDir)) return null;
  return fs.readdirSync(proofDir)
    .filter((name) => /^end-to-end-live-run\.\d{8}T\d{6}Z\.json$/.test(name))
    .sort()
    .at(-1) || null;
}

function publicRepoUrl() {
  const draft = readJsonIfPresent('.public-export/pablito-settlement-sentinel/PUBLIC_EXPORT_SUMMARY.json') || readJsonIfPresent('PUBLIC_EXPORT_SUMMARY.json');
  return draft?.repositoryUrl || null;
}

function gate(id, label, status, nextAction, approvalRequired, evidence = []) {
  return { id, label, status, approvalRequired, nextAction, evidence };
}

function bool(value) {
  return Boolean(value);
}

function markdownGateRows(gates) {
  return gates
    .map((item) => `| ${item.label} | ${item.status} | ${item.approvalRequired ? 'yes' : 'no'} | ${item.nextAction} |`)
    .join('\n');
}

const listingCheck = readJsonIfPresent('proof/listing-requirements-check.latest.json');
const liveListing = readJsonIfPresent('proof/live-listing-refresh.latest.json');
const releaseCheck = readJsonIfPresent('proof/public-release-check.latest.json');
const manifest = readJsonIfPresent('proof/public-export-manifest.latest.json');
const completion = readJsonIfPresent('proof/completion-gap.latest.json');
const settlement = readJsonIfPresent('proof/settlement-evidence-bundle.latest.json');
const sapReadiness = readJsonIfPresent('proof/sap-mainnet-registration-readiness.latest.json');
const publicUrl = readJsonIfPresent('proof/public-url-status.latest.json');
const sapIdentity = readJsonIfPresent('proof/sap-identity-status.latest.json');
const race = readJsonIfPresent('proof/race-mode-dashboard.latest.json');
const newestRunFile = newestArchivedEndToEndRun();

const releaseClean = releaseCheck?.redFlagCount === 0 && releaseCheck?.placeholderFileCount === 0;
const exportReady = releaseClean && bool(manifest?.fileCount || manifest?.files?.length);
const aceServicesReady = (settlement?.aceServiceUsage?.distinctServiceCount || 0) >= 3;
const acePaymentReady = settlement?.aceX402Payment?.ok === true
  && settlement?.aceX402Payment?.orderState === 'Finished'
  && Boolean(settlement?.aceX402Payment?.transaction);
const aceOnChainProofCount = settlement?.aceX402Payments?.onChainProofCount ?? (acePaymentReady ? 1 : 0);
const aceThreeOnChainReady = aceOnChainProofCount >= 3;
const sapReadyForPreview = sapReadiness?.status === 'ready-for-controlled-no-send-registration-preview';
const sapRegistered = [
  'registered-live-identity-found',
  'sap-identity-visible-in-explorer',
].includes(sapIdentity?.status);
const atomicRunCaptured = Boolean(newestRunFile);
const repoPublished = Boolean(publicRepoUrl()) || listingCheck?.commonRequirements?.publicGithubRepository?.status === 'published';
const xPosted = listingCheck?.commonRequirements?.xSubmissionPost?.status === 'posted';
const superteamSubmitted = completion?.requirements?.some((item) => item.id === 'submission' && item.status === 'submitted');
const livePrizeAmount = Number(String(liveListing?.listing?.totalPrizes || '').replace(/[^\d.]/g, '')) || null;

const gates = [
  gate(
    'public_export',
    'Scoped public export',
    exportReady ? 'ready' : 'not-ready',
    !exportReady
      ? 'Fix release scan and export manifest first.'
      : repoPublished
        ? 'Public GitHub repo has been published from the scoped export; keep proof links current.'
        : 'Review and approve creating the public GitHub repo from .public-export/pablito-settlement-sentinel.',
    exportReady ? !repoPublished : true,
    ['proof/public-release-check.latest.json', 'proof/public-export-manifest.latest.json'],
  ),
  gate(
    'ace_services',
    'Ace service usage',
    aceServicesReady ? 'captured' : 'missing',
    aceServicesReady ? 'No more service breadth is required for the minimum Ace category proof.' : 'Capture at least three successful Ace service summaries.',
    false,
    ['proof/settlement-evidence-bundle.latest.json', 'proof/ace-service-proof.*.json'],
  ),
  gate(
    'ace_x402_payment',
    'Ace x402 payment artifact',
    acePaymentReady ? 'captured' : 'missing',
    acePaymentReady ? 'Use the redacted payment artifact as the first Ace x402 on-chain proof.' : 'Capture one approved minimal x402 payment artifact.',
    false,
    ['proof/ace-x402-live-payment.latest.json', 'proof/settlement-evidence-bundle.latest.json'],
  ),
  gate(
    'ace_x402_three_onchain',
    'Three Ace x402 on-chain proofs',
    aceThreeOnChainReady ? 'captured' : 'missing',
    aceThreeOnChainReady ? 'Attach the bundled on-chain proof list to the submission.' : `Need ${Math.max(0, 3 - aceOnChainProofCount)} more legitimate Ace x402 order payment(s) before claiming three on-chain proofs.`,
    !aceThreeOnChainReady,
    ['proof/ace-x402-onchain-batch.latest.json', 'proof/settlement-evidence-bundle.latest.json', 'proof/ace-x402-live-payment.*.json'],
  ),
  gate(
    'sap_identity',
    'SAP mainnet identity',
    sapRegistered ? 'registered' : sapReadyForPreview ? 'ready-for-no-send-preview' : 'not-ready',
    sapRegistered ? 'Keep SAP transaction/PDA proof attached; keep refreshing explorer/API search until it indexes.' : 'Run the controlled SAP provider preview, then request explicit signature/broadcast approval after fee/rent estimate.',
    !sapRegistered,
    ['proof/sap-registration.live.latest.json', 'proof/sap-identity-status.latest.json', 'proof/synapse-explorer-snapshot.latest.json'],
  ),
  gate(
    'atomic_live_run',
    'Single atomic live run',
    atomicRunCaptured ? 'captured' : 'missing',
    atomicRunCaptured ? `Review ${newestRunFile} and re-run publication checks.` : 'Capture one request-id-scoped run tying trigger, capability choice, Ace execution, payment evidence, and deliverable hash.',
    !atomicRunCaptured,
    ['proof/end-to-end-run-plan.latest.json', 'proof/end-to-end-live-run.template.json'],
  ),
  gate(
    'github_publication',
    'Public GitHub repo',
    repoPublished ? 'published' : 'not-published',
    repoPublished ? 'Fill the final repo URL and commit hash in submission drafts.' : 'Create public repo only after explicit approval; publish only the scoped export.',
    !repoPublished,
    ['.public-export/pablito-settlement-sentinel'],
  ),
  gate(
    'x_walkthrough',
    'X walkthrough',
    xPosted ? 'posted' : 'draft-only',
    xPosted ? 'Attach post URL to the Superteam submission.' : 'Post only after public repo and final proof links are accurate and approved.',
    !xPosted,
    ['proof/x-walkthrough-draft.md'],
  ),
  gate(
    'superteam_submission',
    'Superteam final submission',
    superteamSubmitted ? 'submitted' : 'not-submitted',
    superteamSubmitted ? 'Track sponsor replies and avoid duplicate submissions.' : 'Submit after repo, X walkthrough, and final evidence are ready and approved.',
    !superteamSubmitted,
    ['proof/superteam-submission-draft.final-shape.md'],
  ),
];

const criticalMissing = gates
  .filter((item) => ['not-ready', 'missing', 'not-published', 'draft-only', 'not-submitted', 'ready-for-no-send-preview'].includes(item.status))
  .map((item) => item.id);

const nextMoveOrder = [
  'Refresh read-only public URL/SAP identity snapshots.',
  aceThreeOnChainReady
    ? 'Keep the three Ace x402 Base transaction proofs attached; do not create more payment volume unless the usage campaign has an explicit budget.'
    : `Create or identify ${Math.max(0, 3 - aceOnChainProofCount)} more legitimate low-cost Ace order payment(s), then run the guarded x402 batch path until three Base transaction proofs are captured.`,
  repoPublished
    ? 'Keep the public GitHub repo URL and commit hash attached to all final submission copy.'
    : 'Publish the red-flag-free scoped public GitHub export and record its repo URL/commit hash.',
  sapRegistered
    ? 'Keep SAP mainnet registration transaction/PDA proof attached; refresh explorer/API indexing snapshots.'
    : 'Complete SAP mainnet registration preview and, only after fee/rent review, an approved live registration.',
  atomicRunCaptured
    ? `Keep the atomic live run ${newestRunFile} and deliverable hash attached to the proof bundle.`
    : 'Capture one atomic end-to-end live run with a single request id.',
  'Post the X walkthrough with repo/proof links and required tags.',
  'Submit the Superteam bounty with Ace category selected and no overclaims.',
  'Run legitimate Ace usage daily until the deadline if budget remains approved.',
];

const dashboard = {
  generatedAt: new Date().toISOString(),
  listing: {
    title: liveListing?.listing?.title || liveListing?.title || listingCheck?.listing?.title || 'Autonomous Agent Bounty: OOBE x Ace Data Cloud',
    url: liveListing?.source?.url || liveListing?.url || 'https://superteam.fun/earn/listing/autonomous-agent-bounty-oobe-ace-data-cloud/',
    prizePool: livePrizeAmount || liveListing?.prizePool || listingCheck?.listing?.rewardAmount || 2400,
    token: liveListing?.token || listingCheck?.listing?.token || 'USDC',
    liveSubmissionsSeen: liveListing?.listing?.submissionsShown ?? liveListing?.submissionsSeen ?? null,
    winnerAnnouncement: liveListing?.listing?.winnerAnnouncementBy || liveListing?.winnerAnnouncement || '2026-06-10',
  },
  currentVerdict: criticalMissing.length === 0 ? 'submission-complete-ready-to-monitor' : 'not-final-yet',
  strongestRoute: 'Ace Data Cloud Usage category',
  readiness: {
    competitivePercent: race?.currentReadiness?.competitivePercent ?? null,
    publicExportReady: exportReady,
    releaseRedFlags: releaseCheck?.redFlagCount ?? null,
    releasePlaceholderFiles: releaseCheck?.placeholderFileCount ?? null,
    publicExportFiles: manifest?.fileCount || manifest?.files?.length || null,
    aceDistinctServiceCount: settlement?.aceServiceUsage?.distinctServiceCount || 0,
    aceX402PaymentCaptured: acePaymentReady,
    aceX402OnChainProofCount: aceOnChainProofCount,
    aceX402ThreeOnChainCaptured: aceThreeOnChainReady,
    sapMainnetIdentityCaptured: sapRegistered,
    atomicLiveRunCaptured: atomicRunCaptured,
    publicRepoPublished: repoPublished,
    xWalkthroughPosted: xPosted,
    superteamSubmitted,
    publicMetadataReachable: publicUrl?.overallStatus || publicUrl?.status || null,
    sapIdentityStatus: sapIdentity?.status || null,
  },
  gates,
  criticalMissing,
  nextMoveOrder,
  rulesForFinalClaims: [
    'Do not claim the reward is won, owed, escrowed, or guaranteed.',
    'Do not claim full SAP settlement until SAP registration/settlement proof exists.',
    'Do not expose Ace token, order secrets, wallet secrets, private OpenClaw paths, or private memory.',
    aceThreeOnChainReady
      ? 'Describe current Ace x402 proof as three captured live Ace x402 Base transaction proofs; do not overclaim full SAP settlement until SAP proof exists.'
      : 'Describe current Ace x402 proof as a captured partial live payment artifact unless the final atomic run performs a fresh payment.',
    'State the chosen category as Ace Data Cloud Usage unless sponsor guidance changes.',
  ],
};

const md = `# OOBE x Ace Finalization Dashboard

Generated: ${dashboard.generatedAt}

Verdict: **${dashboard.currentVerdict}**

Strongest route: **${dashboard.strongestRoute}**

## Listing Snapshot

- Title: ${dashboard.listing.title}
- Prize pool: ${dashboard.listing.prizePool} ${dashboard.listing.token}
- Live submissions seen: ${dashboard.listing.liveSubmissionsSeen ?? 'unknown'}
- Winner announcement: ${dashboard.listing.winnerAnnouncement}
- Source: ${dashboard.listing.url}

## Readiness

- Competitive score: ${dashboard.readiness.competitivePercent ?? 'unknown'}%
- Public export ready: ${dashboard.readiness.publicExportReady}
- Release scan: ${dashboard.readiness.releaseRedFlags ?? 'unknown'} red flags, ${dashboard.readiness.releasePlaceholderFiles ?? 'unknown'} placeholder files
- Ace service count: ${dashboard.readiness.aceDistinctServiceCount}
- Ace x402 payment captured: ${dashboard.readiness.aceX402PaymentCaptured}
- Ace x402 on-chain proof count: ${dashboard.readiness.aceX402OnChainProofCount}/3
- SAP mainnet identity captured: ${dashboard.readiness.sapMainnetIdentityCaptured}
- Atomic live run captured: ${dashboard.readiness.atomicLiveRunCaptured}
- Public repo published: ${dashboard.readiness.publicRepoPublished}
- X walkthrough posted: ${dashboard.readiness.xWalkthroughPosted}
- Superteam submitted: ${dashboard.readiness.superteamSubmitted}

## Gates

| Gate | Status | Approval? | Next action |
| --- | --- | --- | --- |
${markdownGateRows(gates)}

## Next Move Order

${nextMoveOrder.map((item, index) => `${index + 1}. ${item}`).join('\n')}

## Claim Rules

${dashboard.rulesForFinalClaims.map((item) => `- ${item}`).join('\n')}
`;

const approval = `# Final Publication Approval Packet

Status: **draft approval packet only**. This does not publish, sign, spend, post, or submit anything by itself.

## Exact external actions this packet is for

1. Create/push the public GitHub repository from \`.public-export/pablito-settlement-sentinel\`.
2. Complete SAP mainnet registration only after preview + fee/rent estimate review.
3. Capture one atomic live run if the SAP gate is satisfied or explicitly marked out of scope.
4. Publish the X walkthrough tagging @OOBEonSol and @AceDataCloud.
5. Submit the Superteam bounty in the Ace Data Cloud Usage category.

## Current safe-ready facts

- Public export release scan: ${releaseCheck?.redFlagCount ?? 'unknown'} red flags, ${releaseCheck?.placeholderFileCount ?? 'unknown'} placeholder files.
- Ace services captured: ${settlement?.aceServiceUsage?.distinctServiceCount || 0}.
- Ace x402 payment captured: ${acePaymentReady}.
- Ace x402 on-chain proof count: ${aceOnChainProofCount}/3.
- SAP mainnet identity captured: ${sapRegistered}.
- Atomic live run captured: ${atomicRunCaptured}.

## Explicit approval phrase

\`\`\`text
YES FINALIZE OOBE ACE BOUNTY
Public GitHub repo approved: yes/no
SAP preview approved: yes/no
SAP live registration approved after fee estimate: yes/no
Atomic run approved: yes/no
Fresh x402 payment max:
Three-proof x402 batch approved after exact order/cost review: yes/no
X walkthrough approved after final link review: yes/no
Superteam submission approved after final link review: yes/no
\`\`\`

## Hard stops

- Stop before any wallet signature or transaction broadcast unless the fee/rent estimate and exact transaction purpose are visible.
- Stop before any public repo/X/Superteam action unless final links and copy are reviewed.
- Stop if a secret, private path, private memory, or raw payment header appears in the public export.
- Stop if the copy overclaims reward, SAP settlement, or sponsor acceptance.
`;

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(dashboardJsonPath, `${JSON.stringify(dashboard, null, 2)}\n`, 'utf8');
fs.writeFileSync(dashboardMdPath, md, 'utf8');
fs.writeFileSync(approvalPacketPath, approval, 'utf8');

console.log(`Wrote finalization dashboard: ${dashboardJsonPath}`);
console.log(`Wrote finalization markdown: ${dashboardMdPath}`);
console.log(`Wrote final publication approval packet: ${approvalPacketPath}`);
