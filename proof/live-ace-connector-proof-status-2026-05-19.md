# Live Ace Connector Proof Status - 2026-05-19

Status: live-service proof improved; on-chain settlement still blocked by Ace order state.

## Hosted Service Proof

- Total catalog connectors: 17
- Hosted-safe connectors attempted with Ace API: 14
- Successful hosted Ace services with archived public-safe proof: 12
- Hosted provider/account blocked: 2
- Restricted/manual-review families: 3

Successful hosted services:

- `openai-chat-completions`
- `openai-responses`
- `openai-embeddings`
- `seedream-image-generation`
- `midjourney-generation`
- `nano-banana-image-generation`
- `veo-video-generation`
- `kling-video-generation`
- `suno-music-generation`
- `serp-google-search`
- `short-url`
- `localization-translate`

Provider/account blocked hosted routes:

- `flux-image-generation`: Ace returned no available Flux provider channel for the hosted token.
- `sora-video-generation`: Ace accepted the documented route shape but returned upstream generation failure.

Restricted/manual-review only:

- `captcha-recognition`
- `identity-idcard-check`
- `global-proxy`

The hosted manifest now marks Flux and Sora as `hostedInvokeAllowed: false`, so buyers are not asked to pay for routes that are known to fail. Restricted services remain listed for discovery and BYO-token/manual-review mode only.

## On-Chain Settlement Proof

No on-chain settlement proof was produced yet.

What was attempted:

- `src/ace-x402-pay-live.mjs` was run in no-sign preflight mode against the known Ace order id.
- The Ace platform payment endpoint returned HTTP 400 with `code: invalid` instead of the expected HTTP 402 payment requirements.
- Because no valid payment requirements were returned, the script did not sign, retry, spend, or settle.

Current blocker:

- Need a valid unpaid Ace order that returns `402 Payment Required` from `POST /api/v1/orders/{order_id}/pay/` with `{"pay_way":"X402"}`.
- Need Base USDC in the managed payer wallet if the returned `maxAmountRequired` exceeds wallet balance.

Important distinction:

- Ace service usage proof is per connector/service call.
- On-chain x402/SAP settlement proof is per paid request/order/escrow. It should be attached to legitimate paid usage, not fabricated as circular self-volume per connector.

## Buyer Access Model

The public skill is a thin client:

- Buyers do not need Paul/Wisely Ace API keys.
- Buyers use the hosted Wisely endpoint for quote, service catalog, progress events, receipt capture, and attribution.
- Buyers need their own x402-capable wallet/client with funds in the required settlement route.
- If a buyer forks the package and calls Ace directly with their own token, that may be useful to them but likely will not count as Wisely hosted usage or bounty volume.

## Evidence Locations

- Hosted status endpoint: `https://payments.wiselyenterprisesllc.com/ace/bounty-status`
- Hosted manifest: `https://payments.wiselyenterprisesllc.com/ace/manifest`
- Live service proof archives: `proof/ace-service-proof.*.json`
- Latest x402 preflight/blocker: `proof/ace-x402-live-payment.latest.json`
