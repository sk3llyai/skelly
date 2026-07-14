-- Just-in-time tenant provisioning at login.
--
-- RLS on `organisations` is keyed by the row's own id, so the restricted app role
-- cannot look up an organisation by its external (WorkOS) id — that lookup/creation
-- is a privileged bootstrap. We expose it as a SECURITY DEFINER function (runs as the
-- owner, bypassing RLS) that the app role may EXECUTE, and nothing more. User rows are
-- then created by the app role itself, inside the org's RLS context.

CREATE OR REPLACE FUNCTION app_get_or_create_organisation(p_workos_org_id text, p_name text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id
  FROM organisations
  WHERE workos_org_id = p_workos_org_id AND deleted_at IS NULL;

  IF v_id IS NULL THEN
    INSERT INTO organisations (id, workos_org_id, name, created_at, updated_at)
    VALUES (gen_random_uuid(), p_workos_org_id, p_name, now(), now())
    RETURNING id INTO v_id;
  END IF;

  RETURN v_id;
END;
$$;

-- Least privilege: only the app role may call it.
REVOKE ALL ON FUNCTION app_get_or_create_organisation(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION app_get_or_create_organisation(text, text) TO skelly_app;
