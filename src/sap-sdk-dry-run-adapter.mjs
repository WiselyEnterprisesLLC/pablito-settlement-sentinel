import crypto from 'node:crypto';

/**
 * Dry-run adapter shaped from @oobe-protocol-labs/synapse-sap-sdk v0.17.0.
 *
 * SDK surface inspected safely via `npm pack --ignore-scripts` / .d.ts only:
 * - createSapClient(rpcUrl, wallet?) -> SapClient
 * - agent lifecycle registration mutates chain; NEVER called here
 * - DiscoveryRegistry.findAgentsByCapability/findAgentsByProtocol models SAP discovery
 * - X402Registry.calculateCost is pure; preparePayment/settle mutate escrow and are not called
 * - x402 headers use X-Payment-Protocol, Escrow, Agent, Depositor, MaxCalls, PricePerCall, Program, Network
 *
 * This file intentionally does not import the SDK. It provides deterministic fixtures and
 * a safe interface contract so live code can later replace this adapter behind approval gates.
 */

export const SDK_INTERFACE_EVIDENCE = Object.freeze({
  package: '@oobe-protocol-labs/synapse-sap-sdk',
  version: '0.17.0',
  inspectedVia: 'npm view + npm pack --ignore-scripts + dist/esm/*.d.ts',
  mutatingSdkCallsNotUsed: [
    'SapClient.sendTransaction',
    'client.agent.register',
    'client.x402.preparePayment',
    'client.x402.settle',
    'client.escrowV2.create',
    'client.escrowV2.deposit',
  ],
});

export const DEMO_PUBLIC_WALLET = 'HE9MYDzoLAgnwbRXbiWRGGvoE2QE9LqKdQGJhNLPxtVj';
export const SAP_PROGRAM_ADDRESS = 'SAPpUhsWLJG1FfkGRcXagEDMrMsWGjbky7AyhGpFETZ';
export const SAP_PROGRAM_ID_PLACEHOLDER = 'SAP_PROGRAM_ID_FROM_SDK_CONSTANTS_NOT_QUERIED_IN_DRY_RUN';
export const SAP_NETWORK = 'solana:mainnet-beta';

const deterministicAddress = (prefix, seed) => {
  const digest = crypto.createHash('sha256').update(seed).digest('hex').slice(0, 32);
  return `${prefix}_${digest}`;
};

const sha256Hex = (value) => crypto.createHash('sha256').update(value).digest('hex');

function normalizeTokenType(tokenType) {
  const normalized = String(tokenType || 'sol').toLowerCase();
  if (normalized === 'usdc') return { usdc: {} };
  if (normalized === 'spl') return { spl: {} };
  return { sol: {} };
}

function normalizeSettlementMode(settlementMode) {
  const normalized = String(settlementMode || 'x402').toLowerCase();
  if (normalized === 'instant') return { instant: {} };
  if (normalized === 'escrow') return { escrow: {} };
  if (normalized === 'batched') return { batched: {} };
  return { x402: {} };
}

function defaultTokenDecimals(tokenType) {
  const normalized = String(tokenType || 'sol').toLowerCase();
  if (normalized === 'sol') return 9;
  if (normalized === 'usdc') return 6;
  return null;
}

export function buildRegisterAgentArgs(manifest) {
  return {
    name: manifest.name,
    description: manifest.description,
    capabilities: manifest.capabilities.map((capability) => ({
      id: capability.id,
      description: capability.description,
      protocolId: capability.protocolId,
      version: capability.version,
    })),
    pricing: manifest.pricing.map((tier) => ({
      tierId: tier.tierId,
      pricePerCall: String(tier.pricePerCall),
      minPricePerCall: null,
      maxPricePerCall: null,
      rateLimit: tier.rateLimit,
      maxCallsPerSession: tier.maxCallsPerSession ?? 100,
      burstLimit: tier.burstLimit ?? null,
      tokenType: normalizeTokenType(tier.tokenType),
      tokenMint: tier.tokenMint ?? null,
      tokenDecimals: tier.tokenDecimals ?? defaultTokenDecimals(tier.tokenType),
      settlementMode: normalizeSettlementMode(tier.settlementMode),
      minEscrowDeposit: tier.minEscrowDeposit ?? null,
      batchIntervalSec: tier.batchIntervalSec ?? null,
      volumeCurve: tier.volumeCurve ?? null,
    })),
    protocols: manifest.protocols,
    agentId: manifest.agentId,
    agentUri: manifest.agentUri,
    x402Endpoint: manifest.x402Endpoint,
  };
}

