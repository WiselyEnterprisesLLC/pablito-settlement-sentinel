# End-to-End Live Run Approval Packet - Draft Only

**Status:** DRAFT ONLY. This file does not approve a wallet signature, payment, service spend, public post, public repo, or bounty submission.

## Goal

Capture the missing atomic workflow proof for the OOBE x Ace bounty: trigger -> SAP/tool selection -> Ace service execution -> payment evidence -> deliverable.

## Current separate evidence

- **SAP:** ready for controlled no-send preview, but no mainnet identity proof yet.
- **Ace services:** captured 15 distinct services: gemini_chat, kling-video-generation, localization-translate, midjourney-generation, nano-banana-image-generation, openai-chat-completions, openai-embeddings, openai-responses, openai_chat, seedream-image-generation, serp-google-search, serp_google, short-url, suno-music-generation, veo-video-generation.
- **Ace x402 payment:** not captured.

## Why this is still needed

- The listing asks for a complete autonomous workflow from trigger to execution to payment.
- Current SAP preview, Ace service proofs, and Ace x402 payment proof were captured as separate controlled steps.
- A strong final submission needs one request id and one evidence bundle that ties trigger, tool selection, service execution, payment artifact, and deliverable together.

## Proposed run shape

- Preflight balances, configured tokens, public URLs, and SAP identity state.
- Select SAP/x402/Ace capability based on the request and record why that capability was chosen.
- Call one or more Ace Data Cloud services using public-safe input only.
- Attach the existing approved Ace x402 payment artifact if sponsor accepts it, or perform one new minimal payment only after explicit cost approval.
- Generate the public-safe deliverable and hash it.
- Write one final live-run evidence JSON that links every proof file, amount, service id, timestamp, and deliverable hash.
- Run public release checks again before any repo/X/Superteam action.

## Approval needed before execution

- Choose whether the run may reuse the existing Ace x402 payment artifact or must perform a fresh minimal payment.
- Approve exact service calls and input text.
- Approve maximum service/payment cost if any new paid call is needed.
- Approve any SAP registration or wallet signature step separately.
- Approve public repo/X/Superteam actions separately after the run is captured.

## Hard rule

No new paid call, wallet signature, transaction broadcast, public repo, X post, or Superteam submission happens from this packet alone.

## Approval phrase shape

```text
YES OOBE ACE ATOMIC RUN
Reuse existing Ace payment artifact: yes/no
Fresh payment max:
Service calls approved:
Input approved:
SAP registration already handled: yes/no
Public posting approved now: no
```
