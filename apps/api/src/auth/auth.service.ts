import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { WorkOS, type User } from '@workos-inc/node';
import type { AuthenticatedIdentity } from './provisioning';

export interface AuthResult {
  sealedSession: string;
  identity: AuthenticatedIdentity;
}

/**
 * Normalise a WorkOS user (+ optional organization) into our identity shape.
 * Personal (org-less) sign-ups get a stable synthetic org key so every user still
 * belongs to exactly one tenant.
 */
export function toIdentity(user: User, organizationId: string | null): AuthenticatedIdentity {
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  const name = fullName || user.email;
  const workosOrgId = organizationId ?? `user:${user.id}`;
  const orgName = organizationId ? `Organisation ${organizationId}` : `${name}'s workspace`;
  return { workosUserId: user.id, email: user.email, name, workosOrgId, orgName };
}

/** Thin wrapper over the WorkOS AuthKit flow (delegated auth — ADR-012). */
@Injectable()
export class AuthService {
  private readonly workos: WorkOS | null;
  private readonly clientId: string;
  private readonly redirectUri: string;
  private readonly cookiePassword: string;

  constructor() {
    this.clientId = process.env.WORKOS_CLIENT_ID ?? '';
    this.redirectUri = process.env.WORKOS_REDIRECT_URI ?? '';
    this.cookiePassword = process.env.WORKOS_COOKIE_PASSWORD ?? '';
    const apiKey = process.env.WORKOS_API_KEY ?? '';
    this.workos = apiKey && this.clientId ? new WorkOS(apiKey, { clientId: this.clientId }) : null;
  }

  get configured(): boolean {
    return this.workos !== null && this.cookiePassword.length > 0;
  }

  private client(): WorkOS {
    if (!this.workos || !this.cookiePassword) {
      throw new ServiceUnavailableException(
        'WorkOS is not configured. Set WORKOS_API_KEY, WORKOS_CLIENT_ID and WORKOS_COOKIE_PASSWORD.',
      );
    }
    return this.workos;
  }

  /** The URL to send the user to in order to log in via WorkOS AuthKit. */
  getAuthorizationUrl(): string {
    return this.client().userManagement.getAuthorizationUrl({
      provider: 'authkit',
      clientId: this.clientId,
      redirectUri: this.redirectUri,
    });
  }

  /** Exchange the authorization code for a sealed session + normalised identity. */
  async authenticateWithCode(code: string): Promise<AuthResult> {
    const response = await this.client().userManagement.authenticateWithCode({
      clientId: this.clientId,
      code,
      session: { sealSession: true, cookiePassword: this.cookiePassword },
    });
    if (!response.sealedSession) {
      throw new ServiceUnavailableException('WorkOS did not return a sealed session.');
    }
    return {
      sealedSession: response.sealedSession,
      identity: toIdentity(response.user, response.organizationId ?? null),
    };
  }

  /** Validate a sealed session cookie; returns the identity if still authenticated. */
  async authenticateSession(
    sessionData: string,
  ): Promise<{ authenticated: boolean; identity?: AuthenticatedIdentity }> {
    const session = this.client().userManagement.loadSealedSession({
      sessionData,
      cookiePassword: this.cookiePassword,
    });
    const result = await session.authenticate();
    if (!result.authenticated) {
      return { authenticated: false };
    }
    return {
      authenticated: true,
      identity: toIdentity(result.user, result.organizationId ?? null),
    };
  }

  /** The WorkOS logout URL for a given sealed session. */
  async getLogoutUrl(sessionData: string): Promise<string> {
    const session = this.client().userManagement.loadSealedSession({
      sessionData,
      cookiePassword: this.cookiePassword,
    });
    return session.getLogoutUrl();
  }
}
