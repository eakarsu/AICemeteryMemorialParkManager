# Governed death-care operations

The production-boundary workflow is \`/api/governed-cases\`: intake → identity verification → documented authorization → scheduling → service completion → price reconciliation → immutable close. Creation requires \`x-tenant-id\`, bearer auth, and \`idempotency-key\`; all transitions use a version number to reject concurrent updates. Roles are assigned only through \`cemetery_tenant_memberships\`.

Vital-record, mapping, inventory, payment, e-signature, publishing, and accounting requests enter \`deathcare_outbox\`. Operators must add jurisdiction-approved adapters, reconciliation jobs, retention policy, and licensed professional/legal validation. The software does not claim regulatory certification or replace identity/chain-of-custody procedures.

## Safe lifecycle

1. Copy `.env.example` to `.env` and replace every placeholder.
2. Run `scripts/bootstrap.sh` once to install locked dependencies.
3. Run `scripts/migrate.sh` explicitly against the intended database.
4. Provision tenant memberships through an audited administrator process.
5. Run `./start.sh`; it never installs, seeds, migrates, starts PostgreSQL, or kills ports.

Legacy seed data is demo-only. Where `scripts/seed-demo.sh` exists it requires `CONFIRM_DEMO_SEED=yes` and refuses production. External provider calls and production data were not exercised by this implementation.
