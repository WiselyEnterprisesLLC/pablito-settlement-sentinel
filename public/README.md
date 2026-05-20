# Pablito Settlement Sentinel

Public README for the OOBE x Ace Data Cloud autonomous agent bounty.

> Status: **public-safe submitted/reviewer packet plus live Ace/x402 evidence**. This repo does not claim sponsor acceptance, prize award, full SAP escrow ranking, or private OpenClaw/Pablito capabilities.

## What this is

Pablito Settlement Sentinel is a small autonomous workflow-payment demo. It shows how an agent could:

1. receive a public-safe business workflow request,
2. select a SAP-shaped service capability,
3. run an AI workflow-classification step,
4. produce a bounded deliverable, and
5. attach an x402/SAP-style settlement proof object.

The local implementation stays deterministic so reviewers can inspect the architecture without exposing private keys or private agent memory. Separate public-safe proof files now record live Ace/x402 evidence that has already been captured.

## What is live vs mocked

| Area | Current state |
| --- | --- |
| SAP agent registration | Readiness/status artifacts; do not treat as prize acceptance |
| Service discovery | Local SAP-shaped fixture |
| Ace Data Cloud usage | Live public-safe summaries exist across enabled service families; local demo stays deterministic |
| x402/SAP payment | Three Ace/x402 on-chain proof artifacts exist; full SAP escrow ranking/prize result is not claimed |
| Wallet signing | None in the local dry-run/test path |
| Public posting/submission | Public submission/posting handled separately; this repo is the public-safe proof package |

See `proof/settlement-evidence-bundle.latest.json` for the public-safe evidence summary tying the Ace x402 artifacts to the Ace service proof files.

## Hosted x402 AI/API Router

The broader public product is x402 Agent-Payment Infrastructure:

```text
https://payments.wiselyenterprisesllc.com/ai
```

It lets agents discover services, quote payment, buy/top up developer credit, invoke hosted AI/data/media services, stream progress, store receipts, and quote external x402 payment-required sellers without exposing keys.

See `../docs/X402_CRYPTO_PAYG_AI_ROUTER_USER_GUIDE.md` for the plain-English setup flow.

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

## Remaining Proof Caveats

Do not present this repo as sponsor-accepted or prize-awarded unless that happens separately. Remaining caveats:

- bounty operator ranking/acceptance is external
- SAP/Synapse interpretation is controlled by the bounty operators
- no artificial/wash payment volume should be created
- quote/handoff crypto routes need the caller's own wallet/exchange executor before they are real payments

## Current diligence questions

See `proof/questions-for-sponsor.md` for the sponsor/Superteam questions that need answers before final live work.

## License

Public-safe bounty/demo package.
