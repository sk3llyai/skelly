# @skelly/worker — RESERVED SEAM

The background job / event processor (BullMQ). Runs the async side of the platform:
notifications, reminders, CSV import/ingestion, scheduled recalculations.

**Status:** empty placeholder. Wired up when the first async workload appears (Notifications /
Reminders, Phase 7; ingestion, Phase 8). Same domain code as `apps/api`, different entrypoint —
so business logic is never duplicated across the sync and async sides.
