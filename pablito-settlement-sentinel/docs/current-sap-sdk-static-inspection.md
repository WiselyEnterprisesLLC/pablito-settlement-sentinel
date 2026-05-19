# Current SAP SDK Static Inspection

Date: 2026-05-17 UTC

Status: static inspection only. No SDK install, wallet connection, signing, spend,
registration, escrow, settlement, or public submission was performed.

## Package Snapshot

Inspected with:

```bash
npm view @oobe-protocol-labs/synapse-sap-sdk --json
npm pack @oobe-protocol-labs/synapse-sap-sdk@0.17.0 --ignore-scripts
```

Observed:

- Package: `@oobe-protocol-labs/synapse-sap-sdk`
- Latest inspected version: `0.17.0`
- Published: 2026-05-16 per npm metadata
- License in npm metadata: `Apache-2.0`
- Runtime dependencies include Anchor, Solana Web3, SPL Token, BN, and bs58.
- Exported areas include types, PDAs, instructions, accounts, events, utils, modules, registries, and parser pieces.

Also checked current broader client SDK metadata:

- Package: `@oobe-protocol-labs/synapse-client-sdk`
- Latest inspected version: `2.0.6`
- Includes RPC, plugin tooling, MCP surfaces, and x402 gateway surfaces.

## Useful SDK Surface

Static type declarations show these relevant paths:

- `SapClient.from(provider)` / `SapClient.fromProgram(program)`
- `client.agent.register(args)` for SAP agent identity registration.
- `client.discovery.findAgentsByCapability(capabilityId)` and related discovery calls.
- `client.builder.agent(...).description(...).x402Endpoint(...).addCapability(...).addPricingTier(...).register()`
- `client.x402.calculateCost(...)` is a pure helper.
- `client.x402.preparePayment(...)` exists but is marked deprecated for V1 escrow.
- `client.escrowV2.create(...)`, `deposit(...)`, `settle(...)`, `finalizeSettlement(...)`, and dispute-window helpers are the preferred V2 path after approval.

## Latest Register-Agent Detail

Additional static inspection of `@oobe-protocol-labs/synapse-sap-sdk@0.17.0`
showed two useful registration surfaces:

- High-level agent module:
  - derives the agent PDA from a wallet,
  - derives the stats PDA from the agent PDA,
  - exposes agent fetch/fetch-nullable helpers for post-registration proof,
  - exposes the chain-mutating registration method that returns a transaction signature.
- Low-level instruction builder:
  - builds a `registerAgent` instruction with signer, wallet, agent PDA, agent stats PDA, and global registry accounts,
  - accepts the same public metadata fields used by `agent.manifest.draft.json`: name, description, capabilities, pricing, protocols, agent id, agent URI, and x402 endpoint.

The safer next step is therefore a controlled provider-preview path:

1. derive the expected PDAs from the chosen wallet,
2. build or simulate the registration transaction,
3. capture fee/rent and account previews,
4. stop before signature/broadcast,
5. request explicit approval before any live transaction.

## Important Correction To Older Drafts

Older notes that point to a one-command `synapse-sap agent register --manifest ... --simulate`
should be treated as CLI-shape placeholders, not confirmed final commands.

The npm package README describes a CLI, but the inspected SDK package itself did not expose a `bin`
entry in npm metadata. The final live plan should therefore prefer a controlled Node script that:

1. imports the pinned SDK only after dependency approval,
2. builds registration/escrow calls in no-send/no-sign mode where possible,
3. prints the exact transaction/request preview,
4. stops before signing or sending.

## Live Path Implication

To complete the bounty safely, the next real technical gate is not "submit now."
It is:

1. choose category: General/Sentinel or Ace/3 distinct services,
2. confirm route: public Superteam or sponsor-confirmed agent API,
3. install pinned dependencies in an isolated workspace only after approval,
4. build no-send/no-sign previews,
5. request approval for any wallet signing, rent/fee, service call, public repo, X post, or final Superteam submission.
