# Pablito Safe AI Invocation Layer Architecture

## Positioning

This is not a generic "pay crypto for tokens" wrapper. The stronger product is B2B agent infrastructure:

> x402 at the edge; provider adapters behind it. Agents discover, quote, pay, invoke, and receive receipts without exposing keys.

The customer is an agent developer or operator. Their bot should not stop mid-run because a provider credit card fails, a localized balance hits zero, or each service requires a different account.

## Public Product

Public name: **x402 Crypto Pay-As-You-Go AI API Router**

Public promise:

- install one skill
- discover hosted AI/data services
- quote a call
- pay per call with x402, or use a developer-credit key
- stream progress so the agent does not look hung
- return a deterministic receipt the agent can log and reason over

Do not publicly market this as direct provider resale. Do not expose internal provider costs, model routing, or model-tier pricing language. Public quotes show:

- selected service
- payment asset/network
- route/network estimate when applicable
- total debit

## Provider Boundary

Every public paid connector should satisfy the x402 customer-facing standard. Providers fall into two lanes:

- **Native x402/SAP providers:** the upstream itself supports x402/SAP and can produce direct payment evidence. Ace Data Cloud is the first live upstream and OOBE/Ace bounty lane.
- **x402-wrapped API providers:** the caller pays Wisely/Pablito through x402, then the hosted adapter calls the upstream with server-side provider credentials or credits. The caller never sees provider API keys or wallet signing secrets.

This means Higgsfield, Meshy, Runway, Luma, fal, Replicate, BFL/FLUX, ElevenLabs, HeyGen, Tavus, and similar providers can be added without changing the payment surface, as long as the provider has a documented API and compatible terms.

## Live Modes

### 1. Per-Call x402

Status: live path.

Flow:

1. Buyer agent calls `/ai/manifest`.
2. Buyer agent calls `/ai/quote`.
3. Buyer agent calls `/ai/invoke`.
4. Endpoint returns `402 Payment Required`.
5. Buyer signs/pays through its wallet/x402 runtime.
6. Buyer retries with `X-PAYMENT`.
7. Server verifies/settles, runs provider call, records receipt.

### 2. Developer Credit Balance

Status: live path.

Flow:

1. Buyer calls `/ai/credits/purchase` for a small amount such as `$5`.
2. Endpoint returns x402 payment requirements.
3. Buyer signs/pays through its wallet/x402 runtime.
4. Endpoint returns a one-time `pablito_dev_*` key.
5. Buyer stores the key in their agent secret store.
6. Agent checks `/ai/credits/status`.
7. Agent calls `/ai/invoke` with `X-Developer-Key` or bearer token.
8. Server hard-checks balance before the provider call.
9. Server debits only after a successful hosted call and records a ledger receipt.

Current ledger storage:

- state: `agent-payments/multiplexer/developer-credits.json`
- append-only ledger: `agent-payments/multiplexer/developer-credit-ledger.jsonl`

Security:

- developer keys are hashed at rest
- admin creation/adjustment requires `PABLITO_MULTIPLEXER_ADMIN_TOKEN`
- no wallet signing secrets, provider keys, raw cards, or passwords are accepted

## Live Proof Status

- Base USDC -> x402 developer-credit purchase: proven live.
- Base ETH -> USDC -> x402 developer-credit purchase: proven live.
- x402-funded developer key -> paid AI invoke with receipt: proven live.
- DOGE, NEAR, XRP, SOL, BONK, PEPE, and similar routes: quote/handoff until the caller's exchange, bridge, or wallet executor signs and executes the route.

## Planned Modes

- tenant limits and per-agent budgets
- low-balance webhooks/alerts
- provider failover policy
- usage analytics by `agent_id`
- monthly developer license/support tier
- provider adapters beyond Ace: video, 3D assets, voice, avatar, image, and aggregator APIs

## Endpoint Contract

Manifest:

```text
GET /ai/manifest
```

Quote:

```text
POST /ai/quote
```

Invoke with x402:

```text
POST /ai/invoke
X-PAYMENT: <payment envelope>
```

Invoke with developer credit:

```text
POST /ai/invoke
X-Developer-Key: <pablito_dev_key>
```

Status:

```text
GET /ai/credits/status
Authorization: Bearer <pablito_dev_key>
```

Admin create:

```text
POST /ai/credits/create
Authorization: Bearer <admin_token>
```

Admin adjust:

```text
POST /ai/credits/adjust
Authorization: Bearer <admin_token>
```

Receipt lookup:

```text
GET /ai/receipts/{receiptId}
```

Compatibility:

```text
/ace/* remains available for existing clients and OOBE/Ace bounty proof.
```

## Failure Behavior

The endpoint returns clean machine-readable failures. It does not throw unhandled provider errors back into the caller's agent loop.

Current fallback policy:

- no automatic provider/model fallback by default
- same-family fallback candidates are returned on provider failure
- caller can retry with another service id after checking budget and output compatibility

This avoids silent behavior changes while still making the next action obvious to the agent.

## Bounty Accounting

Hosted usage and receipts remain attributable to Wisely/Pablito. Local-only forks may help a buyer, but they do not create Wisely/Pablito hosted usage, payment volume, or receipts.

Internal proof may mention Ace/SAP/x402 where needed for the bounty. Public product copy should emphasize agent uptime, unified API access, progress streaming, and receipts.
