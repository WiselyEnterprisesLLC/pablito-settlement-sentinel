# Provider Expansion Research - 2026-05-19

## Product Rule

Pablito Safe AI Invocation Layer is provider-neutral, but every public paid connector must meet the x402 customer-boundary standard:

1. Caller discovers service metadata.
2. Caller requests a quote.
3. Hosted endpoint returns x402 payment requirements or uses an authorized developer credit balance.
4. Caller wallet signs/pays; the endpoint verifies/settles.
5. Hosted adapter invokes the upstream provider.
6. Endpoint returns progress, result summary, and receipt/proof.

If the upstream provider supports x402/SAP natively, prefer that route. If the upstream only supports API keys/credits, Wisely/Pablito is the x402 seller and wraps the upstream call server-side.

## Current Live Lane

Ace Data Cloud remains the first live upstream and the OOBE/Ace bounty lane.

- Why: broad AI service catalog, account token already configured, and the bounty specifically rewards Ace usage through x402/SAP.
- Public framing: Ace-backed first, provider-pluggable by design.
- Proof framing: Ace/SAP evidence for bounty; `/ai/*` endpoints for broader market.

## Adapter Readiness Tiers

### Tier 0 - Native x402/SAP

Use when the upstream service itself supports x402/SAP or SAP-discoverable tool/payment flows.

- Best for bounty proof and direct agent-to-agent service commerce.
- Evidence should include payment receipt, service receipt, tool route, and non-wash usage context.

### Tier 1 - x402-Wrapped API Provider

Use when a provider has a documented API, API keys/credits, async jobs, webhooks, or polling. The customer still pays by x402; the hosted adapter uses Wisely-managed upstream credentials.

- Must never expose provider API keys.
- Must stream status because media jobs can take minutes.
- Must persist public-safe receipts, not raw private payloads.
- Must include moderation/terms-aware input controls where provider docs require it.

### Tier 2 - Aggregator Adapter

Use an aggregator when it speeds expansion across many model families.

- Good for fast coverage across image/video/audio/3D.
- Risk: thinner differentiation and possible overlapping margins.
- Good first targets: fal and Replicate.

### Rejected / Manual Review

Reject brittle consumer-UI automation, shared account automation, or unofficial API scraping as public product connectors. Those can break terms, leak sessions, and create support risk.

## Researched Provider Map

| Provider | Fit | Adapter Shape | Notes |
| --- | --- | --- | --- |
| Ace Data Cloud | live first upstream and bounty proof lane | native/bounty x402 + hosted API invoke | Keep `/ace/*` compatibility and `/ai/*` neutral surface. |
| Meshy | 3D assets, text-to-3D, image-to-3D | async task create, poll/stream, return model URLs | Strong product niche: agents can buy 3D assets with crypto. Docs show Text to 3D preview/refine workflow, task polling, SSE stream, and credit errors. |
| Higgsfield | cinematic image/video and agent-friendly creative workflow | verify official API/CLI terms, then async media adapter | Docs/CLI show strong agent-media fit. Treat API surface as "candidate" until official account/API access is confirmed. |
| Runway | high-quality image/video/audio/avatar generation | async task adapter using official SDK/API | Strong power-user creative API. Good for premium video products. |
| Luma Dream Machine | image/video generation | create generation, poll status, optional callback | Good x402-wrapped adapter for video/image generation. Docs show Bearer auth, generation IDs, polling, and callbacks. |
| fal | model aggregator across image/video/audio/3D | generic model-runner adapter | Very high leverage: one API can expose 1,000+ models with consistent JSON/media URL shape. |
| Replicate | model marketplace/aggregator | prediction adapter | Good fallback and long-tail model coverage. |
| BFL/FLUX | premium image generation/editing | async generation/polling adapter | Good text rendering/product-image lane; credits are provider-side. |
| Ideogram | text-heavy image generation/editing | image generation adapter | Useful for logos, ads, social images where text quality matters. |
| ElevenLabs | voice/TTS/STT | audio adapter | Useful for agent-generated voiceovers, ads, narration, call flows. |
| HeyGen | avatar/video generation | async video adapter | Useful for sales videos and avatar explainers; watch API credit/duration limits. |
| Tavus | conversational video/replica APIs | realtime/session adapter, not simple one-shot | Useful later for interactive agent video, but more complex than one-shot media generation. |

## First Expansion Recommendation

1. Keep Ace first for bounty and proof.
2. Add `/ai/provider-roadmap` or manifest providerRoadmap fields first so buyers see the product is not Ace-only.
3. Build Meshy adapter next if we want a distinctive product: "pay crypto for 3D assets from your agent" is less crowded than generic image generation.
4. Build fal adapter next for breadth and fast model coverage.
5. Add Luma or Runway for premium video proof.
6. Add ElevenLabs for low-latency, lower-cost voice output that agents can use frequently.

## Public Copy Rule

Say:

> A safe x402 invocation layer for AI agents: discover services, quote payment, hand off wallet signing, invoke provider adapters, and return receipts/proofs without exposing keys.

Do not say:

> Ace-only wrapper.

Do not expose:

- provider API keys
- internal model routing
- exact provider cost formulas
- raw margins
- server shell or memory access

## Sources Checked

- x402 official site: https://www.x402.org/
- Coinbase x402 docs: https://docs.cdp.coinbase.com/x402/welcome and https://docs.cdp.coinbase.com/x402/core-concepts/how-it-works
- Ace docs: https://docs.acedata.cloud/en/guides/x402 and https://platform.acedata.cloud/services?type=&tag=
- Meshy Text to 3D docs: https://docs.meshy.ai/api/text-to-3d
- Runway API docs: https://docs.dev.runwayml.com/
- Luma Dream Machine API docs: https://docs.lumalabs.ai/docs/api
- fal model API docs: https://fal.ai/docs/documentation/model-apis/overview
- Replicate model API docs: https://replicate.com/docs/topics/models/run-a-model/
- BFL quickstart/API docs: https://docs.bfl.ai/quick_start/get_started and https://docs.bfl.ai/quick_start/generating_images
- Ideogram API docs: https://developer.ideogram.ai/
- ElevenLabs TTS docs: https://elevenlabs.io/docs/overview/capabilities/text-to-speech
- HeyGen video API docs: https://docs.heygen.com/reference/create-video-1
- Tavus API docs: https://docs.tavus.io/api-reference
- Higgsfield docs/CLI surfaces: https://docs.higgsfield.ai/v1/image2video and https://higgsfield.ai/cli
