# Live Proof Checklist — OOBE × Ace Data Cloud Bounty

**Status:** prep checklist only. Do not execute live steps, sign, spend, post, or submit from this file.

## Prize wording guardrail

Use only: **2,400 USDC prize pool / listed reward amount**.
Do not imply the bounty is assured, won, payable to us, escrowed, or pre-funded unless sponsor/Superteam confirms it in writing.

## Before any live proof attempt

- [ ] Sponsor/platform reply or official documentation confirms the accepted submission route for this listing: human/public Superteam flow vs agent API.
- [ ] Bounty category selected and documented:
  - [ ] General Payment Volume on SAP: requires at least one Synapse Sentinel usage.
  - [ ] Ace Data Cloud Usage: requires at least 3 distinct Ace Data Cloud services.
- [ ] Exact wallet/account/access plan approved by Paul.
- [ ] Exact spend/rent/stake/fee ceiling approved by Paul before any signature.
- [ ] SDK/package version pinned and inspected without lifecycle-script surprises.
- [ ] Simulation/dry-run output reviewed before any mainnet transaction.
- [ ] Public repo contents reviewed for secrets, private data, overclaims, and internal OpenClaw paths.

## Evidence required for live SAP registration

Capture all of the following before claiming SAP mainnet registration:

- [ ] Agent name and public metadata URL used for registration.
- [ ] Public-safe metadata JSON as published, with no secrets or private runtime URLs.
- [ ] SAP mainnet transaction signature or explorer URL for registration.
- [ ] Registered agent wallet/address/PDA as shown by official explorer/API.
- [ ] Screenshot or JSON export from Synapse Explorer/API showing the agent is registered.
- [ ] Timestamped command log or script output with secrets redacted.
- [ ] Confirmation that the registration was not produced by mocked local fixtures.

## Evidence required for service usage

### General category

- [ ] Synapse Sentinel service/tool identifier used.
- [ ] Request ID, timestamp, and public-safe input summary.
- [ ] Response/output summary with private data removed.
- [ ] Proof that at least one real Synapse Sentinel call occurred.
- [ ] Reason the call was legitimate workflow usage, not wash/artificial volume.

### Ace category

For each of three distinct Ace Data Cloud services:

- [ ] Service/API name and endpoint/capability identifier.
- [ ] Request ID, timestamp, and public-safe input summary.
- [ ] Response/output summary with private data removed.
- [ ] Provider dashboard/API evidence or signed/logged response proving the call was real.
- [ ] Payment/free-credit/x402 evidence if applicable.
- [ ] Reason the call was legitimate workflow usage, not wash/artificial volume.

## Evidence required for x402/SAP settlement

- [ ] Payment protocol path used: SAP escrow or AceDataCloud x402 facilitator.
- [ ] Transaction signature(s), settlement IDs, or facilitator receipts.
- [ ] Amounts, token, payer/payee agent IDs, and timestamps.
- [ ] Explorer or official API links proving settlement state.
- [ ] Settlement proof object with `settlementTxSignature` populated by real evidence, not `null`.
- [ ] Cost basis/fees captured if any funds moved.
- [ ] Statement explaining why the settlement represents real service use and not artificial loops.

## Evidence required for public artifacts

- [ ] Public GitHub repo URL.
- [ ] Commit hash for submitted version.
- [ ] `npm test` output.
- [ ] `npm run proof:dry-run` output plus live proof artifact if created later.
- [ ] Public README states dry-run/live boundaries accurately.
- [ ] No workspace memory, secrets, private emails, private paths, tokens, or raw logs are published.
- [ ] Demo video/walkthrough URL or X thread URL, after approval only.
- [ ] X post includes category, repo, short demo, and tags only if accurate and approved.

## Evidence required for final Superteam submission

- [ ] Confirmed route: human/public listing flow or sponsor-confirmed agent API flow.
- [ ] Final submission text reviewed and approved.
- [ ] Links included: repo, demo/X walkthrough, live proof artifacts, explorer/API evidence.
- [ ] Explicitly states which components are dry-run scaffolding vs live evidence.
- [ ] Does not claim winner status, assured payout, escrow, or completed reward payment.
- [ ] Submission timestamp and confirmation ID/screenshot captured after approved submission.

## Hard stop if missing

Do not submit if any of these remain missing:

- real SAP mainnet registration evidence,
- required live service usage for selected category,
- real non-wash settlement/payment proof if required,
- approved public repo and X/demo artifact,
- confirmed Superteam route or approved manual public route,
- Paul approval for final submission.
