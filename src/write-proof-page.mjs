#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const publicDir = path.join(root, 'public');
const outPath = path.join(publicDir, 'oobe-ace-proof.html');

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

const scorecard = readJsonIfPresent(path.join(proofDir, 'competitive-scorecard.latest.json'));
const settlement = readJsonIfPresent(path.join(proofDir, 'settlement-evidence-bundle.latest.json'));
const listing = readJsonIfPresent(path.join(proofDir, 'listing-requirements-check.latest.json'));
const e2ePlan = readJsonIfPresent(path.join(proofDir, 'end-to-end-run-plan.latest.json'));
const e2eLive = readJsonIfPresent(path.join(proofDir, 'end-to-end-live-run.latest.json'));
const sapIdentity = readJsonIfPresent(path.join(proofDir, 'sap-identity-status.latest.json'));
const release = readJsonIfPresent(path.join(proofDir, 'public-release-check.latest.json'));
const publicSummary = readJsonIfPresent(path.join(root, '.public-export', 'pablito-settlement-sentinel', 'PUBLIC_EXPORT_SUMMARY.json'))
  || readJsonIfPresent(path.join(root, 'PUBLIC_EXPORT_SUMMARY.json'));
const xPostUrl = process.env.X_POST_URL || '';

const aceServices = settlement?.aceServiceUsage?.distinctServiceIds || [];
const tx = settlement?.aceX402Payment?.transaction || 'pending';
const orderState = settlement?.aceX402Payment?.orderState || 'pending';
const onChainProofCount = settlement?.aceX402Payments?.onChainProofCount || (tx !== 'pending' ? 1 : 0);
const onChainProofStatus = `${onChainProofCount}/3 captured`;
const readinessPercent = scorecard?.score?.percent ?? 'pending';
const sapStatus = sapIdentity?.status === 'registered-live-identity-found' || sapIdentity?.status === 'sap-identity-visible-in-explorer'
  ? 'Registered'
  : listing?.aceCategory?.sapMainnetRegistration?.status || 'Pending';
const atomicStatus = e2eLive?.ok === true ? 'Captured' : e2ePlan?.status || 'Pending';

const proofRows = [
  ['Ace x402 payment', orderState === 'Finished' ? 'Captured' : 'Pending', 'proof/settlement-evidence-bundle.latest.json'],
  ['Ace x402 on-chain proofs', onChainProofStatus, 'proof/ace-x402-onchain-batch.latest.json + proof/settlement-evidence-bundle.latest.json'],
  ['Ace services', aceServices.length ? `${aceServices.length} captured: ${aceServices.join(', ')}` : 'Pending', 'proof/ace-service-proof.*.json'],
  ['SAP registration', sapStatus, 'proof/sap-registration.live.latest.json + proof/sap-identity-status.latest.json'],
  ['Atomic run', atomicStatus, 'proof/end-to-end-live-run.latest.json'],
  ['Public export scan', release ? `${release.redFlagCount} red flags` : 'Pending', 'proof/public-release-check.latest.json'],
];

