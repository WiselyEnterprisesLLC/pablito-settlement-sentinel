# Live Simulation Plan

Status: **simulation planning only**. This plan is for dry-run or no-sign/no-send rehearsal before any wallet signing, spend, public publication, or final bounty action.

## Goal

Prove that the SAP/OOBE/Ace path can be rehearsed safely, with reviewed inputs and evidence capture, before any state-changing transaction or public claim is attempted.

## Simulation principles

- Use local dry-run commands first.
- Use official simulation/no-send modes before any live transaction.
- Do not connect a wallet until the exact simulation command and expected output have been reviewed.
- Do not send private user/customer data to any service.
- Do not treat simulation output as bounty-valid live proof.
- Capture only public-safe logs, ids, timestamps, and screenshots.

## Step-by-step plan

### Step 1 — Local scaffold verification

Purpose: confirm the repo is clean and deterministic before touching any external tool.

Commands:

```bash
npm test
npm run proof:dry-run
npm run verify:prep
```

Evidence to capture:

- command exit status,
- short terminal output showing pass/fail,
- updated `proof/dry-run-proof.latest.json`,
- reviewer note that `settlementTxSignature` remains `null`.

Stop if any command fails.

### Step 2 — Controlled dependency/CLI inspection

Purpose: identify the exact SAP/OOBE command surface without running install scripts or signing transactions.

Exact commands:

```bash
npm view @oobe-protocol-labs/synapse-sap-sdk version dist-tags --json
mkdir -p /tmp/oobe-sap-sdk-inspection
npm pack @oobe-protocol-labs/synapse-sap-sdk@0.17.0 --ignore-scripts --pack-destination /tmp/oobe-sap-sdk-inspection
```

Evidence to capture:

- package name and version,
- command help output path,
- source of documentation,
- reviewer note on whether install scripts, network access, or credentials are involved.

Stop if the tool requires credentials, wallet files, unknown scripts, or account login before simulation.

### Step 3 — SAP registration simulation

Purpose: rehearse registration arguments and inspect the transaction preview without sending it.

Known command shape already present in `docs/live-action-gate.md`:

```bash
synapse-sap agent register --manifest agent.json --simulate --json
```

Final exact command for this repo:

```bash
npm run proof:sap-preview
```

This writes `proof/sap-registration.preview.latest.json`. It previews registration arguments and blockers only. It does not import the live SDK, connect a wallet, sign, send, or mutate network state.

Evidence to capture:

- manifest path used,
- simulation output path,
- network selected,
- estimated rent/fee if shown,
- confirmation that no transaction signature was produced,
- reviewer note on whether arguments match `agent.manifest.draft.json` or a reviewed derived manifest.

Stop if the command attempts to sign, send, connect a wallet, or mutate mainnet state.

### Step 4 — Ace Data Cloud / Synapse Sentinel service rehearsal

Purpose: verify account/service requirements and identify legitimate service calls before any live use.

Exact commands: pending official account-free or simulation-only service commands. Leave blank until the official Ace/Sentinel service route is confirmed.

Evidence to capture:

- service names,
- whether the chosen category requires one service or three services,
- allowed input data shape,
- cost/credit requirement,
- proof format expected from official UI/API,
- data privacy review.

Stop if the route requires payment-card entry, sensitive identity checks, unsupported account sharing, or private data.

### Step 5 — x402/SAP settlement rehearsal

Purpose: preview payment/settlement fields and prove the payment would be legitimate and non-wash before any value moves.

Exact commands or requests: pending exact quote/prepare/simulate command or HTTP request. Do not execute settlement from this simulation plan.

Local model command now available:

```bash
npm run proof:live-rehearsal
```

This writes `proof/live-rehearsal.no-sign.latest.json` and updates `proof/live-execution-approval-packet.draft.md` with the exact known preview commands plus remaining live blockers.

Evidence to capture:

- payer public address placeholder,
- payee/service public address placeholder,
- asset,
- amount,
- facilitator/escrow route,
- non-wash rationale,
- preview output,
- maximum approved SOL/USDC cost needed for later live action.

Stop if the only available path creates circular/artificial volume or requires more cost than the sandbox budget.

### Step 6 — Public artifact rehearsal

Purpose: make sure public repo, X walkthrough, and final Superteam text can point to real artifacts without overclaiming.

Exact commands/actions: pending final repo scan command, public repo creation method, X draft approval id, and Superteam route.

Evidence to capture:

- public file list,
- secret/private-data scan result,
- final README URL placeholder,
- final proof URL placeholder,
- final post/submission copy path,
- approval id placeholders.

Stop if any placeholder could be mistaken for real live evidence.

## Simulation completion criteria

Simulation is complete only when:

- local verification passes,
- SAP registration simulation or equivalent official no-send preview exists,
- Ace/Synapse service route and evidence format are known,
- settlement preview route is known and non-wash,
- costs are bounded,
- public artifacts pass wording and privacy checks,
- the final live approval packet can be filled with exact commands and evidence paths.

Until then, the correct status remains **wait / no-go for final submission**.
