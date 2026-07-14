import { healthStatusSchema, type HealthStatus } from '@skelly/domain-contracts';

/**
 * Parse/validate a health payload received from the API against the shared contract.
 * Proves the web ← domain-contracts wiring: the frontend validates against the exact
 * same schema the backend produces.
 */
export function parseHealth(input: unknown): HealthStatus {
  return healthStatusSchema.parse(input);
}
