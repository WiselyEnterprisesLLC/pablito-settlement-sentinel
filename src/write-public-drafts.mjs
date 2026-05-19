#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { DEMO_PUBLIC_WALLET, SAP_NETWORK } from './sap-sdk-dry-run-adapter.mjs';

const root = path.resolve(import.meta.dirname, '..');
const publicDir = path.join(root, 'public');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'agent.manifest.draft.json'), 'utf8'));
const proofDir = path.join(root, 'proof');

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

const aceLivePayment = readJsonIfPresent(path.join(proofDir, 'ace-x402-live-payment.latest.json'));
const aceOrderEvidence = readJsonIfPresent(path.join(proofDir, 'ace-order-evidence.latest.json'));
const acePaymentResponse = aceLivePayment?.paymentResponse || {};
const aceX402Proof = aceLivePayment?.ok === true
  ? {
      status: 'captured-live-ace-x402-payment',
      orderState: aceLivePayment.responsePublicSummary?.fields?.state || null,
      payWay: aceLivePayment.responsePublicSummary?.fields?.pay_way || null,
      payer: acePaymentResponse.payer || aceLivePayment.payerAddress || null,
      network: acePaymentResponse.network || aceLivePayment.requirement?.network || null,
      asset: aceLivePayment.requirement?.asset || null,
      amountAtomic: aceLivePayment.requirement?.maxAmountRequired || null,
      transaction: acePaymentResponse.transaction || null,
      proofFile: 'proof/ace-x402-live-payment.latest.json',
      orderApiEvidenceFile: aceOrderEvidence ? 'proof/ace-order-evidence.latest.json' : null,
      orderApiEvidenceStatus: aceOrderEvidence?.status || null,
      orderApiEvidenceHttpStatus: aceOrderEvidence?.httpStatus || null,
    }
  : null;

const metadata = {
  status: 'draft-only-not-live',
  warning:
    'Public-safe metadata draft only. This is not SAP mainnet registration evidence and not a completed bounty submission.',
  generatedAt: new Date().toISOString(),
  agent: {
    name: manifest.name,
    description: manifest.description,
    agentId: manifest.agentId,
    candidateWallet: DEMO_PUBLIC_WALLET,
    network: SAP_NETWORK,
    protocols: manifest.protocols,
    capabilities: manifest.capabilities,
    pricing: manifest.pricing,
  },
  endpoints: {
    agentUri: manifest.agentUri,
    x402Endpoint: manifest.x402Endpoint,
    note: 'These URLs can be publicly hosted as static proof metadata. They are not proof of SAP mainnet registration by themselves.',
  },
  proofBoundary: {
    dryRunProof: 'proof/dry-run-proof.latest.json',
    liveEvidence: aceX402Proof,
    superteamSubmission: null,
    xWalkthrough: null,
  },
  publicSafety: {
    containsSecrets: false,
    containsPrivateData: false,
    claimsLiveRegistration: false,
    claimsPaymentSettlement: aceLivePayment?.ok === true,
    claimsBountyCompletion: false,
  },
};

const x402Resource = {
  status: 'draft-only-not-live',
  protocol: 'SAP-x402',
  network: SAP_NETWORK,
  service: {
    id: 'workflow:classify',
    name: 'Pablito workflow leak classifier',
    description:
      'Classify a public-safe workflow bottleneck and return one automation-ready next step.',
  },
  payment: {
    tokenType: 'sol',
    pricePerCallSmallestUnit: String(manifest.pricing[0]?.pricePerCall ?? 1000),
    settlementMode: 'x402',
    escrowVersion: 'V2 preferred after approval',
  },
  headersExpectedAfterLiveEscrow: [
    'X-Payment-Protocol',
    'X-Payment-Escrow',
    'X-Payment-Agent',
    'X-Payment-Depositor',
    'X-Payment-MaxCalls',
    'X-Payment-PricePerCall',
    'X-Payment-Program',
    'X-Payment-Network',
  ],
  proofBoundary: {
    currentSettlementTxSignature: acePaymentResponse.transaction || null,
    currentEscrowPda: null,
    currentAgentPda: null,
    currentAceX402Proof: aceX402Proof,
    note: aceX402Proof
      ? 'Ace x402 payment evidence exists; SAP escrow/registration values remain null until approved SAP live proof exists.'
      : 'These values stay null until approved live proof exists.',
  },
};

