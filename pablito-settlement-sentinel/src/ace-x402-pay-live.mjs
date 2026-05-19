#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { CdpClient } from '@coinbase/cdp-sdk';
import { x402Client, x402HTTPClient } from '@x402/fetch';
import { registerExactEvmScheme } from '@x402/evm/exact/client';
import { toAccount } from 'viem/accounts';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const latestPath = path.join(proofDir, 'ace-x402-live-payment.latest.json');
const batchLatestPath = path.join(proofDir, 'ace-x402-onchain-batch.latest.json');

const approvalId = process.env.ACE_X402_APPROVAL_ID || 'appr_20260518022742_wg7log';
const expectedOrderId = process.env.ACE_X402_EXPECTED_ORDER_ID || '';
const defaultPayTo = '0x4F0E2D3477a1B94CF33d16E442CEe4733dadCeE7';
const payToAllowlist = new Set(
  String(process.env.ACE_X402_ALLOWED_PAY_TO || defaultPayTo)
    .split(/[\s,]+/)
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean),
);
const baseUsdc = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913';
const baseUsdcLower = baseUsdc.toLowerCase();
const maxPerOrderAtomic = BigInt(process.env.ACE_X402_MAX_PER_ORDER_ATOMIC || '1330000');

function resolveOpenClawRoot() {
  const candidates = [
    process.env.OPENCLAW_CONFIG_DIR,
    process.env.OPENCLAW_STATE_DIR,
    process.env.OPENCLAW_HOME,
    process.env.OPENCLAW_HOME?.endsWith('.openclaw') ? process.env.OPENCLAW_HOME : process.env.OPENCLAW_HOME ? path.join(process.env.OPENCLAW_HOME, '.openclaw') : '',
    path.join(os.homedir(), '.openclaw'),
    '/opt/openclaw/config',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0] || path.join(os.homedir(), '.openclaw');
}

const openClawRoot = resolveOpenClawRoot();
const envPath = path.join(openClawRoot, 'revenue-agent.env');

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

function latestHasSuccessfulPayment() {
  const latest = readJsonIfPresent(latestPath);
  const tx = latest?.transaction || latest?.paymentResponse?.transaction || null;
  return latest?.ok === true
    && latest?.httpStatus === 200
    && latest?.paymentResponseHeaderPresent === true
    && typeof tx === 'string'
    && tx.startsWith('0x');
}

function writeLatestIfSafe(payload) {
  if (payload?.ok === true || !latestHasSuccessfulPayment()) {
    writeJson(latestPath, payload);
  }
}

function safeOrderShort(orderId) {
  return String(orderId || 'unknown').replace(/[^a-z0-9-]/gi, '').slice(0, 12) || 'unknown';
}

function archive(payload, orderId = '') {
  const stamp = String(payload.generatedAt || new Date().toISOString()).replace(/[-:.]/g, '').replace(/Z$/, 'Z');
  const orderPart = orderId ? `${safeOrderShort(orderId)}.` : '';
  const archivePath = path.join(proofDir, `ace-x402-live-payment.${orderPart}${stamp}.json`);
  writeJson(archivePath, payload);
  return archivePath;
}

function readEnvFile() {
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index < 0) continue;
    env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function normalizePem(value) {
  const text = String(value || '').trim().replace(/\\n/g, '\n');
  if (!text.startsWith('-----BEGIN EC PRIVATE KEY-----')) return text;
  return crypto.createPrivateKey(text).export({ type: 'pkcs8', format: 'pem' }).toString();
}

function cdpConfig() {
  const env = readEnvFile();
  return {
    apiKeyId: env.CDP_API_KEY_ID || env.COINBASE_CDP_API_KEY_ID || env.COINBASE_CDP_API_KEY || '',
    apiKeySecret: env.CDP_API_KEY_SECRET || env.COINBASE_CDP_API_KEY_SECRET || env.COINBASE_CDP_API_SECRET || '',
    walletSecret: env.CDP_WALLET_SECRET || env.COINBASE_CDP_WALLET_SECRET || '',
    accountName: env.CDP_WALLET_ACCOUNT_NAME || env.COINBASE_CDP_WALLET_ACCOUNT_NAME || 'wisely-openclaw-agent-main',
  };
}

function redact(value) {
  const text = String(value || '');
  if (!text) return '';
  if (text.length <= 10) return '[redacted]';
  return `${text.slice(0, 6)}...[redacted]...${text.slice(-4)}`;
}

