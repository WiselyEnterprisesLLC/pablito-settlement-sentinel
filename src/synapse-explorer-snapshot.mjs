#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const latestPath = path.join(proofDir, 'synapse-explorer-snapshot.latest.json');
const baseUrl = 'https://explorer.oobeprotocol.ai';

const requests = [
  ['status', '/api/v1/status'],
  ['networkMetrics', '/api/v1/network/metrics'],
  ['agentsSample', '/api/v1/agents?limit=5'],
  ['capabilitySearch', '/api/v1/agents?capability=workflow%3Aclassify&limit=20'],
  ['nameSearch', '/api/v1/search?q=Pablito%20Settlement%20Sentinel&limit=20'],
];

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function safeSummarize(value) {
  if (!value || typeof value !== 'object') return value;
  const data = value.data;
  return {
    ok: !value.error,
    error: value.error || null,
    meta: value.meta || null,
    dataShape: Array.isArray(data) ? 'array' : data && typeof data === 'object' ? 'object' : typeof data,
    dataCount: Array.isArray(data) ? data.length : null,
    dataPreview: Array.isArray(data) ? data.slice(0, 3) : data && typeof data === 'object' ? data : null,
  };
}

async function main() {
  const results = {};
  for (const [name, route] of requests) {
    const response = await fetch(`${baseUrl}${route}`, {
      headers: {
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
    results[name] = {
      route,
      httpStatus: response.status,
      ok: response.ok,
      summary: body ? safeSummarize(body) : null,
      responsePreviewIfNonJson: body ? undefined : text.slice(0, 500),
    };
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    status: 'captured-synapse-explorer-read-only-snapshot',
    source: {
      explorer: baseUrl,
      docs: 'https://explorer.oobeprotocol.ai/api-playground.html',
      openapi: 'https://explorer.oobeprotocol.ai/openapi/v1.minimal.json',
    },
    safety: {
      readOnly: true,
      usesApiKey: false,
      signsWallet: false,
      sendsTransaction: false,
      spendsFunds: false,
      publishesPublicly: false,
    },
    note: 'Use this as a before/after read-only harness. Before SAP registration, Pablito should not appear in search/agent lists; after registration, the same script should capture the live agent identity.',
    results,
  };

  writeJson(latestPath, payload);
  const archivePath = path.join(proofDir, `synapse-explorer-snapshot.${payload.generatedAt.replace(/[-:.]/g, '').replace(/Z$/, 'Z')}.json`);
  writeJson(archivePath, payload);
  console.log(JSON.stringify({
    ok: true,
    latestPath,
    archivePath,
    statusHttp: results.status?.httpStatus,
    searchCount: results.nameSearch?.summary?.dataCount,
    capabilityCount: results.capabilitySearch?.summary?.dataCount,
  }, null, 2));
}

main().catch((error) => {
  const payload = {
    generatedAt: new Date().toISOString(),
    status: 'fatal-synapse-explorer-snapshot-error',
    ok: false,
    error: error.message,
  };
  writeJson(latestPath, payload);
  console.error(error);
  process.exit(1);
});
