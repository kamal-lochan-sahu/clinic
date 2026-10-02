# Project Status

Last updated: 2026-10-01. Findings below come from a full read of the code, not from running the app; verify before fixing.

## Goal

Turn MediManage into a production-grade, secure, multi-tenant clinic management product, with a clean repo and a professional workflow (feature branches, PRs, conventional commits).

## Done

- Git history cleaned (junk files removed, force-pushed). Backup bundle kept locally.
- Repo hygiene: README, env examples, .gitignore, editorconfig (this branch).

## Known issues (priority order)

P0 (security / broken behaviour)
1. Staff accounts cannot see clinic data: queries filter by `ownerId = req.user._id`, and staff have their own user id. Need a clinic/tenant id on every user.
2. Token refresh broken: expired token gives 500 instead of 401; `cookie-parser` is missing so `req.cookies` is undefined (hard-refresh session restore fails).
3. Cross-clinic access (IDOR): queue endpoints, `Patient.findById`, `Appointment.findByIdAndUpdate` lack owner scope; update endpoints pass `req.body` directly (can overwrite `ownerId`).
4. Almost no role checks (only branch/staff/expense create are owner-only).
5. Regex built from user input in search endpoints.
6. Patient documents (prescription/receipt PDFs, lab reports) are public Cloudinary URLs; uploads have no type or size limits.

P1 (correctness)
7. `patientId`, `appointmentId`, `receiptNumber` are numbered per owner but unique globally, so a second clinic collides; counters also race.
8. Billing trusts client amounts; no endpoint to collect a due balance; stock is not reduced by billing or prescriptions.
9. Timezone: appointments use IST, queue/analytics/cron use server time.
10. Settings (slot duration, booking window, auto-confirm, reminder hours, branch timings) are saved but not used; brand colour has no effect.

P2 (quality)
- `asyncHandler` replies itself and bypasses the error middleware; Joi installed but unused; login reveals whether an email exists.
- Prescription PDF never receives the diagnosis; low-stock and expiry jobs only log.
- Unused deps (react-big-calendar, moment); backend features without UI (branches, templates, notifications, salary history, calendar).
- No tests, CI, linting, API docs; bundle not code-split.

## Roadmap

1. Hygiene: README/env/docs, lint + format, CI (this phase).
2. Foundations: tenant model, auth/refresh fix, per-clinic counters, owner scoping, validation, RBAC.
3. Product: wire up settings, billing and inventory integration, timezone fix, tests.
4. Features (after competitor research): ABDM/ABHA, GST invoices, online booking or patient portal, Hindi/Odia UI, audit log, backup/export, pharmacy batches.

## Working agreement

- Claude cannot access the local machine; it reads the code from GitHub and provides scripts.
- Changes are made locally via scripts, committed on a branch, pushed, and merged via PR.
- Progress log is updated at the end of every session.

## Progress log

- 2026-10-01: full code read and analysis; git history audited and cleaned; repo hygiene branch created.
