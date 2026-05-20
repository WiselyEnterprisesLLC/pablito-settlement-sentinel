# OOBE x Ace Data Cloud Autonomous Agent Bounty - Safe Execution Workspace

Status: **submitted/reviewer packet plus live Ace/x402 evidence - public-safe scoped repo**

This workspace prepares a compliant submission path for the Superteam Earn bounty without exposing private agent memory, credentials, wallet secrets, social/email/trading/browser systems, or unrelated autonomous revenue capabilities. Start review at `proof/reviewer-index.md`.

## Submission Scope

This is a scoped bounty package for **Pablito Settlement Sentinel** only. It is not the full OpenClaw/Pablito agent, and it does not include private memory, social/email/trading/browser systems, credentials, wallet secrets, sessions, or unrelated autonomous revenue capabilities. See `SUBMISSION_SCOPE.md`.

Current live evidence includes public-safe Ace API usage summaries, three Ace/x402 on-chain proof artifacts, SAP identity/readiness files, a public proof page, and the public submission packet. It still does not claim full SAP escrow ranking, sponsor acceptance, prize award, or unrelated OpenClaw/Pablito capabilities.

## x402 Crypto Pay-As-You-Go AI API Router

This repo also documents the public-facing router/skill that grew out of the bounty work:

```text
https://payments.wiselyenterprisesllc.com/ai
```

The router is a hosted x402 boundary for AI agents:

- discover services from `/ai/manifest`
- quote costs and routes before spending
- buy/top up reusable developer-credit keys
- invoke hosted AI/data/media services with `X-Developer-Key` or direct `X-PAYMENT`
- stream progress for long image/video/audio calls
- return receipts and public-safe proof
- quote how to pay any external x402 seller from the crypto the user has

Novice-friendly setup and full feature explanation live in `docs/X402_CRYPTO_PAYG_AI_ROUTER_USER_GUIDE.md`.

Live-proven routes:

- Base USDC -> x402 payment
- Base ETH -> USDC -> x402 payment
- x402-funded developer-credit key -> paid AI invoke

Quote/handoff routes:

- DOGE, NEAR, XRP, SOL, BONK, PEPE, and similar assets can be quoted into the required x402 settlement asset, but the caller's wallet, bridge, or exchange executor still signs and executes the returned route.

## Bounty facts captured

- Listing: `Autonomous Agent Bounty: OOBE x Ace Data Cloud`
- Source: `https://superteam.fun/earn/listing/autonomous-agent-bounty-oobe-ace-data-cloud`
- API artifact: `docs/superteam-listing.json`
- Status seen: `OPEN`
- Prize pool / listed reward amount: `2,400 USDC`
- Deadline: `2026-06-03T21:59:59.999Z`

## Guardrails

Hard stop before any of these:

1. Creating/logging into third-party accounts.
2. Connecting GitHub, Google, Discord, or wallets.
3. Signing any Solana transaction or message.
4. Moving SOL/USDC or opening escrow.
5. Running unknown code from bounty repos.
6. Publishing a public X submission.
7. Generating artificial/wash payment volume.
8. Exposing private OpenClaw, Paul, Wisely, customer, key, token, wallet-secret, or internal runtime details.

Allowed now:

- Read official docs and public API data.
- Create a local dry-run architecture and proof packet.
- Build demo code that uses mock/dry-run adapters only.
- Prepare exact approval gates for registration/payment/public posting.

## Proposed compliant demo angle

**Pablito Settlement Sentinel**

A small autonomous workflow agent that:

1. Receives a public-safe workflow request.
2. Discovers an SAP-listed tool/service capability.
3. Uses an AI service adapter to classify or summarize the request.
4. Produces a bounded deliverable and payment/settlement proof object.
5. In live mode only, would settle through SAP escrow or AceDataCloud x402 facilitator.

The local version proves the workflow shape without pretending to have generated bounty-valid volume.

## Current local scaffold

