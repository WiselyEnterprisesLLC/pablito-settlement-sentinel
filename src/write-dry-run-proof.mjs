#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { runDryRunDemo } from './dry-run-demo.mjs';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const outputPath = path.join(proofDir, 'dry-run-proof.latest.json');

const demo = runDryRunDemo();

const publicSafeProof = {
  generatedAt: new Date().toISOString(),
  status: 'dry-run-only-not-bounty-complete',
  warning:
    'This artifact is a deterministic local proof scaffold. It does not claim live SAP registration, live Ace Data Cloud usage, wallet signing, x402 settlement, payment volume, public posting, or Superteam submission.',
  name: demo.name,
  categoryFit: demo.categoryFit,
  sdkInterfaceEvidence: demo.sdkInterfaceEvidence,
  mockedVsLive: demo.mockedVsLive,
  safety: demo.safety,
  workflow: {
    trigger: demo.workflow.trigger,
    sapRegistrationArgsDraft: demo.workflow.sapRegistrationArgsDraft,
    sapDiscoveryModel: demo.workflow.sapDiscovery,
    aiServiceCallModel: demo.workflow.aiServiceCall,
    x402CostEstimateModel: demo.workflow.x402CostEstimate,
    x402HeadersModel: demo.workflow.x402HeadersModel,
    settlementProofModel: demo.workflow.settlementProof.publicProof,
    publicDeliverable: demo.workflow.publicDeliverable,
  },
  liveProofStillRequired: [
    'Confirmed Superteam submission route',
    'SAP mainnet registration proof',
    'Real Ace Data Cloud service usage proof if pursuing Ace category',
    'Synapse Sentinel usage proof if pursuing general category',
    'Non-wash x402/SAP settlement proof',
    'Approved public GitHub repo',
    'Approved X walkthrough/demo post',
    'Approved final Superteam submission',
  ],
};

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(publicSafeProof, null, 2)}\n`, 'utf8');

console.log(`Wrote public-safe dry-run proof artifact: ${outputPath}`);
