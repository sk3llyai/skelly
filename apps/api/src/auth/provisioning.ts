import { PrismaClient } from '@prisma/client';
import { withOrg } from '../database/tenant';

/** An authenticated identity, normalised from the WorkOS auth response. */
export interface AuthenticatedIdentity {
  workosUserId: string;
  email: string;
  name: string;
  /** External org key — a real WorkOS organization id, or a synthetic per-user key. */
  workosOrgId: string;
  orgName: string;
}

export interface ResolvedTenant {
  organisationId: string;
  userId: string;
}

/**
 * Resolve (create if needed) the Organisation + User for a freshly authenticated
 * identity, idempotently.
 *
 * Organisation resolution goes through the SECURITY DEFINER function (privileged
 * bootstrap — see the `auth_provisioning_fn` migration). The User is then upserted by
 * the app role inside the org's RLS context, so it is subject to tenant isolation like
 * everything else.
 */
export async function resolveTenant(
  prisma: PrismaClient,
  identity: AuthenticatedIdentity,
): Promise<ResolvedTenant> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT app_get_or_create_organisation(${identity.workosOrgId}, ${identity.orgName}) AS id
  `;
  const organisationId = rows[0].id;

  const userId = await withOrg(prisma, organisationId, async (tx) => {
    const user = await tx.user.upsert({
      where: { workosUserId: identity.workosUserId },
      create: {
        organisationId,
        workosUserId: identity.workosUserId,
        email: identity.email,
        name: identity.name,
      },
      update: { email: identity.email, name: identity.name },
    });
    return user.id;
  });

  return { organisationId, userId };
}

export interface TenantView {
  organisationId: string;
  organisationName: string;
  userId: string;
  email: string;
  name: string;
}

/**
 * Read the current user + organisation for an identity (a normal, read-only request).
 * The org function only writes on first-ever login; steady-state this is two reads,
 * both under the org's RLS context.
 */
export async function getTenantView(
  prisma: PrismaClient,
  identity: AuthenticatedIdentity,
): Promise<TenantView> {
  const rows = await prisma.$queryRaw<{ id: string }[]>`
    SELECT app_get_or_create_organisation(${identity.workosOrgId}, ${identity.orgName}) AS id
  `;
  const organisationId = rows[0].id;

  const view = await withOrg(prisma, organisationId, async (tx) => {
    const existing = await tx.user.findUnique({
      where: { workosUserId: identity.workosUserId },
      include: { organisation: true },
    });
    if (existing) return existing;

    // First login via this path: create the user, then read it back with its org.
    const created = await tx.user.create({
      data: {
        organisationId,
        workosUserId: identity.workosUserId,
        email: identity.email,
        name: identity.name,
      },
    });
    const withRelation = await tx.user.findUniqueOrThrow({
      where: { id: created.id },
      include: { organisation: true },
    });
    return withRelation;
  });

  return {
    organisationId,
    organisationName: view.organisation.name,
    userId: view.id,
    email: view.email,
    name: view.name,
  };
}
