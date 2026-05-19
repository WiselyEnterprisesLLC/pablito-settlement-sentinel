#!/usr/bin/env node

/**
 * Pablito Settlement Sentinel — OOBE × Ace Data Cloud dry-run demo.
 *
 * No SDK import, wallet connection, signature, transaction, escrow, public post,
 * account login, or paid API call occurs here. The demo models the required bounty
 * shape using deterministic local adapters:
 *   trigger -> SAP discovery model -> AI service call model -> x402 settlement proof -> public-safe deliverable
 */

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  SDK_INTERFACE_EVIDENCE,
  buildRegisterAgentArgs,
  simulateSapDiscovery,
  calculateDryRunCost,
  buildDryRunX402Headers,
  createDryRunSettlementProof,
} from './sap-sdk-dry-run-adapter.mjs';
import { runMockAceAiService, buildPublicDemoNarrative } from './public-safe-deliverable.mjs';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'agent.manifest.draft.json'), 'utf8'));
const proofDir = path.join(root, 'proof');

function getAceLiveServiceProofStatus() {
  if (!fs.existsSync(proofDir)) return { satisfied: false, distinctServices: [] };
  const distinctServices = [...new Set(fs.readdirSync(proofDir)
    .filter((name) => /^ace-service-proof\.[^.]+\.\d{8}T\d{9}Z\.json$/.test(name))
    .map((name) => {
      try {
        return JSON.parse(fs.readFileSync(path.join(proofDir, name), 'utf8'));
      } catch {
        return null;
      }
    })
    .filter((proof) => proof?.ok === true && proof.serviceId)
    .map((proof) => proof.serviceId))].sort();
  return { satisfied: distinctServices.length >= 3, distinctServices };
}

export function runDryRunDemo() {
  const request = {
    id: 'req_oobe_ace_dry_run_001',
    source: 'local-demo-trigger',
    workflowPain: 'A small operator loses leads because form submissions, first replies, and follow-up reminders are handled manually.',
    requestedDeliverable: 'Classify the workflow leak and suggest one safe automation step.',
  };

  const registerAgentArgs = buildRegisterAgentArgs(manifest);
  const discovery = simulateSapDiscovery({
    capabilityId: 'workflow:classify',
    protocolId: 'SAP',
    manifest,
  });
  const aiResult = runMockAceAiService(request);
  const cost = calculateDryRunCost({
    pricePerCall: discovery.selectedAgent.pricingTier.pricePerCall,
    calls: 1,
  });
  const x402 = buildDryRunX402Headers({ requestId: request.id, discovery, calls: 1 });
  const proof = createDryRunSettlementProof({ request, discovery, aiResult, cost, x402 });
  const publicDeliverable = buildPublicDemoNarrative({ request, discovery, aiResult, proof });
  const aceLiveServiceProof = getAceLiveServiceProofStatus();

  return {
    name: 'Pablito Settlement Sentinel',
    categoryFit: {
      general: 'Workflow models SAP discovery + AI capability + settlement proof path; live general category still needs Synapse Sentinel usage once.',
      ace: aceLiveServiceProof.satisfied
        ? `Dry-run still models one local Ace-style service, but live Ace usage proof is captured separately for: ${aceLiveServiceProof.distinctServices.join(', ')}.`
        : 'Workflow models one Ace-style AI service; live Ace category still needs 3 actual Ace Data Cloud services.',
    },
    liveProofStatus: {
      aceServiceUsage: aceLiveServiceProof,
    },
    sdkInterfaceEvidence: SDK_INTERFACE_EVIDENCE,
    mockedVsLive: {
      mocked: proof.mockedComponents,
      liveRequired: proof.liveComponentsRequired,
    },
    safety: {
      spendsFunds: false,
      signsWallet: false,
      connectsAccount: false,
      publishesPublicly: false,
      artificialVolume: false,
      importsSapSdk: false,
      networkMutation: false,
    },
    workflow: {
      trigger: request,
      sapRegistrationArgsDraft: registerAgentArgs,
      sapDiscovery: discovery,
      aiServiceCall: aiResult,
      x402CostEstimate: cost,
      x402HeadersModel: x402,
      settlementProof: proof,
      publicDeliverable,
    },
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const demo = runDryRunDemo();
  console.log(JSON.stringify(demo, null, 2));
}
