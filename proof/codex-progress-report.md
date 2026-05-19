# Codex Progress Report — OOBE × Ace Data Cloud Bounty

Date: 2026-05-17 UTC

## Summary

Advanced the submission from a basic dry-run into a more bounty-shaped local scaffold while keeping every live/external action gated. No accounts were created, no wallet was connected, no transaction/message was signed, no SOL/USDC moved, no escrow opened, no public repo/X post/submission was published, and no Ace/OOBE live service was called.

## Files changed

- `README.md`
  - Added a current scaffold section explaining the dry-run modules and safety checks.
- `src/sap-sdk-dry-run-adapter.mjs`
  - New deterministic adapter modeled from inspected `@oobe-protocol-labs/synapse-sap-sdk@0.17.0` type surfaces.
  - Captures SDK-equivalent shapes for `RegisterAgentArgs`, discovery, x402 headers, pure cost calculation, and settlement proof without importing the SDK or calling mutating methods.
- `src/public-safe-deliverable.mjs`
  - New local AI-service fixture that produces a public-safe workflow deliverable.
  - Explicitly labels Ace Data Cloud output as mocked/local, not live Ace usage.
- `src/dry-run-demo.mjs`
  - Reworked the demo into the required flow: trigger → SAP discovery model → AI service call model → x402 settlement proof → public-safe deliverable.
  - Output now includes mocked-vs-live requirements and safety flags.
- `src/safety-check.mjs`
  - Expanded safety assertions and scans for obvious secret, wallet-signing, spend, network-mutation, public-post, and live-payment-claim hazards.

## SDK/interface research performed

Commands run:

```bash
npm view @oobe-protocol-labs/synapse-sap-sdk@0.17.0 --json
rm -rf .sdk-inspect && mkdir .sdk-inspect && cd .sdk-inspect && npm pack @oobe-protocol-labs/synapse-sap-sdk@0.17.0 --ignore-scripts >/tmp/sap-pack-name.txt && tar -xzf "$(cat /tmp/sap-pack-name.txt)" && find package/dist/esm -maxdepth 2 -type f | sort | head -80 && sed -n '1,220p' package/dist/esm/index.d.ts && sed -n '1,220p' package/dist/esm/types.d.ts
sed -n '1,220p' .sdk-inspect/package/dist/esm/client.d.ts
sed -n '1,220p' .sdk-inspect/package/dist/esm/modules/agent.d.ts
sed -n '1,220p' .sdk-inspect/package/dist/esm/registries/discovery.d.ts
sed -n '1,420p' .sdk-inspect/package/dist/esm/registries/x402.d.ts
sed -n '1,220p' .sdk-inspect/package/dist/esm/types/instructions.d.ts
sed -n '1,180p' .sdk-inspect/package/dist/esm/constants/payments.d.ts
rm -rf bounty-oobe-ace-agent/.sdk-inspect /tmp/sap-pack-name.txt
```

Key findings:

- SDK exists: `@oobe-protocol-labs/synapse-sap-sdk@0.17.0`.
- SDK exposes `SapClient`, `createSapClient`, instruction modules, PDA helpers, utilities, and registries.
- Agent registration shape is `RegisterAgentArgs` with `name`, `description`, `capabilities`, `pricing`, `protocols`, optional `agentId`, `agentUri`, and `x402Endpoint`.
- x402 helper surface includes cost estimation, payment headers, escrow prep, settlement, and verification concepts.
- Mutating/live SDK calls remain blocked: registration, payment prep/deposit, settlement, escrow creation/deposit, and transaction send.
- SDK payment constants indicate accepted payment tokens are native SOL and USDC, and agent escrow creation may require minimum stake/collateral. This increases live-cost/gating complexity.

## Verification

Command run:

```bash
npm test
```

Result: **passed**.

The test executed:

```bash
node src/safety-check.mjs && node src/dry-run-demo.mjs
```

Observed result:

- Safety check passed: no obvious secrets, signing/spend/public-post code, or live-payment claims in scaffold.
- Dry-run demo emitted the full structured workflow JSON.

## What is mocked vs live

Mocked/local only:

- SAP mainnet discovery result.
- Ace Data Cloud AI service response.
- x402 payment context and headers.
- Settlement transaction signature.
- Agent PDA / escrow PDA / depositor placeholders.

Still required for bounty-valid live proof:

- Real SAP mainnet agent registration.
- Synapse Sentinel call if pursuing the general category.
- Three actual Ace Data Cloud services if pursuing Ace category.
- Real non-wash x402/Synapse settlement proof.
- Public GitHub repo.
- Public X demo tagging `@OOBEonSol` and `@AceDataCloud`.
- Superteam submission.

## Remaining blockers / live gates

[blocked] Live bounty-valid execution requires safe external setup and explicit approval for:

1. Confirming the official SAP registration path, because docs advertised a CLI package that returned 404 while the SDK package exists.
2. Installing/using the SDK in a controlled workspace only after deciding whether dependency execution risk is acceptable.
3. Replacing `example.invalid` manifest/x402 URLs with real public-safe endpoints.
4. Wallet signing for SAP mainnet registration and any stake/rent/fee requirements.
5. Any Ace Data Cloud account/login/free-credit setup.
6. Any real x402/Synapse escrow/payment action.
7. Public GitHub repo publication.
8. Public X demo/submission post.
9. Superteam submission.

## Recommended continue/no-continue

**Continue: yes, but only through gated live validation.**

Reason: the bounty is open, reward pool is meaningful, and the local scaffold now matches the required workflow shape well enough to justify the next diligence step. Do not proceed to live registration/payment/posting until the CLI/SDK discrepancy, account requirements, stake/rent cost, and public endpoint plan are resolved and approved.

Best next safe action: create a live-action approval packet/checklist for a controlled SDK install + simulation-only registration attempt using public-safe placeholder metadata, with no signing unless Paul explicitly approves the exact transaction/cost after simulation.