const timeline = [
  ['1', 'Trigger', 'A public-safe workflow request starts the agent run.'],
  ['2', 'Tool selection', 'Pablito records why SAP/x402/Ace capabilities are selected.'],
  ['3', 'Ace execution', 'Ace Data Cloud services execute useful workflow steps.'],
  ['4', 'Payment evidence', 'x402 payment/facilitator evidence is attached to the run.'],
  ['5', 'Deliverable', 'A public-safe output is hashed and tied to the proof bundle.'],
];

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pablito Settlement Sentinel - OOBE x Ace Proof</title>
  <style>
    :root { color-scheme: light; --ink:#182321; --muted:#52615e; --line:#d8e3df; --bg:#f7faf8; --panel:#ffffff; --accent:#0f6f5c; --gold:#a97716; --soft:#eef6f2; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: var(--bg); color: var(--ink); line-height: 1.45; }
    main { width: min(1080px, calc(100% - 32px)); margin: 0 auto; padding: 40px 0 56px; }
    h1 { margin: 0 0 8px; font-size: clamp(28px, 5vw, 48px); letter-spacing: 0; }
    h2 { margin: 32px 0 12px; font-size: 21px; letter-spacing: 0; }
    p { max-width: 790px; color: var(--muted); }
    a { color: var(--accent); }
    .status { display: inline-flex; gap: 8px; align-items: center; border: 1px solid var(--line); background: var(--panel); padding: 8px 10px; border-radius: 8px; font-weight: 700; }
    .hero { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(260px, .65fr); gap: 20px; align-items: end; }
    .score { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 18px; }
    .score strong { font-size: 42px; color: var(--gold); }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 12px; margin-top: 18px; }
    .item { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 14px; min-height: 118px; }
    .label { font-size: 12px; text-transform: uppercase; color: var(--muted); font-weight: 700; }
    .value { margin-top: 7px; overflow-wrap: anywhere; }
    .proof-table { width: 100%; border-collapse: collapse; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
    .proof-table th, .proof-table td { border-bottom: 1px solid var(--line); padding: 10px; text-align: left; vertical-align: top; }
    .proof-table tr:last-child td { border-bottom: 0; }
    .timeline { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; }
    .step { border: 1px solid var(--line); background: var(--soft); border-radius: 8px; padding: 12px; }
    .num { width: 26px; height: 26px; display: inline-grid; place-items: center; border-radius: 50%; background: var(--accent); color: #fff; font-weight: 700; margin-bottom: 8px; }
    code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 13px; }
    ul { padding-left: 20px; }
    @media (max-width: 760px) { .hero { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <main>
    <div class="status">Ace category proof packet, not final submission</div>
    <section class="hero">
      <div>
        <h1>Pablito Settlement Sentinel</h1>
        <p>Autonomous agent proof package for the OOBE x Ace Data Cloud bounty. This page separates captured live SAP/Ace artifacts, public proof surfaces, and the remaining publication/submission gates.</p>
      </div>
      <div class="score">
        <div class="label">Competitive readiness</div>
        <strong>${escapeHtml(readinessPercent)}%</strong>
        <p>Strategy score from the local proof packet. It is not a prize claim.</p>
      </div>
    </section>

    <section class="grid" aria-label="Proof summary">
      <div class="item">
        <div class="label">Category</div>
        <div class="value">Ace Data Cloud Usage</div>
      </div>
      <div class="item">
        <div class="label">Ace services</div>
        <div class="value">${escapeHtml(aceServices.join(', ') || 'pending')}</div>
      </div>
      <div class="item">
        <div class="label">Ace x402 payment</div>
        <div class="value">${escapeHtml(orderState)}</div>
      </div>
      <div class="item">
        <div class="label">On-chain x402 proofs</div>
        <div class="value">${escapeHtml(onChainProofStatus)}</div>
      </div>
      <div class="item">
        <div class="label">Base transaction</div>
        <div class="value"><code>${escapeHtml(tx)}</code></div>
      </div>
    </section>

    <h2>Atomic Run Shape</h2>
    <div class="timeline">
      ${timeline.map(([num, title, body]) => `<div class="step"><span class="num">${num}</span><div class="label">${escapeHtml(title)}</div><div>${escapeHtml(body)}</div></div>`).join('\n      ')}
    </div>

    <h2>Proof Map</h2>
    <table class="proof-table">
      <thead><tr><th>Requirement</th><th>Status</th><th>Evidence</th></tr></thead>
      <tbody>
        ${proofRows.map(([name, status, file]) => `<tr><td>${escapeHtml(name)}</td><td>${escapeHtml(status)}</td><td><code>${escapeHtml(file)}</code></td></tr>`).join('\n        ')}
      </tbody>
    </table>

    <h2>Public Artifacts</h2>
    <ul>
      <li><a href="/oobe-ace/pablito-settlement-sentinel.metadata.json">Agent metadata JSON</a></li>
      <li><a href="/.well-known/x402/pablito-settlement-sentinel.json">x402 resource JSON</a></li>
      ${publicSummary?.repositoryUrl ? `<li><a href="${escapeHtml(publicSummary.repositoryUrl)}">Public GitHub repository</a></li>` : ''}
      ${xPostUrl ? `<li><a href="${escapeHtml(xPostUrl)}">X walkthrough post</a></li>` : ''}
      ${publicSummary?.repositoryCommit ? `<li>Repository commit: <code>${escapeHtml(publicSummary.repositoryCommit)}</code></li>` : ''}
      ${e2eLive?.deliverable?.sha256 ? `<li>Atomic deliverable SHA-256: <code>${escapeHtml(e2eLive.deliverable.sha256)}</code></li>` : ''}
      ${e2eLive?.deliverable?.file ? `<li><a href="/oobe-ace/deliverables/${escapeHtml(path.basename(e2eLive.deliverable.file))}">Atomic run deliverable JSON</a></li>` : ''}
    </ul>

    <h2>Remaining Gates</h2>
    <ul>
      ${sapIdentity?.status === 'registered-live-identity-found' ? '<li>Synapse Explorer search indexing is still catching up; transaction/PDA proof is captured.</li>' : '<li>SAP mainnet registration transaction and post-registration Explorer/API proof.</li>'}
      ${e2eLive?.ok === true ? '<li>Atomic live run captured; keep its request id and deliverable hash attached.</li>' : '<li>One request-id-scoped atomic live run tying trigger, tool selection, Ace execution, payment evidence, and deliverable hash.</li>'}
      ${publicSummary?.repositoryUrl ? '<li>Public GitHub repository is live; next gate is the X walkthrough post.</li>' : '<li>Public GitHub repository and X walkthrough after final private-data and claim review.</li>'}
      <li>Final Superteam submission after explicit approval.</li>
    </ul>
  </main>
</body>
</html>
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(outPath, html, 'utf8');
console.log(`Wrote proof page: ${outPath}`);
