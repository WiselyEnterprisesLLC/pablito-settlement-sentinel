#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const latestPath = path.join(proofDir, 'ace-service-proof.latest.json');

const services = {
  openai_chat: {
    label: 'Ace OpenAI-compatible chat completion',
    docs: 'https://docs.acedata.cloud/en/guides/openai/openai_chat_completions',
    url: 'https://api.acedata.cloud/openai/chat/completions',
    body: {
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: 'Return one terse JSON object with keys category and next_step for this workflow leak: missed first replies create lost leads.',
        },
      ],
      temperature: 0.2,
      max_tokens: 80,
    },
  },
  gemini_chat: {
    label: 'Ace Gemini chat completion',
    docs: 'https://docs.acedata.cloud/en/guides/gemini/gemini_chat_completions',
    url: 'https://api.acedata.cloud/gemini/chat/completions',
    body: {
      model: 'gemini-2.5-flash',
      messages: [
        {
          role: 'user',
          content: 'In one sentence, classify this business workflow issue: no owner for the second follow-up after a web lead arrives.',
        },
      ],
      temperature: 0.2,
      max_tokens: 80,
    },
  },
  serp_google: {
    label: 'Ace SERP Google data service',
    docs: 'https://docs.acedata.cloud/en/guides/serp/serp_google',
    url: 'https://api.acedata.cloud/serp/google',
    body: {
      query: 'small business missed lead follow up automation pain',
      num: 3,
    },
  },
};

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function archive(payload) {
  const stamp = String(payload.generatedAt || new Date().toISOString()).replace(/[-:.]/g, '').replace(/Z$/, 'Z');
  const archivePath = path.join(proofDir, `ace-service-proof.${payload.serviceId || 'unknown'}.${stamp}.json`);
  writeJson(archivePath, payload);
  return archivePath;
}

function safeText(value, maxLength = 800) {
  if (value == null) return null;
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...[truncated]` : text;
}

function summarizeResponse(body) {
  if (!body || typeof body !== 'object') return { type: typeof body, preview: safeText(body) };
  const topLevelKeys = Object.keys(body).sort();
  const choices = Array.isArray(body.choices)
    ? body.choices.slice(0, 2).map((choice) => ({
        index: choice.index,
        finish_reason: choice.finish_reason || null,
        message: choice.message
          ? {
              role: choice.message.role || null,
              content: safeText(choice.message.content, 800),
            }
          : null,
      }))
    : null;
  const organicResults = Array.isArray(body.organic_results)
    ? body.organic_results.slice(0, 5).map((item) => ({
        title: safeText(item.title, 160),
        link: safeText(item.link, 240),
        snippet: safeText(item.snippet, 280),
      }))
    : null;
  return {
    topLevelKeys,
    id: typeof body.id === 'string' ? body.id : null,
    model: typeof body.model === 'string' ? body.model : null,
    usage: body.usage && typeof body.usage === 'object' ? body.usage : null,
    choices,
    organicResults,
    preview: choices || organicResults ? null : safeText(body, 1000),
  };
}

function basePayload(status, serviceId, notes = []) {
  return {
    generatedAt: new Date().toISOString(),
    status,
    serviceId,
    safety: {
      storesApiToken: false,
      storesRawResponse: false,
      usesPersonalFiatFunding: false,
      signsPayment: false,
      publishesPublicly: false,
    },
    notes,
  };
}

function parseArgs(argv) {
  const out = { service: process.env.ACE_SERVICE_ID || '' };
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--service') out.service = argv[++index];
    else throw new Error(`Unknown argument: ${value}`);
  }
  return out;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const serviceId = args.service;
  const service = services[serviceId];
  const apiToken = String(process.env.ACE_API_TOKEN || '').trim();

  if (!service) {
    const payload = {
      ...basePayload('blocked-unknown-service', serviceId, ['No external API call was attempted.']),
      ok: false,
      supportedServices: Object.keys(services),
    };
    writeJson(latestPath, payload);
    archive(payload);
    console.log(JSON.stringify(payload, null, 2));
    process.exit(1);
  }

  if (!apiToken) {
    const payload = {
      ...basePayload('blocked-missing-ace-api-token', serviceId, ['No external API call was attempted.']),
      ok: false,
      serviceLabel: service.label,
      missing: ['ACE_API_TOKEN'],
      docs: service.docs,
    };
    writeJson(latestPath, payload);
    archive(payload);
    console.log(JSON.stringify(payload, null, 2));
    return;
  }

  const response = await fetch(service.url, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(service.body),
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  const payload = {
    ...basePayload('captured-ace-api-service-proof', serviceId, [
      'API token was provided through process env/stdin wrapper only.',
      'Stored proof is a public-safe summary, not the raw provider response.',
      'This proves service execution only if httpStatus is 2xx and ok is true.',
    ]),
    ok: response.ok,
    httpStatus: response.status,
    serviceLabel: service.label,
    docs: service.docs,
    endpoint: service.url,
    requestShape: {
      method: 'POST',
      bodyKeys: Object.keys(service.body).sort(),
      model: service.body.model || null,
    },
    responseSummary: body ? summarizeResponse(body) : null,
    responsePreviewIfNonJson: body ? undefined : safeText(text, 800),
  };

  writeJson(latestPath, payload);
  const archivePath = archive(payload);
  console.log(JSON.stringify({
    ok: payload.ok,
    httpStatus: payload.httpStatus,
    serviceId,
    serviceLabel: service.label,
    archive: archivePath,
  }, null, 2));
}

main().catch((error) => {
  const serviceId = process.env.ACE_SERVICE_ID || 'unknown';
  const payload = {
    ...basePayload('fatal-ace-service-proof-error', serviceId, ['Failure occurred before any public publishing.']),
    ok: false,
    error: error.message,
  };
  writeJson(latestPath, payload);
  archive(payload);
  console.error(error);
  process.exit(1);
});
