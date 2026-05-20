# Ace Unit Economics Analysis - 2026-05-19

## Bottom Line

The live hosted `/ace/invoke` path does not call OpenAI directly from Wisely's OpenAI account. It verifies x402 payment, calls Ace Data Cloud, records a public-safe receipt, and returns a summary. Current direct OpenAI API cost to Wisely per hosted Ace call is therefore exactly `$0.00`.

Current hosted prices cover Ace variable cost for almost every enabled route using Ace's public service catalog package-rate math. The weak spot is `openai-embeddings`, which is basically break-even or slightly negative at the small package rate. `localization-translate` is enabled but the public Ace services catalog did not expose a matching price rule, so it should be treated as unpriced until verified.

## Pricing Model In The Deployed Endpoint

- Hosted payment amount is the full `hostedPriceUsd`, not just the 1% fee.
- The visible 1% Wisely platform fee exists in quote/disclosure logic, but `/ace/invoke` currently charges the resource price directly.
- If we only charged a 1% fee while paying Ace ourselves, the product would not be viable.
- With the current hosted prices, it is viable on variable cost, except the noted embedding/unpriced routes.

## Ace Credit Conversion Used

Ace's public service catalog reports service consumption in `Credit`.

Public API package examples from the Ace service catalog:

| Package price | Credits | Effective price / credit |
| ---: | ---: | ---: |
| 63.2 | 530 | 0.119245 |
| 126 | 1110 | 0.113514 |
| 647 | 5950 | 0.108739 |
| 1313 | 12500 | 0.10504 |
| 2528 | 25000 | 0.10112 |

This report uses the small-package rate `0.119245 USD/credit` for conservative cash-cost math. The best package rate seen in the catalog snapshot was `0.095126 USD/credit`. Confirm the exact billing currency in the Ace dashboard before treating the USD conversion as accounting-final.

## Current Hosted Margin Table

| Service | Enabled | Hosted price | Ace credits | Ace cash cost | Gross margin | Charge / Ace cost |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| openai-chat-completions | yes | $0.25 | 0.0064559625 | $0.00076984 | $0.24923016 | 324.7x |
| openai-responses | yes | $0.25 | 0.0009972625 | $0.00011892 | $0.24988108 | 2102.3x |
| openai-embeddings | yes | $0.05 | 0.4199 | $0.05007109 | -$0.00007109 | 1.0x |
| seedream-image-generation | yes | $0.75 | 0.32 | $0.03815849 | $0.71184151 | 19.7x |
| midjourney-generation | yes | $0.75 | 0.27 | $0.03219623 | $0.71780377 | 23.3x |
| nano-banana-image-generation | yes | $0.75 | 0.14 | $0.01669434 | $0.73330566 | 44.9x |
| veo-video-generation | yes | $2.50 | 0.69 | $0.08227925 | $2.41772075 | 30.4x |
| kling-video-generation | yes | $2.50 | 2.1 | $0.25041509 | $2.24958491 | 10.0x |
| suno-music-generation | yes | $1.00 | 0.55 | $0.06558491 | $0.93441509 | 15.2x |
| serp-google-search | yes | $0.10 | 0.01 | $0.00119245 | $0.09880755 | 83.9x |
| short-url | yes | $0.10 | 0 | $0.00000000 | $0.10000000 | free variable cost |
| localization-translate | yes | unknown | unknown | unknown | unknown | unknown |
| flux-image-generation | no | $0.75 | 0.16 | $0.01907925 | n/a while disabled | n/a |
| sora-video-generation | no | $2.50 | 0.56 | $0.06677736 | n/a while disabled | n/a |
| captcha-recognition | no | $0.25 | 0.02 | $0.00238491 | n/a while disabled | n/a |
| identity-idcard-check | no | $1.00 | 0.5 | $0.05962264 | n/a while disabled | n/a |
| global-proxy | no | unknown | unknown | unknown | n/a | n/a |

## OpenAI Token Cost To Wisely

Existing hosted endpoint direct OpenAI cost: `$0.00` per call.

