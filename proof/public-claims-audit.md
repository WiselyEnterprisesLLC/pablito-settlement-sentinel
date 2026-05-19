# Public Claims Audit — Dry-run vs Live Proof

Date: 2026-05-17 UTC
Scope: `README.md`, `public/README.md`, `proof/*.md`, `proof/dry-run-proof.latest.json`, `agent.manifest.draft.json`, and safety wording relevant to public/submission use.

## Verdict

Current package is acceptable as **dry-run prep**, not as a bounty-complete submission. Public-facing language must continue to say the workspace models the architecture and proof path only.

## Prize/reward wording

Allowed wording:

- **2,400 USDC prize pool / listed reward amount**
- **listed reward amount**
- **sponsor-paid after judging** only as an unresolved possibility/question

Blocked wording:

- wording that calls it a USD-denominated prize instead of a USDC prize pool
- wording that says the prize is payable to us
- guaranteed-payout, guaranteed-prize, or guaranteed-reward style wording
- won, earned, secured, received, or payable to us
- escrowed/pre-funded unless confirmed by sponsor/Superteam evidence

Current scan result: docs now use `2,400 USDC prize pool / listed reward amount` where local wording was under our control. The raw saved Superteam listing JSON may contain official listing text and should not be edited as our claim.

## Claims that must remain dry-run-only until live proof exists

| Claim area | Current safe claim | Must not claim until live evidence exists | Evidence needed |
| --- | --- | --- | --- |
| SAP registration | Registration arguments are drafted/modelled locally. | Agent is registered on SAP mainnet. | Explorer/API proof plus transaction signature/PDA/address. |
| Service discovery | SAP-shaped discovery is mocked from inspected SDK interfaces. | Live SAP discovery selected a live tool. | Official API/explorer output or signed/logged live call. |
| Ace Data Cloud | Local deterministic workflow classifier models one Ace-style capability. | Real Ace Data Cloud usage occurred. | Provider dashboard/API receipts for required services. |
| Synapse Sentinel | General category still requires Synapse Sentinel usage. | Synapse Sentinel was used. | Real call ID/output/receipt. |
| x402/SAP settlement | Settlement headers/proof object are modeled; tx signature is `null`. | Payment settled or x402 transaction completed. | Transaction signature, facilitator receipt, or official settlement record. |
| Payment volume | No bounty-valid volume is claimed. | Volume was generated/proven/achieved. | Real non-wash volume evidence and transaction/accounting records. |
| Public repo | Public README is a draft. | Repo is published/submitted. | Public URL, commit hash, safety scan. |
| X/demo | Draft copy exists only. | X walkthrough was posted or demo submitted. | Approved public post URL/demo URL. |
| Superteam submission | Draft text/route analysis only. | Bounty was submitted or accepted. | Submission confirmation through confirmed route. |
| Prize/payout | Listing has a 2,400 USDC prize pool/listed reward amount. | Payout is guaranteed/won/earned/escrowed for us. | Sponsor/Superteam confirmation and later winner/payment proof. |

## Files reviewed / local claim notes

- `proof/submission-draft.md`: Good as draft-only. X copy must stay pending live proof.
- `public/README.md`: Good public boundary; says dry-run scaffold only.
- `proof/dry-run-proof.latest.json`: Good machine-readable boundary; `settlementTxSignature` is `null` and live-required list is explicit.
- `HANDOFF_TO_LOCAL_CODEX.md`: Contains private/local coordination context; not for public repo without redaction.
- `LOCAL_CODEX_QA_AND_NEXT_GATES.md`: Correct verdict: credible scaffold, not submission-ready.
- `docs/superteam-listing.json`: Raw listing snapshot, not our claim. Keep out of polished public README unless needed as source evidence.

## Required audit before publication/submission

- [ ] Re-run `npm test`.
- [ ] Re-run `npm run proof:dry-run`.
- [ ] Search for blocked reward wording and overclaims.
- [ ] Confirm no private paths, account data, email addresses, or secrets in public artifacts.
- [ ] Reconcile any new live artifact against `proof/live-proof-checklist.md`.
