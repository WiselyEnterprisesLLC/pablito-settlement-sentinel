#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const scorecardPath = path.join(proofDir, 'competitive-scorecard.latest.json');
const strategyPath = path.join(proofDir, 'winner-grade-upgrade-plan.md');

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function score(status) {
  if (status === 'strong') return 5;
  if (status === 'good') return 4;
  if (status === 'partial') return 3;
  if (status === 'weak') return 2;
  return 1;
}

function successfulAceServiceProofs() {
  if (!fs.existsSync(proofDir)) return [];
  return fs.readdirSync(proofDir)
    .filter((name) => /^ace-service-proof\.[^.]+\.\d{8}T\d{9}Z\.json$/.test(name))
    .map((name) => ({ file: `proof/${name}`, proof: readJsonIfPresent(path.join(proofDir, name)) }))
    .filter((item) => item.proof?.ok === true);
}

const listing = readJsonIfPresent(path.join(proofDir, 'listing-requirements-check.latest.json'));
const settlement = readJsonIfPresent(path.join(proofDir, 'settlement-evidence-bundle.latest.json'));
const publicRelease = readJsonIfPresent(path.join(proofDir, 'public-release-check.latest.json'));
const sapReadiness = readJsonIfPresent(path.join(proofDir, 'sap-mainnet-registration-readiness.latest.json'));
const e2ePlan = readJsonIfPresent(path.join(proofDir, 'end-to-end-run-plan.latest.json'));
const aceServices = [...new Set(successfulAceServiceProofs().map((item) => item.proof.serviceId).filter(Boolean))].sort();

const dimensions = [
  {
    id: 'eligibility',
    label: 'Minimum eligibility',
    status: listing?.aceCategory?.threeDistinctAceServices?.status === 'satisfied' ? 'good' : 'partial',
    evidence: 'Three Ace services are captured; SAP mainnet registration and atomic run remain.',
    upgrade: 'Close SAP registration and one atomic run before public submission.',
  },
  {
    id: 'real_usage',
    label: 'Real usage / non-wash proof',
    status: settlement?.status === 'partial-live-ace-x402-evidence-bundled' && aceServices.length >= 3 ? 'good' : 'partial',
    evidence: 'Ace x402 payment artifact plus distinct Ace API proofs exist, but they are not yet bound to one request id.',
    upgrade: 'Capture a single end-to-end run tying one trigger to service calls, payment artifact, and deliverable hash.',
  },
  {
    id: 'autonomy_story',
    label: 'Autonomy story',
    status: e2ePlan ? 'partial' : 'weak',
    evidence: 'Dry-run and atomic-run plan exist; final live autonomous run is still missing.',
    upgrade: 'Show trigger, preflight, tool selection, execution, payment, and deliverable with minimal/no manual intervention during the run.',
  },
  {
    id: 'technical_depth',
    label: 'Technical depth',
    status: sapReadiness ? 'good' : 'partial',
    evidence: 'SAP SDK surfaces are inspected, readiness/approval gates are generated, public metadata and x402 draft URLs exist.',
    upgrade: 'Add post-registration Explorer proof and optional Sentinel/Synapse proof only if cheap and clean.',
  },
  {
    id: 'api_breadth',
    label: 'API/service breadth',
    status: aceServices.length >= 4 ? 'strong' : aceServices.length >= 3 ? 'good' : 'partial',
    evidence: `Distinct Ace services captured: ${aceServices.join(', ') || 'none'}.`,
    upgrade: 'Add one or two more distinct Ace services only if they support the same useful workflow, not as random volume.',
  },
  {
    id: 'judge_readability',
    label: 'Judge readability',
    status: publicRelease?.redFlagCount === 0 ? 'good' : 'partial',
    evidence: 'Public export has zero red flags, reviewer index, proof bundle, and demo page.',
    upgrade: 'Upgrade the demo page to show a timeline, exact proof files, remaining boundaries, and concise prize-category positioning.',
  },
  {
    id: 'distribution',
    label: 'Public demo/distribution',
    status: 'weak',
    evidence: 'X walkthrough draft exists but no public repo or post yet.',
    upgrade: 'Publish scoped repo and a strong X walkthrough only after final proof exists and copy is approved.',
  },
  {
    id: 'competitive_volume',
    label: 'Competitive legitimate volume',
    status: 'partial',
    evidence: 'One paid Ace x402 artifact and three Ace API proof calls exist; not enough to assume first/second place.',
    upgrade: 'Run a few additional legitimate workflow executions if they are cheap, useful, and tied to distinct deliverables; avoid artificial loops.',
  },
];

