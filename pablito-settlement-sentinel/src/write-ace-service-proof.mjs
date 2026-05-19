#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { runAceConnectorSuiteDryRun } from './ace-connector-suite.mjs';

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const publicDir = path.join(root, 'public');
const proofJsonPath = path.join(proofDir, 'ace-connector-suite.latest.json');
const proofMarkdownPath = path.join(proofDir, 'ace-connector-suite.md');
const publicMetadataPath = path.join(publicDir, 'ace-connector-suite.metadata.draft.json');

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function writeJson(filePath, value) {
  writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function markdownList(items) {
  return items.map((item) => `- ${item}`).join('\n');
}

const proof = runAceConnectorSuiteDryRun();

const publicSafeProof = {
  generatedAt: new Date().toISOString(),
  status: proof.status,
  warning:
    'This proves the connector suite architecture and package coverage only. It does not claim live Ace usage, live SAP registration, x402 settlement, public posting, or bounty submission.',
  suiteName: proof.suiteName,
  docsSources: proof.docsSources,
  catalogSummary: proof.catalogSummary,
  bountyFit: proof.bountyFit,
  safety: proof.safety,
  universalCryptoPaymentRouter: {
    manifest: proof.universalCryptoPaymentRouter.manifest,
    dryRunQuotes: proof.universalCryptoPaymentRouter.dryRunQuotes.map((quote) => ({
      status: quote.status,
      mode: quote.mode,
      serviceId: quote.serviceId,
      amountUsd: quote.amountUsd,
      userPaysWith: quote.userPaysWith,
      selectedRoute: quote.selectedRoute,
      alternatives: quote.alternatives,
      allCandidateCount: quote.allCandidateCount,
      platformFee: quote.platformFee,
      executionBoundary: quote.executionBoundary,
      feeDisclosureRule: quote.feeDisclosureRule,
    })),
  },
  dryRunCalls: proof.calls.map((call) => ({
    callId: call.callId,
    status: call.status,
    service: call.service,
    endpointModel: call.endpointModel,
    inputSummary: call.inputSummary,
    outputModel: call.outputModel,
    proofModel: call.proofModel,
    safety: call.safety,
  })),
  nextLiveGates: proof.nextLiveGates,
};

writeJson(proofJsonPath, publicSafeProof);

const markdown = `# Ace Data Cloud Connector Suite Proof

**Status:** ${proof.status}

This artifact proves that the repository now contains a reusable Ace Data Cloud connector suite and dry-run evidence path. It does **not** claim live Ace usage, SAP registration, settlement, public repo publication, X posting, or bounty submission.

## Coverage

- Total connectors modeled: ${proof.catalogSummary.totalConnectorsModeled}
- Bounty core services modeled: ${proof.catalogSummary.bountyCoreServiceIds.join(', ')}
- Distinct Ace services modeled for Ace-category shape: ${proof.bountyFit.aceCategoryDistinctServicesModeled}
- Dry-run Ace-category shape passes 3-service threshold: ${proof.bountyFit.aceCategoryRequirementMetInDryRunShape ? 'yes' : 'no'}
- Universal crypto payment router modeled: yes
- Router purpose: user can bring many crypto assets; connector quotes conversion into Ace-required settlement assets and picks the cheapest viable route before user signing.
- Platform fee modeled: 1% of service/payment amount, disclosed as its own line item.

## Families

${Object.entries(proof.catalogSummary.families).map(([family, serviceIds]) => `- ${family}: ${serviceIds.join(', ')}`).join('\n')}

## Dry-Run Calls

${proof.calls.map((call) => `### ${call.service.name}\n\n- Service id: \`${call.service.id}\`\n- Family: \`${call.service.family}\`\n- Status: ${call.status}\n- Endpoint model: \`${call.endpointModel.method} ${call.endpointModel.url}\`\n- Proof hash: \`${call.proofModel.proofHash}\`\n- Output kind: ${call.outputModel.kind}\n`).join('\n')}

## Live Gates

${proof.nextLiveGates.map((gate) => `- ${gate.id}: ${gate.gate} (${gate.approvalNeeded ? 'approval required' : 'no approval required'})`).join('\n')}

## Universal Crypto Payment Router

- Required settlement options modeled: ${proof.universalCryptoPaymentRouter.manifest.requiredSettlementOptions.map((item) => `${item.protocol}/${item.network}/${item.asset}`).join(', ')}
- Route classes modeled: ${proof.universalCryptoPaymentRouter.manifest.supportedRouteClasses.map((item) => item.id).join(', ')}
- Sample quotes modeled: ${proof.universalCryptoPaymentRouter.dryRunQuotes.length}
- Live rule: quote conversion, slippage, gas/network cost, platform fee, destination, expiry, and total debit before user signs.
- Custody rule: user signs or authorizes from their own wallet/exchange; the connector never asks for wallet signing secrets, recovery words, exchange passwords, raw cards, or bank credentials.

## Official Source Links Used

${markdownList(Object.values(proof.docsSources))}
`;

writeFile(proofMarkdownPath, markdown);

writeJson(publicMetadataPath, {
  name: proof.suiteName,
  status: 'draft-public-metadata-not-live-evidence',
  description: 'Reusable connector suite for Ace Data Cloud AI services with x402/SAP-ready proof capture.',
  connectorCount: proof.catalogSummary.totalConnectorsModeled,
  bountyCoreServiceIds: proof.catalogSummary.bountyCoreServiceIds,
  universalCryptoPaymentRouter: {
    status: 'dry-run-modeled-live-adapters-needed',
    purpose: proof.universalCryptoPaymentRouter.manifest.purpose,
    requiredSettlementOptions: proof.universalCryptoPaymentRouter.manifest.requiredSettlementOptions,
    supportedRouteClasses: proof.universalCryptoPaymentRouter.manifest.supportedRouteClasses.map((item) => item.id),
    liveAdaptersNeeded: proof.universalCryptoPaymentRouter.manifest.liveAdaptersNeeded,
  },
  safety: proof.safety,
  liveEvidenceStatus: {
    aceServiceUsage: 'missing',
    sapRegistration: 'missing',
    x402Settlement: 'missing',
  },
});

console.log(`Wrote Ace connector proof JSON: ${proofJsonPath}`);
console.log(`Wrote Ace connector proof markdown: ${proofMarkdownPath}`);
console.log(`Wrote public metadata draft: ${publicMetadataPath}`);
