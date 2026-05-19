#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
import { CdpClient } from '@coinbase/cdp-sdk';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';
import BN from 'bn.js';
import { buildRegisterAgentArgs, SAP_NETWORK, SAP_PROGRAM_ADDRESS } from './sap-sdk-dry-run-adapter.mjs';

const require = createRequire(import.meta.url);
const { SapClient, Pdas } = require('@oobe-protocol-labs/synapse-sap-sdk');

const root = path.resolve(import.meta.dirname, '..');
const proofDir = path.join(root, 'proof');
const latestPath = path.join(proofDir, 'sap-registration.live.latest.json');
const approvalId = process.env.SAP_REGISTER_APPROVAL_ID || 'appr_20260519_sap_identity_registration';
const defaultRpc = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';

function resolveOpenClawRoot() {
  const candidates = [
    process.env.OPENCLAW_CONFIG_DIR,
    process.env.OPENCLAW_STATE_DIR,
    process.env.OPENCLAW_HOME,
    process.env.OPENCLAW_HOME?.endsWith('.openclaw') ? process.env.OPENCLAW_HOME : process.env.OPENCLAW_HOME ? path.join(process.env.OPENCLAW_HOME, '.openclaw') : '',
    path.join(os.homedir(), '.openclaw'),
    '/opt/openclaw/config',
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate)) || candidates[0] || path.join(os.homedir(), '.openclaw');
}

const openClawRoot = resolveOpenClawRoot();
const envPath = path.join(openClawRoot, 'revenue-agent.env');

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function archive(payload) {
  const stamp = payload.generatedAt.replace(/[-:.]/g, '').replace(/Z$/, 'Z');
  const archivePath = path.join(proofDir, `sap-registration.live.${stamp}.json`);
  writeJson(archivePath, payload);
  return archivePath;
}

function readEnvFile() {
  const env = {};
  if (!fs.existsSync(envPath)) return env;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index < 0) continue;
    env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim().replace(/^["']|["']$/g, '');
  }
  return env;
}

function normalizePem(value) {
  const text = String(value || '').trim().replace(/\\n/g, '\n');
  if (!text.startsWith('-----BEGIN EC PRIVATE KEY-----')) return text;
  return crypto.createPrivateKey(text).export({ type: 'pkcs8', format: 'pem' }).toString();
}

function cdpConfig() {
  const env = readEnvFile();
  return {
    apiKeyId: env.CDP_API_KEY_ID || env.COINBASE_CDP_API_KEY_ID || env.COINBASE_CDP_API_KEY || '',
    apiKeySecret: env.CDP_API_KEY_SECRET || env.COINBASE_CDP_API_KEY_SECRET || env.COINBASE_CDP_API_SECRET || '',
    walletSecret: env.CDP_WALLET_SECRET || env.COINBASE_CDP_WALLET_SECRET || '',
    solanaAccountName: env.CDP_SOLANA_ACCOUNT_NAME || env.COINBASE_CDP_SOLANA_ACCOUNT_NAME || 'wisely-openclaw-agent-solana',
    expectedSolanaAddress: env.COINBASE_CDP_SOLANA_ACCOUNT_ADDRESS || env.AGENT_SOLANA_WALLET_PUBLIC_ADDRESS || '',
  };
}