const proofPage = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Pablito Settlement Sentinel - OOBE x Ace Proof</title>
  <style>
    :root { color-scheme: light; --ink:#172026; --muted:#52616b; --line:#d8e0e5; --bg:#f7faf9; --panel:#ffffff; --accent:#146c60; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: Arial, Helvetica, sans-serif; background: var(--bg); color: var(--ink); line-height: 1.45; }
    main { width: min(980px, calc(100% - 32px)); margin: 0 auto; padding: 40px 0 56px; }
    h1 { margin: 0 0 8px; font-size: clamp(28px, 4vw, 44px); letter-spacing: 0; }
    h2 { margin: 32px 0 12px; font-size: 20px; letter-spacing: 0; }
    p { max-width: 760px; color: var(--muted); }
    a { color: var(--accent); }
    .status { display: inline-flex; gap: 8px; align-items: center; border: 1px solid var(--line); background: var(--panel); padding: 8px 10px; border-radius: 8px; font-weight: 700; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; margin-top: 18px; }
    .item { border: 1px solid var(--line); background: var(--panel); border-radius: 8px; padding: 14px; min-height: 116px; }
    .label { font-size: 12px; text-transform: uppercase; color: var(--muted); font-weight: 700; }
    .value { margin-top: 7px; overflow-wrap: anywhere; }
    code { font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-size: 13px; }
    ul { padding-left: 20px; }
  </style>
</head>
<body>
  <main>
    <div class="status">Partial live proof, not final submission</div>
    <h1>Pablito Settlement Sentinel</h1>
    <p>Public-safe proof page for the OOBE x Ace Data Cloud autonomous agent bounty path. This page separates verified artifacts from remaining gates.</p>

    <section class="grid" aria-label="Proof summary">
      <div class="item">
        <div class="label">Ace x402 payment</div>
        <div class="value">${aceX402Proof ? 'Captured' : 'Not captured'}</div>
      </div>
      <div class="item">
        <div class="label">Order state</div>
        <div class="value">${aceX402Proof?.orderState || 'Pending'}</div>
      </div>
      <div class="item">
        <div class="label">Base transaction</div>
        <div class="value"><code>${aceX402Proof?.transaction || 'Pending'}</code></div>
      </div>
      <div class="item">
        <div class="label">SAP registration</div>
        <div class="value">Preview ready; no live registration claim yet.</div>
      </div>
    </section>

    <h2>Public Artifacts</h2>
    <ul>
      <li><a href="/oobe-ace/pablito-settlement-sentinel.metadata.json">Agent metadata JSON</a></li>
      <li><a href="/.well-known/x402/pablito-settlement-sentinel.json">x402 resource JSON</a></li>
    </ul>

    <h2>Remaining Gates</h2>
    <ul>
      <li>Capture distinct Ace API service execution proofs.</li>
      <li>Complete SAP mainnet registration only after wallet/signing approval.</li>
      <li>Create a public repository and X walkthrough after final private-data review.</li>
      <li>Submit to Superteam only after route and proof package are final.</li>
    </ul>
  </main>
</body>
</html>
`;

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(
  path.join(publicDir, 'pablito-settlement-sentinel.metadata.draft.json'),
  `${JSON.stringify(metadata, null, 2)}\n`,
  'utf8',
);
fs.writeFileSync(
  path.join(publicDir, 'x402-resource.draft.json'),
  `${JSON.stringify(x402Resource, null, 2)}\n`,
  'utf8',
);
fs.writeFileSync(path.join(publicDir, 'oobe-ace-proof.html'), proofPage, 'utf8');

console.log('Wrote public-safe metadata/x402 drafts under public/.');