function amountToUsdcText(atomic) {
  const value = BigInt(atomic || 0);
  const whole = value / 1_000_000n;
  const fraction = String(value % 1_000_000n).padStart(6, '0').replace(/0+$/, '');
  return fraction ? `${whole}.${fraction}` : `${whole}`;
}

function publicSafeRequirement(requirement) {
  if (!requirement || typeof requirement !== 'object') return null;
  return {
    scheme: requirement.scheme || null,
    network: requirement.network || null,
    asset: requirement.asset || null,
    maxAmountRequired: requirement.maxAmountRequired || requirement.amount || null,
    payTo: requirement.payTo || null,
    extraKeys: requirement.extra && typeof requirement.extra === 'object' ? Object.keys(requirement.extra).sort() : [],
  };
}

function normalizePaymentRequired(body) {
  if (!body || typeof body !== 'object') throw new Error('payment_required_body_missing');
  if (body.x402Version) return body;
  if (!Array.isArray(body.accepts)) throw new Error('payment_required_accepts_missing');
  return {
    x402Version: 1,
    error: body.error || body.detail || body.message || 'Payment required',
    accepts: body.accepts,
  };
}

function findBaseRequirement(paymentRequired) {
  const accepts = Array.isArray(paymentRequired.accepts) ? paymentRequired.accepts : [];
  return accepts.find((item) =>
    String(item.scheme || '').toLowerCase() === 'exact' &&
    String(item.network || '').toLowerCase() === 'base' &&
    String(item.asset || '').toLowerCase() === baseUsdcLower
  );
}

function parseOrderIdsFromText(value) {
  const text = String(value || '').trim();
  if (!text) return [];
  try {
    const parsed = JSON.parse(text);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // Fall through to line/comma parsing.
  }
  return text.split(/[\s,]+/).map((item) => item.trim()).filter(Boolean);
}

function readOrderIds(fileEnv = {}) {
  const ids = [
    ...parseOrderIdsFromText(process.env.ACE_X402_ORDER_IDS || ''),
    ...parseOrderIdsFromText(process.env.ACE_X402_ORDER_ID || ''),
    ...parseOrderIdsFromText(fileEnv.ACE_X402_ORDER_IDS || ''),
    ...parseOrderIdsFromText(fileEnv.ACE_X402_ORDER_ID || ''),
  ];
  const filePath = process.env.ACE_X402_ORDER_IDS_FILE || fileEnv.ACE_X402_ORDER_IDS_FILE || '';
  if (filePath && fs.existsSync(filePath)) {
    ids.push(...parseOrderIdsFromText(fs.readFileSync(filePath, 'utf8')));
  }
  return [...new Set(ids)].filter(Boolean);
}

async function fetchPaymentRequired(platformToken, orderId) {
  const url = `https://platform.acedata.cloud/api/v1/orders/${encodeURIComponent(orderId)}/pay/`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${platformToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pay_way: 'X402' }),
  });
  const bodyText = await response.text();
  let body = null;
  try {
    body = bodyText ? JSON.parse(bodyText) : null;
  } catch {
    body = null;
  }
  return { response, body, bodyText, url };
}

function encodeBalanceOfCall(address) {
  const clean = String(address || '').toLowerCase().replace(/^0x/, '');
  if (!/^[a-f0-9]{40}$/.test(clean)) throw new Error('invalid_evm_address_for_balance_check');
  return `0x70a08231${clean.padStart(64, '0')}`;
}

async function baseUsdcBalance(address) {
  const rpcUrl = process.env.BASE_RPC_URL || 'https://mainnet.base.org';
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_call',
      params: [
        {
          to: baseUsdc,
          data: encodeBalanceOfCall(address),
        },
        'latest',
      ],
    }),
  });
  const payload = await response.json();
  if (payload.error) throw new Error(`base_rpc_balance_error:${payload.error.message || JSON.stringify(payload.error)}`);
  return BigInt(payload.result || '0x0');
}

function publicBodySummary(body) {
  if (!body || typeof body !== 'object') return null;
  const allowed = {};
  for (const key of ['id', 'status', 'state', 'code', 'message', 'detail', 'error', 'payment_status', 'pay_status', 'order_status', 'paid', 'amount', 'currency', 'pay_way']) {
    if (!(key in body)) continue;
    const value = body[key];
    if (value == null || typeof value === 'boolean' || typeof value === 'number') allowed[key] = value;
    if (typeof value === 'string') allowed[key] = value.length > 200 ? `${value.slice(0, 200)}...[truncated]` : value;
  }
  return { topLevelKeys: Object.keys(body).sort(), fields: allowed };
}