function normalizeSapArgs(draft) {
  return {
    name: draft.name,
    description: draft.description,
    capabilities: draft.capabilities.map((capability) => ({
      id: capability.id,
      description: capability.description ?? null,
      protocolId: capability.protocolId ?? null,
      version: capability.version ?? null,
    })),
    pricing: draft.pricing.map((tier) => ({
      tierId: tier.tierId,
      pricePerCall: new BN(String(tier.pricePerCall)),
      minPricePerCall: tier.minPricePerCall == null ? null : new BN(String(tier.minPricePerCall)),
      maxPricePerCall: tier.maxPricePerCall == null ? null : new BN(String(tier.maxPricePerCall)),
      rateLimit: tier.rateLimit,
      maxCallsPerSession: tier.maxCallsPerSession ?? 100,
      burstLimit: tier.burstLimit ?? null,
      tokenType: tier.tokenType?.usdc ? { usdc: {} } : tier.tokenType?.spl ? { spl: {} } : { sol: {} },
      tokenMint: tier.tokenMint ? new PublicKey(tier.tokenMint) : null,
      tokenDecimals: tier.tokenDecimals ?? (tier.tokenType?.sol ? 9 : tier.tokenType?.usdc ? 6 : null),
      settlementMode: tier.settlementMode?.instant ? { instant: {} }
        : tier.settlementMode?.escrow ? { escrow: {} }
          : tier.settlementMode?.batched ? { batched: {} }
            : { x402: {} },
      minEscrowDeposit: tier.minEscrowDeposit == null ? null : new BN(String(tier.minEscrowDeposit)),
      batchIntervalSec: tier.batchIntervalSec ?? null,
      volumeCurve: tier.volumeCurve ?? null,
    })),
    protocols: draft.protocols,
    agentId: draft.agentId ?? null,
    agentUri: draft.agentUri ?? null,
    x402Endpoint: draft.x402Endpoint ?? null,
  };
}

function publicError(error) {
  return {
    message: error?.message || String(error),
    name: error?.name || null,
    code: error?.code || null,
    logs: Array.isArray(error?.logs) ? error.logs.slice(-20) : undefined,
  };
}

async function accountInfoSummary(connection, address) {
  const info = await connection.getAccountInfo(new PublicKey(address), 'confirmed');
  return info ? {
    exists: true,
    owner: info.owner.toBase58(),
    lamports: info.lamports,
    dataLength: info.data.length,
    executable: info.executable,
  } : { exists: false };
}

