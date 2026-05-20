#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildAceSuitePackageManifest, runAceConnectorDryRun } from './ace-connector-suite.mjs';
import { ACE_DOC_SOURCES, listAceServices } from './ace-service-catalog.mjs';

const root = path.resolve(import.meta.dirname, '..');
const packagesRoot = path.join(root, 'packages');
const suiteDir = path.join(packagesRoot, 'ace-data-connector-suite');
const connectorsDir = path.join(packagesRoot, 'ace-data-connectors');

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function writeJson(filePath, value) {
  writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function yamlSafe(text) {
  return String(text).replace(/"/g, '\\"');
}

function connectorSkill(service) {
  return `---
name: ${service.connectorPackage}
description: "Use when an agent needs to call or package the Ace Data Cloud ${yamlSafe(service.name)} service with crypto/x402/SAP-ready proof capture. Covers dry-run modeling, token/env routing, sanitized evidence fields, and live approval gates for this specific Ace service."
---

# ${service.name}

Use this connector to route ${service.family} work through Ace Data Cloud while preserving proof and safety boundaries.

## Inputs

- Service id: \`${service.id}\`
- Token env: \`${service.tokenEnv}\` or a global Ace credential outside the repo
- Endpoint model: \`${service.method} ${service.apiBase}${service.endpointPath}\`
- Docs: ${service.docsUrl}

## Workflow

1. Confirm the service is acquired/subscribed in Ace Data Cloud.
2. Keep tokens in environment or the OpenClaw secret store; never write them into artifacts.
3. Start in dry-run with \`npm run proof:ace-connectors\`.
4. For live usage, record request id/task id, timestamp, sanitized input hash, sanitized output summary or asset hash, and cost/credit line.
5. If the user wants to pay with crypto that Ace does not directly settle, run the Universal Crypto Payment Router quote first.
6. If the service/order is paid through x402/SAP, attach the x402/SAP receipt from the approved live settlement path.
7. If the connector moves crypto for a user/customer, show the service selected, payment asset/network, route/network estimate when applicable, and total debit before signing. Do not expose internal provider cost, model routing, or Wisely margin formulas as public line items.
8. Write compact state for future agent decisions; write raw output only into private artifacts when needed.

## Evidence Fields

${service.proofFields.map((field) => `- \`${field}\``).join('\n')}

## Good Uses

${service.useCases.map((item) => `- ${item}`).join('\n')}

${service.safetyNote ? `## Safety Note\n\n${service.safetyNote}\n` : ''}
${service.hostedInvokeAllowed === false ? `## Hosted Route Status\n\nThe hosted Wisely route currently lists this connector for discovery/BYO-token mode only: ${service.hostedBlocker}\n\n` : ''}
## Live Gate

Do not run a paid/live call until service token, cost cap, input privacy, and evidence path are approved. For bounty work, at least three distinct Ace services need real evidence before claiming Ace-category live usage.
`;
}

function suiteSkill(manifest) {
  return `---
name: ace-data-connector-suite
description: "Use when an agent needs the full Ace Data Cloud AI connector suite: discover available Ace service packages, choose 3+ services for the OOBE/Ace bounty, run dry-run proof, prepare live service calls, and attach x402/SAP payment evidence."
---

# Ace Data Cloud x402 Connector Suite

Use this suite to connect agent workflows to Ace Data Cloud services with proof capture and crypto-payment readiness.

## Core Flow

1. Pick the smallest service set that proves the job: usually chat/text, web-data, and media.
2. Run \`npm run packages:ace-connectors\` to refresh generated packages.
3. Run \`npm run proof:ace-connectors\` for the dry-run proof artifact.
4. For live bounty evidence, use at least three distinct Ace services with non-sensitive inputs.
5. If a user/customer pays with a non-required crypto asset, quote conversion into the cheapest viable Ace settlement asset first.
6. Attach x402/SAP settlement proof only from the approved settlement script and receipt artifact.
7. Summarize lessons into compact state; keep raw service outputs private unless public release is approved.

## Package Families

${Object.entries(manifest.families).map(([family, serviceIds]) => `- ${family}: ${serviceIds.join(', ')}`).join('\n')}

## References

- Catalog: \`references/catalog.json\`
- Live gates: \`references/live-gates.md\`
- Official docs:
${Object.entries(ACE_DOC_SOURCES).map(([name, url]) => `  - ${name}: ${url}`).join('\n')}
`;
}

