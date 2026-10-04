# Project Status

Last updated: 2026-10-02. Findings come from a full read of the code plus sandbox smoke tests (no database); verify against a real database before relying on them.

## Goal

Turn MediManage into a production-grade, secure, multi-tenant clinic management product, with a clean repo and a professional workflow (small clean commits on main; solo developer).

## Done

- Git history cleaned (junk files removed, force-pushed). Backup bundle kept locally.
- Repo hygiene: README, env examples, .gitignore, editorconfig, this status file.
- Auth: `cookie-parser` added (cookie refresh works), invalid/expired tokens return 401 (so the frontend refresh flow triggers), central error handler (validation 400, duplicate 409, no stack/message leak in production), login no longer reveals whether an email exists, NoSQL-style object inputs rejected.
- Multi-tenancy: staff users carry `ownerId`; middleware sets `req.clinicId` (owner = own id, staff = owner id; legacy staff are linked lazily). Every controller scopes by `req.clinicId`. New `GET /api/staff/doctors`. Staff cannot be created with role `owner`. Staff see the owner's branding.
- Security: queue endpoints, cross-references (patient/doctor ids in bodies), appointment/consultation updates are clinic-scoped; protected fields (`ownerId`, `_id`, `$` operators) stripped from update bodies; regex search input escaped; pagination capped.
- Frontend: booking and queue use `GET /api/staff/doctors` (doctor dropdown when the clinic has more than one doctor); sidebar and routes are filtered by role (matrix in `frontend/src/utils/roles.js`, mirrors backend route guards); dashboard revenue chart only for owner.
- RBAC: owner-only settings update, analytics (revenue/patients/diagnoses), expenses list, staff list/salary, medicine delete; billing for owner/doctor/receptionist; consultation, prescription and lab-test creation for owner/doctor.

## Known issues (priority order)

P0
1. Buttons inside pages are not role-aware yet (e.g. "order lab test" for receptionist gets a 403 toast; medicine delete for non-owner). Pages themselves are gated.
2. Patient documents (prescription/receipt PDFs, lab reports) are public Cloudinary URLs; uploads have no file type or size limits and temp files are not deleted.

P1
3. `patientId`, `appointmentId`, `receiptNumber` are numbered per clinic with a global unique index, so a second clinic collides; counters also race. Queue token numbers race too.
4. Billing trusts client amounts; no endpoint to collect a due balance; stock is not reduced by billing or prescriptions.
5. Timezone: appointments use IST, queue/analytics/cron use server time.
6. Settings (slot duration, booking window, auto-confirm, reminder hours, branch timings) are saved but not used; brand colour has no effect.

P2
- Joi installed but unused (request validation is ad hoc); password policy is only min 6; no rate limit on refresh-token.
- Prescription PDF never receives the diagnosis; low-stock and expiry jobs only log.
- Unused deps (react-big-calendar, moment); backend features without UI (branches, templates, notifications, salary history, calendar).
- No tests, CI, linting, API docs; bundle not code-split.

## Roadmap

1. Hygiene: README/env/docs (done); lint + format, CI.
2. Foundations: auth, tenancy, scoping, RBAC, doctor list and page gating (done); per-clinic counters; validation; in-page role-aware buttons.
3. Product: wire up settings, billing and inventory integration, timezone fix, tests.
4. Features (after competitor research): ABDM/ABHA, GST invoices, online booking or patient portal, Hindi/Odia UI, audit log, backup/export, pharmacy batches.

## Working agreement

- Claude cannot access the local machine; it reads the code from GitHub and delivers scripts or patch files.
- Changes are made locally via scripts, tested locally, committed to main in small commits, then pushed.
- Progress log is updated at the end of every session.

## Progress log

- 2026-10-01: full code read and analysis; git history audited and cleaned; repo hygiene added.
- 2026-10-02: backend auth, tenancy, scoping and RBAC fixes (5 commits); frontend doctor selection and role gating (3 commits).
