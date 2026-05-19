#!/usr/bin/env node

import { pathToFileURL } from 'node:url';

const REQUIRED_SETTLEMENT_OPTIONS = [
  {
    id: 'ace-x402-base-usdc',
    protocol: 'x402',
    network: 'base',
    asset: 'USDC',
    tokenAddress: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    priority: 1,
    note: 'Hosted x402 settlement route: Base USDC payment envelope.',
  },
  {
    id: 'sap-solana-usdc',
    protocol: 'SAP',
    network: 'solana',
    asset: 'USDC',
    tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    priority: 2,
    note: 'SAP-compatible Solana USDC route when the target service accepts SAP settlement.',
  },
  {
    id: 'sap-solana-sol',
    protocol: 'SAP',
    network: 'solana',
    asset: 'SOL',
    tokenAddress: 'So11111111111111111111111111111111111111112',
    priority: 3,
    note: 'SAP-compatible SOL route when the target service accepts native SOL pricing.',
  },
];

const HOSTED_MARGIN_BPS = 100;
const HOSTED_MARGIN_FLOOR_USD = 0.05;

const ROUTE_TEMPLATES = [
  {
    id: 'native-settlement',
    kind: 'native',
    supports: ({ from, to }) => from.asset === to.asset && from.network === to.network,
    variableBps: 0,
    fixedUsd: 0,
    custodyRisk: 'none',
    speed: 'fastest',
    userAction: 'User signs the hosted service payment only.',
    steps: ['pay the required hosted-service settlement asset directly'],
  },
  {
    id: 'same-chain-dex-swap',
    kind: 'dex',
    supports: ({ from, to }) => from.network === to.network && from.asset !== to.asset && ['base', 'ethereum', 'solana'].includes(from.network),
    variableBps: 35,
    fixedUsd: 0.03,
    custodyRisk: 'none',
    speed: 'fast',
    userAction: 'User signs swap, then signs hosted service payment.',
    steps: ['quote same-chain DEX swap', 'swap into required asset', 'pay hosted service settlement'],
  },
  {
    id: 'solana-jupiter-then-bridge',
    kind: 'swap_bridge',
    supports: ({ from, to }) => from.network === 'solana' && to.network === 'base',
    variableBps: 95,
    fixedUsd: 0.15,
    custodyRisk: 'bridge',
    speed: 'medium',
    userAction: 'User signs Jupiter swap and bridge/payment transactions.',
    steps: ['quote Jupiter route to Solana USDC if needed', 'bridge USDC to Base', 'pay hosted x402 Base USDC'],
  },
  {
    id: 'base-dex-then-x402',
    kind: 'dex_x402',
    supports: ({ from, to }) => from.network === 'base' && to.network === 'base' && to.asset === 'USDC',
    variableBps: 25,
    fixedUsd: 0.02,
    custodyRisk: 'none',
    speed: 'fast',
    userAction: 'User signs Base swap and x402 payment.',
    steps: ['quote Base DEX route into USDC', 'pay hosted x402 Base USDC'],
  },
  {
    id: 'cex-convert-withdraw',
    kind: 'cex',
    supports: ({ from, to }) => ['btc', 'xrp', 'doge', 'ltc', 'ada', 'dot', 'avax'].includes(from.asset.toLowerCase()) || from.venue,
    variableBps: 120,
    fixedUsd: 0.50,
    custodyRisk: 'exchange',
    speed: 'slow',
    userAction: 'User confirms exchange conversion/withdrawal; agent never receives account password or wallet signing secret.',
    steps: ['quote Coinbase/Kraken conversion to required asset', 'withdraw to required network/address', 'pay hosted service settlement'],
  },
  {
    id: 'cross-chain-aggregator',
    kind: 'aggregator',
    supports: ({ from, to }) => from.network !== to.network && ['base', 'ethereum', 'arbitrum', 'optimism', 'polygon', 'solana'].includes(from.network),
    variableBps: 140,
    fixedUsd: 0.20,
    custodyRisk: 'bridge',
    speed: 'medium',
    userAction: 'User signs aggregator route and then hosted service payment.',
    steps: ['quote cross-chain aggregator', 'bridge/swap into required asset', 'pay hosted service settlement'],
  },
];

function normalizeAsset(asset) {
  return String(asset || '').trim().toUpperCase();
}

function normalizeNetwork(network) {
  return String(network || '').trim().toLowerCase();
}

function routeScore(route, amountUsd, settlementPriority) {
  const totalUsd = Number(route.fixedUsd || 0) + (Number(amountUsd || 0) * Number(route.variableBps || 0)) / 10000;
  const riskPenalty = route.custodyRisk === 'none' ? 0 : route.custodyRisk === 'bridge' ? 0.2 : 0.45;
  const speedPenalty = route.speed === 'fastest' ? 0 : route.speed === 'fast' ? 0.05 : route.speed === 'medium' ? 0.15 : 0.35;
  return totalUsd + riskPenalty + speedPenalty + settlementPriority * 0.01;
}

function hostedMarginEstimate(amountUsd) {
  const base = Number(amountUsd || 0);
  const marginUsd = HOSTED_MARGIN_FLOOR_USD + (base * HOSTED_MARGIN_BPS) / 10000;
  return {
    label: 'Wisely/Pablito hosted infrastructure margin',
    basisPoints: HOSTED_MARGIN_BPS,
    baseAmountUsd: Number(base.toFixed(6)),
    estimatedMarginUsd: Number(marginUsd.toFixed(6)),
    rule: 'Internal pricing estimate. Public quotes present an all-in service price plus route/network costs.',
    hideAsGas: false,
  };
}

