# Pablito Settlement Sentinel

Public README draft for the OOBE x Ace Data Cloud autonomous agent bounty.

> Status: **scaffold plus partial live Ace proof**. This repo does not yet claim live SAP registration, full SAP settlement, Synapse Sentinel usage, reward/payment, escrow funding, or a completed Superteam submission.

## What this is

Pablito Settlement Sentinel is a small autonomous workflow-payment demo. It shows how an agent could:

1. receive a public-safe business workflow request,
2. select a SAP-shaped service capability,
3. run an AI workflow-classification step,
4. produce a bounded deliverable, and
5. attach an x402/SAP-style settlement proof object.

The local implementation stays deterministic so reviewers can inspect the architecture before broader wallet, account, public repo, or live payment actions are attempted. Separate public-safe proof files now record limited live Ace evidence that has already been captured.

## What is live vs mocked

| Area | Current state |
| --- | --- |
| SAP agent registration | Draft arguments only; no mainnet registration |
| Service discovery | Local SAP-shaped fixture |
| Ace Data Cloud usage | Live public-safe summaries exist for OpenAI, Gemini, and SERP; local demo still uses a mocked classifier |
| x402/SAP payment | One approved Ace x402 payment artifact exists; full SAP settlement is still not proven |
| Wallet signing | None in the local dry-run/test path |
| Public posting/submission | None |

See `proof/settlement-evidence-bundle.latest.json` for the public-safe evidence summary tying the approved Ace x402 artifact to the Ace service proof files.

## Why this exists

The bounty asks for real autonomous agent usage around OOBE/SAP and Ace Data Cloud. This scaffold is the safe preparation layer: it makes the intended workflow, proof format, safety boundaries, and missing live steps explicit before anyone claims bounty-valid completion.

## Safety boundaries

This repo should not contain:

- wallet secrets, wallet files, or API tokens,
- private user/customer data,
- internal OpenClaw logs or memory,
- live completion claims without transaction/proof links,
- artificial/wash volume loops,
- code that signs or sends transactions in the dry-run path.

## Run locally

```bash
npm test
```

The test runs a safety scan and then emits a deterministic dry-run workflow JSON.

```bash
npm run demo:dry-run
```

To write a compact public-safe dry-run proof artifact:

```bash
npm run proof:dry-run
```

To regenerate all prep artifacts:

```bash
npm run verify:prep
```

This writes public-safe metadata/x402 drafts, the completion-gap JSON file, and the settlement evidence bundle.

## What proof is still required before bounty submission

A submission should not be presented as complete until the live route is confirmed and evidence exists for whichever category is pursued:

- confirmed submission route: agent API or normal Superteam public listing,
- SAP registration path and any cost/rent/stake requirements,
- real non-wash service usage,
- real x402/SAP settlement proof if required beyond the current Ace artifact,
- public repo URL with placeholders replaced,
- public X/demo post only if approved and accurate,
- final Superteam submission through the confirmed route.

## Current diligence questions

See `proof/questions-for-sponsor.md` for the sponsor/Superteam questions that need answers before final live work.

## License

Draft/internal until a public repository is intentionally created and reviewed.
