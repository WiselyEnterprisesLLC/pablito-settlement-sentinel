# SAP Mainnet Registration Approval Packet - Draft Only

**Status:** DRAFT ONLY. This file does not approve wallet connection, signing, transaction broadcast, fee/rent spend, public posting, public repo creation, or Superteam submission.

## Proposed next live-adjacent step

Connect the controlled Solana provider for a **no-send SAP registration transaction preview only**.

## Current readiness

- **Status:** ready-for-controlled-no-send-registration-preview
- **Network:** `solana:mainnet-beta`
- **SAP program:** `SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ`
- **Candidate wallet:** `HE9MYDzoLAgnwbRXbiWRGGvoE2QE9LqKdQGJhNLPxtVj`
- **Manifest:** `agent.manifest.draft.json`
- **Public metadata URL:** `https://wiselyenterprisesllc.com/oobe-ace/pablito-settlement-sentinel.metadata.json`
- **Public x402 URL:** `https://wiselyenterprisesllc.com/.well-known/x402/pablito-settlement-sentinel.json`
- **Manifest blockers:** none detected by local preview


## Why this matters

The bounty still needs SAP mainnet identity evidence. The current repo has public-safe metadata, x402 drafts, Ace x402/payment artifacts, and Ace service proofs, but no SAP mainnet identity transaction or post-registration explorer proof.

## Approval needed before the next step

- Exact wallet/provider to use.
- Maximum fee/rent cap.
- Confirmation that the network is `solana:mainnet-beta`.
- Confirmation that the metadata and x402 URLs above are the intended public URLs.
- Approval to stop at transaction preview/simulation first.

## Hard stops

- Stop before signature until the exact fee/rent estimate is visible.
- Stop before any transaction broadcast.
- Stop if network is not solana:mainnet-beta.
- Stop if the public metadata or x402 URLs differ from agent.manifest.draft.json.
- Stop if the fee/rent estimate exceeds the approved cap.
- Stop if any tool asks for seed material or a raw private key.

## Evidence to capture only after approval

- Wallet public address used for registration.
- Agent PDA and stats PDA derived by the SDK/provider.
- Transaction preview or simulation output before signature.
- Fee/rent estimate and actual fee after any approved send.
- Transaction signature and explorer URL, only if an approved send happens.
- Post-registration Synapse Explorer/API snapshot proving discoverability.
- Redacted command log with no token, wallet secret, or runtime private path.

## Approval phrase shape

```text
YES SAP NO-SEND PREVIEW
Wallet:
Max fee/rent preview cap:
Network: solana:mainnet-beta
Stop before signing/sending: yes
```
