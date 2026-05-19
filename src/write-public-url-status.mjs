#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const outPath = path.join(proofDir, 'public-url-status.latest.json');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'agent.manifest.draft.json'), 'utf8'));

const targets = [
  { id: 'agent_metadata', url: manifest.agentUri, expectJson: true },
  { id: 'x402_resource', url: manifest.x402Endpoint, expectJson: true },
  { id: 'proof_page', url: 'https://wiselyenterprisesllc.com/oobe-ace/proof', expectJson: false, expectContains: 'Pablito Settlement Sentinel' },
  { id: 'proof_page_html', url: 'https://wiselyenterprisesllc.com/oobe-ace/oobe-ace-proof.html', expectJson: false, expectContains: 'Pablito Settlement Sentinel' },
];

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function summarizeJson(value) {
  if (!value || typeof value !== 'object') return { type: typeof value };
  return {
    type: Array.isArray(value) ? 'array' : 'object',
    topLevelKeys: Object.keys(value).slice(0, 20),
    status: value.status || null,
    warning: value.warning || null,
  };
}

async function checkTarget(target) {
  const startedAt = Date.now();
  try {
    const response = await fetch(target.url, {
      headers: { Accept: target.expectJson ? 'application/json' : 'text/html,application/json;q=0.9,*/*;q=0.8' },
    });
    const text = await response.text();
    let parsed = null;
    let jsonError = null;
    if (target.expectJson) {
      try {
        parsed = JSON.parse(text);
      } catch (error) {
        jsonError = error.message;
      }
    }

    const containsExpectedText = target.expectContains ? text.includes(target.expectContains) : true;

    return {
      id: target.id,
      url: target.url,
      ok: response.ok && (!target.expectJson || Boolean(parsed)) && containsExpectedText,
      httpStatus: response.status,
      contentType: response.headers.get('content-type'),
      bytes: Buffer.byteLength(text),
      sha256: sha256(text),
      latencyMs: Date.now() - startedAt,
      jsonSummary: parsed ? summarizeJson(parsed) : null,
      jsonError,
      expectedTextPresent: target.expectContains ? containsExpectedText : undefined,
      expectedTextMissing: target.expectContains && !containsExpectedText ? target.expectContains : undefined,
      preview: target.expectJson ? undefined : text.slice(0, 240),
    };
  } catch (error) {
    return {
      id: target.id,
      url: target.url,
      ok: false,
      error: error.message,
      latencyMs: Date.now() - startedAt,
    };
  }
}

const results = [];
for (const target of targets) {
  results.push(await checkTarget(target));
}

const payload = {
  generatedAt: new Date().toISOString(),
  status: results.every((result) => result.ok)
    ? 'all-public-urls-readable'
    : 'some-public-urls-not-readable',
  safety: {
    readOnly: true,
    signsWallet: false,
    sendsTransaction: false,
    spendsFunds: false,
    publishesPublicly: false,
    storesSecrets: false,
  },
  targets: results,
  nextAction: results.every((result) => result.ok)
    ? 'Public metadata endpoints are readable; proceed to SAP registration gate when approved.'
    : 'Fix unreadable public metadata/proof URLs before SAP registration or public submission.',
};

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  ok: payload.status === 'all-public-urls-readable',
  status: payload.status,
    failed: results.filter((result) => !result.ok).map((result) => ({ id: result.id, httpStatus: result.httpStatus, error: result.error || result.jsonError || result.expectedTextMissing })),
}, null, 2));
