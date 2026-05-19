# Live Route Research - 2026-05-17

Status: research only. No login, token creation, wallet connection, signing, spend, order payment, public post, or bounty submission was performed.

## Sources Checked

- OOBE Synapse Client SDK docs: `https://oobe-protocol.github.io/synapse-client-sdk/`
- npm metadata: `@oobe-protocol-labs/synapse-client-sdk@2.0.6` and `@oobe-protocol-labs/synapse-sap-sdk@0.17.0`
- AceDataCloud x402 guide: `https://docs.acedata.cloud/en/guides/x402`
- PyPI package page: `acedatacloud-x402==2026.4.20.1`

## Findings

### OOBE / Synapse

- The Synapse client SDK exposes agent commerce concepts: session open, tool execution, session settlement, pricing/metering, response validation, and marketplace/discovery pieces.
- It also exposes x402 buyer/seller helpers and facilitator lookup.
- The SDK docs show plugin coverage across Solana tools, including DeFi, token, NFT, and Blinks capability families.
- This supports the bounty architecture, but the repo still needs a real approved live usage path before any completion claim.

### AceDataCloud / x402

- AceDataCloud documents a concrete x402 payment path under `https://platform.acedata.cloud`.
- The documented payment route is Base mainnet USDC.
- The flow is: create/obtain an Ace platform token, create/identify an order, call the order payment endpoint without `X-PAYMENT`, receive HTTP 402 requirements, sign an `X-PAYMENT` envelope, retry, then capture `X-PAYMENT-RESPONSE` as receipt evidence.
- The docs' examples use exported EVM signing material for local signing. This repo must not store or expose raw signing secrets. A production-safe path should use a managed signer such as the existing CDP/agent wallet flow if it can produce the required x402 signature without revealing key material.

## Implication For This Bounty

Best current live-proof path appears to be:

1. Keep SAP/Synapse registration preview separate and no-sign until approved.
2. Use AceDataCloud x402 as the likely real settlement proof path if Paul approves an Ace platform token/order and a managed signer route.
3. Capture the `X-PAYMENT-RESPONSE` receipt and order state as live settlement evidence.
4. Only then publish public repo/X/Superteam materials.

## Current Blockers

- Need Ace account/platform token and order id, handled as credentials and not committed to repo.
- Need a no-raw-secret signer route for Base USDC x402. CDP managed wallet signing should be investigated before any live payment.
- Need actual Ace service selection: three distinct services if pursuing Ace category, or a sponsor-confirmed alternative.
- Need Synapse Sentinel route/service proof if pursuing general category.
- Need approval before any live signing, spend, public repo, X walkthrough, or Superteam submission.
