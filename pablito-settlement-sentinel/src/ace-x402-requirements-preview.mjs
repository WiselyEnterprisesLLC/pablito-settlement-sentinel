#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const outPath = path.join(proofDir, 'ace-x402-requirements.preview.latest.json');
const blockerPath = path.join(proofDir, 'ace-x402-requirements.blocker.latest.json');

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function archivePreview(payload) {
  const stamp = String(payload.generatedAt || new Date().toISOString()).replace(/[-:.]/g, '').replace(/Z$/, 'Z');
  const archivePath = path.join(proofDir, `ace-x402-requirements.preview.${stamp}.json`);
  writeJson(archivePath, payload);
  return archivePath;
}

function redact(value) {
  const text = String(value || '');
  if (!text) return '';
  if (text.length <= 10) return '[redacted]';
  return `${text.slice(0, 6)}...[redacted]...${text.slice(-4)}`;
}

function publicSafeRequirement(requirement) {
  if (!requirement || typeof requirement !== 'object') return requirement;
  return {
    scheme: requirement.scheme || null,
    network: requirement.network || null,
    asset: requirement.asset || null,
    maxAmountRequired: requirement.maxAmountRequired || null,
    payTo: requirement.payTo || null,
    hasEip712: Boolean(requirement.extra?.eip712),
    eip712Keys: requirement.extra?.eip712 ? Object.keys(requirement.extra.eip712).sort() : [],
  };
}

function publicSafeBodySummary(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) return null;
  const keys = Object.keys(body).sort();
  const allowedFields = [
    'status',
    'state',
    'code',
    'message',
    'detail',
    'error',
    'payment_status',
    'pay_status',
    'order_status',
    'paid',
    'amount',
    'currency',
    'pay_way',
  ];
  const fields = {};
  for (const key of allowedFields) {
    if (!(key in body)) continue;
    const value = body[key];
    if (value == null || typeof value === 'boolean' || typeof value === 'number') {
      fields[key] = value;
    } else if (typeof value === 'string') {
      fields[key] = value.length > 200 ? `${value.slice(0, 200)}...[truncated]` : value;
    }
  }
  return { topLevelKeys: keys, fields };
}

function baseSkeleton(status, notes = []) {
  return {
    generatedAt: new Date().toISOString(),
    status,
    safety: {
      createsAccount: false,
      signsPayment: false,
      sendsPayment: false,
      spendsFunds: false,
      storesPlatformToken: false,
      storesSignerSecret: false,
      publishesPublicly: false,
    },
    source: {
      docs: 'https://docs.acedata.cloud/en/guides/x402',
      apiBase: 'https://platform.acedata.cloud',
      endpointShape: 'POST /api/v1/orders/{order_id}/pay/ with { "pay_way": "X402" }',
    },
    notes,
  };
}

async function main() {
  const platformToken = process.env.ACE_PLATFORM_TOKEN || '';
  const orderId = process.env.ACE_X402_ORDER_ID || '';
  const maxPreviewStatus = Number(process.env.ACE_X402_PREVIEW_MAX_STATUS || 499);

  if (!platformToken || !orderId) {
    const missing = [
      platformToken ? null : 'ACE_PLATFORM_TOKEN',
      orderId ? null : 'ACE_X402_ORDER_ID',
    ].filter(Boolean);
    const payload = {
      ...baseSkeleton('blocked-missing-ace-token-or-order', [
        'This command is safe to run now, but it needs an Ace Platform Token and an existing order id to capture a real 402 requirement.',
        'It intentionally does not sign, pay, or store the token.',
      ]),
      ok: false,
      missing,
      nextAccountSteps: [
        'Create/login Ace Data Cloud account at https://platform.acedata.cloud.',
        'Create a Platform Token at https://platform.acedata.cloud/console/platform-tokens.',
        'Create or identify a low-cost order for one real Ace service call.',
        'Run this command with ACE_PLATFORM_TOKEN and ACE_X402_ORDER_ID in the environment only.',
      ],
    };
    const existingLatest = readJsonIfPresent(outPath);
    const latestHasRealAttempt = existingLatest && existingLatest.status !== 'blocked-missing-ace-token-or-order';
    const targetPath = latestHasRealAttempt ? blockerPath : outPath;
    writeJson(targetPath, {
      ...payload,
      preservedLatestPreview: latestHasRealAttempt ? path.relative(root, outPath).replace(/\\/g, '/') : null,
    });
    if (latestHasRealAttempt) {
      console.log(`Wrote Ace x402 requirements blocker without overwriting live preview: ${targetPath}`);
    } else {
      console.log(`Wrote Ace x402 requirements preview blocker: ${targetPath}`);
    }
    return;
  }

  const url = `https://platform.acedata.cloud/api/v1/orders/${encodeURIComponent(orderId)}/pay/`;
  let response;
  let bodyText = '';
  let body = null;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${platformToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pay_way: 'X402' }),
    });
    bodyText = await response.text();
    try {
      body = bodyText ? JSON.parse(bodyText) : null;
    } catch {
      body = null;
    }
  } catch (error) {
    const payload = {
      ...baseSkeleton('request-failed-no-sign-no-spend', ['Network/request failure before any signing or payment.']),
      ok: false,
      error: error.message,
      orderId: redact(orderId),
    };
    writeJson(outPath, payload);
    archivePreview(payload);
    console.log(`Wrote Ace x402 requirements request failure: ${outPath}`);
    return;
  }

  const accepts = Array.isArray(body?.accepts) ? body.accepts.map(publicSafeRequirement) : [];
  const baseUsdcRequirements = accepts.filter((item) =>
    String(item.network || '').toLowerCase() === 'base' &&
    String(item.scheme || '').toLowerCase() === 'exact'
  );
  const payload = {
    ...baseSkeleton(response.status === 402 ? 'captured-402-requirements-no-sign-no-spend' : 'unexpected-response-no-sign-no-spend', [
      'This proof captures only the initial payment requirements response.',
      'No X-PAYMENT header was generated.',
      'No raw signing material or managed-signer request was used.',
      'No payment was retried.',
    ]),
    ok: response.status === 402 && baseUsdcRequirements.length > 0,
    httpStatus: response.status,
    orderId: redact(orderId),
    platformToken: redact(platformToken),
    responseBodyPreview: body ? undefined : bodyText.slice(0, 1000),
    responsePublicSummary: response.status === 402 ? undefined : publicSafeBodySummary(body),
    accepts,
    baseUsdcRequirements,
    nextLiveGate: baseUsdcRequirements.length
      ? 'Review maxAmountRequired/payTo/order state, then create a separate approval packet before any managed signer creates X-PAYMENT.'
      : 'Fix order/token/service route before any live payment work.',
    hardStops: [
      'Do not add raw signing material to files or chat.',
      'Do not retry with X-PAYMENT without explicit live approval.',
      'Do not present this requirements capture as paid/settled proof.',
    ],
  };

  if (response.status > maxPreviewStatus) payload.ok = false;
  writeJson(outPath, payload);
  archivePreview(payload);
  console.log(`Wrote Ace x402 requirements preview: ${outPath}`);
}

main().catch((error) => {
  const payload = {
    ...baseSkeleton('fatal-preview-error-no-sign-no-spend'),
    ok: false,
    error: error.message,
  };
  writeJson(outPath, payload);
  console.log(`Wrote Ace x402 fatal preview error: ${outPath}`);
  process.exit(1);
});
