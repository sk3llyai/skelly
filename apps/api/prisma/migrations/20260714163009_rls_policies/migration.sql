-- Multi-tenancy enforced by Postgres Row-Level Security (ADR-007).
-- The running app connects as the restricted role `skelly_app` and announces the
-- current tenant via `app.current_org_id`; Postgres filters every other org's rows out.

-- 1) Restricted application role (created idempotently so this replays cleanly in CI).
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'skelly_app') THEN
    CREATE ROLE skelly_app LOGIN PASSWORD 'skelly_app';
  END IF;
END
$$;

-- 2) Least-privilege grants: DML on tenant tables, no DDL, no superuser, no BYPASSRLS.
GRANT USAGE ON SCHEMA public TO skelly_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO skelly_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO skelly_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO skelly_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO skelly_app;

-- 3) Enable + FORCE RLS on every tenant table. FORCE means even a table owner is
--    subject to the policies (defence in depth); superusers still bypass, which is
--    why migrations/seeding run as the privileged role and the app never does.
ALTER TABLE "organisations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "organisations" FORCE ROW LEVEL SECURITY;
ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "roles" FORCE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" FORCE ROW LEVEL SECURITY;

-- 4) Isolation policies. When the tenant context is unset, current_setting(..., true)
--    yields NULL or '' (empty) depending on session history; NULLIF collapses both to
--    NULL so an un-scoped connection matches no rows (deny by default).
CREATE POLICY tenant_isolation ON "organisations"
  USING (id = NULLIF(current_setting('app.current_org_id', true), '')::uuid)
  WITH CHECK (id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation ON "roles"
  USING (organisation_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid)
  WITH CHECK (organisation_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);

CREATE POLICY tenant_isolation ON "users"
  USING (organisation_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid)
  WITH CHECK (organisation_id = NULLIF(current_setting('app.current_org_id', true), '')::uuid);
