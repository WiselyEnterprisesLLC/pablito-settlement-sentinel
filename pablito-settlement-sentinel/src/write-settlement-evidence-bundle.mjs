#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const outPath = path.join(proofDir, 'settlement-evidence-bundle.latest.json');

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function proofFilesMatching(pattern) {
  if (!fs.existsSync(proofDir)) return [];
  return fs.readdirSync(proofDir)
    .filter((name) => pattern.test(name))
    .sort()
    .map((name) => ({ name, path: path.join(proofDir, name) }));
}

function archivedAceServiceProofs() {
  return proofFilesMatching(/^ace-service-proof\.[^.]+\.\d{8}T\d{9}Z\.json$/)
    .map((item) => ({ file: `proof/${item.name}`, proof: readJsonIfPresent(item.path) }))
    .filter((item) => item.proof?.ok === true)
    .map((item) => ({
      file: item.file,
      serviceId: item.proof.serviceId,
      serviceLabel: item.proof.serviceLabel,
      httpStatus: item.proof.httpStatus,
      endpoint: item.proof.endpoint,
      generatedAt: item.proof.generatedAt,
    }))
    .sort((a, b) => `${a.serviceId}:${a.generatedAt}`.localeCompare(`${b.serviceId}:${b.generatedAt}`));
}

function paymentFromArtifact(file, proof) {
  const paymentResponse = proof?.paymentResponse || {};
  const orderFields = proof?.responsePublicSummary?.fields || {};
  const txHash = proof?.transaction || paymentResponse.transaction || null;
  const ok = proof?.ok === true
    && proof?.httpStatus === 200
    && proof?.paymentResponseHeaderPresent === true
    && typeof txHash === 'string'
    && txHash.startsWith('0x');
  if (!ok) return null;
  return {
    evidenceFile: `proof/${file}`,
    ok: true,
    generatedAt: proof.generatedAt || null,
    approvalId: proof.approvalId || null,
    httpStatus: proof.httpStatus || null,
    orderId: proof.orderId || orderFields.id || null,
    orderState: orderFields.state || null,
    payWay: orderFields.pay_way || null,
    network: paymentResponse.network || proof.requirement?.network || null,
    payer: paymentResponse.payer || proof.payerAddress || null,
    payTo: proof.requirement?.payTo || null,
    asset: proof.requirement?.asset || null,
    maxAmountRequiredAtomic: proof.requirement?.maxAmountRequired || null,
    walletBaseUsdcBefore: proof.walletBaseUsdcBefore || null,
    paymentResponseHeaderPresent: proof.paymentResponseHeaderPresent === true,
    transaction: txHash,
  };
}

function archivedAceX402Payments() {
  const seen = new Set();
  const payments = [];
  for (const item of proofFilesMatching(/^ace-x402-live-payment(?:\.[^.]+)*\.json$/)) {
    const proof = readJsonIfPresent(item.path);
    const payment = paymentFromArtifact(item.name, proof);
    if (!payment || seen.has(payment.transaction)) continue;
    seen.add(payment.transaction);
    payments.push(payment);
  }
  return payments.sort((a, b) => String(a.generatedAt || '').localeCompare(String(b.generatedAt || '')));
}

const aceOrderEvidencePath = path.join(proofDir, 'ace-order-evidence.latest.json');
const aceBatchPath = path.join(proofDir, 'ace-x402-onchain-batch.latest.json');
const aceOrderEvidence = readJsonIfPresent(aceOrderEvidencePath);
const aceBatch = readJsonIfPresent(aceBatchPath);
const serviceProofs = archivedAceServiceProofs();
const distinctServiceIds = [...new Set(serviceProofs.map((proof) => proof.serviceId).filter(Boolean))].sort();
const payments = archivedAceX402Payments();
const primaryPayment = payments.at(-1) || null;
const onChainProofCount = payments.length;
const paymentSettled = onChainProofCount >= 1;
const hasAtLeastThreeOnChainX402Proofs = onChainProofCount >= 3;

const summary = {
  generatedAt: new Date().toISOString(),
  status: hasAtLeastThreeOnChainX402Proofs
    ? 'three-live-ace-x402-onchain-proofs-bundled'
    : paymentSettled
      ? 'partial-live-ace-x402-evidence-bundled'
      : 'missing-live-settlement-evidence',
  scope: {
    describes: 'Public-safe evidence bundle for Ace x402 payment artifacts and Ace service usage proofs.',
    doesNotClaim: [
      'full SAP mainnet settlement',
      'SAP mainnet identity registration',
      'Synapse Sentinel usage',
      'final Superteam submission',
      'reward won or owed',
    ],
  },
  safety: {
    storesSecrets: false,
    storesRawPaymentHeader: false,
    storesPlatformToken: false,
    signsPayment: false,
    spendsFunds: false,
    publishesPublicly: false,
  },
  aceX402Payment: primaryPayment,
  aceX402Payments: {
    status: hasAtLeastThreeOnChainX402Proofs ? 'three-onchain-proofs-captured' : 'needs-more-onchain-proofs',
    targetOnChainProofCount: 3,
    onChainProofCount,
    hasAtLeastThreeOnChainX402Proofs,
    batchEvidenceFile: aceBatch ? 'proof/ace-x402-onchain-batch.latest.json' : null,
    payments,
  },
  aceOrderVerifier: aceOrderEvidence
    ? {
      evidenceFile: 'proof/ace-order-evidence.latest.json',
      ok: aceOrderEvidence.ok === true,
      httpStatus: aceOrderEvidence.httpStatus || null,
      documentedPaymentStateSatisfied: aceOrderEvidence.documentedPaymentStateSatisfied === true,
      orderState: aceOrderEvidence.orderState || null,
      platformBlocker: aceOrderEvidence.ok === false && aceOrderEvidence.httpStatus
        ? `Ace documented GET-order verifier returned HTTP ${aceOrderEvidence.httpStatus}; retain payment response and transaction proof as stronger evidence until the platform endpoint is healthy.`
        : null,
    }
    : null,
  aceServiceUsage: {
    status: distinctServiceIds.length >= 3 ? 'three-distinct-services-captured' : 'insufficient-distinct-service-proof',
    distinctServiceCount: distinctServiceIds.length,
    distinctServiceIds,
    proofFiles: serviceProofs,
  },
  reviewerClaimLevel: hasAtLeastThreeOnChainX402Proofs
    ? [
      'Can cite three distinct Ace x402 on-chain payment proofs with HTTP 200 payment responses and Base transaction hashes.',
      'Can cite at least three distinct Ace API service proof summaries if the route is the Ace category.',
      'Cannot cite full SAP settlement or bounty completion until the remaining live gates are closed.',
    ]
    : paymentSettled
      ? [
        `Can cite ${onChainProofCount} approved Ace x402 payment artifact(s) with HTTP 200, payment response header, order state, and Base transaction hash.`,
        'Can cite three distinct Ace API service proof summaries if the route is the Ace category.',
        'Need two more legitimate Ace x402 payments before claiming three on-chain Ace proofs.',
        'Cannot cite full SAP settlement or bounty completion until the remaining live gates are closed.',
      ]
      : [
        'Cannot cite live x402 settlement evidence yet.',
        'Use dry-run and service-proof artifacts only until a valid approved payment artifact exists.',
      ],
};

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
console.log(`Wrote settlement evidence bundle: ${outPath}`);
