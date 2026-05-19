#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { buildRegisterAgentArgs, SDK_INTERFACE_EVIDENCE, SAP_NETWORK } from './sap-sdk-dry-run-adapter.mjs';

const root = path.resolve(import.meta.dirname, '..');

function parseArgs(argv) {
  const args = {
    manifest: 'agent.manifest.draft.json',
    network: SAP_NETWORK,
    out: 'proof/sap-registration.preview.latest.json',
    noSign: false,
    noSend: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--manifest') args.manifest = argv[++index];
    else if (value === '--network') args.network = argv[++index];
    else if (value === '--out') args.out = argv[++index];
    else if (value === '--no-sign') args.noSign = true;
    else if (value === '--no-send') args.noSend = true;
    else {
      throw new Error(`Unknown argument: ${value}`);
    }
  }

  return args;
}

function isPlaceholder(value) {
  return typeof value === 'string' && (
    value.includes('example.invalid')
    || value.includes('[pending')
    || value.includes('PLACEHOLDER')
  );
}

function validateManifest(manifest) {
  const blockers = [];

  if (!manifest.name) blockers.push('manifest.name is missing');
  if (!manifest.agentId) blockers.push('manifest.agentId is missing');
  if (!manifest.agentUri || isPlaceholder(manifest.agentUri)) {
    blockers.push('manifest.agentUri must be a deployed public metadata URL before live registration');
  }
  if (!manifest.x402Endpoint || isPlaceholder(manifest.x402Endpoint)) {
    blockers.push('manifest.x402Endpoint must be a deployed public x402 resource URL before live settlement proof');
  }
  if (!Array.isArray(manifest.capabilities) || manifest.capabilities.length === 0) {
    blockers.push('manifest.capabilities must include at least one capability');
  }
  if (!Array.isArray(manifest.pricing) || manifest.pricing.length === 0) {
    blockers.push('manifest.pricing must include at least one pricing tier');
  }

  return blockers;
}

export function buildSapRegistrationPreview({ manifestPath, network }) {
  const absoluteManifestPath = path.resolve(root, manifestPath);
  const manifest = JSON.parse(fs.readFileSync(absoluteManifestPath, 'utf8'));
  const registerAgentArgs = buildRegisterAgentArgs(manifest);
  const blockers = validateManifest(manifest);

  return {
    generatedAt: new Date().toISOString(),
    status: 'preview-only-no-sign-no-send',
    bountyValidity: 'not live bounty proof; this is only an argument and gate preview',
    safety: {
      signsWallet: false,
      sendsTransaction: false,
      connectsWallet: false,
      spendsFunds: false,
      mutatesNetwork: false,
      importsLiveSdk: false,
    },
    sdkInterfaceEvidence: SDK_INTERFACE_EVIDENCE,
    network,
    manifestPath,
    liveSdkCallShape: [
      'SapClient.from(provider)',
      'client.agent.register with registerAgentArgs',
    ],
    registerAgentArgs,
    blockersBeforeLiveRegistration: blockers,
    exactPreviewCommand: 'npm run proof:sap-preview',
    nextApprovalNeeded: {
      action: 'Install/use pinned SDK in isolated workspace and request wallet transaction preview only',
      approvalReason: 'Any real provider/wallet connection or transaction build may expose signer prompts or fees',
      hardStop: 'Stop before signing or sending. No public claim from this preview.',
    },
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const args = parseArgs(process.argv.slice(2));

  if (!args.noSign || !args.noSend) {
    throw new Error('Refusing to run without both --no-sign and --no-send.');
  }

  const preview = buildSapRegistrationPreview({
    manifestPath: args.manifest,
    network: args.network,
  });

  const outPath = path.resolve(root, args.out);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(preview, null, 2)}\n`, 'utf8');
  console.log(`Wrote SAP registration preview: ${outPath}`);
}
