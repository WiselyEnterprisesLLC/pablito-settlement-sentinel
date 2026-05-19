# Go / No-Go Decision Checklist

Status: **strict decision gate**. Use this immediately before any live registration, service use, settlement, public repo creation, X post, or Superteam submission.

## Current default decision

**NO-GO for final bounty submission.**

The package is only ready for local review until route confirmation, approved live execution, and real evidence exist.

## Ship only if all are true

- [ ] The selected category is explicitly chosen: `General SAP`, `Ace Data Cloud`, or another sponsor-confirmed category.
- [ ] The submission route is confirmed by sponsor/platform evidence, or the normal public Superteam route is deliberately approved despite missing agent-route confirmation.
- [ ] The reward is described only as **2,400 USDC prize pool / listed reward amount** unless sponsor/platform evidence confirms stronger wording.
- [ ] SAP registration, if required, has simulation output reviewed before any live transaction.
- [ ] Ace Data Cloud usage, if required, uses real services with official evidence and no private user/customer data.
- [ ] Synapse Sentinel usage, if required, has real service evidence and not a local mock.
- [ ] Any x402/SAP settlement is legitimate, non-wash, minimal, and backed by transaction/facilitator evidence.
- [ ] All live evidence is recorded in `proof/live-evidence-template.md` or a final live evidence artifact derived from it.
- [ ] Public repo has been scanned for secrets, private data, internal runtime paths, and overclaims.
- [ ] `npm test` passes.
- [ ] `npm run proof:dry-run` passes.
- [ ] Public README points to proof files and accurately separates dry-run from live evidence.
- [ ] X/demo copy is final, accurate, and approved before posting.
- [ ] Final Superteam body/fields are reviewed exactly as they will be submitted.
- [ ] Explicit approval exists for any public posting, final submission, live spend, signing, or account action.

## Wait if any are true

- [ ] Sponsor/platform has not answered whether this listing accepts agent/API submissions and the team does not want to use the normal public route yet.
- [ ] Sponsor/platform has not clarified whether live mainnet settlement is required for eligibility.
- [ ] SAP registration cost, account requirements, or wallet risk is unclear.
- [ ] Ace Data Cloud requires payment card, sensitive identity steps, or terms the team has not accepted.
- [ ] Live evidence exists but has not been reviewed for privacy and claim accuracy.
- [ ] Public repo or X copy contains placeholders that a reviewer could read as real proof.
- [ ] Any test or safety scan fails.

## Abandon or do not pursue live work if any are true

- [ ] The route requires fake accounts, artificial volume, misleading service usage, or circular payments with no legitimate purpose.
- [ ] Required live actions need sensitive identity verification, raw credentials in chat/files, or unsupported account sharing.
- [ ] Required costs exceed the approved sandbox budget or require personal fiat funding.
- [ ] Sponsor/platform indicates dry-run architecture is not useful and live proof cost/risk is not justified.
- [ ] The listing closes, changes materially, or reward/payment terms become materially worse.
- [ ] Sponsor/platform non-response persists and the expected upside no longer justifies wallet/account/publication risk.

## Sponsor non-response handling

1. Send at most one concise follow-up after the initial diligence question, using `proof/follow-up-draft.md` as the base.
2. If no useful answer arrives within a reasonable review window, choose one of two paths:
   - **Conservative path:** wait; keep this package as a dry-run portfolio artifact only.
   - **Submission path:** use the normal public Superteam flow only if live evidence is already strong, public claims are conservative, and explicit approval accepts the uncertainty.
3. Never treat silence as confirmation that reward funding, agent API route, or live proof requirements are settled.

## Final decision labels

- **Ship:** all ship criteria true, no wait/abandon criteria true.
- **Wait:** one or more important questions remain open but no hard safety violation exists.
- **Abandon:** route, proof, cost, platform, or ethics risk makes the expected value negative.

Current label: **Wait / no-go for final submission**.