const total = dimensions.reduce((sum, item) => sum + score(item.status), 0);
const max = dimensions.length * 5;
const scorecard = {
  generatedAt: new Date().toISOString(),
  status: 'competitive-not-yet-winner-grade',
  category: 'Ace Data Cloud Usage primary',
  premise: 'This is a ranked bounty, not an equal split. Minimum requirements qualify; winner-grade proof needs real usage, clarity, autonomy, and legitimate activity.',
  score: {
    total,
    max,
    percent: Math.round((total / max) * 100),
  },
  dimensions,
  topThreeUpgrades: [
    'Complete SAP mainnet registration proof and post-registration Explorer/API snapshot.',
    'Capture one atomic live run with one request id tying trigger, SAP/tool choice, Ace service calls, payment evidence, and deliverable hash.',
    'Upgrade public demo/X walkthrough to explain the system in 60 seconds and cite proof files without overclaiming.',
  ],
  volumeGuidance: {
    do: [
      'Use more Ace services only when they make the workflow better.',
      'Prefer repeated legitimate customer-like tasks with unique deliverables and public-safe outputs.',
      'Record cost, request id, service id, reason, output hash, and payment proof every time.',
    ],
    avoid: [
      'API spam',
      'circular payments',
      'artificial volume',
      'random API breadth with no user-visible reason',
    ],
  },
};

const strategy = `# Winner-Grade Upgrade Plan

**Status:** strategy only. This does not authorize live spending, signing, posting, repo creation, or Superteam submission.

## Key correction

This bounty is competitive. The prize pool is not an equal split among every valid submission. Meeting the minimum requirements qualifies the project; it does not make the project likely to place.

## Our current strongest lane

Ace Data Cloud Usage remains the best route because we already have:

- one Ace x402 payment artifact,
- three successful distinct Ace service proofs,
- a scoped public export with zero red flags,
- SAP registration readiness and an atomic-run plan.

## What winner-grade means here

Judges should be able to see, quickly:

1. Pablito is registered/discoverable on SAP mainnet.
2. Pablito chooses tools for a real workflow reason.
3. Pablito uses several Ace services because they improve the workflow.
4. Payment proof is tied to that workflow, not random volume.
5. The final deliverable is useful, hashed, and public-safe.
6. The repo and X walkthrough make the evidence easy to inspect.

## What not to do

Do not chase "every API" for its own sake. Broad integrations only help if they support the story. Random calls can look like spam or artificial volume.

## Priority order

1. SAP mainnet identity proof.
2. One atomic live run.
3. Public proof page upgrade.
4. Optional extra Ace services if they make the same run stronger.
5. Public repo.
6. X walkthrough.
7. Final Superteam submission.

## Current score

Competitive readiness: **${scorecard.score.percent}%**.

Top upgrades:

${scorecard.topThreeUpgrades.map((item) => `- ${item}`).join('\n')}
`;

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(scorecardPath, `${JSON.stringify(scorecard, null, 2)}\n`, 'utf8');
fs.writeFileSync(strategyPath, strategy, 'utf8');
console.log(`Wrote competitive scorecard: ${scorecardPath}`);
console.log(`Wrote winner-grade plan: ${strategyPath}`);
