import type { User } from '@workos-inc/node';
import { describe, expect, it, vi } from 'vitest';
import { AuthService, toIdentity } from './auth.service';

const makeUser = (partial: Partial<User>): User =>
  ({
    id: 'user_1',
    email: 'a@b.com',
    firstName: null,
    lastName: null,
    ...partial,
  }) as unknown as User;

describe('toIdentity', () => {
  it('builds a full name and a synthetic org for a personal (org-less) user', () => {
    const identity = toIdentity(makeUser({ firstName: 'Ada', lastName: 'Lovelace' }), null);
    expect(identity.workosUserId).toBe('user_1');
    expect(identity.name).toBe('Ada Lovelace');
    expect(identity.workosOrgId).toBe('user:user_1');
  });

  it('uses the WorkOS org id when present and falls back to email for the name', () => {
    const identity = toIdentity(makeUser({ id: 'user_2', email: 'x@y.com' }), 'org_123');
    expect(identity.name).toBe('x@y.com');
    expect(identity.workosOrgId).toBe('org_123');
  });
});

describe('AuthService when unconfigured', () => {
  it('reports not configured and throws on use when the API key is empty', () => {
    vi.stubEnv('WORKOS_API_KEY', '');
    vi.stubEnv('WORKOS_CLIENT_ID', 'client_test');
    vi.stubEnv('WORKOS_COOKIE_PASSWORD', 'x'.repeat(32));

    const service = new AuthService();
    expect(service.configured).toBe(false);
    expect(() => service.getAuthorizationUrl()).toThrow(/not configured/i);

    vi.unstubAllEnvs();
  });
});
