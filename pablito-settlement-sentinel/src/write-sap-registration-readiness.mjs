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
const manifestPath = 'agent.manifest.draft.json';
const readinessPath = path.join(proofDir, 'sap-mainnet-registration-readiness.latest.json');
const approvalPath = path.join(proofDir, 'sap-mainnet-registration-approval.draft.md');
const explorerSnapshotPath = path.join(proofDir, 'synapse-explorer-snapshot.latest.json');

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function markdownList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

const manifest = readJsonIfPresent(path.join(root, manifestPath));
const preview = buildSapRegistrationPreview({
  manifestPath,
  network: SAP_NETWORK,
});
const explorerSnapshot = readJsonIfPresent(explorerSnapshotPath);
const manifestReady = preview.blockersBeforeLiveRegistration.length === 0;
const urls = [manifest?.agentUri, manifest?.x402Endpoint].filter(Boolean);

const readiness = {
  generatedAt: new Date().toISOString(),
  status: manifestReady
    ? 'ready-for-controlled-no-send-registration-preview'
    : 'blocked-until-public-metadata-is-fixed',
  bountyValidity: 'not live SAP proof; this is the final readiness and approval map before a real wallet/provider step',
  safety: {
    importsLiveSdk: false,
    connectsWallet: false,
    signsWallet: false,
    sendsTransaction: false,
    spendsFunds: false,
    mutatesNetwork: false,
    publishesPublicly: false,
    storesSecretMaterial: false,
  },
  selectedPath: {
    network: SAP_NETWORK,
    programAddress: SAP_PROGRAM_ADDRESS,
    candidateWallet: DEMO_PUBLIC_WALLET,
    manifestPath,
    publicUrls: urls,
    sdkPackage: SDK_INTERFACE_EVIDENCE.package,
    sdkVersion: SDK_INTERFACE_EVIDENCE.version,
  },
  currentEvidence: {
    manifestReady,
    manifestBlockers: preview.blockersBeforeLiveRegistration,
    noSignPreviewFile: 'proof/sap-registration.preview.latest.json',
    liveGateFile: 'proof/sap-live-gate.latest.json',
    beforeExplorerSnapshotFile: fs.existsSync(explorerSnapshotPath)
      ? 'proof/synapse-explorer-snapshot.latest.json'
      : null,
    beforeExplorerSnapshotPresent: Boolean(explorerSnapshot),
  },
  inspectedSdkSurface: {
    package: SDK_INTERFACE_EVIDENCE.package,
    version: SDK_INTERFACE_EVIDENCE.version,
    registrationSurfaces: [
      'SapClient constructor accepts rpcUrl, connection, wallet, and programId.',
      'Agent module exposes PDA derivation for agent and stats accounts.',
      'Agent module exposes an on-chain registration method that creates agent identity state.',
      'Low-level instruction builder exposes registerAgent with signer, wallet, agent PDA, stats PDA, and global registry accounts.',
      'SapClient exposes transaction build/send helpers; send helper remains outside this prep path.',
    ],
    inspectedFiles: [
      'dist/esm/client.d.ts',
      'dist/esm/modules/agent.d.ts',
      'dist/esm/instructions/agent.d.ts',
      'dist/esm/pda/index.d.ts',
      'dist/esm/registries/metaplex-bridge.d.ts',
    ],
  },
  approvalRequiredBeforeNextStep: {
    action: 'Connect the controlled Solana provider for a no-send SAP registration transaction preview only.',
    amount: 'No spend approved by this artifact. Fee/rent cap must be approved separately after estimate.',
    platformAccount: 'Solana mainnet agent wallet controlled for Pablito/OOBE bounty work.',
    expectedUpside: 'Creates the main missing proof lane: an SAP identity preview that can become registration evidence after approval.',
    downsideRisk: 'Wallet prompt, rent/fee spend, wrong network/program, or public metadata mistake if the live step is rushed.',
    hardStops: [
      'Stop before signature until the exact fee/rent estimate is visible.',
      'Stop before any transaction broadcast.',
      'Stop if network is not solana:mainnet-beta.',
      'Stop if the public metadata or x402 URLs differ from agent.manifest.draft.json.',
      'Stop if the fee/rent estimate exceeds the approved cap.',
      'Stop if any tool asks for seed material or a raw private key.',
    ],
  },
  evidenceToCaptureAfterApprovalOnly: [
    'Wallet public address used for registration.',
    'Agent PDA and stats PDA derived by the SDK/provider.',
    'Transaction preview or simulation output before signature.',
    'Fee/rent estimate and actual fee after any approved send.',
    'Transaction signature and explorer URL, only if an approved send happens.',
    'Post-registration Synapse Explorer/API snapshot proving discoverability.',
    'Redacted command log with no token, wallet secret, or runtime private path.',
  ],
  recommendedNextCommandsNoLiveAction: [
    'npm run proof:sap-preview',
    'npm run proof:sap-live-gate',
    'npm run proof:sap-registration-readiness',
    'npm run proof:synapse-snapshot',
  ],
  remainingBlockersForBountyProof: [
    'No SAP mainnet transaction signature yet.',
    'No post-registration Synapse Explorer/API proof yet.',
    'No approved fee/rent estimate yet.',
    'No single clean end-to-end autonomous run tied to this identity yet.',
  ],
};

