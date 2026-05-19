# Risk Register

Status: **review artifact only**. This register identifies risks and ship-decision effects; it authorizes no external action.

Probability and impact use: Low / Medium / High.

| Risk | Probability | Impact | Mitigation | Current owner | Ship decision effect |
| --- | --- | --- | --- | --- | --- |
| Submission route remains unconfirmed for agent/API flow. | High | High | Use normal public Superteam route only if explicitly approved, or wait for sponsor/platform reply. | Pablito VPS + Paul approval | No-go for final submission until route is confirmed or uncertainty is accepted. |
| Reward wording is overstated as guaranteed, won, escrowed, or owed. | Medium | High | Use only **2,400 USDC prize pool / listed reward amount** and run wording audit before publication. | Local Codex | Stop public copy until corrected. |
| SAP registration requires mainnet signing, rent, or failed-transaction cost. | High | High | Run official simulation/no-send preview first; cap costs in a final approval packet. | Pablito VPS + Paul approval | No-go for mainnet until simulation and approval exist. |
| SAP CLI/SDK install or dependency execution changes the environment unexpectedly. | Medium | Medium | Inspect package/version; prefer no-script install or isolated workspace; record rollback path. | Local Codex | Wait until controlled install plan is approved. |
| Ace Data Cloud category requires real account setup, credits, payment card, or terms acceptance. | Medium | High | Verify account route and service costs before use; send only public-safe demo inputs. | Pablito VPS + Paul approval | No-go for Ace category until requirements are known and accepted. |
| Synapse Sentinel proof requirement differs from current dry-run assumptions. | Medium | Medium | Ask sponsor/platform or inspect official docs; keep category choice explicit. | Pablito VPS | Wait until category-specific proof is clear. |
| x402/SAP settlement path could look circular, artificial, or wash-like. | Medium | High | Use only a real service reason, minimal legitimate amount, and non-wash rationale; avoid self-dealing loops. | Pablito VPS + Paul approval | Abandon live settlement if legitimate route is not available. |
| Public repo exposes secrets, private data, local runtime paths, or internal operating details. | Low | High | Run safety scan, manual file review, and public claims audit before publication. | Local Codex | Stop publication until clean. |
| Public README or X walkthrough implies dry-run artifacts are live evidence. | Medium | High | Keep dry-run/live boundary prominent; require final wording review and approval. | Local Codex + Paul approval | Stop public post/submission until corrected. |
| Live evidence template is contaminated with guessed ids, fake signatures, or copied placeholders. | Low | High | Leave unknowns as `null`; safety check validates the blank template; replace any unverified value and record source. | Local Codex | Stop review until cleaned and tests pass. |
| Sponsor/platform non-response persists. | High | Medium | Send at most one concise follow-up if approved; then choose conservative wait or accepted-risk public route. | Pablito VPS + Paul approval | Wait unless explicit approval accepts uncertainty. |
| Listing terms, deadline, or reward details change. | Medium | Medium | Re-check official listing before live work and before final submission. | Pablito VPS | Wait if facts differ from saved snapshot. |
| Required live costs exceed sandbox funds or require personal fiat funding. | Medium | High | Reconcile sandbox balances, cap SOL/USDC in approval packet, refuse personal fiat funding. | Paul approval + Pablito VPS | Abandon live path unless funded sandbox budget is approved. |
| Final Superteam form includes wrong links, stale placeholders, or unreviewed body text. | Medium | High | Review exact final fields/body before submit; capture confirmation only after approved action. | Local Codex + Paul approval | No-go for final action until reviewed. |
| Local dry-run code drifts into live network calls or signing behavior. | Low | High | Keep `src/safety-check.mjs` guarding mutation patterns; require tests after changes. | Local Codex | Stop until code is reverted or approved as a separate live packet. |

## Current risk posture

Overall risk is **manageable for local review** and **too high for final public submission**. The largest blockers are route uncertainty, missing live SAP/Ace/Synapse evidence, and the absence of approved non-wash settlement proof.

## Risk-based ship rule

- **Local review:** allowed if tests pass and no private data/overclaim is found.
- **Public repo/X/demo:** wait until scans pass and exact public copy is approved.
- **Final bounty submission:** no-go until route, live evidence, settlement requirements, and approvals are complete.
- **Live signing/spend:** no-go until simulation output, cost cap, wallet/network details, and explicit approval exist.