function basePayload(status, notes = []) {
  return {
    generatedAt: new Date().toISOString(),
    status,
    approvalId,
    safety: {
      createsAccount: false,
      usesManagedSigner: true,
      storesSignerSecret: false,
      storesPlatformToken: false,
      usesPersonalFiatFunding: false,
      signsPayment: false,
      retriesPayment: false,
      spendsFunds: false,
    },
    source: {
      docs: 'https://docs.acedata.cloud/en/guides/x402',
      coinbaseBuyerDocs: 'https://docs.cdp.coinbase.com/x402/quickstart-for-buyers',
      apiBase: 'https://platform.acedata.cloud',
      endpointShape: 'POST /api/v1/orders/{order_id}/pay/ with { "pay_way": "X402" }',
    },
    notes,
  };
}

function resultStatus(result) {
  if (result.ok && result.transaction) return 'onchain-payment-captured';
  if (result.preflightBlockers?.length) return 'blocked-preflight';
  return result.status || 'not-captured';
}

async function loadSigner() {
  const cfg = cdpConfig();
  const missing = [
    cfg.apiKeyId ? null : 'CDP_API_KEY_ID or COINBASE_CDP_API_KEY_ID',
    cfg.apiKeySecret ? null : 'CDP_API_KEY_SECRET or COINBASE_CDP_API_SECRET',
    cfg.walletSecret ? null : 'CDP_WALLET_SECRET or COINBASE_CDP_WALLET_SECRET',
  ].filter(Boolean);
  if (missing.length) return { missing };

  const cdp = new CdpClient({
    apiKeyId: cfg.apiKeyId.trim(),
    apiKeySecret: normalizePem(cfg.apiKeySecret),
    walletSecret: cfg.walletSecret.trim(),
  });
  const cdpAccount = await cdp.evm.getOrCreateAccount({ name: cfg.accountName });
  const signer = toAccount(cdpAccount);
  return {
    signer,
    payerAddress: cdpAccount.address || signer.address,
  };
}

async function inspectOrder({ platformToken, orderId, payerAddress, remainingTotalCapAtomic }) {
  const initial = await fetchPaymentRequired(platformToken, orderId);
  if (initial.response.status !== 402) {
    return {
      ...basePayload('blocked-unexpected-ace-response', ['Initial Ace request did not return 402 payment requirements. No signature, retry, or payment was attempted.']),
      ok: false,
      orderId: redact(orderId),
      httpStatus: initial.response.status,
      responsePublicSummary: publicBodySummary(initial.body),
      responseBodyPreview: initial.body ? undefined : initial.bodyText.slice(0, 1000),
      preflightBlockers: ['ace_response_not_payment_required'],
    };
  }

  const paymentRequired = normalizePaymentRequired(initial.body);
  const requirement = findBaseRequirement(paymentRequired);
  if (!requirement) {
    return {
      ...basePayload('blocked-no-base-usdc-requirement', ['No signature, retry, or payment was attempted.']),
      ok: false,
      orderId: redact(orderId),
      accepts: (paymentRequired.accepts || []).map(publicSafeRequirement),
      preflightBlockers: ['no_base_usdc_requirement'],
    };
  }

  const amountAtomic = BigInt(requirement.maxAmountRequired || requirement.amount || '0');
  const payTo = String(requirement.payTo || '').toLowerCase();
  const preflightBlockers = [];
  if (expectedOrderId && orderId !== expectedOrderId) preflightBlockers.push('order_id_changed_from_expected_env');
  if (!payToAllowlist.has(payTo)) preflightBlockers.push('pay_to_not_allowlisted');
  if (amountAtomic > maxPerOrderAtomic) preflightBlockers.push('amount_exceeds_per_order_cap');
  if (amountAtomic > remainingTotalCapAtomic) preflightBlockers.push('amount_exceeds_remaining_total_cap');

  return {
    ...basePayload(preflightBlockers.length ? 'blocked-preflight-failed-no-sign-no-spend' : 'ready-preflight'),
    ok: preflightBlockers.length === 0,
    orderId: redact(orderId),
    fullOrderIdForRuntimeOnly: orderId,
    payerAddress,
    requirement: publicSafeRequirement(requirement),
    amountAtomic: amountAtomic.toString(),
    amountUsdc: amountToUsdcText(amountAtomic),
    paymentRequired,
    paymentUrl: initial.url,
    preflightBlockers,
  };
}