const approvalMarkdown = `# SAP Mainnet Registration Approval Packet - Draft Only

**Status:** DRAFT ONLY. This file does not approve wallet connection, signing, transaction broadcast, fee/rent spend, public posting, public repo creation, or Superteam submission.

## Proposed next live-adjacent step

Connect the controlled Solana provider for a **no-send SAP registration transaction preview only**.

## Current readiness

- **Status:** ${readiness.status}
- **Network:** \`${SAP_NETWORK}\`
- **SAP program:** \`${SAP_PROGRAM_ADDRESS}\`
- **Candidate wallet:** \`${DEMO_PUBLIC_WALLET}\`
- **Manifest:** \`${manifestPath}\`
- **Public metadata URL:** \`${manifest?.agentUri || 'missing'}\`
- **Public x402 URL:** \`${manifest?.x402Endpoint || 'missing'}\`
- **Manifest blockers:** ${preview.blockersBeforeLiveRegistration.length ? '' : 'none detected by local preview'}
${preview.blockersBeforeLiveRegistration.length ? markdownList(preview.blockersBeforeLiveRegistration) : ''}

## Why this matters

The bounty still needs SAP mainnet identity evidence. The current repo has public-safe metadata, x402 drafts, Ace x402/payment artifacts, and Ace service proofs, but no SAP mainnet identity transaction or post-registration explorer proof.

## Approval needed before the next step

- Exact wallet/provider to use.
- Maximum fee/rent cap.
- Confirmation that the network is \`${SAP_NETWORK}\`.
- Confirmation that the metadata and x402 URLs above are the intended public URLs.
- Approval to stop at transaction preview/simulation first.

## Hard stops

${markdownList(readiness.approvalRequiredBeforeNextStep.hardStops)}

## Evidence to capture only after approval

${markdownList(readiness.evidenceToCaptureAfterApprovalOnly)}

## Approval phrase shape

\`\`\`text
YES SAP NO-SEND PREVIEW
Wallet:
Max fee/rent preview cap:
Network: solana:mainnet-beta
Stop before signing/sending: yes
\`\`\`
`;

fs.mkdirSync(proofDir, { recursive: true });
fs.writeFileSync(readinessPath, `${JSON.stringify(readiness, null, 2)}\n`, 'utf8');
fs.writeFileSync(approvalPath, approvalMarkdown, 'utf8');
console.log(`Wrote SAP registration readiness: ${readinessPath}`);
console.log(`Wrote SAP registration approval draft: ${approvalPath}`);
