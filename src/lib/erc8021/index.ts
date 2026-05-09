/**
 * ERC-8021: Transaction Attribution Placeholder
 * Used for routing transaction rewards or tracking origin attribution.
 */

export const ATTRIBUTION_CODE = "ECHO_DRIFT_ARENA_CLIENT";
export const BUILDER_CODE = "YOUR_BUILDER_CODE_HERE"; // Placeholder to be replaced by the developer

export function generateAttributionPayload(transactionData: any) {
  return {
    ...transactionData,
    attribution: ATTRIBUTION_CODE,
    builder: BUILDER_CODE,
    timestamp: Date.now(),
  };
}
