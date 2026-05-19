#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { buildSapRegistrationPreview } from './live-sap-register-preview.mjs';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const manifestPath = 'agent.manifest.draft.json';
const rehearsalPath = path.join(proofDir, 'live-rehearsal.no-sign.latest.json');
const approvalPath = path.join(proofDir, 'live-execution-approval-packet.draft.md');
const aceServiceProofLatestPath = path.join(proofDir, 'ace-service-proof.latest.json');
const settlementBundlePath = path.join(proofDir, 'settlement-evidence-bundle.latest.json');

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function markdownList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

const sapPreview = buildSapRegistrationPreview({
  manifestPath,
  network: 'solana:mainnet-beta',
});
const aceServiceProofLatest = readJsonIfPresent(aceServiceProofLatestPath);
const settlementBundle = readJsonIfPresent(settlementBundlePath);
const aceServiceProofs = fs.existsSync(proofDir)
  ? fs.readdirSync(proofDir)
    .filter((name) => /^ace-service-proof\.[^.]+\.\d{8}T\d{9}Z\.json$/.test(name))
    .map((name) => readJsonIfPresent(path.join(proofDir, name)))
    .filter((proof) => proof?.ok === true)
  : [];
const aceDistinctServiceIds = [...new Set(aceServiceProofs.map((proof) => proof.serviceId).filter(Boolean))].sort();
const aceThreeServicesSatisfied = aceDistinctServiceIds.length >= 3;
const aceSettlementBundled = settlementBundle?.status === 'partial-live-ace-x402-evidence-bundled';
const aceServiceStatusLine = aceServiceProofLatest
  ? `latest Ace service proof attempt: ${aceServiceProofLatest.serviceId || 'unknown'} returned ${aceServiceProofLatest.httpStatus || aceServiceProofLatest.status || 'failed'}`
  : 'no Ace service proof attempt recorded yet';

writeJson(path.join(proofDir, 'sap-registration.preview.latest.json'), sapPreview);

