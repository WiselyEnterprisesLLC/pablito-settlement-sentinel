# Live Evidence Template

Status: **blank template for future approved live work**. Do not fill this file with guesses, examples, sample signatures, copied placeholders, or unverified claims.

Instructions:

- Leave unknown fields as `null`.
- Use `not_applicable` only when the final chosen category truly does not require that evidence.
- Every populated URL, id, timestamp, transaction signature, service name, or submission id must come from real approved live execution.
- If a field is populated, add the evidence capture path and reviewer initials/date in the same section.
- Do not record secrets, account credentials, raw logs containing private data, or private runtime paths.

```json
{
  "status": "blank-template-not-live-evidence",
  "bounty": {
    "listingTitle": "Autonomous Agent Bounty: OOBE × Ace Data Cloud",
    "listedRewardAmount": "2,400 USDC prize pool / listed reward amount",
    "chosenCategory": null,
    "confirmedSubmissionRoute": null,
    "routeConfirmationSource": null,
    "routeConfirmationUrl": null,
    "routeConfirmationCapturedAt": null
  },
  "approvals": {
    "liveExecutionApprovalId": null,
    "publicRepoApprovalId": null,
    "xPostApprovalId": null,
    "superteamSubmissionApprovalId": null,
    "maximumApprovedSolCost": null,
    "maximumApprovedUsdcCost": null
  },
  "sapRegistration": {
    "requiredForChosenCategory": null,
    "registrationMode": null,
    "registeredAgentName": null,
    "registeredAgentAddressOrPda": null,
    "metadataUrl": null,
    "simulationLogPath": null,
    "transactionSignature": null,
    "explorerUrl": null,
    "officialApiEvidenceUrl": null,
    "network": null,
    "executedAt": null,
    "evidenceCapturePath": null,
    "reviewerNote": null
  },
  "aceDataCloudUsage": {
    "requiredForChosenCategory": null,
    "servicesRequiredCount": null,
    "servicesUsed": [],
    "accountOrProjectLabel": null,
    "usageEvidenceUrls": [],
    "usageTimestamps": [],
    "paymentOrCreditEvidenceUrl": null,
    "dataPrivacyNote": null,
    "evidenceCapturePath": null,
    "reviewerNote": null
  },
  "synapseSentinelUsage": {
    "requiredForChosenCategory": null,
    "serviceName": null,
    "serviceCapability": null,
    "usageEvidenceUrl": null,
    "usageTimestamp": null,
    "inputPrivacyNote": null,
    "outputSummary": null,
    "evidenceCapturePath": null,
    "reviewerNote": null
  },
  "settlement": {
    "requiredForChosenCategory": null,
    "protocol": null,
    "facilitatorOrEscrowRoute": null,
    "payerPublicAddress": null,
    "payeePublicAddress": null,
    "asset": null,
    "amount": null,
    "transactionSignature": null,
    "explorerUrl": null,
    "facilitatorReceiptUrl": null,
    "settledAt": null,
    "nonWashRationale": null,
    "evidenceCapturePath": null,
    "reviewerNote": null
  },
  "publicArtifacts": {
    "publicRepositoryUrl": null,
    "publicRepositoryCommitHash": null,
    "publicReadmeUrl": null,
    "dryRunProofUrl": null,
    "liveProofUrl": null,
    "xWalkthroughUrl": null,
    "demoVideoUrl": null,
    "securityScanResultPath": null,
    "publicClaimsAuditPath": null
  },
  "superteamSubmission": {
    "submitted": null,
    "submissionRoute": null,
    "submissionId": null,
    "submissionUrl": null,
    "submittedAt": null,
    "confirmationCapturePath": null,
    "finalSubmittedTextPath": null,
    "reviewerNote": null
  },
  "sponsorOrPlatformReply": {
    "received": null,
    "replyUrlOrCapturePath": null,
    "replyReceivedAt": null,
    "routeAnswered": null,
    "rewardFundingAnswered": null,
    "paymentDisputePathAnswered": null,
    "liveProofRequirementsAnswered": null,
    "reviewerNote": null
  },
  "finalReview": {
    "readyToSubmit": null,
    "reviewedBy": null,
    "reviewedAt": null,
    "remainingBlockers": [],
    "abandonOrWaitReason": null
  }
}
```

## Anti-fabrication rule

If this template has any non-null live field before approved live execution, treat the package as contaminated and stop. Replace the value with `null`, record where it came from, and re-run `npm test` plus `npm run proof:dry-run` before further review.