- `SUBMISSION_SCOPE.md` defines what is and is not included in the public submission package.
- `proof/reviewer-index.md` explains each proof file and its dry-run, pending-live, or review-ready status.
- `proof/category-route-decision.md` records the current recommendation: Ace Data Cloud category and normal public Superteam route unless sponsor/platform confirms an agent API route.
- `proof/payout-maximization-plan.md` explains why the Ace route has the highest expected payout and how to use Sentinel as optional credibility proof.
- `proof/listing-requirements-check.latest.json` maps the exact listing requirements to current proof artifacts and missing items.
- `proof/competitive-scorecard.latest.json` and `proof/winner-grade-upgrade-plan.md` evaluate the package as a ranked bounty submission, not an equal-split checklist.
- `proof/race-mode-dashboard.latest.json` and `proof/race-mode-briefing.md` track deadline urgency, live gates, and the ranked-usage operating plan.
- `proof/finalization-dashboard.latest.json`, `proof/finalization-dashboard.latest.md`, and `proof/final-publication-approval.packet.md` are the current mission-control layer for final bounty publication/submission gates.
- `proof/legitimate-ace-usage-campaign.latest.json` and `proof/ace-usage-run-queue.draft.json` define useful Ace workflows that can create legitimate usage after approval.
- `proof/public-url-status.latest.json`, `proof/sap-identity-status.latest.json`, and `proof/p0-live-action-brief.md` are read-only live-status artifacts for the immediate SAP/public-readiness gate.
- `proof/live-evidence-template.md` is a blank/null capture template for future approved live evidence; it is not evidence by itself.
- `proof/go-no-go.md` defines the strict ship/wait/abandon decision gate.
- `proof/local-qa-checklist.md` gives Local Codex/Paul the exact local checks to run before publication or live approval.
- `proof/live-simulation-plan.md` outlines the no-sign/no-send rehearsal path for SAP/OOBE/Ace before any external action.
- `proof/sap-registration.preview.latest.json` is generated by `npm run proof:sap-preview` and previews SAP registration arguments/blockers without importing the live SDK or touching a wallet.
- `proof/sap-mainnet-registration-readiness.latest.json` and `proof/sap-mainnet-registration-approval.draft.md` turn the SAP identity gap into a controlled no-send provider-preview approval gate.
- `proof/end-to-end-run-plan.latest.json` and `proof/end-to-end-run-approval.draft.md` define the missing atomic workflow proof: trigger -> SAP/tool selection -> Ace execution -> payment evidence -> deliverable.
- `proof/end-to-end-live-run.template.json` is the exact blank capture shape for the final atomic live run.
- `proof/live-rehearsal.no-sign.latest.json` is generated by `npm run proof:live-rehearsal` and maps the current exact preview commands plus remaining live gates.
- `proof/ace-x402-requirements.preview.latest.json` is generated by `npm run proof:ace-x402-preview`; without Ace credentials it records the exact missing token/order blocker, and with a temporary Ace token/order id it captures the initial 402 requirements without signing or paying.
- `proof/ace-x402-onchain-batch.latest.json` is generated by `npm run proof:ace-x402-batch`; it can preflight or execute multiple existing Ace x402 orders with Base USDC caps, pay-to allowlist checks, and no stored raw payment header.
- `proof/three-onchain-x402-approval.packet.md` tracks the current 3-proof gate. Current target is three legitimate Ace x402 payment proofs, not artificial/wash volume.
- `proof/ace-service-proof.latest.json` and archived `proof/ace-service-proof.*.json` files contain public-safe summaries of live Ace API calls for OpenAI, Gemini, and SERP.
- `proof/settlement-evidence-bundle.latest.json` ties the approved Ace x402 payment artifacts to the Ace service proof files without claiming full SAP escrow ranking, sponsor acceptance, or prize award.
- `public/oobe-ace-proof.html` is generated by `npm run artifact:proof-page` and gives reviewers a concise proof map/timeline.
- `proof/x-walkthrough-draft.md` and `proof/superteam-submission-draft.final-shape.md` are regenerated by `npm run artifact:submission-copy` with stronger ranked-bounty copy, but remain draft-only.
- `proof/risk-register.md` tracks probability, impact, mitigation, owner, and ship-decision effect for the remaining risks.
- `proof/completion-gap.latest.json` tracks the remaining requirement-by-requirement path to completion.
- `proof/public-release-check.latest.json` scans the staged public export for red flags and expected placeholders before publication approval.
- `proof/public-export-manifest.latest.json` lists staged public-export files and SHA-256 hashes.
- `proof/publication-approval-packet.draft.md` gives the exact future approval shape for public repo, X, and Superteam actions.
- `public/pablito-settlement-sentinel.metadata.draft.json` and `public/x402-resource.draft.json` are public-safe drafts only; they are not deployed/live evidence.
- `docs/current-sap-sdk-static-inspection.md` captures the current pinned SDK inspection and notes that final live work should use an exact controlled preview, not an unverified CLI placeholder.
- `docs/live-route-research-2026-05-17.md` captures the current OOBE/Ace route research, including Ace x402 Base USDC requirements and the managed-signer route.
- `docs/X402_CRYPTO_PAYG_AI_ROUTER_USER_GUIDE.md` is the novice-friendly explanation of the hosted x402 AI/API router, developer-credit flow, external x402 quote flow, and live proof boundaries.
- `ACE_ACCOUNT_AND_X402_SETUP.md` is an internal operator runbook and is intentionally excluded from the public export because it can contain account/setup details.
- `src/ace-x402-requirements-preview.mjs` is the no-spend Ace x402 requirements capture helper. It never creates an `X-PAYMENT` header and never retries payment.
- `src/sap-sdk-dry-run-adapter.mjs` models the inspected `@oobe-protocol-labs/synapse-sap-sdk@0.17.0` interfaces without importing the SDK or mutating chain state.
- `src/public-safe-deliverable.mjs` creates the mocked AI-service output and public-safe demo narrative.
- `src/dry-run-demo.mjs` emits the full workflow: trigger -> SAP discovery model -> AI service call model -> x402 settlement proof -> public-safe deliverable.
- `src/safety-check.mjs` scans for obvious secret/signing/spend/public-post code, fake live evidence in the blank template, and live-payment/bounty-valid overclaims.
- `npm run verify:prep` runs the safe aggregate local verification path: dry-run proof generation, public draft generation, completion-gap update, no-sign live rehearsal, SAP readiness, atomic-run planning, competitive scorecard, finalization dashboard generation, proof page generation, Ace x402 requirements preview, public-export checks, and tests.

## Go/no-go gates

See `proof/go-no-go.md` for the full decision gate. Proceed only if all are true:

- Official docs confirm the action.
- Transaction can be simulated first.
- Funds are already in an AI sandbox wallet/account.
- No personal fiat funding or raw secrets are needed.
- Activity is real, useful, and non-wash.
- Public repo/demo contains no private data.
- Paul approves exact account/wallet/public submission steps if required.
