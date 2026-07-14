import { z } from 'zod';

/**
 * Every persisted entity in Skelly is tenant-scoped by organisation.
 * `OrganisationId` is the seam that Postgres Row-Level Security enforces at the
 * database layer (ADR-007). Defining it here, once, keeps api and web in agreement.
 */
export const organisationIdSchema = z.string().uuid().brand<'OrganisationId'>();
export type OrganisationId = z.infer<typeof organisationIdSchema>;

/**
 * The shape returned by every service's health endpoint. First shared contract —
 * proves the api → domain-contracts → web wiring end to end.
 */
export const HEALTH_OK = 'ok' as const;

export const healthStatusSchema = z.object({
  status: z.literal(HEALTH_OK),
  service: z.string().min(1),
  timestamp: z.string().datetime(),
});
export type HealthStatus = z.infer<typeof healthStatusSchema>;