const rehearsal = {
  generatedAt: new Date().toISOString(),
  status: 'no-sign-rehearsal-complete-live-proof-still-missing',
  summary: 'This artifact turns the live path into exact preview commands and approval gates. It does not create bounty-valid live evidence.',
  safety: {
    signsWallet: false,
    sendsTransaction: false,
    connectsWallet: false,
    spendsFunds: false,
    createsAccount: false,
    publishesPublicly: false,
    submitsBounty: false,
    mutatesNetwork: false,
  },
  chosenPathRecommendation: {
    primary: 'Ace Data Cloud category if three real Ace services can be used cheaply and safely',
    fallback: 'General SAP route with Synapse Sentinel if Ace service access is unclear',
    routeDefault: 'normal public Superteam route unless sponsor/platform confirms an agent/API route',
  },
  currentResearchNotes: [
    'AceDataCloud docs describe x402 payments through platform.acedata.cloud orders on Base mainnet USDC.',
    'Ace x402 flow needs a platform token, order id, HTTP 402 requirements, an X-PAYMENT signature, retry, and X-PAYMENT-RESPONSE receipt capture.',
    'This repo now has a no-spend Ace requirements preview script that can capture the first HTTP 402 requirements response when ACE_PLATFORM_TOKEN and ACE_X402_ORDER_ID are supplied through environment variables.',
    'Ace examples use exported EVM signing material; this repo must use a managed signer path instead of storing raw signing secrets.',
    'OOBE Synapse client SDK docs show AgentGateway, X402Paywall/X402BuyerClient, facilitator lookup, and Solana agent plugin tooling.',
  ],
  exactNoSignCommands: [
    'npm view @oobe-protocol-labs/synapse-sap-sdk version dist-tags --json',
    'mkdir -p /tmp/oobe-sap-sdk-inspection',
    'npm pack @oobe-protocol-labs/synapse-sap-sdk@0.17.0 --ignore-scripts --pack-destination /tmp/oobe-sap-sdk-inspection',
    'npm run proof:sap-preview',
    'npm run proof:live-rehearsal',
    'npm run proof:ace-x402-preview',
    'npm run verify:prep',
  ],
  evidencePathsCreated: [
    'proof/sap-registration.preview.latest.json',
    'proof/live-rehearsal.no-sign.latest.json',
    'proof/ace-x402-requirements.preview.latest.json',
    'proof/live-execution-approval-packet.draft.md',
  ],
  proofGates: [
    {
      id: 'sap_mainnet_identity',
      targetProof: 'SAP mainnet agent identity / registration evidence',
      currentState: 'registration arguments previewed only; no wallet/provider connected',
      previewCommand: 'npm run proof:sap-preview',
      approvalBeforeLive: 'Explicit approval for wallet provider, network, max SOL fee/rent, exact SDK command, and evidence capture path',
      currentBlockers: sapPreview.blockersBeforeLiveRegistration,
    },
    {
      id: 'ace_data_cloud_usage',
      targetProof: 'Three distinct Ace Data Cloud service calls if pursuing Ace category',
      currentState: aceThreeServicesSatisfied
        ? `captured ${aceDistinctServiceIds.length} distinct Ace service proofs: ${aceDistinctServiceIds.join(', ')}`
        : aceServiceProofLatest?.ok === true
        ? `captured service proof for ${aceServiceProofLatest.serviceId}`
        : `runner installed; ${aceServiceStatusLine}`,
      previewCommand: 'record official service names, allowed inputs, cost/credit rules, and proof format before live use',
      approvalBeforeLive: 'Explicit approval for account route, selected services, input data, cost cap, and proof capture',
      currentBlockers: aceThreeServicesSatisfied
        ? [
          'No additional Ace services needed for the exact three-service requirement unless sponsor asks for paid-order evidence per service.',
          'Need one clean end-to-end live run tying service usage to SAP/tool selection and payment evidence.',
        ]
        : [
          aceServiceProofLatest?.ok === true
            ? 'Need more distinct successful Ace services if pursuing Ace category'
            : 'Need Ace service-specific/global API token from acquired services; the previous no-store proof attempt reached Ace but was unauthorized',
          'Need service names and whether 3 distinct services are still required',
          'Need proof format accepted by reviewers',
          'Need Ace platform token/order id and API service token(s) kept out of repo',
          'Need managed Base USDC signer path; do not store raw EVM signing secrets',
          'No-spend preview command exists: npm run proof:ace-x402-preview',
        ],
    },
    {
      id: 'synapse_sentinel_usage',
      targetProof: 'Synapse Sentinel usage if pursuing general category',
      currentState: 'not used live; still a route/service confirmation item',
      previewCommand: 'document official Sentinel call route and evidence output before live use',
      approvalBeforeLive: 'Explicit approval for service call, input data, cost cap, and proof capture',
      currentBlockers: [
        'Need official Sentinel endpoint/UI path',
        'Need accepted proof format',
      ],
    },
    {
      id: 'x402_sap_settlement',
      targetProof: 'Real non-wash x402/SAP settlement proof',
      currentState: aceSettlementBundled
        ? 'Ace x402 facilitator payment artifact is bundled; full SAP/on-chain escrow settlement remains unproven'
        : 'headers/costs modeled locally; no escrow/facilitator/payment call performed',
      previewCommand: 'derive quote/prepare/settle route from pinned SDK or facilitator docs, then stop before payment',
      approvalBeforeLive: 'Explicit approval for payer/payee, asset, amount, route, max loss, and non-wash rationale',
      currentBlockers: [
        'Need deployed real service/resource endpoint',
        'Need payer/payee addresses and cost cap',
        'Need facilitator/escrow route that does not create circular artificial volume',
        'Ace x402 route appears to use Base USDC order payment and X-PAYMENT-RESPONSE receipt capture',
        'First safe live-prep checkpoint is proof/ace-x402-requirements.preview.latest.json from the initial 402 response',
      ],
    },
  ],
  stillNotDone: [
    'No SAP mainnet registration transaction',
    ...(aceThreeServicesSatisfied ? [] : ['No complete three-service Ace usage proof']),
    'No Synapse Sentinel service usage',
    ...(aceSettlementBundled ? ['No full SAP/on-chain escrow settlement proof'] : ['No real x402/SAP settlement']),
    'No single clean end-to-end live autonomous run tying trigger, SAP/tool selection, service execution, payment, and deliverable together',
    'No public repo',
    'No X walkthrough post',
    'No Superteam final submission',
  ],
};

writeJson(rehearsalPath, rehearsal);

