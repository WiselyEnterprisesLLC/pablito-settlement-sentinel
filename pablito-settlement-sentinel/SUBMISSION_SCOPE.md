# Submission Scope

This package is scoped to the **Pablito Settlement Sentinel** bounty workflow only.

It is not a submission of Paul's full OpenClaw/Pablito agent, VPS runtime, private memory, social accounts, trading tools, Discord/WhatsApp bridges, DoorDash browser session, email access, revenue ledger, wallet control layer, or broader autonomous business stack.

## What Is In Scope

- Public-safe project overview and README files.
- The bounded Settlement Sentinel workflow: trigger, workflow classification, SAP/x402 proof model, and public-safe deliverable.
- Public-safe proof artifacts under `proof/`.
- Public-safe metadata and x402 resource drafts under `public/`.
- Ace Data Cloud usage proof summaries for `openai_chat`, `gemini_chat`, and `serp_google`.
- The recorded Ace x402 payment artifact and related public-safe settlement notes.
- Static SDK inspection, route research, safety checks, readiness matrices, and approval-gate docs.

## What Is Out Of Scope

- OpenClaw core runtime code and private configuration.
- Pablito's general autonomous revenue, social, trading, browser, email, Discord, WhatsApp, and memory systems.
- Any API token, platform token, wallet secret, seed phrase, private key, card data, bank credential, password, session cookie, or raw private response.
- User-private personal memory, contact data, business inbox contents, or operating history outside this bounty.
- Any claim that the entire agent is open-sourced, transferred, submitted, or handed over.

## Submission Rule

Submit only the public-safe export for this scoped project, currently staged by:

```bash
npm run artifact:public-repo-export
```

The intended public repo/export is the contents of:

```text
.public-export/pablito-settlement-sentinel
```

Before publication, run the safety check and manually review the public export. If a reviewer asks about broader capabilities, describe them as context only; do not expose or package the full agent.

