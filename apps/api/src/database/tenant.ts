import { Prisma, PrismaClient } from '@prisma/client';

/**
 * Run `fn` inside a transaction scoped to a single tenant.
 *
 * Sets the `app.current_org_id` Postgres setting for the life of the transaction
 * (transaction-local, so it never leaks across pooled connections). Every query in
 * `fn` is then filtered by Row-Level Security to that organisation — the database
 * enforces isolation even if application code forgets to.
 */
export async function withOrg<T>(
  prisma: PrismaClient,
  organisationId: string,
  fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_org_id', ${organisationId}, true)`;
    return fn(tx);
  });
}
