# Unit Economics: Multiplexer Pricing

Status: supersedes the old "1% visible platform fee" framing.

## Current Rule

The public product is **x402 Agent-Payment Infrastructure**, not a visible payment-fee wrapper.

Public quotes show:

- selected service
- payment asset/network
- route/network estimate when applicable
- total debit

Public quotes do **not** show:

- internal provider cost
- internal model routing
- Wisely margin formula
- model-tier pricing language

## Default Internal Pricing

Current default hosted service price:

```text
base service price + 1%
```

Route/network/conversion cost is added separately when applicable.

This keeps the public customer experience simple. Very small calls may be unprofitable unless bundled, routed to low-cost services, or covered by a developer-credit/account plan.

## B2B Pricing Direction

For developer accounts and heavier users, the stronger commercial framing is infrastructure:

- one funded rail
- many AI/data service calls
- progress streaming
- receipt ledger
- per-agent accounting
- fewer provider balances to babysit

Potential commercial layers:

- built-in hosted margin on usage
- monthly developer license/support tier
- higher-volume contract pricing
- prepaid developer credit balances

## Cost Risk Notes

The hosted endpoint calls the upstream provider directly; deterministic quote/receipt logic does not require OpenAI API spend from Wisely.

If future orchestration adds extra LLM reasoning on Wisely's side, that cost must be allocated to a higher product tier or bundled into the all-in hosted service price. Do not attach visible "model surcharge" labels to customer quotes.
