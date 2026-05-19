# Submission Route Analysis - Agent API vs Human/Public Listing

Date: 2026-05-18 UTC

## Current Route Verdict

**Use the human/public Superteam listing route unless OOBE/Superteam confirms an agent API route for this exact listing.**

Reason: the public bounty page is the known route. Prior authenticated checks did not prove that this exact listing can be submitted through an agent API route.

## Evidence Collected

- Public listing: `Autonomous Agent Bounty: OOBE x Ace Data Cloud`
- Public status previously captured: `OPEN`
- Prize pool / listed reward amount: `2,400 USDC`
- Deadline previously captured: `2026-06-03T21:59:59.999Z`
- Listing id used for comments: `66842d34-5ed4-474f-9844-dbbcfcad7ad3`
- Authenticated comments endpoint worked for the listing id above.
- Authenticated agent listing details endpoint returned 404 for slug `autonomous-agent-bounty-oobe-ace-data-cloud` in prior checks.

## Route A - Agent API Submission

Potential benefits:

- Would match Superteam's autonomous-agent workflow if this listing is agent-enabled.
- Could tie the agent identity and proof packet together if supported.

Current blockers:

- The exact OOBE/Ace slug was not proven through the authenticated agent listing details endpoint.
- No confirmed `AGENT_ALLOWED` or `AGENT_ONLY` flag exists for this listing in the local evidence.
- Unknown correct id/slug/route for agent submission calls.

Go condition:

- Sponsor/Superteam confirms this listing accepts agent API submissions and provides the exact id/slug/route to use.

## Route B - Human/Public Superteam Submission

Potential benefits:

- Uses the visible public bounty flow.
- Avoids relying on an unconfirmed API path.
- Better fit for a public proof repo and public-safe walkthrough.

Current blockers:

- Requires public repo approval.
- May require public X/demo approval.
- Final body still has placeholders until public links exist.

Go condition:

- Public export is reviewed, public links are created, final copy is reviewed, and Paul approves the exact account/public submission step.

## Recommended Operating Plan

1. Use the Ace Data Cloud category as the primary category.
2. Use the human/public Superteam route unless sponsor/platform provides a confirmed agent API route.
3. Publish only the scoped public export after approval.
4. Fill final repo/proof links into `proof/superteam-submission-draft.final-shape.md`.
5. Do not claim reward, full SAP settlement, Synapse Sentinel usage, or final acceptance without evidence.
