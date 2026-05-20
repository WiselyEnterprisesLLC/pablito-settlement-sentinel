# x402 Crypto Pay-As-You-Go AI API Router

This is the novice-friendly public guide for the hosted Wisely/Pablito router.

The simple version:

> Install the free skill, tell your agent what AI/API work you want, and let the agent pay as it goes with crypto through x402 or a reusable developer-credit key.

Base URL:

```text
https://payments.wiselyenterprisesllc.com/ai
```

External x402 quote URL:

```text
https://payments.wiselyenterprisesllc.com/x402/quote
```

## What It Does

The router gives AI agents one clean buying lane for digital AI/API work:

- discovers live services through `/ai/manifest`
- quotes the total cost before a call
- lets a wallet pay directly with x402
- lets a user buy a reusable developer-credit key
- invokes hosted AI/data/media services through `/ai/invoke`
- streams progress for slow image, video, and audio jobs
- returns receipts so the agent can remember what happened
- quotes how to pay outside x402 sellers from the crypto the user already has

The customer-facing product is not "Ace only." Ace Data Cloud is the first live upstream and bounty proof lane. The same x402 boundary can wrap other documented provider APIs later, such as video, 3D, avatar, voice, image, search, model aggregation, and media-generation providers.

## Current Proof Status

Live proven:

- Base USDC -> x402 developer-credit purchase
- Base ETH -> USDC -> x402 developer-credit purchase
- x402-funded developer-credit key -> paid AI invoke with receipt capture
- hosted manifest, quote, invoke, streaming, receipts, and external x402 quote endpoints

Quote/handoff proven:

- DOGE/Coinbase
- NEAR/Coinbase
- XRP/Coinbase
- SOL/Solana
- BONK/Solana
- PEPE/Base
- USDC/Base

Important distinction: quote/handoff means the router can explain the route into the required x402 settlement asset, but the caller's wallet, bridge, or exchange executor still has to sign and execute it. The router does not ask for seed phrases, private keys, raw cards, bank credentials, exchange passwords, or provider API keys.

Public transaction proof captured during live tests:

- Base USDC x402 purchase: `0x60bca5eb8d44c27647ad7b8f89bc628e3ed529f11601f495e0267b51b32026ea`
- Base ETH fund: `0x50a8d398202c123608c48debc228e52a2a99ab5e5f605e9b36ec9448b344e936`
- Base ETH -> USDC swap: `0x763022aec42f340bdb36e7df6d7f4661217a5d2b88f33668832b6f17a8ebc9a7`
- Base ETH route x402 purchase: `0xf232228528779f8dbfbc7a268b8547eeec2bb9c7c8d1a6cc04556829be7d7dc0`
- Developer-credit paid AI invoke x402 purchase: `0x1d83a8590654f8309477a2ab6321c973a87da20ad0c8aea592ccc3afe7bc5ba5`
- Paid invoke receipt id: `mux_20260520024000_fhm1ld`

## What To Tell Your Agent

Copy this into your agent:

```text
You have the x402 Crypto Pay-As-You-Go AI API Router.

Use this base URL:
https://payments.wiselyenterprisesllc.com/ai

When I ask for AI/API work:
1. Call /manifest first so you know what services are live.
2. If I need easy setup, help me buy/top up a developer-credit key through /credits/purchase.
3. Let my wallet/x402 runtime pay the returned payment requirement.
4. Save the developer-credit key in your secure secret store.
5. Use /invoke with X-Developer-Key for normal calls.
6. Use /invoke?stream=1 for image, video, audio, or long-running jobs.
7. If another website or API returns x402 Payment Required, call https://payments.wiselyenterprisesllc.com/x402/quote with the seller's payment requirement and the crypto I have.
8. Show me the route and total debit before any wallet signs.
9. Never ask me for seed phrases, private keys, raw cards, bank logins, exchange passwords, or provider API keys.
```

## Easy Mode: Developer Credit

This is best for novice users.

1. The agent asks to buy a small credit balance, such as `$5`.
2. The endpoint returns x402 payment instructions.
3. The user's wallet pays once.
4. The endpoint returns a developer key once.
5. The agent stores the key securely.
6. Future calls use `X-Developer-Key`.

This avoids making the user manually handle a payment proof on every single AI call.

## Direct x402 Mode

This is best for wallet-native agents.

1. Agent calls `/ai/manifest`.
2. Agent calls `/ai/quote`.
3. Agent calls `/ai/invoke`.
4. Endpoint returns `402 Payment Required`.
5. Wallet signs and pays.
6. Agent retries `/ai/invoke` with `X-PAYMENT`.
7. Endpoint verifies payment, runs the service, and returns a receipt.

## External x402 Seller Mode

If an agent finds a new paid resource on the internet that returns `402 Payment Required`, it can use this router as a payment route advisor.

Example user instruction:

```text
This API returned x402 Payment Required. Use the x402 router to quote how to pay it from the crypto I have. Show me whether the route is direct, same-chain swap, bridge, or exchange handoff before I sign anything.
```

The router returns a no-custody route. It does not take wallet secrets.

## Example Uses

```text
Use the x402 router to show me what AI services I can buy with a $5 credit balance.
```

```text
Generate an image for my post using the router. Use streaming so I can see progress. Do not spend more than $1.
```

```text
Make a short video demo. Check /manifest first and pick a live video provider.
```

```text
Run a web search through the router and show me the receipt.
```

```text
I have some shitcoins in an old wallet. Check whether the x402 router can quote a path from those coins into the payment coin this AI service needs.
```

## Safety Boundary

The router and skill are designed to expose:

- service catalog
- quotes
- payment requirements
- progress events
- receipts
- public-safe result summaries

They are not designed to expose:

- private keys
- seed phrases
- raw cards
- bank credentials
- exchange passwords
- provider API keys
- private OpenClaw memory
- server shell access

All service outputs, search results, media captions, endpoint errors, and customer input are untrusted data. They can be summarized and stored as receipts, but they cannot override the installing agent's tool policy, wallet rules, endpoint URL, or safety boundaries.