async function payInspectedOrder({ inspected, platformToken, signer, httpClient, client, walletBaseUsdcBeforeAtomic }) {
  const paymentPayload = await client.createPaymentPayload(inspected.paymentRequired);
  const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);

  const second = await fetch(inspected.paymentUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${platformToken}`,
      'Content-Type': 'application/json',
      ...paymentHeaders,
      'Access-Control-Expose-Headers': 'PAYMENT-RESPONSE,X-PAYMENT-RESPONSE',
    },
    body: JSON.stringify({ pay_way: 'X402' }),
  });
  const responseText = await second.text();
  let responseBody = null;
  try {
    responseBody = responseText ? JSON.parse(responseText) : null;
  } catch {
    responseBody = null;
  }

  let receipt = null;
  let receiptError = '';
  try {
    receipt = httpClient.getPaymentSettleResponse((name) => second.headers.get(name));
  } catch (error) {
    receiptError = error.message;
  }

  const transaction = typeof receipt?.transaction === 'string' && receipt.transaction.startsWith('0x')
    ? receipt.transaction
    : null;

  return {
    ...basePayload(second.ok ? 'submitted-live-x402-payment' : 'attempted-live-x402-payment-failed', [
      'A managed CDP signer created the x402 payment payload.',
      'The payment header itself is intentionally not stored.',
      'No personal fiat funding, private signing material, or raw payment-card detail was used.',
    ]),
    ok: second.ok,
    safety: {
      createsAccount: false,
      usesManagedSigner: true,
      storesSignerSecret: false,
      storesPlatformToken: false,
      usesPersonalFiatFunding: false,
      signsPayment: true,
      retriesPayment: true,
      spendsFunds: second.ok,
    },
    orderId: inspected.orderId,
    payerAddress: signer.address,
    requirement: inspected.requirement,
    walletBaseUsdcBeforeAtomic: walletBaseUsdcBeforeAtomic.toString(),
    walletBaseUsdcBefore: amountToUsdcText(walletBaseUsdcBeforeAtomic),
    httpStatus: second.status,
    paymentResponseHeaderPresent: Boolean(second.headers.get('PAYMENT-RESPONSE') || second.headers.get('X-PAYMENT-RESPONSE')),
    paymentResponse: receipt,
    paymentResponseDecodeError: receiptError || undefined,
    transaction,
    responsePublicSummary: publicBodySummary(responseBody),
    responseBodyPreview: responseBody ? undefined : responseText.slice(0, 1000),
  };
}

async function main() {
  const execute = String(process.env.ACE_X402_EXECUTE || '').toLowerCase() === 'true';
  const liveApproval = process.env.ACE_X402_LIVE_APPROVAL || '';
  const fileEnv = readEnvFile();
  const platformToken = process.env.ACE_PLATFORM_TOKEN || fileEnv.ACE_PLATFORM_TOKEN || '';
  const orderIds = readOrderIds(fileEnv);
  const maxTotalAtomic = BigInt(process.env.ACE_X402_MAX_TOTAL_ATOMIC || String(maxPerOrderAtomic * BigInt(Math.max(orderIds.length, 1))));

  const missing = [
    platformToken ? null : 'ACE_PLATFORM_TOKEN',
    orderIds.length ? null : 'ACE_X402_ORDER_ID, ACE_X402_ORDER_IDS, or ACE_X402_ORDER_IDS_FILE',
  ].filter(Boolean);

  if (missing.length) {
    const payload = {
      ...basePayload('blocked-missing-ace-env', ['No request, signature, retry, or payment was attempted.']),
      ok: false,
      missing,
      requestedOrderCount: orderIds.length,
      executeRequested: execute,
    };
    writeLatestIfSafe(payload);
    writeJson(batchLatestPath, {
      ...payload,
      status: 'blocked-missing-ace-env-batch',
      results: [],
      onChainProofCount: 0,
      targetOnChainProofCount: 3,
    });
    archive(payload);
    console.log(`Wrote Ace x402 batch blocker: ${batchLatestPath}`);
    return;
  }

  const signerState = await loadSigner();
  if (signerState.missing) {
    const payload = {
      ...basePayload('blocked-missing-cdp-managed-signer', ['No signature, retry, or payment was attempted.']),
      ok: false,
      orderIds: orderIds.map(redact),
      missing: signerState.missing,
      executeRequested: execute,
    };
    writeLatestIfSafe(payload);
    writeJson(batchLatestPath, {
      ...payload,
      status: 'blocked-missing-cdp-managed-signer-batch',
      results: [],
      onChainProofCount: 0,
      targetOnChainProofCount: 3,
    });
    archive(payload);
    console.log(`Wrote Ace x402 managed-signer blocker: ${batchLatestPath}`);
    return;
  }

  const { signer, payerAddress } = signerState;
  const startingBalanceAtomic = await baseUsdcBalance(payerAddress);
  let remainingTotalCapAtomic = maxTotalAtomic;
  const inspectedOrders = [];
  for (const orderId of orderIds) {
    const inspected = await inspectOrder({ platformToken, orderId, payerAddress, remainingTotalCapAtomic });
    inspectedOrders.push(inspected);
    if (inspected.ok && inspected.amountAtomic) remainingTotalCapAtomic -= BigInt(inspected.amountAtomic);
  }

  const totalRequiredAtomic = inspectedOrders
    .filter((item) => item.ok && item.amountAtomic)
    .reduce((sum, item) => sum + BigInt(item.amountAtomic), 0n);
  if (totalRequiredAtomic > startingBalanceAtomic) {
    let remainingBalance = startingBalanceAtomic;
    for (const item of inspectedOrders) {
      if (!item.ok || !item.amountAtomic) continue;
      const amount = BigInt(item.amountAtomic);
      if (remainingBalance >= amount) {
        remainingBalance -= amount;
      } else {
        item.ok = false;
        item.status = 'blocked-preflight-failed-no-sign-no-spend';
        item.preflightBlockers = [...(item.preflightBlockers || []), 'insufficient_base_usdc_balance'];
      }
    }
  }

  const preflightBlockers = inspectedOrders.flatMap((item) => item.preflightBlockers || []);
  const approvalEnvMatches = liveApproval === approvalId;
  const shouldExecute = execute && approvalEnvMatches && preflightBlockers.length === 0;
  const results = [];

  if (!shouldExecute) {
    for (const item of inspectedOrders) {
      const payload = {
        ...item,
        status: item.preflightBlockers?.length ? 'blocked-preflight-failed-no-sign-no-spend' : 'ready-preflight-no-execute',
        paymentRequired: undefined,
        paymentUrl: undefined,
        fullOrderIdForRuntimeOnly: undefined,
        walletBaseUsdcAtomic: startingBalanceAtomic.toString(),
        walletBaseUsdc: amountToUsdcText(startingBalanceAtomic),
        executeRequested: execute,
        approvalEnvMatches,
        approvedMaxPerOrderAtomic: maxPerOrderAtomic.toString(),
        approvedMaxPerOrderUsdc: amountToUsdcText(maxPerOrderAtomic),
        approvedMaxTotalAtomic: maxTotalAtomic.toString(),
        approvedMaxTotalUsdc: amountToUsdcText(maxTotalAtomic),
        nextAction: item.preflightBlockers?.includes('insufficient_base_usdc_balance')
          ? `Fund ${payerAddress} on Base with enough USDC for this order, then rerun.`
          : 'Set ACE_X402_EXECUTE=true and ACE_X402_LIVE_APPROVAL to the approval id to perform the approved payment batch.',
      };
      writeLatestIfSafe(payload);
      archive(payload, item.fullOrderIdForRuntimeOnly || '');
      results.push({
        orderId: payload.orderId,
        status: resultStatus(payload),
        ok: payload.ok,
        amountAtomic: payload.requirement?.maxAmountRequired || null,
        preflightBlockers: payload.preflightBlockers || [],
      });
    }

    const batchPayload = {
      ...basePayload(preflightBlockers.length ? 'blocked-preflight-failed-no-sign-no-spend-batch' : 'ready-preflight-no-execute-batch', [
        'Initial 402 requirements were fetched and checked.',
        'No X-PAYMENT/PAYMENT-SIGNATURE payload was generated.',
        'No retry was sent and no funds were spent.',
      ]),
      ok: preflightBlockers.length === 0,
      orderCount: orderIds.length,
      targetOnChainProofCount: 3,
      onChainProofCount: 0,
      payerAddress,
      walletBaseUsdcAtomic: startingBalanceAtomic.toString(),
      walletBaseUsdc: amountToUsdcText(startingBalanceAtomic),
      approvedMaxPerOrderAtomic: maxPerOrderAtomic.toString(),
      approvedMaxPerOrderUsdc: amountToUsdcText(maxPerOrderAtomic),
      approvedMaxTotalAtomic: maxTotalAtomic.toString(),
      approvedMaxTotalUsdc: amountToUsdcText(maxTotalAtomic),
      executeRequested: execute,
      approvalEnvMatches,
      preflightBlockers: [...new Set(preflightBlockers)],
      results,
    };
    writeJson(batchLatestPath, batchPayload);
    console.log(`Wrote Ace x402 batch preflight: ${batchLatestPath}`);
    return;
  }

  const client = new x402Client();
  registerExactEvmScheme(client, { signer });
  const httpClient = new x402HTTPClient(client);
  let walletBalanceAtomic = startingBalanceAtomic;

  for (const inspected of inspectedOrders) {
    const paid = await payInspectedOrder({
      inspected,
      platformToken,
      signer,
      httpClient,
      client,
      walletBaseUsdcBeforeAtomic: walletBalanceAtomic,
    });
    writeJson(latestPath, paid);
    archive(paid, inspected.fullOrderIdForRuntimeOnly);
    results.push({
      orderId: paid.orderId,
      status: resultStatus(paid),
      ok: paid.ok,
      httpStatus: paid.httpStatus,
      amountAtomic: paid.requirement?.maxAmountRequired || null,
      network: paid.paymentResponse?.network || paid.requirement?.network || null,
      transaction: paid.transaction || paid.paymentResponse?.transaction || null,
      paymentResponseHeaderPresent: paid.paymentResponseHeaderPresent === true,
    });
    if (!paid.ok) break;
    if (inspected.amountAtomic) walletBalanceAtomic -= BigInt(inspected.amountAtomic);
  }

  const successfulTxs = [...new Set(results.map((item) => item.transaction).filter((tx) => typeof tx === 'string' && tx.startsWith('0x')))];
  const batchPayload = {
    ...basePayload(successfulTxs.length === orderIds.length ? 'submitted-live-x402-payment-batch' : 'attempted-live-x402-payment-batch-partial', [
      'Each successful item used a managed CDP signer and stored only public-safe settlement metadata.',
      'Raw X-PAYMENT headers, platform tokens, wallet secrets, and private signing material are not stored.',
      'No personal fiat funding was used.',
    ]),
    ok: successfulTxs.length === orderIds.length,
    safety: {
      createsAccount: false,
      usesManagedSigner: true,
      storesSignerSecret: false,
      storesPlatformToken: false,
      usesPersonalFiatFunding: false,
      signsPayment: true,
      retriesPayment: true,
      spendsFunds: successfulTxs.length > 0,
    },
    orderCount: orderIds.length,
    targetOnChainProofCount: 3,
    onChainProofCount: successfulTxs.length,
    payerAddress,
    walletBaseUsdcBeforeAtomic: startingBalanceAtomic.toString(),
    walletBaseUsdcBefore: amountToUsdcText(startingBalanceAtomic),
    approvedMaxPerOrderAtomic: maxPerOrderAtomic.toString(),
    approvedMaxPerOrderUsdc: amountToUsdcText(maxPerOrderAtomic),
    approvedMaxTotalAtomic: maxTotalAtomic.toString(),
    approvedMaxTotalUsdc: amountToUsdcText(maxTotalAtomic),
    transactions: successfulTxs,
    results,
  };
  writeJson(batchLatestPath, batchPayload);
  console.log(`Wrote Ace x402 live-payment batch result: ${batchLatestPath}`);
  if (!batchPayload.ok) process.exit(1);
}

main().catch((error) => {
  const payload = {
    ...basePayload('fatal-live-payment-error', ['Unhandled error. Review before retrying.']),
    ok: false,
    error: error.message,
  };
  writeLatestIfSafe(payload);
  writeJson(batchLatestPath, {
    ...payload,
    status: 'fatal-live-payment-error-batch',
    results: [],
    onChainProofCount: 0,
    targetOnChainProofCount: 3,
  });
  archive(payload);
  console.log(`Wrote Ace x402 live-payment fatal error: ${batchLatestPath}`);
  process.exit(1);
});