export function simulateSapDiscovery({ capabilityId, protocolId = 'SAP', manifest }) {
  const registerArgs = buildRegisterAgentArgs(manifest);
  const selected = registerArgs.capabilities.find((capability) => capability.id === capabilityId)
    ?? registerArgs.capabilities[0];

  return {
    sdkModel: 'DiscoveryRegistry.findAgentsByCapability + getAgentProfile (mocked)',
    liveEquivalent: `discovery.findAgentsByCapability(${JSON.stringify(capabilityId)})`,
    mocked: true,
    query: { capabilityId, protocolId },
    selectedAgent: {
      wallet: DEMO_PUBLIC_WALLET,
      agentPda: deterministicAddress('agentPda', `${DEMO_PUBLIC_WALLET}:${manifest.agentId}`),
      name: manifest.name,
      protocols: manifest.protocols,
      hasX402: Boolean(manifest.x402Endpoint),
      capability: selected,
      pricingTier: registerArgs.pricing[0],
      reputation: {
        source: 'fixture-only',
        totalCalls: 0,
        averageRating: null,
      },
    },
  };
}

export function calculateDryRunCost({ pricePerCall, calls }) {
  const totalCost = BigInt(pricePerCall) * BigInt(calls);
  return {
    sdkModel: 'X402Registry.calculateCost (pure equivalent, mocked locally)',
    mocked: true,
    calls,
    pricePerCall: String(pricePerCall),
    totalCost: totalCost.toString(),
    tokenSmallestUnit: 'lamports-for-SOL-placeholder',
  };
}

export function buildDryRunX402Headers({ requestId, discovery, calls = 1 }) {
  const pricePerCall = discovery.selectedAgent.pricingTier.pricePerCall;
  return {
    sdkModel: 'X402Registry.buildPaymentHeaders(PaymentContext)',
    mocked: true,
    headers: {
      'X-Payment-Protocol': 'SAP-x402',
      'X-Payment-Escrow': deterministicAddress('escrowPda', requestId),
      'X-Payment-Agent': discovery.selectedAgent.agentPda,
      'X-Payment-Depositor': deterministicAddress('depositor', `${requestId}:client`),
      'X-Payment-MaxCalls': String(calls),
      'X-Payment-PricePerCall': String(pricePerCall),
      'X-Payment-Program': SAP_PROGRAM_ID_PLACEHOLDER,
      'X-Payment-Network': SAP_NETWORK,
    },
  };
}

export function createDryRunSettlementProof({ request, discovery, aiResult, cost, x402 }) {
  const publicProof = {
    requestId: request.id,
    agentWallet: DEMO_PUBLIC_WALLET,
    agentPda: discovery.selectedAgent.agentPda,
    capabilityId: discovery.selectedAgent.capability.id,
    callsServed: cost.calls,
    amountDueSmallestUnit: cost.totalCost,
    paymentProtocol: x402.headers['X-Payment-Protocol'],
    settlementTxSignature: null,
    escrowPda: x402.headers['X-Payment-Escrow'],
    deliverableHash: sha256Hex(JSON.stringify({ requestId: request.id, result: aiResult.publicDeliverable })),
  };

  return {
    mode: 'dry-run-only',
    bountyValidity: 'not bounty-valid until replaced by real SAP registration, real service usage, and real settlement evidence',
    mockedComponents: [
      'SAP mainnet discovery result',
      'Ace Data Cloud AI service response',
      'x402 payment context/headers',
      'settlement transaction signature',
    ],
    liveComponentsRequired: [
      'Registered SAP mainnet agent profile',
      'Synapse Sentinel call if pursuing general category',
      'Three distinct Ace Data Cloud service calls if pursuing Ace category; cite archived live proof files when present',
      'Non-wash x402/Synapse settlement proof',
      'Public GitHub repo and X demo post after approval',
    ],
    publicProof,
  };
}
