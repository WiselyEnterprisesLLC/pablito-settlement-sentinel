# Ace Data Cloud Connector Suite Proof

**Status:** connector-suite-dry-run-ready-live-usage-missing

This artifact proves that the repository now contains a reusable Ace Data Cloud connector suite and dry-run evidence path. It does **not** claim live Ace usage, SAP registration, settlement, public repo publication, X posting, or bounty submission.

## Coverage

- Total connectors modeled: 17
- Bounty core services modeled: openai-chat-completions, serp-google-search, flux-image-generation, short-url
- Distinct Ace services modeled for Ace-category shape: 4
- Dry-run Ace-category shape passes 3-service threshold: yes
- Universal crypto payment router modeled: yes
- Router purpose: user can bring many crypto assets; connector quotes conversion into Ace-required settlement assets and picks the cheapest viable route before user signing.
- Platform fee modeled: 1% of service/payment amount, disclosed as its own line item.

## Families

- ai-chat: openai-chat-completions, openai-responses
- embedding: openai-embeddings
- ai-image: seedream-image-generation, flux-image-generation, midjourney-generation, nano-banana-image-generation
- ai-video: sora-video-generation, veo-video-generation, kling-video-generation
- ai-audio: suno-music-generation
- web-data: serp-google-search, short-url, localization-translate
- captcha: captcha-recognition
- identity: identity-idcard-check
- proxy: global-proxy

## Dry-Run Calls

### OpenAI Chat Completions

- Service id: `openai-chat-completions`
- Family: `ai-chat`
- Status: modeled-no-network-no-spend
- Endpoint model: `POST https://api.acedata.cloud/openai/chat/completions`
- Proof hash: `f703efe169351c02`
- Output kind: text

### Google Search / SERP

- Service id: `serp-google-search`
- Family: `web-data`
- Status: modeled-no-network-no-spend
- Endpoint model: `POST https://api.acedata.cloud/serp/google`
- Proof hash: `593b121f727c92e6`
- Output kind: data

### Flux Image Generation

- Service id: `flux-image-generation`
- Family: `ai-image`
- Status: modeled-no-network-no-spend
- Endpoint model: `POST https://api.acedata.cloud/flux/images`
- Proof hash: `0bf35ebee58f4ab4`
- Output kind: image

### Short URL

- Service id: `short-url`
- Family: `web-data`
- Status: modeled-no-network-no-spend
- Endpoint model: `POST https://api.acedata.cloud/shorturl`
- Proof hash: `ca74fce0a1f0cb45`
- Output kind: data


## Live Gates

- service_catalog_refresh: Refresh platform services page and subscribed services list (no approval required)
- service_tokens: Install Ace service token or global token outside repo (approval required)
- three_service_usage: Run at least three distinct Ace services with non-sensitive inputs (approval required)
- sap_registration: Register or verify SAP mainnet agent identity (approval required)
- x402_settlement: Use x402/SAP settlement for a legitimate service/order (approval required)
- public_package: Publish public package only after redaction scan (approval required)

## Universal Crypto Payment Router

- Required settlement options modeled: x402/base/USDC, SAP/solana/USDC, SAP/solana/SOL
- Route classes modeled: native-settlement, same-chain-dex-swap, solana-jupiter-then-bridge, base-dex-then-x402, cex-convert-withdraw, cross-chain-aggregator
- Sample quotes modeled: 4
- Live rule: quote conversion, slippage, gas/network cost, platform fee, destination, expiry, and total debit before user signs.
- Custody rule: user signs or authorizes from their own wallet/exchange; the connector never asks for wallet signing secrets, recovery words, exchange passwords, raw cards, or bank credentials.

## Official Source Links Used

- https://docs.acedata.cloud/en/quickstart
- https://docs.acedata.cloud/en/authentication
- https://docs.acedata.cloud/en/mcp/overview
- https://docs.acedata.cloud/en/guides/x402
- https://docs.acedata.cloud/en/guides/ace-token
- https://platform.acedata.cloud/services?type=&tag=
