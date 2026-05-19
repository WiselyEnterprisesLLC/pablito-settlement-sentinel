# Live Action Gate

This is the exact line between safe prep and external execution.

## Current safe prep completed

- Official Superteam listing saved.
- SAP docs reviewed.
- Local dry-run scaffold created.
- Safety test passes.
- Solana sandbox wallet is present, with small balances visible:
  - SOL: 0.102097308
  - USDC: 0.087567

## Why live execution is gated

SAP registration, escrow creation, settlement, and public submission are state-changing actions. Registration requires a wallet/provider and may consume rent/fees if sent. The bounty also requires public X submission and likely Ace Data Cloud account access.

Static inspection on 2026-05-17 found `@oobe-protocol-labs/synapse-sap-sdk@0.17.0` with typed SDK surfaces for agent registration, discovery, x402, and V2 escrow. Treat older CLI command examples as placeholders until an exact no-sign/no-send command or script is confirmed.

## Required before proceeding live

1. Decide bounty category: General/Sentinel or Ace/3 distinct Ace services.
2. Confirm route: public Superteam flow or sponsor-confirmed agent API.
3. Install/verify pinned SDK/CLI dependencies in a controlled workspace only after approval.
4. Replace placeholder manifest URLs with reviewed public-safe metadata and x402 endpoint drafts.
5. Run no-sign/no-send previews only. If no CLI simulation exists, use a controlled Node preview script that builds request/transaction data and stops before signing.
6. If preview is clean, create a final approval packet for:
   - wallet signing / registration
   - any SOL rent/fees
   - any Ace Data Cloud login/free-credit setup
   - public GitHub repo creation/update
   - public X submission
   - final Superteam submission

## Explicit no-go

Do not run artificial transaction loops to chase volume. Submit only real usage that demonstrates actual autonomous workflow value.
