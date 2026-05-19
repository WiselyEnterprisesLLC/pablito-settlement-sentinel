# Live Execution Approval Packet - Draft Only

**Status:** DRAFT ONLY. This packet is a concrete no-sign rehearsal output, not approval to sign, spend, publish, post, submit, or claim the bounty.

## Current recommendation

- **Primary path:** Ace Data Cloud category, if three real Ace services can be used cheaply and safely.
- **Fallback path:** General SAP route with Synapse Sentinel if Ace service access is unclear.
- **Submission route default:** normal public Superteam route unless sponsor/platform confirms an agent/API route.
- **Current decision:** WAIT / NO-GO for final submission.

## Exact preview commands now available

```bash
npm view @oobe-protocol-labs/synapse-sap-sdk version dist-tags --json
mkdir -p /tmp/oobe-sap-sdk-inspection
npm pack @oobe-protocol-labs/synapse-sap-sdk@0.17.0 --ignore-scripts --pack-destination /tmp/oobe-sap-sdk-inspection
npm run proof:sap-preview
npm run proof:live-rehearsal
npm run proof:ace-x402-preview
npm run verify:prep
```

## Evidence paths from this no-sign pass

- proof/sap-registration.preview.latest.json
- proof/live-rehearsal.no-sign.latest.json
- proof/ace-x402-requirements.preview.latest.json
- proof/live-execution-approval-packet.draft.md

## SAP mainnet identity / registration gate

- **Status now:** registration arguments previewed only.
- **Preview command:** `npm run proof:sap-preview`
- **Network:** `solana:mainnet-beta`
- **Manifest:** `agent.manifest.draft.json`
- **Live SDK call shape:** `SapClient.from(provider)` then `client.agent.register` with the previewed `registerAgentArgs`
- **Current blockers before live registration:**
- none detected by preview

Approval still required before wallet/provider connection, SDK live preview, signing, rent/fee spend, or transaction send.

## Ace Data Cloud usage gate

- **Status now:** captured 15 distinct Ace services: gemini_chat, kling-video-generation, localization-translate, midjourney-generation, nano-banana-image-generation, openai-chat-completions, openai-embeddings, openai-responses, openai_chat, seedream-image-generation, serp-google-search, serp_google, short-url, suno-music-generation, veo-video-generation.
- **Needed for Ace category:** three distinct real Ace services; this is already satisfied in the proof archives.
- **Current researched route:** Ace x402 docs use `https://platform.acedata.cloud`, a platform token, an order id, Base mainnet USDC, HTTP 402 payment requirements, and `X-PAYMENT-RESPONSE` receipt capture.
- **Credential note:** Ace docs say API tokens are bound to specific acquired services or a global credential. A Platform Token/order token can prove x402 order state but may not authorize service endpoints.
- **No-spend preview command:** `npm run proof:ace-x402-preview`
- **No-spend preview output:** `proof/ace-x402-requirements.preview.latest.json`
- **Signer caveat:** docs show raw EVM signing-material examples; this project should use a managed signer path instead and must not store raw signing secrets.
- **Before live use:** confirm service names, account/project route, allowed input data, proof format, cost/credit rules, and privacy note.
- **Approval needed:** account route, exact service calls, max cost, and evidence capture path.

## Synapse Sentinel usage gate

- **Status now:** no Synapse Sentinel service called.
- **Needed for general route:** one legitimate Sentinel usage proof, if this is the selected category path.
- **Before live use:** confirm official endpoint/UI path, accepted proof format, input privacy, and cost.
- **Approval needed:** exact service call, max cost, and evidence capture path.

## x402 / SAP settlement gate

- **Status now:** local x402 cost/header model only; no escrow, facilitator, payment, or transaction.
- **Best researched path:** Ace order payment through x402 on Base USDC, if a managed signer can create the required `X-PAYMENT` header and the cost is explicitly approved.
- **Before live settlement:** deploy/identify a real service resource, select payer/payee, asset, amount, facilitator/escrow route, and non-wash rationale.
- **Approval needed:** exact amount, addresses, route, cost cap, and hard stop conditions.

## Hard no-go checks

- No raw secrets, seed material, wallet files, API tokens, or private runtime paths in public artifacts.
- No artificial/wash volume or circular self-payment presented as real market activity.
- No claim that the bounty is complete until live SAP/Ace/Sentinel/settlement evidence exists.
- No public repo, X post, or Superteam submission without final reviewed copy and explicit approval.

## Final approval prompt shape

```text
Approval request: OOBE x Ace live gate

Action:
Platform/accounts:
Wallet/network:
Max total cost:
Exact commands/steps:
Expected upside:
Downside/risk:
Hard stops:
Public artifacts to be created:

Reply YES OOBE LIVE GATE to approve, or NO to stop.
```
