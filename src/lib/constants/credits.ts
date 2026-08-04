export const CREDIT_COSTS = {
  DM_GENERATION: 30,
  MEMORY_VAULT: 25,
  SEGMENTATION: 20,
  TRANSLATOR: 20,
  DATA_METRIC_LOGGER: 5,
} as const;

export type CreditOperation = keyof typeof CREDIT_COSTS;
