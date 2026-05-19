const AUTOMATION_PATTERNS = [
  {
    match: /lead|form|submission|follow[- ]?up/i,
    category: 'lead-follow-up',
    bottleneck: 'The first response and second touch are not owned by a timed checkpoint.',
    recommendedAction: 'Create one intake queue with a 15-minute first-reply target and an automatic next-day reminder for every unclosed lead.',
  },
  {
    match: /invoice|billing|payment|quote/i,
    category: 'billing-handoff',
    bottleneck: 'Commercial status is not visible at the handoff between operations and billing.',
    recommendedAction: 'Add a daily exception list for jobs missing price, approval, customer PO, or invoice-ready status.',
  },
  {
    match: /dispatch|truck|driver|load|route/i,
    category: 'dispatch-exception',
    bottleneck: 'Dispatch exceptions are being discovered manually after they are already late.',
    recommendedAction: 'Create a two-column exception board: blocked loads and next action owner, reviewed at fixed intervals.',
  },
];

export function runMockAceAiService(request) {
  const pattern = AUTOMATION_PATTERNS.find((candidate) => candidate.match.test(request.workflowPain))
    ?? {
      category: 'ops-handoff',
      bottleneck: 'The workflow depends on memory instead of a visible owner/checkpoint.',
      recommendedAction: 'Turn the handoff into one checklist with owner, due time, and done condition.',
    };

  return {
    service: 'Ace Data Cloud service placeholder #1: workflow classification',
    mocked: true,
    model: 'local-rule-fixture-not-Ace-live',
    category: pattern.category,
    bottleneck: pattern.bottleneck,
    recommendedAction: pattern.recommendedAction,
    publicDeliverable: {
      title: `Automation leak: ${pattern.category}`,
      summary: pattern.bottleneck,
      safeNextStep: pattern.recommendedAction,
      excludedData: [
        'private customer details',
        'credentials',
        'payment/account identifiers',
        'internal OpenClaw runtime details',
      ],
    },
  };
}

export function buildPublicDemoNarrative({ request, discovery, aiResult, proof }) {
  return {
    title: 'Pablito Settlement Sentinel dry-run proof',
    trigger: {
      source: request.source,
      requestedDeliverable: request.requestedDeliverable,
    },
    sapDiscoveryModel: {
      selectedAgent: discovery.selectedAgent.name,
      selectedCapability: discovery.selectedAgent.capability.id,
      note: 'Modeled from SAP SDK discovery interfaces; no mainnet query executed.',
    },
    aiServiceCallModel: {
      service: aiResult.service,
      note: 'Local deterministic fixture; not an Ace Data Cloud live call.',
      output: aiResult.publicDeliverable,
    },
    settlementProofModel: proof.publicProof,
    publicSafety: {
      containsPrivateData: false,
      containsSecrets: false,
      claimsLivePayment: false,
      claimsBountyValidVolume: false,
    },
  };
}
