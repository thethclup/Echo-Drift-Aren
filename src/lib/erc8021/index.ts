/**
 * ERC-8021: Transaction Attribution Placeholder
 * Used for routing transaction rewards or tracking origin attribution.
 */

export const ATTRIBUTION_CODE = "[ATTRIBUTION_CODE]";
export const BUILDER_CODE = "[BUILDER_CODE]";

export function generateAttributionPayload(transactionData: any) {
  return {
    ...transactionData,
    attribution: ATTRIBUTION_CODE,
    builder: BUILDER_CODE,
    timestamp: Date.now(),
  };
}
