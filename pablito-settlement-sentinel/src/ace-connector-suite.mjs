import crypto from 'node:crypto';
import { ACE_DOC_SOURCES, getAceService, groupAceServicesByFamily, listAceServices, selectBountyCoreServices } from './ace-service-catalog.mjs';
import { buildUniversalCryptoAceQuote, buildUniversalRouterManifest } from './ace-universal-crypto-router.mjs';

function stableHash(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex').slice(0, 16);
}

function summarizeInput(input) {
  const text = JSON.stringify(input ?? {});
  return {
    inputHash: stableHash(input ?? {}),
    approximateBytes: Buffer.byteLength(text),
    topLevelKeys: input && typeof input === 'object' && !Array.isArray(input) ? Object.keys(input).sort() : [],
  };
}

function dryRunOutputFor(service, input) {
  const inputSummary = summarizeInput(input);
  const familyOutputs = {
    'ai-chat': {
      kind: 'text',
      summary: 'Modeled an AI response suitable for workflow diagnosis, reply drafting, or planning.',
      artifact: { title: 'workflow leak diagnosis', tokensEstimated: 420 },
    },
    embedding: {
      kind: 'vector',
      summary: 'Modeled a vectorization call for memory search, lead clustering, or semantic routing.',
      artifact: { dimensionsEstimated: 1536, vectorHash: `dryvec_${inputSummary.inputHash}` },
    },
    'ai-image': {
      kind: 'image',
      summary: 'Modeled image-generation output for public proof, offer graphics, or campaign assets.',
      artifact: { assetHash: `dryimg_${inputSummary.inputHash}`, resolution: '1024x1024' },
    },
    'ai-video': {
      kind: 'video',
      summary: 'Modeled video-generation output for demos, walkthroughs, or social proof clips.',
      artifact: { assetHash: `dryvid_${inputSummary.inputHash}`, durationSecondsEstimated: 5 },
    },
    'ai-audio': {
      kind: 'audio',
      summary: 'Modeled audio-generation output for demo reels or branded clips.',
      artifact: { assetHash: `dryaud_${inputSummary.inputHash}`, durationSecondsEstimated: 20 },
    },
    'web-data': {
      kind: 'data',
      summary: 'Modeled web/data output for market research, source discovery, or campaign link handling.',
      artifact: { resultCountEstimated: 5, sourceSetHash: `drydata_${inputSummary.inputHash}` },
    },
    captcha: {
      kind: 'restricted-data',
      summary: 'Modeled captcha recognition only for owned/authorized QA flows.',
      artifact: { decisionLengthEstimated: 6, safetyScope: 'owned-or-authorized-only' },
    },
    identity: {
      kind: 'restricted-data',
      summary: 'Modeled identity verification only for consented/private workflows.',
      artifact: { decision: 'dry-run-not-verified', privacyScope: 'no-public-personal-data' },
    },
    proxy: {
      kind: 'network-session',
      summary: 'Modeled proxy setup for permitted QA or regional availability testing.',
      artifact: { sessionId: `dryproxy_${inputSummary.inputHash}`, region: input?.country || 'unspecified' },
    },
  };
  return familyOutputs[service.family] ?? {
    kind: 'generic',
    summary: 'Modeled Ace service output.',
    artifact: { outputHash: `dry_${inputSummary.inputHash}` },
  };
}

export function buildAceConnectorCall({ serviceId, input = undefined, mode = 'dry-run', requestId = undefined } = {}) {
  const service = getAceService(serviceId);
  const selectedInput = input ?? service.typicalInput;
  const callId = requestId || `ace_${service.id}_${stableHash({ serviceId, selectedInput, mode })}`;

  if (mode !== 'dry-run') {
    return {
      callId,
      mode,
      service: {
        id: service.id,
        name: service.name,
        family: service.family,
        connectorPackage: service.connectorPackage,
      },
      status: 'blocked-live-mode-requires-explicit-service-token-cost-and-evidence-gate',
      endpoint: {
        method: service.method,
        url: `${service.apiBase}${service.endpointPath}`,
      },
      requiredEnv: [service.tokenEnv, 'ACE_CONNECTOR_LIVE_APPROVAL'],
      liveGate: {
        serviceSubscribed: false,
        tokenStoredOutsideRepo: true,
        costCapApproved: false,
        inputPrivacyReviewed: false,
        evidenceCapturePathApproved: false,
        x402SettlementIfOrderRequiresPayment: 'use src/ace-x402-pay-live.mjs after a separate approval packet',
      },
    };
  }

  const output = dryRunOutputFor(service, selectedInput);
  return {
    callId,
    mode: 'dry-run',
    status: 'modeled-no-network-no-spend',
    service: {
      id: service.id,
      name: service.name,
      family: service.family,
      connectorPackage: service.connectorPackage,
      docsUrl: service.docsUrl,
      serviceTokenScope: service.serviceTokenScope,
      tokenEnv: service.tokenEnv,
    },
    endpointModel: {
      method: service.method,
      url: `${service.apiBase}${service.endpointPath}`,
      authorization: 'Bearer token stored outside repo',
    },
    inputSummary: summarizeInput(selectedInput),
    outputModel: output,
    proofModel: {
      mocked: true,
      serviceId: service.id,
      family: service.family,
      proofFields: service.proofFields,
      proofHash: stableHash({ service: service.id, input: selectedInput, output }),
      liveEvidenceRequired: [
        'Ace request id or task id',
        'timestamp',
        'service id/name',
        'sanitized input hash',
        'sanitized output summary or asset hash',
        'cost/credit line if available',
        'x402/SAP receipt if this was paid through the bounty settlement route',
      ],
    },
    safety: {
      networkCall: false,
      spendsCredits: false,
      signsWallet: false,
      publishesPublicly: false,
      containsSecrets: false,
      inputPrivacyReviewed: true,
      restrictedUseNote: service.safetyNote || null,
    },
  };
}