const approvalMarkdown = `# Live Execution Approval Packet - Draft Only

**Status:** DRAFT ONLY. This packet is a concrete no-sign rehearsal output, not approval to sign, spend, publish, post, submit, or claim the bounty.

## Current recommendation

- **Primary path:** Ace Data Cloud category, if three real Ace services can be used cheaply and safely.
- **Fallback path:** General SAP route with Synapse Sentinel if Ace service access is unclear.
- **Submission route default:** normal public Superteam route unless sponsor/platform confirms an agent/API route.
- **Current decision:** WAIT / NO-GO for final submission.

## Exact preview commands now available

\`\`\`bash
npm view @oobe-protocol-labs/synapse-sap-sdk version dist-tags --json
mkdir -p /tmp/oobe-sap-sdk-inspection
npm pack @oobe-protocol-labs/synapse-sap-sdk@0.17.0 --ignore-scripts --pack-destination /tmp/oobe-sap-sdk-inspection
npm run proof:sap-preview
npm run proof:live-rehearsal
npm run proof:ace-x402-preview
npm run verify:prep
\`\`\`

## Evidence paths from this no-sign pass

${markdownList(rehearsal.evidencePathsCreated)}

## SAP mainnet identity / registration gate

- **Status now:** registration arguments previewed only.
- **Preview command:** \`npm run proof:sap-preview\`
- **Network:** \`solana:mainnet-beta\`
- **Manifest:** \`${manifestPath}\`
- **Live SDK call shape:** \`SapClient.from(provider)\` then \`client.agent.register\` with the previewed \`registerAgentArgs\`
- **Current blockers before live registration:**
${markdownList(sapPreview.blockersBeforeLiveRegistration.length ? sapPreview.blockersBeforeLiveRegistration : ['none detected by preview'])}

Approval still required before wallet/provider connection, SDK live preview, signing, rent/fee spend, or transaction send.

## Ace Data Cloud usage gate

- **Status now:** ${aceThreeServicesSatisfied ? `captured ${aceDistinctServiceIds.length} distinct Ace services: ${aceDistinctServiceIds.join(', ')}` : aceServiceStatusLine}.
- **Needed for Ace category:** three distinct real Ace services; ${aceThreeServicesSatisfied ? 'this is already satisfied in the proof archives.' : 'this is not fully satisfied yet.'}
- **Current researched route:** Ace x402 docs use \`https://platform.acedata.cloud\`, a platform token, an order id, Base mainnet USDC, HTTP 402 payment requirements, and \`X-PAYMENT-RESPONSE\` receipt capture.
- **Credential note:** Ace docs say API tokens are bound to specific acquired services or a global credential. A Platform Token/order token can prove x402 order state but may not authorize service endpoints.
- **No-spend preview command:** \`npm run proof:ace-x402-preview\`
- **No-spend preview output:** \`proof/ace-x402-requirements.preview.latest.json\`
- **Signer caveat:** docs show raw EVM signing-material examples; this project should use a managed signer path instead and must not store raw signing secrets.
- **Before live use:** confirm service names, account/project route, allowed input data, proof format, cost/credit rules, and privacy note.
- **Approval needed:** account route, exact service calls, max cost, and evidence capture path.

## Synapse Sentinel usage gate

- **Status now:** no Synapse Sentinel service called.
- **Needed for general route:** one legitimate Sentinel usage proof, if this is the selected category path.
- **Before live use:** confirm official endpoint/UI path, accepted proof format, input privacy, and cost.
- **Approval needed:** exact service call, max cost, and evidence capture path.

## x402 / SAP settlement gate

- **Status now:** local x402 cost/header model only; no escrow, facilitator, payment, or transaction.
- **Best researched path:** Ace order payment through x402 on Base USDC, if a managed signer can create the required \`X-PAYMENT\` header and the cost is explicitly approved.
- **Before live settlement:** deploy/identify a real service resource, select payer/payee, asset, amount, facilitator/escrow route, and non-wash rationale.
- **Approval needed:** exact amount, addresses, route, cost cap, and hard stop conditions.

## Hard no-go checks

- No raw secrets, seed material, wallet files, API tokens, or private runtime paths in public artifacts.
- No artificial/wash volume or circular self-payment presented as real market activity.
- No claim that the bounty is complete until live SAP/Ace/Sentinel/settlement evidence exists.
- No public repo, X post, or Superteam submission without final reviewed copy and explicit approval.

## Final approval prompt shape

\`\`\`text
Approval request: OOBE x Ace live gate

Action:
Platform/accounts:
Wallet/network:
Max total cost:
Exact commands/steps:
Expected upside:
Downside/risk:
Hard stops:
Public artifacts to be created:

Reply YES OOBE LIVE GATE to approve, or NO to stop.
\`\`\`
`;

fs.writeFileSync(approvalPath, approvalMarkdown, 'utf8');
console.log(`Wrote SAP preview: ${path.join(proofDir, 'sap-registration.preview.latest.json')}`);
console.log(`Wrote live rehearsal: ${rehearsalPath}`);
console.log(`Wrote approval packet: ${approvalPath}`);
