# Superteam / OOBE Bounty Due Diligence

Date: 2026-05-17 UTC

## Listing status

Fresh public API check showed:

- Title: `Autonomous Agent Bounty: OOBE × Ace Data Cloud`
- Status: `OPEN`
- Listed reward amount / prize pool: `2,400 USDC`
- Token: UI/API redacts token symbol in this endpoint, but listing text and prior page copy indicate USDC.
- Deadline: `2026-06-03T21:59:59.999Z`
- Winners announced: `0`
- Winners announced at: `null`
- Sponsor: `OOBE Protocol`
- Sponsor verification flag: `isVerified: 0`

Interpretation: the bounty appears active and not yet awarded, but the sponsor is not marked verified in the API.

## Superteam platform credibility signals

Public Superteam pages claim:

- Superteam Earn is a Solana talent/bounty marketplace.
- Earn page says 183,670+ users and 2,450+ sponsors.
- Sponsor page claims trust/use from Solana ecosystem teams including Jupiter, Solana, Helius, and Civic.
- Sponsor page says Superteam Earn takes 0% commission and rewards go to talent.
- Agent pages and `skill.md` define an official agent registration, listing discovery, submission, update, comment, and human payout claim flow.

## Moderation / rejection / payout signals

Public `skill.md` confirms:

- Listings control agent eligibility through `AGENT_ALLOWED` / `AGENT_ONLY`.
- Agents can create and update submissions.
- Rejected or spam-labeled submissions cannot be edited.
- Errors include `403 Submission cannot be edited after rejection`, implying a reject/spam state exists.
- Agents can fetch and post comments on listings through authenticated API.
- For payouts, a human operator must claim the agent via claim code, sign in, complete talent profile, review the agent name, and confirm claim.
- Agent listing page says sponsor reviews outputs and verifies quality; then human operator claims payout with claim code; reward is paid to a verified wallet.

## Unconfirmed / needs human-platform verification

I did not find public proof of:

- Whether every bounty is pre-funded or escrowed.
- Whether Superteam guarantees payout if a sponsor refuses.
- Exact dispute/escalation process for non-payment.
- How rejection notices are delivered: dashboard, email, API, or all of the above.
- Whether OOBE sponsor `isVerified: 0` is normal for new sponsors or a concern.

Attempts:

- Terms and privacy PDFs are public, but local extraction tooling could not parse the PDF text in this environment.
- Public comments endpoint returned 404; authenticated agent comments endpoint returned 401, so comments/questions require agent auth.
- Agent registration would create an external agent/api key/claim code, so it was not performed without approval.

## Recommended diligence questions before live work

Ask via official listing comments/support after approved agent/account setup:

1. Is the 2,400 USDC prize pool / listed reward amount pre-funded, escrowed, or sponsor-paid after judging?
2. What is the expected judging/winner announcement date after 2026-06-03?
3. How are winners and rejected submissions notified?
4. What is the dispute path if a selected winner is not paid?
5. Is OOBE Protocol's `isVerified: 0` sponsor flag expected?
6. Are agent submissions accepted for this exact listing, or must it be submitted by a human account?
7. Are wallet signatures/SAP registration fees required, and are any funds reimbursable?

## Current risk decision

Treat Superteam as credible and the listing as real/active, but do not assume payout is guaranteed or escrowed. Proceed only if the technical route produces a strong legitimate submission without artificial volume, private data leakage, or unsafe wallet/account actions.
