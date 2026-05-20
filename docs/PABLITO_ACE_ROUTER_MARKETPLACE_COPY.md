# Marketplace Copy: x402 Crypto Pay-As-You-Go AI API Router

## Product Name

x402 Crypto Pay-As-You-Go AI API Router

## Tagline

Tell your agent to pay for AI chat, images, video, audio, search, and x402 paywalls with crypto.

## Short Listing Description

Install this free skill so your autonomous agent can route hosted AI/data/generative calls through one x402-compatible rail, without juggling separate provider subscriptions, API balances, or keys. Built for OpenClaw users, trading/data bots, and agent developers who need high-velocity service calls with progress and receipts.

## Long Listing Description

Autonomous agents should not stop mid-run because one provider balance ran dry or a credit-card refill screen appeared.

x402 Crypto Pay-As-You-Go AI API Router gives the agent a hosted service catalog, live quote flow, x402 payment path, developer-credit easy mode, progress stream, and receipt-backed output summary. Live mode supports per-call x402 with Ace Data Cloud as the first upstream and bounty lane. The easiest user path is a reusable developer-credit key: the user funds a small balance once, the agent stores the key securely, and future calls use `X-Developer-Key`.

The product is not Ace-only. The public payment standard remains x402 while upstream providers can be native x402/SAP services or server-side adapters for documented APIs such as Higgsfield, Meshy, Runway, Luma, fal, Replicate, BFL/FLUX, ElevenLabs, HeyGen, and Tavus.

The public quote shows the selected service, payment asset/network, estimated route/network cost, and total debit. Internal provider cost, model routing, and Wisely margin formulas are intentionally not exposed as customer-facing line items.

The package is intentionally a thin client. Hosted routing keeps usage, receipts, and measurement tied to Wisely/Pablito. A purely local fork may still be useful, but it will not create Wisely/Pablito hosted usage or payment volume.

Plain-English pitch:

Got old coins, awkward memecoins, or shitcoins sitting around in wallets? This skill lets your agent quote how to turn that crypto into usable AI/API fuel for x402 payment-required services. Base USDC and Base ETH -> USDC -> x402 are live-proven. Other coins are quote/handoff routes until your wallet, bridge, or exchange executor signs them.

## What It Includes

- Hosted AI/data/generative service manifest.
- Universal crypto quote flow.
- x402-ready invoke flow.
- Developer-credit purchase/top-up flow.
- `X-Developer-Key` paid invocation for easy repeated calls.
- Customer progress streaming via Server-Sent Events.
- Multi-service connector definitions.
- Provider-neutral `/ai` endpoints with `/ace` compatibility for the bounty lane.
- Public-safe proof/receipt pattern.
- Thin Node helper: `client.mjs`.
- Setup and guardrails in `SKILL.md`.

## How A Novice Uses It

Tell your agent:

```text
You have the x402 Crypto Pay-As-You-Go AI API Router.

Use this base URL:
https://payments.wiselyenterprisesllc.com/ai

First call /manifest to see what is live.
For easy mode, help me buy a developer-credit key through /credits/purchase, save it securely, and use /invoke with X-Developer-Key.
For image/video/audio, use /invoke?stream=1 so I can see progress.
If you find any website or API that says x402 Payment Required, use https://payments.wiselyenterprisesllc.com/x402/quote to show how to pay it from the crypto I have.
Show me the route and total debit before signing.
Never ask me for seed phrases, private keys, raw cards, bank logins, exchange passwords, or provider API keys.
```

Example requests:

- "Use the router to show me what AI services I can buy with a $5 credit balance."
- "Generate an image using the router and stream progress."
- "Make a short video demo. Pick the live video provider from the manifest."
- "Run a web search through the router and show me the receipt."
- "This API returned x402 Payment Required. Quote how to pay it from my SOL/XRP/DOGE before I sign anything."

## Supported Service Families

- chat and response APIs
- embeddings
- image generation
- video generation
- audio/music generation
- web/search/data
- short links
- translation
- 3D assets and avatar/video providers as adapters are added
- selected manual-review/BYO-token lanes for captcha, identity, and proxy use cases

## Pricing Copy

Public pricing is simple:

- selected AI service
- payment asset/network
- estimated route/network/conversion cost, when applicable
- total debit before signing

Wisely/Pablito may route across providers and internal models to fulfill the service. The customer does not need that breakdown to approve the payment.

For developers, position this as infrastructure convenience: one balance/rail, many services, receipts, progress streaming, and fewer provider accounts to babysit. The ClawMart skill is free; hosted usage is paid by quoted x402/developer-credit calls.

## Best Audience

- agent builders
- OpenClaw users
- x402 builders
- AI agents with funded wallets
- developers who want one funded rail for many AI/data calls
- bots that cannot pause mid-run for provider balance refills

## Launch Post

Agents should not stall because a provider balance ran dry.

I built x402 Crypto Pay-As-You-Go AI API Router: install the skill, ask for an AI/data/media service, quote the x402 rail, stream status, return the result, and keep the receipt.

One rail. Many calls. Less babysitting the token jars.

No recovery-word handling. No raw cards. No provider keys in your agent.

## Non-Spam Distribution Targets

- ClawMart listing
- MonetizeYourAgent directory
- MYA jobs/swarms where x402/agent-payment work is relevant
- X post/thread from Pablito
- GitHub public repo/readme after redaction scan
- Smithery/MCP directories after MCP wrapper exists
- Skills marketplaces after package polish

## Launch Rule

Do not claim live bounty-winning volume until real non-self usage and receipts exist.