function liveGatesMarkdown(manifest) {
  return `# Ace Connector Live Gates

Status: package instructions only. This file does not authorize live spending, signing, publishing, or bounty submission.

${manifest.liveGateSummary.map((gate) => `## ${gate.id}\n\n- Gate: ${gate.gate}\n- Evidence: ${gate.evidence}\n- Approval needed: ${gate.approvalNeeded ? 'yes' : 'no'}\n`).join('\n')}

## Bounty Proof Rule

The Ace category needs real activity, not dry-run output. Capture at least three distinct Ace service calls, then attach SAP/x402 proof from the approved settlement route.
`;
}

function marketplaceOffer(manifest) {
  return `# Ace Data Cloud x402 Connector Suite - Draft Offer

## Positioning

A connector pack for AI agents that need to buy, use, and prove Ace Data Cloud services with crypto-payment-ready evidence. It is built for agentic commerce builders who want service calls, artifacts, and settlement receipts to line up cleanly.

## What It Includes

- ${manifest.serviceCount} modeled Ace service connectors across chat, embeddings, image, video, audio, web/data, identity, captcha, and proxy families.
- Dry-run proof generator for bounty/reviewer packets.
- Per-service skill packages with token env names, endpoint shape, evidence fields, and live gates.
- x402/SAP settlement readiness notes that pair with the guarded live payment path.
- Customer-safe pricing policy for any derived crypto-moving connector: disclose selected service, payment asset/network, route/network estimate when applicable, and total debit before signing. Keep provider cost, routing, and margin formulas internal.
- Universal Crypto Payment Router for quote/direct/swap/bridge/exchange route planning so users can pay with the crypto they already hold while Ace receives its required settlement asset.

## Buyer

- Agent builders.
- Bounty builders.
- Teams experimenting with machine-paid API calls.
- Developers who need proof artifacts rather than loose API scripts.

## Suggested Pricing

- Starter package: $49
- Assisted setup: $299
- Custom connector/service proof buildout: quoted after scoping

## Limits

This package does not include Ace service credits, account credentials, wallet funds, or guaranteed bounty placement. Live calls and settlement require the buyer's own accounts, tokens, and approval.

The Universal Crypto Payment Router is a quote/route layer until live adapters are connected. It must not custody user funds or ask for private keys. User wallets or explicitly authorized exchange accounts sign/approve the conversion and payment.
`;
}

export function writeAceConnectorPackages() {
  const services = listAceServices();
  const manifest = buildAceSuitePackageManifest();

  writeJson(path.join(suiteDir, 'references', 'catalog.json'), {
    generatedAt: new Date().toISOString(),
    docsSources: ACE_DOC_SOURCES,
    services,
  });
  writeJson(path.join(suiteDir, 'package-manifest.json'), manifest);
  writeFile(path.join(suiteDir, 'SKILL.md'), suiteSkill(manifest));
  writeFile(path.join(suiteDir, 'references', 'live-gates.md'), liveGatesMarkdown(manifest));
  writeFile(path.join(suiteDir, 'MARKETPLACE_OFFER.md'), marketplaceOffer(manifest));
  writeFile(path.join(suiteDir, 'scripts', 'ace-suite-smoke.mjs'), `#!/usr/bin/env node
import { runAceConnectorSuiteDryRun } from '../../../src/ace-connector-suite.mjs';
const proof = runAceConnectorSuiteDryRun();
console.log(JSON.stringify({
  ok: proof.bountyFit.aceCategoryRequirementMetInDryRunShape,
  distinctServices: proof.bountyFit.aceCategoryDistinctServicesModeled,
  totalConnectorsModeled: proof.catalogSummary.totalConnectorsModeled,
  status: proof.status,
}, null, 2));
`);

  for (const service of services) {
    const dir = path.join(connectorsDir, service.connectorPackage);
    writeFile(path.join(dir, 'SKILL.md'), connectorSkill(service));
    writeJson(path.join(dir, 'dry-run-example.json'), runAceConnectorDryRun(service.id));
  }

  return {
    generatedAt: new Date().toISOString(),
    suiteDir,
    connectorsDir,
    serviceCount: services.length,
    packageCount: services.length + 1,
    suiteManifest: path.join(suiteDir, 'package-manifest.json'),
    marketplaceOffer: path.join(suiteDir, 'MARKETPLACE_OFFER.md'),
  };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = writeAceConnectorPackages();
  console.log(JSON.stringify(result, null, 2));
}
