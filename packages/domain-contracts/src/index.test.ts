import { describe, expect, it } from 'vitest';
import { HEALTH_OK, healthStatusSchema, organisationIdSchema } from './index';

describe('domain-contracts', () => {
  it('accepts a valid organisation id', () => {
    const id = '00000000-0000-0000-0000-000000000000';
    expect(organisationIdSchema.parse(id)).toBe(id);
  });

  it('rejects a non-uuid organisation id', () => {
    expect(() => organisationIdSchema.parse('not-a-uuid')).toThrow();
  });

  it('validates a health status payload', () => {
    const payload = { status: HEALTH_OK, service: 'api', timestamp: new Date().toISOString() };
    expect(healthStatusSchema.parse(payload)).toEqual(payload);
  });

  it('rejects a health status with the wrong status literal', () => {
    const payload = { status: 'down', service: 'api', timestamp: new Date().toISOString() };
    expect(() => healthStatusSchema.parse(payload)).toThrow();
  });
});
