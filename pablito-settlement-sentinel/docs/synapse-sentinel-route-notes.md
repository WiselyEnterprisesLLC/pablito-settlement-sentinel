# Synapse / Sentinel Route Notes

Status: route research, not live Sentinel proof.

## What is confirmed from public docs/pages

- Synapse is presented as OOBE's Solana RPC/gateway infrastructure with API key management, analytics, webhooks/events, and SDK links.
- The Synapse SAP Explorer public API is currently read-only under `/api/v1`.
- Explorer public reads require no key for basic use and can optionally accept `x-api-key` for higher limits.
- The current public Explorer surface is useful for before/after SAP registration proof, but not by itself a mutating Sentinel usage proof.

## Current artifact

`proof/synapse-explorer-snapshot.latest.json` captures the read-only before-state for later comparison after SAP registration.

## Remaining blocker

The exact "Synapse Sentinel" service path is not yet confirmed from the public pages. For a general-category submission, do not claim Sentinel usage until one legitimate Sentinel call or accepted UI/API action is identified and captured.

## Next acceptable live step

After sponsor/platform clarification or official endpoint discovery:

1. record the exact endpoint/UI path,
2. record expected cost and data sent,
3. run one legitimate call only after approval,
4. save public-safe evidence,
5. rerun the Explorer snapshot to show before/after registration/discovery context.

Until then, prefer the Ace-category route if valid Ace service tokens can be acquired.
