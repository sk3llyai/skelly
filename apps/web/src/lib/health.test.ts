import { HEALTH_OK } from '@skelly/domain-contracts';
import { describe, expect, it } from 'vitest';
import { parseHealth } from './health';

describe('parseHealth', () => {
  it('accepts a valid health payload from the api', () => {
    const payload = { status: HEALTH_OK, service: 'api', timestamp: new Date().toISOString() };
    expect(parseHealth(payload)).toEqual(payload);
  });

  it('rejects a malformed health payload', () => {
    expect(() => parseHealth({ status: 'ok' })).toThrow();
  });
});
