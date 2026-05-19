#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import {
  DEMO_PUBLIC_WALLET,
  SAP_NETWORK,
  SAP_PROGRAM_ADDRESS,
  SDK_INTERFACE_EVIDENCE,
} from './sap-sdk-dry-run-adapter.mjs';
import { buildSapRegistrationPreview } from './live-sap-register-preview.mjs';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const outPath = path.join(proofDir, 'sap-live-gate.latest.json');

const preview = buildSapRegistrationPreview({
  manifestPath: 'agent.manifest.draft.json',
  network: SAP_NETWORK,
});

const payload = {
  generatedAt: new Date().toISOString(),
  status: 'no-sign-no-provider-live-gate-plan',
  bountyValidity: 'not live bounty proof; use this to request exact approval before a wallet/provider is connected',
  safety: {
    connectsWallet: false,
    signsWallet: false,
    sendsTransaction: false,
    spendsFunds: false,
    mutatesNetwork: false,
    storesSecretMaterial: false,
  },
  sdk: {
    ...SDK_INTERFACE_EVIDENCE,
    programAddress: SAP_PROGRAM_ADDRESS,
    inspectedFiles: [
      'dist/esm/modules/agent.d.ts',
      'dist/esm/instructions/agent.d.ts',
      'dist/esm/types/instructions.d.ts',
      'dist/esm/types/common.d.ts',
      'dist/esm/types/enums.d.ts',
      'dist/esm/constants/programs.d.ts',
    ],
  },
  network: SAP_NETWORK,
  candidateWallet: DEMO_PUBLIC_WALLET,
  liveInstructionShape: {
    highLevelCall: 'client.agent.register with registerAgentArgs',
    lowLevelInstruction: 'instructions.agent.registerAgent(ctx)',
    requiredAccountsFromDts: [
      'signer',
      'wallet',
      'agent',
      'agentStats',
      'globalRegistry',
    ],
    requiredArgsFromDts: [
      'name',
      'description',
      'capabilities',
      'pricing',
      'protocols',
      'agentId',
      'agentUri',
      'x402Endpoint',
    ],
    derivedPdasNeededBeforeSign: [
      'deriveAgent(wallet)',
      'deriveAgentStats(agent)',
      'deriveGlobalRegistry()',
    ],
  },
  registerAgentArgs: preview.registerAgentArgs,
  blockersBeforeWalletPreview: [
    ...preview.blockersBeforeLiveRegistration,
    'Confirm the candidate Solana wallet is the funded/controlled agent wallet for SAP registration.',
    'Estimate mainnet rent/fee after provider connection but before signing.',
    'Get explicit approval for wallet/provider connection and no-send transaction preview.',
    'Do not use this as bounty-valid proof until transaction signature and explorer/Synapse evidence are captured.',
  ],
  exactNextGateRequest: {
    action: 'Connect Solana provider for no-send SAP registration transaction simulation only',
    network: SAP_NETWORK,
    wallet: DEMO_PUBLIC_WALLET,
    programAddress: SAP_PROGRAM_ADDRESS,
    hardStops: [
      'stop before wallet signature',
      'stop before transaction send',
      'stop if rent/fee estimate exceeds approved cap',
      'stop if SDK args differ from proof/sap-live-gate.latest.json',
    ],
  },
};

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
console.log(`Wrote SAP live gate plan: ${outPath}`);