Ace's OpenAI calls are inside Ace's service call, not our OpenAI API account.

Latest proof usage samples:

| Ace service | Model | Tokens | Direct OpenAI equivalent note |
| --- | --- | --- | --- |
| openai-chat-completions | gpt-5.2 | 14 prompt + 152 completion | If billed directly at Ace catalog's gpt-5.2 official-price fields, about `$0.0021525`; if mapped to current OpenAI gpt-5.4 standard, about `$0.002315`; gpt-5.5 standard, about `$0.00463`. |
| openai-responses | gpt-5.2 | 14 input + 22 output | Ace catalog gpt-5.2 equivalent about `$0.0003325`; current OpenAI gpt-5.4 standard about `$0.000365`; gpt-5.5 standard about `$0.00073`. |
| openai-embeddings | text-embedding-ada-002 | 4 input tokens | Direct OpenAI equivalent is tiny, about `$0.0000004` using the public pages-per-dollar math, but Ace catalog matched a 0.4199-credit default rule, making our hosted price too low at small-package credit cost. |

## Upcharge / Provider Comparison

There are two different upcharges:

1. Ace vs underlying provider.
2. Wisely hosted price vs Ace variable cost.

Findings:

- OpenAI text: Ace's public OpenAI service cost formula appears to multiply underlying OpenAI-style token cost. Using Ace's own gpt-5.2 official-price fields, the credit consumption is roughly 3x direct OpenAI if 1 credit were treated as $1. Using package-rate cash conversion, the actual cash-equivalent cost is lower than direct OpenAI for the tiny sample calls.
- OpenAI image/video: current OpenAI pricing lists gpt-image token rates and Sora per-second rates. Ace Sora 10-second typical input matched 0.56 credits, which is far below OpenAI's current Sora-2 720p $0.10/sec if package-rate credit math is valid. Sora is currently disabled in our hosted manifest because the provider route failed.
- Flux: BFL official pricing says FLUX.1 Kontext Pro is $0.04/image. Ace Flux Kontext Pro matched 0.16 credits, or about $0.019 at the small Ace package rate; lower than BFL list if package-rate math is valid. Our hosted price would be $0.75, but Flux is disabled because the provider channel was unavailable.
- Midjourney: official Midjourney is subscription/GPU-time based, not a public per-call API. Exact Ace-vs-direct API markup cannot be calculated cleanly. Our hosted price is $0.75 vs Ace 0.27 credits.
- Suno: official Suno is subscription-credit based, not a normal public API. If a subscriber fully uses Pro/Premier credits, effective cost per song is much lower than Ace's 0.55-credit cash equivalent; but that comparison is not apples-to-apples for hosted API resale.
- Veo: Google Vertex pricing lists Veo per-second video rates. Ace's `veo2-fast` route matched 0.69 credits. If the output is comparable to current Vertex Veo 3.1 Fast/Lite pricing, Ace looks cheaper; if compared to old Veo 2 at $0.50/sec, Ace is dramatically cheaper. Verify exact output duration/model before claiming.

## Risk / Fixes

1. Raise `openai-embeddings` hosted price from `$0.05` to at least `$0.10`, or change the model/input so it does not hit the 0.4199-credit default.
2. Disable or conservatively reprice `localization-translate` until its Ace service price rule is found.
3. Add a runtime margin guard: compute `estimatedAceCredits`, `estimatedAceUsd`, `hostedPriceUsd`, and fail closed if expected gross margin is below a minimum.
4. Make quote and invoke pricing line up: service cost + conversion cost + 1% platform fee + hosted orchestration minimum.
5. Keep GPT helper/orchestration out of the hot path unless the customer pays a minimum fee. A GPT-5.5 helper can cost more than the 1% fee on small orders.

## Generated Artifacts

- `proof/ace-unit-economics.latest.json`
- `proof/ace-unit-economics.latest.txt`
- `proof/ace-live-service-cost-matches.latest.json`
- `proof/ace-relevant-service-raw-costs.latest.txt`
