import { PrismaClient } from '@prisma/client';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { withOrg } from './tenant';

/**
 * Integration test: proves Postgres Row-Level Security isolates tenants.
 *
 * Requires a running database with migrations applied. Seeding uses the privileged
 * role (superuser bypasses RLS); all assertions use the restricted app role, which is
 * subject to RLS — exactly how the running application connects.
 */
describe('Row-Level Security tenant isolation', () => {
  const admin = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_ADMIN_URL } } });
  const app = new PrismaClient({ datasources: { db: { url: process.env.DATABASE_URL } } });

  let orgA = '';
  let orgB = '';
  let userAId = '';
  let userBId = '';

  beforeAll(async () => {
    const stamp = Date.now();
    const a = await admin.organisation.create({ data: { name: `Org A ${stamp}` } });
    const b = await admin.organisation.create({ data: { name: `Org B ${stamp}` } });
    orgA = a.id;
    orgB = b.id;
    const alice = await admin.user.create({
      data: { organisationId: orgA, email: `alice-${stamp}@a.test`, name: 'Alice' },
    });
    const bob = await admin.user.create({
      data: { organisationId: orgB, email: `bob-${stamp}@b.test`, name: 'Bob' },
    });
    userAId = alice.id;
    userBId = bob.id;
  });

  afterAll(async () => {
    await admin.user.deleteMany({ where: { id: { in: [userAId, userBId] } } });
    await admin.organisation.deleteMany({ where: { id: { in: [orgA, orgB] } } });
    await admin.$disconnect();
    await app.$disconnect();
  });

  it('scoped to org A, sees only org A users', async () => {
    const users = await withOrg(app, orgA, (tx) => tx.user.findMany());
    expect(users.map((u) => u.organisationId)).toEqual([orgA]);
    expect(users.some((u) => u.id === userBId)).toBe(false);
  });

  it('scoped to org B, sees only org B users', async () => {
    const users = await withOrg(app, orgB, (tx) => tx.user.findMany());
    expect(users.map((u) => u.organisationId)).toEqual([orgB]);
  });

  it('cannot read another org’s row even by its exact id', async () => {
    const leaked = await withOrg(app, orgA, (tx) => tx.user.findUnique({ where: { id: userBId } }));
    expect(leaked).toBeNull();
  });

  it('sees nothing with no tenant context (deny by default)', async () => {
    const users = await app.user.findMany();
    expect(users).toEqual([]);
  });

  it('cannot write a row into another org (WITH CHECK enforced)', async () => {
    await expect(
      withOrg(app, orgA, (tx) =>
        tx.user.create({
          data: { organisationId: orgB, email: `mallory-${Date.now()}@x.test`, name: 'Mallory' },
        }),
      ),
    ).rejects.toThrow();
  });
});
