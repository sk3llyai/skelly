import { PrismaClient } from '@prisma/client';
import { afterAll, describe, expect, it } from 'vitest';
import { withOrg } from '../database/tenant';
import { resolveTenant } from './provisioning';

/**
 * Integration test: just-in-time provisioning runs through the restricted app role
 * (plus the SECURITY DEFINER org function) and produces tenant-isolated rows.
 */
describe('tenant provisioning', () => {
  const app = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });
  const admin = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_ADMIN_URL } } });

  const stamp = Date.now();
  const workosOrgId = `org_test_${stamp}`;
  const workosUserId = `user_test_${stamp}`;

  afterAll(async () => {
    await admin.user.deleteMany({ where: { workosUserId } });
    await admin.organisation.deleteMany({ where: { workosOrgId } });
    await admin.$disconnect();
    await app.$disconnect();
  });

  it('creates an organisation and user on first login', async () => {
    const { organisationId, userId } = await resolveTenant(app, {
      workosOrgId,
      orgName: 'Acme',
      workosUserId,
      email: 'founder@acme.test',
      name: 'Founder',
    });

    expect(organisationId).toMatch(/^[0-9a-f-]{36}$/);
    expect(userId).toMatch(/^[0-9a-f-]{36}$/);

    const user = await withOrg(app, organisationId, (tx) =>
      tx.user.findUnique({ where: { id: userId } }),
    );
    expect(user?.workosUserId).toBe(workosUserId);
    expect(user?.organisationId).toBe(organisationId);
  });

  it('is idempotent on repeat login and applies profile updates', async () => {
    const first = await resolveTenant(app, {
      workosOrgId,
      orgName: 'Acme',
      workosUserId,
      email: 'founder@acme.test',
      name: 'Founder',
    });
    const second = await resolveTenant(app, {
      workosOrgId,
      orgName: 'Acme',
      workosUserId,
      email: 'founder@acme.test',
      name: 'Founder Renamed',
    });

    expect(second.organisationId).toBe(first.organisationId);
    expect(second.userId).toBe(first.userId);

    const user = await withOrg(app, second.organisationId, (tx) =>
      tx.user.findUnique({ where: { id: second.userId } }),
    );
    expect(user?.name).toBe('Founder Renamed');
  });
});
