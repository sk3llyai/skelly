import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

/**
 * Per-environment role bootstrap: grant the restricted `skelly_app` role LOGIN with a
 * strong password sourced from the APP_DB_PASSWORD secret. Run after `prisma migrate
 * deploy`, as the privileged admin role (DATABASE_ADMIN_URL). Idempotent — safe to re-run
 * to rotate the password.
 *
 * Keeping the password out of the migration means no database credential is ever committed
 * to the repo (critical: a leaked `skelly_app` login could otherwise forge tenant context).
 */
const adminUrl = process.env.DATABASE_ADMIN_URL;
const password = process.env.APP_DB_PASSWORD;

if (!adminUrl || !password) {
  console.error('bootstrap-db-role: DATABASE_ADMIN_URL and APP_DB_PASSWORD are required');
  process.exit(1);
}
if (!/^[A-Za-z0-9_]+$/.test(password)) {
  console.error(
    'bootstrap-db-role: APP_DB_PASSWORD must be URL-safe (letters, digits, underscore)',
  );
  process.exit(1);
}

const prisma = new PrismaClient({ datasources: { db: { url: adminUrl } } });
try {
  await prisma.$executeRawUnsafe(`ALTER ROLE skelly_app WITH LOGIN PASSWORD '${password}'`);
  console.log('bootstrap-db-role: skelly_app login configured');
} finally {
  await prisma.$disconnect();
}
