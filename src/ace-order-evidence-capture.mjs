#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const latestPath = path.join(proofDir, 'ace-order-evidence.latest.json');
const expectedOrderId = 'a1cc2a8e-a8aa-468a-bd51-2b04ae15b6c1';

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function archive(payload) {
  const stamp = String(payload.generatedAt || new Date().toISOString()).replace(/[-:.]/g, '').replace(/Z$/, 'Z');
  const archivePath = path.join(proofDir, `ace-order-evidence.${stamp}.json`);
  writeJson(archivePath, payload);
  return archivePath;
}

function redact(value) {
  const text = String(value || '');
  if (!text) return '';
  if (text.length <= 10) return '[redacted]';
  return `${text.slice(0, 6)}...[redacted]...${text.slice(-4)}`;
}

function safeString(value, maxLength = 240) {
  if (value == null) return null;
  const text = String(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...[truncated]` : text;
}

function pickSafeFields(value, keys) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  const out = {};
  for (const key of keys) {
    if (!(key in value)) continue;
    const item = value[key];
    if (item == null || typeof item === 'boolean' || typeof item === 'number') out[key] = item;
    else if (typeof item === 'string') out[key] = safeString(item);
  }
  return Object.keys(out).length ? out : null;
}

function summarizeOrder(body) {
  return {
    topLevelKeys: body && typeof body === 'object' ? Object.keys(body).sort() : [],
    order: pickSafeFields(body, [
      'id',
      'state',
      'pay_way',
      'amount',
      'price',
      'discount',
      'remaining_amount',
      'created_at',
      'updated_at',
      'expired_at',
      'description',
    ]),
    application: pickSafeFields(body?.application, [
      'id',
      'name',
      'title',
      'slug',
      'description',
      'category',
      'type',
    ]),
    package: pickSafeFields(body?.package, [
      'id',
      'name',
      'title',
      'slug',
      'description',
      'price',
      'amount',
      'quota',
      'duration',
    ]),
    applicationsCount: Array.isArray(body?.applications) ? body.applications.length : null,
    packagesCount: Array.isArray(body?.packages) ? body.packages.length : null,
    tags: Array.isArray(body?.tags) ? body.tags.filter((item) => typeof item === 'string').slice(0, 12) : [],
  };
}

function basePayload(status, notes = []) {
  return {
    generatedAt: new Date().toISOString(),
    status,
    source: {
      docs: 'https://docs.acedata.cloud/en/guides/x402',
      apiBase: 'https://platform.acedata.cloud',
      endpointShape: 'GET /api/v1/orders/{order_id}/ with Authorization: Bearer {platform_token}',
    },
    safety: {
      storesPlatformToken: false,
      storesRawOrderResponse: false,
      usesPersonalFiatFunding: false,
      signsPayment: false,
      spendsFunds: false,
      publishesPublicly: false,
    },
    notes,
  };
}

async function main() {
  const platformToken = String(process.env.ACE_PLATFORM_TOKEN || '').trim();
  const orderId = String(process.env.ACE_X402_ORDER_ID || expectedOrderId).trim();

  if (!platformToken) {
    const payload = {
      ...basePayload('blocked-missing-ace-platform-token', ['No external API call was attempted.']),
      ok: false,
      orderId: redact(orderId),
      missing: ['ACE_PLATFORM_TOKEN'],
    };
    writeJson(latestPath, payload);
    archive(payload);
    console.log(`Wrote Ace order evidence blocker: ${latestPath}`);
    return;
  }

  const response = await fetch(`https://platform.acedata.cloud/api/v1/orders/${encodeURIComponent(orderId)}/`, {
    headers: {
      Authorization: `Bearer ${platformToken}`,
      Accept: 'application/json',
    },
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  const orderState = body?.state || body?.status || null;
  const payload = {
    ...basePayload('captured-ace-order-api-evidence', [
      'Platform token was provided through process env/stdin wrapper only.',
      'Stored proof is public-safe summary data, not the raw platform response.',
      'Order state FINISHED or PAID is the documented API verification signal for successful x402 payment.',
    ]),
    ok: response.ok,
    httpStatus: response.status,
    orderId,
    documentedPaymentStateSatisfied: ['PAID', 'FINISHED', 'Paid', 'Finished'].includes(orderState),
    orderState,
    summary: body && typeof body === 'object' ? summarizeOrder(body) : null,
    responsePreviewIfNonJson: body ? undefined : safeString(text, 500),
  };

  writeJson(latestPath, payload);
  archive(payload);
  console.log(`Wrote Ace order evidence: ${latestPath}`);
  console.log(JSON.stringify({
    ok: payload.ok,
    httpStatus: payload.httpStatus,
    orderState: payload.orderState,
    documentedPaymentStateSatisfied: payload.documentedPaymentStateSatisfied,
    orderId: redact(orderId),
  }, null, 2));
}

main().catch((error) => {
  const payload = {
    ...basePayload('fatal-ace-order-evidence-error', ['Failure occurred before any signing, spending, or public publishing.']),
    ok: false,
    error: error.message,
    orderId: redact(process.env.ACE_X402_ORDER_ID || expectedOrderId),
  };
  writeJson(latestPath, payload);
  archive(payload);
  console.error(error);
  process.exit(1);
});
