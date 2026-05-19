#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const outPath = path.join(proofDir, 'race-mode-dashboard.latest.json');
const briefingPath = path.join(proofDir, 'race-mode-briefing.md');

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function daysUntil(deadlineIso) {
  if (!deadlineIso) return null;
  const ms = new Date(deadlineIso).getTime() - Date.now();
  return Math.max(0, Math.round((ms / 86_400_000) * 10) / 10);
}

const listing = readJsonIfPresent(path.join(proofDir, 'listing-requirements-check.latest.json'));
const scorecard = readJsonIfPresent(path.join(proofDir, 'competitive-scorecard.latest.json'));
const publicRelease = readJsonIfPresent(path.join(proofDir, 'public-release-check.latest.json'));
const deadline = listing?.listing?.deadline || '2026-06-03T21:59:59.999Z';
const daysLeft = daysUntil(deadline);

const dashboard = {
  generatedAt: new Date().toISOString(),
  status: 'race-mode-needed-asap',
  premise: 'This is ranked by real usage/activity. Qualifying is not enough; the strongest path is to get live, public, and legitimately active quickly.',
  deadline: {
    utc: deadline,
    daysLeftApprox: daysLeft,
    note: 'Refresh the live listing before final submission.',
  },
  currentReadiness: {
    competitivePercent: scorecard?.score?.percent ?? null,
    publicExportRedFlags: publicRelease?.redFlagCount ?? null,
    publicExportPlaceholderFiles: publicRelease?.placeholderFileCount ?? null,
    aceCategory: listing?.aceCategory ?? null,
  },
  racePriorities: [
    {
      id: 'p0_sap_identity',
      urgency: 'immediate',
      action: 'Complete SAP mainnet identity proof with explorer/API snapshot.',
      whyItMatters: 'Without SAP mainnet identity, the submission remains structurally incomplete.',
      approvalGate: 'Wallet/provider, fee/rent cap, preview first, then separate approval before any signature or broadcast.',
    },
    {
      id: 'p1_atomic_run',
      urgency: 'immediate-after-sap',
      action: 'Capture one atomic live run with one request id from trigger through deliverable.',
      whyItMatters: 'This converts separate evidence into the complete autonomous workflow the listing asks for.',
      approvalGate: 'Service calls, any new payment, and any live signing/spend remain separately approved.',
    },
    {
      id: 'p2_public_proof',
      urgency: 'same-day-after-run',
      action: 'Publish the scoped repo and X walkthrough after final private-data review.',
      whyItMatters: 'Judges need a clean public artifact and proof narrative; public visibility also helps credibility.',
      approvalGate: 'Exact repo action, X copy, and Superteam body approval.',
    },
    {
      id: 'p3_legitimate_usage',
      urgency: 'daily-until-deadline',
      action: 'Run additional useful Ace workflows only where each run produces a real deliverable and proof bundle.',
      whyItMatters: 'The category rewards highest real Ace usage, not a one-time minimum.',
      approvalGate: 'Budget cap and allowed service list for each usage batch.',
    },
  ],
  antiDisqualificationRules: [
    'No artificial loops.',
    'No circular self-payment presented as market demand.',
    'No API spam.',
    'No private customer/user data in public artifacts.',
    'Each usage run should have a reason, service list, output hash, and payment/evidence reference.',
  ],
  recommendedCadenceAfterLiveGates: {
    lightBudget: '2 legitimate workflow runs/day',
    mediumBudget: '4 legitimate workflow runs/day',
    aggressiveButClean: '6 legitimate workflow runs/day only if costs stay tiny and every run has a distinct useful deliverable',
  },
  nextUnblockedLocalWork: [
    'Keep public proof page and reviewer index current.',
    'Keep usage queue ready with public-safe input tasks.',
    'Keep submission/X copy ready but unposted.',
    'Re-run verify:prep after every new evidence artifact.',
  ],
};

const briefing = `# Race Mode Briefing

**Status:** operating plan only. This does not approve live signing, spending, public repo creation, X posting, or Superteam submission.

## Read

This bounty is ranked by real usage/activity. Minimum compliance is not enough. We need to become live and then accumulate legitimate, inspectable Ace usage before the deadline.

## Deadline

- UTC: ${deadline}
- Approx days left at generation: ${daysLeft}

## Current score

- Competitive readiness: ${scorecard?.score?.percent ?? 'unknown'}%
- Public export red flags: ${publicRelease?.redFlagCount ?? 'unknown'}
- Placeholder files: ${publicRelease?.placeholderFileCount ?? 'unknown'}

## Priority order

1. SAP mainnet identity proof.
2. One atomic live run.
3. Public repo and X walkthrough.
4. Repeated legitimate Ace workflow runs until deadline.

## The winning shape

Pablito should look like an agent that actually does useful work, chooses services for reasons, pays/settles cleanly, and leaves an audit trail. Random breadth is weaker than a coherent run that judges can inspect in two minutes.

## Hard no

- No fake volume.
- No spam usage.
- No private data.
- No overclaiming.
- No external action without the specific approval gate.
`;

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(dashboard, null, 2)}\n`, 'utf8');
fs.writeFileSync(briefingPath, briefing, 'utf8');
console.log(`Wrote race-mode dashboard: ${outPath}`);
console.log(`Wrote race-mode briefing: ${briefingPath}`);
