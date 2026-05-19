#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const xDraftPath = path.join(proofDir, 'x-walkthrough-draft.md');
const submissionPath = path.join(proofDir, 'superteam-submission-draft.final-shape.md');

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

const scorecard = readJsonIfPresent(path.join(proofDir, 'competitive-scorecard.latest.json'));
const settlement = readJsonIfPresent(path.join(proofDir, 'settlement-evidence-bundle.latest.json'));
const sapIdentity = readJsonIfPresent(path.join(proofDir, 'sap-identity-status.latest.json'));
const e2eLive = readJsonIfPresent(path.join(proofDir, 'end-to-end-live-run.latest.json'));
const publicSummary = readJsonIfPresent(path.join(root, '.public-export', 'pablito-settlement-sentinel', 'PUBLIC_EXPORT_SUMMARY.json'))
  || readJsonIfPresent(path.join(root, 'PUBLIC_EXPORT_SUMMARY.json'));
const aceServices = settlement?.aceServiceUsage?.distinctServiceIds || [];
const tx = settlement?.aceX402Payment?.transaction || 'pending';
const sapTx = sapIdentity?.liveRegistration?.signature || 'pending';
const atomicRequestId = e2eLive?.requestId || 'pending';
const repoUrl = publicSummary?.repositoryUrl || 'pending public URL';
const commitHash = publicSummary?.repositoryCommit || 'pending commit hash';
const proofPageUrl = 'https://wiselyenterprisesllc.com/oobe-ace/proof';
const xPostUrl = process.env.X_POST_URL || 'pending approved X or video URL';
const xPostPublished = /^https:\/\/x\.com\/Pablito_WE\/status\/\d+$/i.test(xPostUrl);

const xDraft = `# X Walkthrough Draft

Status: ${xPostPublished ? `posted at ${xPostUrl}` : 'draft only. Do not post until the public repo is reviewed and Paul approves the exact public text.'}

## Strong Thread Draft

\`\`\`text
1/
Pablito Settlement Sentinel for the OOBE x Ace Data Cloud autonomous agent bounty.

Category: Ace Data Cloud Usage.

Autonomous proof trail: trigger -> SAP/tool choice -> Ace service execution -> x402 payment evidence -> deliverable receipt.

Repo: ${repoUrl}

2/
Live proof captured:
${aceServices.length} Ace service summaries.
${settlement?.aceX402Payments?.onChainProofCount || 0}/3 Base x402 payment proofs.
SAP mainnet identity registered.
Atomic run: ${atomicRequestId}.

3/
The useful bit: every run needs a receipt. Not "the agent did a thing, trust me."

Request id, services selected, payment evidence, deliverable hash, and a reviewer trail.

4/
Proof page:
${proofPageUrl}

SAP tx:
${sapTx}

Example Base x402 tx:
${tx}

5/
Built to avoid the easy failure mode: no fake volume, no private data, no random API spam, no claim bigger than the evidence.

Pablito is a little New Mexico conquistador-clerk reborn in silicon. He checks the ledger before he rides.

@OOBEonSol @AceDataCloud
\`\`\`

## Posting Gate

Post only when:

- public repo URL is live,
- SAP registration or final boundary is accurate,
- atomic run proof exists or the copy says it is still pending,
- no private data appears,
- Paul approves the final exact text.
`;

const submission = `# Superteam Submission Draft - Final Shape

**PUBLICATION/SUBMISSION GATES REMAIN - DO NOT SUBMIT UNTIL REPO/X LINKS ARE FILLED**

## Listing

- **Bounty:** Autonomous Agent Bounty: OOBE x Ace Data Cloud
- **Prize pool / listed reward amount:** 2,400 USDC
- **Planned entry name:** Pablito Settlement Sentinel
- **Chosen category:** Ace Data Cloud Usage, unless sponsor/platform guidance changes
- **Route:** normal public Superteam listing flow unless sponsor/platform confirms an agent API route

## Short Description

Pablito Settlement Sentinel is an autonomous workflow-payment agent. It takes a public-safe operations request, selects SAP/x402/Ace-shaped capabilities, executes bounded AI/data service work, and attaches public-safe evidence to the deliverable.

## Why This Is Competitive

This is a ranked bounty, not an equal split. The submission is designed around judge-verifiable usage:

- real Ace service summaries,
- three Ace x402 Base payment artifacts,
- SAP mainnet identity registration,
- one request-id-scoped atomic live run,
- a no-overclaim proof bundle,
- a request-id-scoped atomic run shape,
- public-safe evidence files that separate dry-run scaffolding from live artifacts.

Current competitive readiness score: ${scorecard?.score?.percent ?? 'pending'}%.

## What The Repo Demonstrates

- Deterministic local dry-run of the agent workflow.
- Clear mocked-vs-live boundaries.
- Safety checks that prevent accidental wallet, spend, public-post, and overclaim behavior in the dry-run package.
- Public-safe deliverable format that excludes private user/customer data and internal runtime details.
- Live Ace proof: ${settlement?.aceX402Payments?.onChainProofCount || 0} approved Ace x402 Base payment artifacts plus ${aceServices.length} distinct Ace API service proof summaries.
- SAP mainnet identity proof: ${sapTx}.
- Atomic live-run proof: ${atomicRequestId}.
- Race-mode plan for legitimate usage before the deadline.

## Evidence Links To Fill After Publication

- Repository: ${repoUrl}
- Commit: ${commitHash}
- Public proof page: ${proofPageUrl}
- Public export summary: ${repoUrl}/blob/main/PUBLIC_EXPORT_SUMMARY.json
- Reviewer index: ${repoUrl}/blob/main/proof/reviewer-index.md
- Competitive scorecard: ${repoUrl}/blob/main/proof/competitive-scorecard.latest.json
- Settlement evidence bundle: ${repoUrl}/blob/main/proof/settlement-evidence-bundle.latest.json
- Ace x402 artifact: ${repoUrl}/blob/main/proof/ace-x402-onchain-batch.latest.json
- Ace service proof files: ${repoUrl}/tree/main/proof
- SAP registration evidence: ${sapTx}
- Atomic live-run evidence: ${atomicRequestId}
- Demo/walkthrough: ${xPostUrl}

## Safe Claim Language

\`\`\`text
This package demonstrates the scoped Pablito Settlement Sentinel workflow, includes deterministic dry-run proof, SAP mainnet identity registration evidence, an atomic request-id-scoped live run, ${aceServices.length} Ace service usage summaries, and ${settlement?.aceX402Payments?.onChainProofCount || 0} approved Ace x402 Base payment artifacts. It is not a claim of reward entitlement or final Superteam acceptance.
\`\`\`

## Final Checklist Before Route Action

- [ ] Sponsor/platform route is confirmed or Paul approves the normal public route.
- [ ] Public repo contains no secrets, private paths, private memory, or raw logs.
- [ ] npm test passes.
- [ ] npm run verify:prep passes.
- [ ] SAP and atomic run evidence fields are either filled with real links or explicitly marked as not claimed.
- [ ] Final text is reviewed for no overclaims.
- [ ] Paul explicitly approves the exact public repo, X post, and final Superteam submission action.
`;

fs.writeFileSync(xDraftPath, xDraft, 'utf8');
fs.writeFileSync(submissionPath, submission, 'utf8');
console.log(`Wrote X walkthrough draft: ${xDraftPath}`);
console.log(`Wrote Superteam submission draft: ${submissionPath}`);
