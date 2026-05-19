# Local QA Checklist

Status: **local preparation checklist only**. This checklist authorizes no live registration, signing, spend, public post, repository publication, or Superteam action.

Use this immediately before creating a public repository, asking for live approval, or preparing a final submission packet.

## 1. Clean workspace and file review

- [ ] Confirm this workspace contains only the bounty scaffold files intended for review.
- [ ] Confirm no raw credentials, wallet secret material, API tokens, account cookies, screenshots with sensitive data, or private runtime logs are present.
- [ ] Confirm public-facing files do not identify private people, private accounts, customers, internal memory, or non-public operations.
- [ ] Confirm `proof/live-evidence-template.md` remains a blank/null template except for approved constants.
- [ ] Confirm `proof/dry-run-proof.latest.json` keeps `settlementTxSignature` as `null`.
- [ ] Confirm `agent.manifest.draft.json` contains draft metadata only and no live endpoint or secret value.

## 2. Local command checks

Run from the repository root:

```bash
npm test
npm run proof:dry-run
npm run verify:prep
```

Expected result:

- [ ] All commands exit successfully.
- [ ] `npm test` reports the safety check passed.
- [ ] `npm run proof:dry-run` updates or confirms `proof/dry-run-proof.latest.json` without adding live transaction fields.
- [ ] `npm run verify:prep` performs only local checks and proof generation.

## 3. Wording and claim checks

- [ ] Reward wording uses only: **2,400 USDC prize pool / listed reward amount**.
- [ ] No file says the project has won, earned, secured, received, or is owed the reward.
- [ ] No file claims live SAP registration, live Ace Data Cloud usage, live Synapse Sentinel usage, or live x402/SAP settlement.
- [ ] No dry-run artifact is described as bounty-valid live evidence.
- [ ] Any public copy clearly separates mocked/dry-run behavior from future approved live work.
- [ ] X/thread/demo copy, if present, is still labeled draft and does not contain placeholder links that look real.

## 4. Private-data and secret checks

- [ ] Search the repo for email addresses, private names, tokens, key material, wallet secret files, and local runtime paths.
- [ ] Confirm generated JSON proof contains public-safe demo inputs only.
- [ ] Confirm no screenshots, logs, or copied CLI output include account ids, billing details, auth headers, seed material, cookies, or private wallet files.
- [ ] Confirm live evidence placeholders remain `null` until real approved evidence exists.

## 5. Approval checks before anything external

Before any external action, create a final approval packet with exact reviewed details for:

- [ ] controlled install or dependency execution,
- [ ] SAP simulation command,
- [ ] wallet connection or signing,
- [ ] maximum SOL/USDC cost,
- [ ] Ace Data Cloud account/service usage,
- [ ] x402/SAP settlement,
- [ ] public endpoint deployment,
- [ ] public repository creation,
- [ ] X walkthrough/demo post,
- [ ] final Superteam submission.

Do not proceed externally unless the relevant approval exists and the exact action matches the approved packet.

## 6. Final local verdict

- [ ] **Go for local review** only if all local commands pass and all public/private wording checks pass.
- [ ] **Wait** if any placeholder, route, account, cost, or evidence question remains unresolved.
- [ ] **Stop** if any secret, private data, fake volume, live-proof overclaim, or unapproved external action appears.
