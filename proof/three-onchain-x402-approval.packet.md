# Three Ace x402 On-Chain Proof Approval Packet

Status: draft control packet. It does not sign, spend, submit, post, or publish by itself.

## Goal

Capture three legitimate Ace Data Cloud x402 payment proofs on Base, each with:

- Ace order payment response
- Base USDC x402 requirement
- managed CDP signer payment
- public Base transaction hash
- no raw `X-PAYMENT` header stored
- no platform token, wallet secret, private key, or personal fiat funding stored

## Current State

- Captured on-chain Ace x402 proofs: 1/3.
- Existing known transaction: `0x237b13bd45979444d1952325e1d5729362ece25e115929c3bd472a17a2b37243`.
- Remaining need: two more unpaid, legitimate Ace order IDs that return x402 `402 Payment Required` requirements.

## Runtime Command Shape

The guarded runner accepts one order or a batch:

```powershell
npm run proof:ace-x402-batch
```

Expected environment inputs:

- `ACE_PLATFORM_TOKEN`
- `ACE_X402_ORDER_IDS` or `ACE_X402_ORDER_IDS_FILE`
- `ACE_X402_EXECUTE=true`
- `ACE_X402_LIVE_APPROVAL=appr_20260518022742_wg7log`
- optional `ACE_X402_MAX_PER_ORDER_ATOMIC`
- optional `ACE_X402_MAX_TOTAL_ATOMIC`

## Default Caps

- Default max per Ace order: `1.33` Base USDC.
- Default pay-to allowlist: `0x4F0E2D3477a1B94CF33d16E442CEe4733dadCeE7`.
- Default asset/network: Base USDC only.

## Hard Stops

- Stop if the Ace pay-to address changes from the allowlist.
- Stop if an order exceeds the per-order or total cap.
- Stop if Base USDC balance is insufficient.
- Stop if an order does not return x402 payment requirements.
- Stop if a platform/API response would require personal fiat funding.
- Stop if the proof would be artificial/wash volume rather than real Ace service usage.

## Exact Approval Phrase

```text
YES RUN THREE ACE X402 PROOFS
Approved order IDs:
Max per order:
Max total:
Use existing Base USDC/CDP signer only: yes
No personal fiat funding: yes
```
