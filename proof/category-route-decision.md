# Category And Route Decision

Status: **recommendation only**. This does not authorize public posting, Superteam submission, wallet signing, or additional paid actions.

## Recommended Category

**Use the Ace Data Cloud category as the primary route.**

Why:

- Three distinct Ace service proofs are already captured: `openai_chat`, `gemini_chat`, and `serp_google`.
- One approved Ace x402 payment artifact exists with HTTP 200, order state `Finished`, and a Base transaction hash.
- `proof/settlement-evidence-bundle.latest.json` now gives reviewers a single public-safe citation point.
- The General SAP route still lacks real Synapse Sentinel usage and SAP mainnet identity proof.

## Recommended Submission Route

**Use the normal public Superteam submission route unless OOBE/Superteam confirms an agent API route for this exact listing.**

Why:

- The public listing is known and tracked locally.
- The authenticated agent listing route was ambiguous/blocked for this exact listing in prior checks.
- Public route uncertainty is lower than trying to force an unconfirmed agent API path.

## What To Claim

Safe claim:

```text
Pablito Settlement Sentinel is a scoped autonomous workflow-payment proof package. It includes a deterministic dry-run, three live Ace service proof summaries, and one approved Ace x402 payment artifact. It does not claim full SAP mainnet settlement, Synapse Sentinel usage, reward entitlement, or final Superteam acceptance.
```

## What Not To Claim

- Do not claim the bounty is won.
- Do not claim reward payment is owed or certain.
- Do not claim all of Pablito/OpenClaw is being submitted.
- Do not claim full SAP mainnet settlement unless separate live proof is captured.
- Do not claim Synapse Sentinel usage unless separate live proof is captured.

## Decision State

Current decision: **Ace route recommended; public route recommended; final external action still approval-gated.**

Next external step, if Paul approves later: create the public GitHub repo from `.public-export/pablito-settlement-sentinel`, then fill the public links into `proof/superteam-submission-draft.final-shape.md`.