export function runAceConnectorDryRun(serviceId, input = undefined) {
  return buildAceConnectorCall({ serviceId, input, mode: 'dry-run' });
}

export function runAceConnectorSuiteDryRun() {
  const selectedServices = selectBountyCoreServices();
  const calls = selectedServices.map((service) => runAceConnectorDryRun(service.id));
  const distinctServices = new Set(calls.map((call) => call.service.id));
  const distinctFamilies = new Set(calls.map((call) => call.service.family));

  return {
    generatedAt: new Date().toISOString(),
    status: 'connector-suite-dry-run-ready-live-usage-missing',
    suiteName: 'Ace Data Cloud x402 Connector Suite',
    docsSources: ACE_DOC_SOURCES,
    catalogSummary: {
      totalConnectorsModeled: listAceServices().length,
      families: groupAceServicesByFamily(),
      bountyCoreServiceIds: selectedServices.map((service) => service.id),
    },
    bountyFit: {
      aceCategoryDistinctServicesModeled: distinctServices.size,
      aceCategoryRequirementMetInDryRunShape: distinctServices.size >= 3,
      liveAceUsageStillRequired: true,
      sapSettlementStillRequired: true,
      notes: [
        'This suite models more than three distinct Ace services for architecture and package proof.',
        'Bounty-valid Ace volume still needs real service calls with evidence, not dry-run calls.',
        'Paid order settlement should use the separate x402/SAP approval gate and receipt capture.',
      ],
    },
    calls,
    universalCryptoPaymentRouter: {
      manifest: buildUniversalRouterManifest(),
      dryRunQuotes: [
        buildUniversalCryptoAceQuote({ fromAsset: 'USDC', fromNetwork: 'base', amountUsd: 1.33, serviceId: 'ace-demo-direct-usdc' }),
        buildUniversalCryptoAceQuote({ fromAsset: 'SOL', fromNetwork: 'solana', amountUsd: 1.33, serviceId: 'ace-demo-solana-user' }),
        buildUniversalCryptoAceQuote({ fromAsset: 'XRP', fromNetwork: 'xrp', userVenue: 'coinbase', amountUsd: 1.33, serviceId: 'ace-demo-xrp-user' }),
        buildUniversalCryptoAceQuote({ fromAsset: 'ETH', fromNetwork: 'base', amountUsd: 1.33, serviceId: 'ace-demo-base-eth-user' }),
      ],
    },
    safety: {
      spendsFunds: false,
      spendsAceCredits: false,
      signsWallet: false,
      createsAccount: false,
      networkMutation: false,
      artificialVolume: false,
    },
    nextLiveGates: buildAceLiveGateChecklist(),
  };
}

export function buildAceLiveGateChecklist() {
  return [
    {
      id: 'service_catalog_refresh',
      gate: 'Refresh platform services page and subscribed services list',
      evidence: 'Sanitized list of selected Ace services with service ids/names',
      approvalNeeded: false,
    },
    {
      id: 'service_tokens',
      gate: 'Install Ace service token or global token outside repo',
      evidence: 'Redacted token presence check only',
      approvalNeeded: true,
    },
    {
      id: 'three_service_usage',
      gate: 'Run at least three distinct Ace services with non-sensitive inputs',
      evidence: 'Request ids/task ids, timestamps, sanitized input hashes, sanitized output summaries',
      approvalNeeded: true,
    },
    {
      id: 'sap_registration',
      gate: 'Register or verify SAP mainnet agent identity',
      evidence: 'Explorer/API proof and public-safe agent metadata URL',
      approvalNeeded: true,
    },
    {
      id: 'x402_settlement',
      gate: 'Use x402/SAP settlement for a legitimate service/order',
      evidence: 'X-PAYMENT-RESPONSE or SAP escrow receipt plus order state',
      approvalNeeded: true,
    },
    {
      id: 'public_package',
      gate: 'Publish public package only after redaction scan',
      evidence: 'Repo/package URL, commit hash, no-secret scan result',
      approvalNeeded: true,
    },
  ];
}

export function buildAceSuitePackageManifest() {
  const services = listAceServices();
  return {
    name: 'ace-data-cloud-x402-connector-suite',
    version: '0.1.0',
    status: 'draft-package-live-gated',
    purpose: 'Let AI agents discover, call, prove, and optionally settle Ace Data Cloud service usage through x402/SAP-controlled payment rails.',
    serviceCount: services.length,
    families: groupAceServicesByFamily(),
    transparentFeePolicy: {
      available: true,
      label: 'Wisely/Pablito transparent platform fee',
      basisPoints: 100,
      rule: 'If this package or a derived connector moves crypto for a user/customer, quote the 1% Wisely platform fee as a separate line item before signing. Never hide it as gas, slippage, protocol cost, or wallet dust.',
      defaultBaseFeeRecipient: '0x122c67ad0DD3bA27bfCaCcCD9aFd9c3fd99216Fa',
      implementationHelper: 'mcp/transparent-fee-policy.mjs',
    },
    universalCryptoPaymentRouter: buildUniversalRouterManifest(),
    packages: services.map((service) => ({
      id: service.connectorPackage,
      serviceId: service.id,
      name: service.name,
      family: service.family,
      tokenEnv: service.tokenEnv,
      docsUrl: service.docsUrl,
    })),
    liveGateSummary: buildAceLiveGateChecklist(),
  };
}
