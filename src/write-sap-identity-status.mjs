#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const outPath = path.join(proofDir, 'sap-identity-status.latest.json');
const snapshotPath = path.join(proofDir, 'synapse-explorer-snapshot.latest.json');
const readinessPath = path.join(proofDir, 'sap-mainnet-registration-readiness.latest.json');
const liveRegistrationPath = path.join(proofDir, 'sap-registration.live.latest.json');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'agent.manifest.draft.json'), 'utf8'));

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function extractHits(result) {
  const preview = result?.summary?.dataPreview;
  if (Array.isArray(preview)) return preview;
  if (preview && typeof preview === 'object' && Array.isArray(preview.data)) return preview.data;
  return [];
}

const snapshot = readJsonIfPresent(snapshotPath);
const readiness = readJsonIfPresent(readinessPath);
const liveRegistration = readJsonIfPresent(liveRegistrationPath);
const nameHits = extractHits(snapshot?.results?.nameSearch);
const capabilityHits = extractHits(snapshot?.results?.capabilitySearch);
const allHits = [...nameHits, ...capabilityHits];

const matchingHits = allHits.filter((hit) => {
  const identity = hit.identity || hit;
  return identity?.name === manifest.name
    || identity?.agentId === manifest.agentId
    || identity?.agentUri === manifest.agentUri
    || identity?.x402Endpoint === manifest.x402Endpoint;
});

const payload = {
  generatedAt: new Date().toISOString(),
  status: matchingHits.length
    ? 'sap-identity-visible-in-explorer'
    : liveRegistration?.ok === true && liveRegistration?.status === 'registered-sap-mainnet-identity'
      ? 'registered-live-identity-found'
      : 'sap-identity-not-visible-yet',
  safety: {
    readOnly: true,
    signsWallet: false,
    sendsTransaction: false,
    spendsFunds: false,
    publishesPublicly: false,
    storesSecrets: false,
  },
  searchedFor: {
    name: manifest.name,
    agentId: manifest.agentId,
    agentUri: manifest.agentUri,
    x402Endpoint: manifest.x402Endpoint,
    capabilityIds: manifest.capabilities.map((capability) => capability.id),
  },
  snapshotFile: snapshot ? 'proof/synapse-explorer-snapshot.latest.json' : null,
  explorerStatus: snapshot?.status || null,
  explorerNameSearchCount: snapshot?.results?.nameSearch?.summary?.dataCount ?? null,
  explorerCapabilitySearchCount: snapshot?.results?.capabilitySearch?.summary?.dataCount ?? null,
  liveRegistration: liveRegistration?.ok === true
    ? {
      evidenceFile: 'proof/sap-registration.live.latest.json',
      status: liveRegistration.status,
      signature: liveRegistration.signature,
      explorerUrl: liveRegistration.explorerUrl,
      wallet: liveRegistration.wallet,
      agentPda: liveRegistration.pdas?.agent || null,
      agentStatsPda: liveRegistration.pdas?.agentStats || null,
      spentLamports: liveRegistration.balances?.spentLamports || null,
      spentSol: liveRegistration.balances?.spentSol ?? null,
    }
    : null,
  matchingHits: matchingHits.map((hit) => ({
    pda: hit.pda || null,
    wallet: hit.identity?.wallet || hit.wallet || null,
    name: hit.identity?.name || hit.name || null,
    agentId: hit.identity?.agentId || hit.agentId || null,
    agentUri: hit.identity?.agentUri || hit.agentUri || null,
    x402Endpoint: hit.identity?.x402Endpoint || hit.x402Endpoint || null,
    capabilities: hit.identity?.capabilities || hit.capabilities || [],
  })),
  readinessStatus: readiness?.status || null,
  nextAction: matchingHits.length
    ? 'Capture post-registration Explorer proof and proceed to the atomic live-run gate.'
    : liveRegistration?.ok === true
      ? 'SAP mainnet transaction is registered and locally verified; explorer index search has not caught up yet. Use the transaction/PDA proof and keep refreshing explorer snapshots.'
      : 'Pablito is not visible in Synapse Explorer yet. Complete SAP mainnet registration after explicit wallet/provider/fee approval.',
};

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({
  status: payload.status,
  matchingHits: payload.matchingHits.length,
  nextAction: payload.nextAction,
}, null, 2));
