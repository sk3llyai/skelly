# infra — Infrastructure as Code

All infrastructure defined in version-controlled config, not clicked together in a console
(Architecture §11). Reproducible, reviewable, disaster-recoverable.

**Status:** starts light. In Phase 0 the only "infra" is local Docker (`docker-compose.yml` at
the repo root) for a local Postgres. Terraform for AWS (staging → production) lands at the deploy
step and grows through Phase 8 (hardening).

Planned contents: Terraform modules for the managed database, container hosting, S3, networking,
and secrets — each environment (development / staging / production) identical in shape, differing
only in scale and secrets.