export function buildUniversalCryptoAceQuote({
  fromAsset,
  fromNetwork,
  amountUsd = 1,
  serviceId = 'ace-service',
  userVenue = '',
  settlementOptions = REQUIRED_SETTLEMENT_OPTIONS,
} = {}) {
  const from = {
    asset: normalizeAsset(fromAsset),
    network: normalizeNetwork(fromNetwork),
    venue: String(userVenue || '').trim().toLowerCase(),
  };
  if (!from.asset) throw new Error('fromAsset_required');
  if (!from.network && !from.venue) throw new Error('fromNetwork_or_userVenue_required');

  const candidates = [];
  for (const to of settlementOptions) {
    const normalizedTo = { ...to, asset: normalizeAsset(to.asset), network: normalizeNetwork(to.network) };
    for (const template of ROUTE_TEMPLATES) {
      if (!template.supports({ from, to: normalizedTo })) continue;
      const estimatedCostUsd = Number(template.fixedUsd || 0) + (Number(amountUsd || 0) * Number(template.variableBps || 0)) / 10000;
      const hostedMargin = hostedMarginEstimate(amountUsd);
      candidates.push({
        id: `${template.id}__to__${normalizedTo.id}`,
        serviceId,
        from,
        to: normalizedTo,
        kind: template.kind,
        steps: template.steps,
        estimatedCostUsd: Number(estimatedCostUsd.toFixed(6)),
        estimatedHostedMarginUsd: hostedMargin.estimatedMarginUsd,
        estimatedTotalUserCostUsd: Number((Number(amountUsd || 0) + estimatedCostUsd + hostedMargin.estimatedMarginUsd).toFixed(6)),
        variableBps: template.variableBps,
        fixedUsd: template.fixedUsd,
        custodyRisk: template.custodyRisk,
        speed: template.speed,
        userAction: template.userAction,
        score: Number(routeScore(template, amountUsd, normalizedTo.priority || 99).toFixed(6)),
      });
    }
  }

  candidates.sort((a, b) => a.score - b.score);
  return {
    generatedAt: new Date().toISOString(),
    status: candidates.length ? 'quote-ready-user-signature-required' : 'blocked-no-route-template',
    mode: 'route-quote-no-spend-no-sign',
    serviceId,
    amountUsd: Number(amountUsd || 0),
    userPaysWith: from,
    requiredSettlementOptions: settlementOptions,
    selectedRoute: candidates[0] || null,
    alternatives: candidates.slice(1, 5),
    allCandidateCount: candidates.length,
    hostedMargin: hostedMarginEstimate(amountUsd),
    executionBoundary: {
      agentCustody: false,
      walletSigningSecretsHandled: false,
      exchangePasswordsHandled: false,
      userMustApproveQuote: true,
      userMustSignOrAuthorizeConversion: true,
      quoteMustExpire: true,
      suggestedQuoteTtlSeconds: 60,
    },
    pricingDisclosureRule: {
      customerFacing: 'all_in_service_price_plus_route_cost',
      neverDisguiseNetworkCost: true,
      includeTotalDebitBeforeSigning: true,
      doNotExposeInternalProviderCostFormula: true,
    },
  };
}

export function buildUniversalRouterManifest() {
  return {
    name: 'Wisely Universal Crypto AI Payment Router',
    version: '0.1.0',
    purpose: 'Let a user pay for hosted AI services with the crypto they already have by quoting conversion paths into the required settlement asset.',
    pricingPresentation: {
      publicRule: 'Show all-in service price, route/network estimate, and total debit. Keep provider-cost formulas and model routing internal.',
      internalMarginBasisPoints: HOSTED_MARGIN_BPS,
      internalMarginFloorUsd: HOSTED_MARGIN_FLOOR_USD,
    },
    requiredSettlementOptions: REQUIRED_SETTLEMENT_OPTIONS,
    supportedRouteClasses: ROUTE_TEMPLATES.map((route) => ({
      id: route.id,
      kind: route.kind,
      custodyRisk: route.custodyRisk,
      speed: route.speed,
      userAction: route.userAction,
      steps: route.steps,
    })),
    liveAdaptersNeeded: [
      'Payment-required parser to read exact required network/asset/amount',
      'DEX quotes: Jupiter for Solana, 0x/1inch/Uniswap or equivalent for EVM',
      'Bridge quotes: Socket/LiFi/Wormhole/official bridge adapter where available',
      'CEX quotes/withdraw estimate: Coinbase/Kraken only if user explicitly uses an exchange account',
      'Receipt writer: conversion quote, user approvals, tx ids, x402/SAP receipt',
    ],
    hardRules: [
      'No wallet signing secrets, recovery words, exchange passwords, raw cards, or bank credentials.',
      'No hidden protocol cost. Public customers must see service selected, payment asset/network, estimated route/network cost, and total debit before signing.',
      'Never present artificial circular volume as bounty-valid usage.',
      'Prefer non-custodial same-chain routes, then bridge routes, then exchange routes.',
      'Every live route must check balance, quote expiry, slippage, destination, and final hosted payment amount.',
    ],
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const quote = buildUniversalCryptoAceQuote({
    fromAsset: process.argv[2] || 'SOL',
    fromNetwork: process.argv[3] || 'solana',
    amountUsd: Number(process.argv[4] || 1.33),
    serviceId: 'demo-ace-service',
  });
  console.log(JSON.stringify(quote, null, 2));
}