async function main() {
  const execute = String(process.env.SAP_REGISTER_EXECUTE || '').toLowerCase() === 'true';
  const approvalMatches = process.env.SAP_REGISTER_LIVE_APPROVAL === approvalId;
  const maxLamports = BigInt(process.env.SAP_REGISTER_MAX_LAMPORTS || '20000000');
  const generatedAt = new Date().toISOString();
  const cfg = cdpConfig();
  const missing = [
    cfg.apiKeyId ? null : 'CDP_API_KEY_ID or COINBASE_CDP_API_KEY_ID',
    cfg.apiKeySecret ? null : 'CDP_API_KEY_SECRET or COINBASE_CDP_API_SECRET',
    cfg.walletSecret ? null : 'CDP_WALLET_SECRET or COINBASE_CDP_WALLET_SECRET',
  ].filter(Boolean);
  if (missing.length) {
    const payload = { generatedAt, ok: false, status: 'blocked-missing-cdp-env', missing };
    writeJson(latestPath, payload);
    archive(payload);
    console.log(`Wrote SAP registration blocker: ${latestPath}`);
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'agent.manifest.draft.json'), 'utf8'));
  const draftArgs = buildRegisterAgentArgs(manifest);
  const registerArgs = normalizeSapArgs(draftArgs);
  const cdp = new CdpClient({
    apiKeyId: cfg.apiKeyId.trim(),
    apiKeySecret: normalizePem(cfg.apiKeySecret),
    walletSecret: cfg.walletSecret.trim(),
  });
  const account = await cdp.solana.getOrCreateAccount({ name: cfg.solanaAccountName });
  const walletPublicKey = new PublicKey(account.address);
  const sap = new SapClient({ rpcUrl: defaultRpc, commitment: 'confirmed' });
  const connection = sap.connection;
  const [agentPda, agentBump] = Pdas.getAgentPDA(walletPublicKey);
  const [agentStatsPda, statsBump] = Pdas.getAgentStatsPDA(agentPda);
  const [globalPda, globalBump] = Pdas.getGlobalPDA();
  const fakeSigner = { publicKey: walletPublicKey, secretKey: new Uint8Array(64) };
  const beforeBalance = BigInt(await connection.getBalance(walletPublicKey, 'confirmed'));
  const beforeAccounts = {
    wallet: await accountInfoSummary(connection, walletPublicKey),
    program: await accountInfoSummary(connection, SAP_PROGRAM_ADDRESS),
    globalRegistry: await accountInfoSummary(connection, globalPda),
    agent: await accountInfoSummary(connection, agentPda),
    agentStats: await accountInfoSummary(connection, agentStatsPda),
  };

  const preflightBlockers = [
    SAP_NETWORK !== 'solana:mainnet-beta' ? 'wrong_sap_network_constant' : null,
    cfg.expectedSolanaAddress && cfg.expectedSolanaAddress !== account.address ? 'cdp_solana_address_mismatch' : null,
    beforeAccounts.program.exists ? null : 'sap_program_not_found_on_mainnet',
    beforeAccounts.globalRegistry.exists ? null : 'sap_global_registry_not_found',
    beforeAccounts.agent.exists ? 'sap_agent_already_registered' : null,
    beforeBalance < maxLamports ? 'wallet_balance_below_max_lamport_cap' : null,
    execute && !approvalMatches ? 'approval_env_mismatch' : null,
  ].filter(Boolean);

  let instruction;
  let transaction;
  let feeLamports = null;
  let rentEstimateLamports = null;
  let simulation = null;
  try {
    instruction = await sap.agent.registerAgent({
      signer: fakeSigner,
      wallet: walletPublicKey,
      agent: agentPda,
      agentStats: agentStatsPda,
      globalRegistry: globalPda,
      ...registerArgs,
    });
    transaction = await sap.buildTransaction([instruction], walletPublicKey, {
      limit: 500_000,
      microLamports: 1_000,
    });
    const fee = await connection.getFeeForMessage(transaction.message, 'confirmed');
    feeLamports = fee.value;
    const agentRent = beforeAccounts.agent.exists ? 0 : await connection.getMinimumBalanceForRentExemption(
      Number(process.env.SAP_REGISTER_AGENT_RENT_BYTES || '6000'),
      'confirmed',
    );
    const statsRent = beforeAccounts.agentStats.exists ? 0 : await connection.getMinimumBalanceForRentExemption(
      Number(process.env.SAP_REGISTER_STATS_RENT_BYTES || '128'),
      'confirmed',
    );
    rentEstimateLamports = agentRent + statsRent;
    simulation = await connection.simulateTransaction(transaction, {
      sigVerify: false,
      replaceRecentBlockhash: true,
      commitment: 'confirmed',
    });
  } catch (error) {
    preflightBlockers.push('build_or_simulation_failed');
    simulation = { error: publicError(error) };
  }

  const simulatedOk = simulation?.value?.err == null && !simulation?.error;
  if (!simulatedOk) preflightBlockers.push('simulation_failed');
  const estimatedMaxLamports = feeLamports == null || rentEstimateLamports == null
    ? null
    : BigInt(feeLamports + rentEstimateLamports);
  if (estimatedMaxLamports != null && estimatedMaxLamports > maxLamports) preflightBlockers.push('fee_exceeds_cap');

  const basePayload = {
    generatedAt,
    ok: preflightBlockers.length === 0,
    status: preflightBlockers.length ? 'blocked-preflight' : execute ? 'ready-to-send' : 'ready-simulation-no-send',
    approvalId,
    network: SAP_NETWORK,
    rpcUrl: defaultRpc,
    sdkPackage: '@oobe-protocol-labs/synapse-sap-sdk',
    programAddress: SAP_PROGRAM_ADDRESS,
    wallet: account.address,
    accountName: cfg.solanaAccountName,
    pdas: {
      agent: agentPda.toBase58(),
      agentBump,
      agentStats: agentStatsPda.toBase58(),
      statsBump,
      globalRegistry: globalPda.toBase58(),
      globalBump,
    },
    manifest: {
      name: manifest.name,
      agentId: manifest.agentId,
      agentUri: manifest.agentUri,
      x402Endpoint: manifest.x402Endpoint,
      capabilities: manifest.capabilities.map((capability) => capability.id),
      protocols: manifest.protocols,
    },
    balances: {
      beforeLamports: beforeBalance.toString(),
      beforeSol: Number(beforeBalance) / 1e9,
    },
    fees: {
      estimatedFeeLamports: feeLamports,
      estimatedRentLamports: rentEstimateLamports,
      estimatedFeePlusRentLamports: estimatedMaxLamports?.toString() || null,
      estimatedFeePlusRentSol: estimatedMaxLamports == null ? null : Number(estimatedMaxLamports) / 1e9,
      maxApprovedLamports: maxLamports.toString(),
      maxApprovedSol: Number(maxLamports) / 1e9,
    },
    accountsBefore: beforeAccounts,
    simulation: simulation?.value ? {
      err: simulation.value.err,
      unitsConsumed: simulation.value.unitsConsumed ?? null,
      logs: Array.isArray(simulation.value.logs) ? simulation.value.logs.slice(-30) : [],
    } : simulation,
    safety: {
      usesCdpManagedSolanaSigner: true,
      storesSignerSecret: false,
      storesWalletSecret: false,
      usesPersonalFiatFunding: false,
      executeRequested: execute,
      signsWallet: false,
      sendsTransaction: false,
    },
    preflightBlockers: [...new Set(preflightBlockers)],
  };

  if (!execute || preflightBlockers.length) {
    writeJson(latestPath, basePayload);
    archive(basePayload);
    console.log(`Wrote SAP registration preflight: ${latestPath}`);
    return;
  }

  const unsignedBase64 = Buffer.from(transaction.serialize()).toString('base64');
  const signed = await account.signTransaction({ transaction: unsignedBase64 });
  const signedBase64 = signed.signedTransaction || signed.transaction;
  if (!signedBase64) throw new Error('cdp_signed_transaction_missing');
  const signedTx = VersionedTransaction.deserialize(Buffer.from(signedBase64, 'base64'));
  const signature = await connection.sendRawTransaction(signedTx.serialize(), {
    skipPreflight: false,
    preflightCommitment: 'confirmed',
    maxRetries: 3,
  });
  const latestBlockhash = await connection.getLatestBlockhash('confirmed');
  const confirmation = await connection.confirmTransaction({
    signature,
    blockhash: latestBlockhash.blockhash,
    lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
  }, 'confirmed');
  const afterBalance = BigInt(await connection.getBalance(walletPublicKey, 'confirmed'));
  const afterAccounts = {
    agent: await accountInfoSummary(connection, agentPda),
    agentStats: await accountInfoSummary(connection, agentStatsPda),
    globalRegistry: await accountInfoSummary(connection, globalPda),
  };
  const payload = {
    ...basePayload,
    ok: confirmation.value.err == null && afterAccounts.agent.exists,
    status: confirmation.value.err == null && afterAccounts.agent.exists ? 'registered-sap-mainnet-identity' : 'sent-but-not-verified',
    signature,
    explorerUrl: `https://explorer.solana.com/tx/${signature}`,
    confirmation: confirmation.value,
    balances: {
      ...basePayload.balances,
      afterLamports: afterBalance.toString(),
      afterSol: Number(afterBalance) / 1e9,
      spentLamports: (beforeBalance - afterBalance).toString(),
      spentSol: Number(beforeBalance - afterBalance) / 1e9,
    },
    accountsAfter: afterAccounts,
    safety: {
      ...basePayload.safety,
      signsWallet: true,
      sendsTransaction: true,
      spendsFunds: true,
    },
  };
  writeJson(latestPath, payload);
  archive(payload);
  console.log(`Wrote SAP registration live result: ${latestPath}`);
  if (!payload.ok) process.exit(1);
}

main().catch((error) => {
  const payload = {
    generatedAt: new Date().toISOString(),
    ok: false,
    status: 'fatal-sap-registration-error',
    error: publicError(error),
    safety: {
      storesSecrets: false,
      usesPersonalFiatFunding: false,
    },
  };
  writeJson(latestPath, payload);
  archive(payload);
  console.log(`Wrote SAP registration fatal result: ${latestPath}`);
  process.exit(1);
});
