# DaVinci Studio - Implementation Backlog (Production + Valuation Uplift)
This backlog turns `docs/PROJECT_VALUE_PRODUCTION_AUDIT.md` into an execution plan.

## How to use this document
- Treat each **Epic** as a milestone.
- Pull **P0** items first. P0 items are the fastest way to raise buyer confidence and reduce risk.
- Each task includes **effort**, **dependencies**, and **acceptance criteria** so it can be assigned and verified.

### Priority legend
- **P0**: Must do for production credibility (blocks launches / senior review)
- **P1**: Strongly recommended (material risk reduction)
- **P2**: Nice-to-have / polish (good for scale)

### Effort legend (rough)
- **S**: 0.5–1 day
- **M**: 2–4 days
- **L**: 1–2 weeks

---

## Epic 0 — Baseline repo hygiene + engineering foundations

### E0-T1 — Replace template README with real project docs
- **Priority**: P0
- **Effort**: M
- **Dependencies**: none
- **Acceptance criteria**:
  - `README.md` explains:
    - What DaVinci is (features, routes)
    - Local setup steps
    - Required env vars (link to `env.template`)
    - Supabase schema/migrations bootstrap
    - How to run lint/build/tests
    - How to deploy (high-level)

### E0-T2 — Introduce `docs/ARCHITECTURE.md`
- **Priority**: P1
- **Effort**: M
- **Dependencies**: E0-T1
- **Acceptance criteria**:
  - Documents: app router structure, data flow, provider registry, Supabase auth model, CMS/admin model, fitting-room save-progress flow.

### E0-T3 — Enforce a clean repo boundary
- **Priority**: P0
- **Effort**: M
- **Dependencies**: none
- **Notes**: reduce audit noise and tool friction.
- **Acceptance criteria**:
  - Experimental/one-off scripts moved under `scripts/dev-only/` or excluded from lint/type gates.
  - `tmp/` does not affect CI quality gates.

---

## Epic 1 — Quality Gate: lint/typecheck/build = green

### E1-T1 — Add `typecheck` script
- **Priority**: P0
- **Effort**: S
- **Dependencies**: none
- **Acceptance criteria**:
  - `package.json` includes `"typecheck": "tsc -p tsconfig.json --noEmit"`
  - Running `npm run typecheck` succeeds.

### E1-T2 — Reduce lint errors to zero in production paths
- **Priority**: P0
- **Effort**: L
- **Dependencies**: E1-T1
- **Acceptance criteria**:
  - `npm run lint` exits 0 OR
  - a strict-but-realistic approach: lint passes for `app/`, `components/`, `lib/`, `types/`, `features/` while allowing explicitly excluded directories for dev-only scripts.

### E1-T3 — Eliminate `any` in business-critical paths
- **Priority**: P0
- **Effort**: L
- **Dependencies**: E1-T2
- **Acceptance criteria**:
  - No `any` in:
    - `app/api/**`
    - `lib/providers/**`
    - `lib/storage/**`
    - `lib/services/**`
    - `lib/api/**`
  - If exceptions remain, they must be:
    - localized (single line or narrow module)
    - documented with rationale

### E1-T4 — Replace `alert()`/`confirm()` UI usage with a consistent UX pattern
- **Priority**: P1
- **Effort**: M
- **Dependencies**: none
- **Acceptance criteria**:
  - No `alert()` calls in core UX flows
  - Confirmations use your design system (e.g. modal + `sonner` toasts)

---

## Epic 2 — Security hardening (the “senior DevOps won’t laugh” epic)

### E2-T1 — Add rate limiting + abuse controls for AI endpoints
- **Priority**: P0
- **Effort**: L
- **Dependencies**: E1-T2
- **Scope**:
  - `/api/generate`
  - `/api/edit`
- **Acceptance criteria**:
  - Per-IP and/or per-user throttling (e.g., sliding window)
  - Clear error responses (429) and client messaging
  - Provider calls have:
    - timeouts
    - max concurrency
    - safe retries (where appropriate)

### E2-T2 — Add request validation schemas (Zod) for every API route
- **Priority**: P0
- **Effort**: M
- **Dependencies**: E1-T3
- **Acceptance criteria**:
  - All route inputs are validated via Zod (`safeParse`)
  - All route outputs conform to typed response contracts
  - Invalid inputs return 400 with consistent shape

### E2-T3 — Harden Supabase RLS policies (table-by-table)
- **Priority**: P0
- **Effort**: L
- **Dependencies**: E2-T2
- **Acceptance criteria**:
  - Documented ownership rules for:
    - `images`, `bookmarks`, `settings`, `orders`, `profiles`, `fitting_room_progress`
  - Confirm public-read tables are intentional
  - Confirm write policies cannot be abused cross-user/session

### E2-T4 — Secrets and service role key governance
- **Priority**: P0
- **Effort**: M
- **Dependencies**: E2-T3
- **Acceptance criteria**:
  - `SUPABASE_SERVICE_ROLE_KEY` is used only in server-only modules
  - Add docs: never expose service key in client
  - Add CI check to prevent accidental commits of `.env*`

### E2-T5 — Production security headers + CSP strategy
- **Priority**: P1
- **Effort**: M
- **Dependencies**: none
- **Acceptance criteria**:
  - Security headers defined and documented (CSP, HSTS, X-Content-Type-Options, etc.)
  - If inline scripts remain, explicitly documented reasoning and CSP exceptions.

---

## Epic 3 — Observability + reliability (production operations)

### E3-T1 — Replace console logging with structured logging
- **Priority**: P1
- **Effort**: M
- **Dependencies**: E1-T2
- **Acceptance criteria**:
  - Introduce a logger wrapper (levels, redaction)
  - Production builds minimize noisy logs
  - Sensitive data never logged (tokens, keys, PII)

### E3-T2 — Add error boundary + crash reporting strategy
- **Priority**: P1
- **Effort**: M
- **Dependencies**: none
- **Acceptance criteria**:
  - Global error boundary patterns for client
  - Server errors logged with request IDs
  - Optional: integrate a tool (Sentry/etc.) with environment gating

### E3-T3 — Health checks + runtime monitoring plan
- **Priority**: P1
- **Effort**: M
- **Dependencies**: E2-T1
- **Acceptance criteria**:
  - `/api/health` covers provider availability + basic DB connectivity (if applicable)
  - Docs define what “healthy” means
  - Uptime monitor checklist included

---

## Epic 4 — CI + release engineering (repeatable delivery)

### E4-T1 — Add CI workflow (PR gate)
- **Priority**: P0
- **Effort**: M
- **Dependencies**: E1-T2, E1-T1
- **Acceptance criteria**:
  - CI runs:
    - install (`npm ci`)
    - `npm run lint`
    - `npm run typecheck`
    - `npm run build`
    - `npm run test` (once tests exist)
  - CI required for merging to main

### E4-T2 — Add preview deployments (optional but high credibility)
- **Priority**: P1
- **Effort**: M
- **Dependencies**: E4-T1
- **Acceptance criteria**:
  - Each PR creates a preview URL (platform-dependent)
  - E2E smoke tests can run against preview

### E4-T3 — Add production deployment strategy + rollback runbook
- **Priority**: P0
- **Effort**: M
- **Dependencies**: E4-T1
- **Acceptance criteria**:
  - `docs/DEPLOYMENT.md` explains production deploy
  - `docs/RUNBOOK.md` explains rollback + incident handling

---

## Epic 5 — Testing implementation

### E5-T1 — Choose and install a unit test framework
- **Priority**: P0
- **Effort**: S
- **Dependencies**: E1-T1
- **Acceptance criteria**:
  - Either Vitest or Jest configured
  - `npm run test` exists

### E5-T2 — Unit tests: pricing + utils + provider registry
- **Priority**: P0
- **Effort**: M
- **Dependencies**: E5-T1
- **Acceptance criteria**:
  - Tests cover:
    - `calculatePrice` tiers and edge cases
    - provider registry model mapping and missing-model cases

### E5-T3 — Integration tests: API routes
- **Priority**: P1
- **Effort**: M
- **Dependencies**: E2-T2, E5-T1
- **Acceptance criteria**:
  - `/api/generate` validation errors tested
  - provider unavailable path tested
  - consistent error shape tested

### E5-T4 — E2E smoke tests (Playwright)
- **Priority**: P1
- **Effort**: L
- **Dependencies**: E4-T2 (if running in preview) OR local E2E harness
- **Acceptance criteria**:
  - Basic journeys:
    - open `/davinci`
    - generate (mock provider)
    - bookmark
    - open fitting room
    - save progress (mock storage)

---

## Epic 6 — Data + typing correctness (Supabase types + migrations)

### E6-T1 — Regenerate Supabase types and remove `[key: string]: any` tables
- **Priority**: P0
- **Effort**: M
- **Dependencies**: E2-T3
- **Acceptance criteria**:
  - `types/database.ts` is accurate for `orders`, `settings` and other weak tables
  - TypeScript can enforce insert/update shapes without `as any`

### E6-T2 — Create “bootstrap / seed” procedure for CMS-required assets
- **Priority**: P0
- **Effort**: M
- **Dependencies**: none
- **Acceptance criteria**:
  - `docs/CMS_BOOTSTRAP.md` explains:
    - required buckets
    - required CMS tables
    - minimum dataset for app to work (models, presets, etc.)
  - Optional seed script for dev/staging.

---

## Epic 7 — Performance + frontend production polish

### E7-T1 — Replace or justify `<img>` usage (image optimization strategy)
- **Priority**: P1
- **Effort**: M
- **Dependencies**: none
- **Acceptance criteria**:
  - Highest-LCP surfaces use optimized image strategy
  - Clear rules when to use `<img>` (data URLs, canvas snapshots, etc.)

### E7-T2 — Define performance budgets + measure them
- **Priority**: P1
- **Effort**: M
- **Dependencies**: E4-T1
- **Acceptance criteria**:
  - Baseline metrics captured (LCP/INP/CLS)
  - Documented targets and monitoring approach

### E7-T3 — Reduce client-component footprint where possible
- **Priority**: P2
- **Effort**: L
- **Dependencies**: none
- **Acceptance criteria**:
  - Non-interactive sections migrated to Server Components
  - 3D and admin chunks lazy-loaded with clear boundaries

---

## Epic 8 — Business/commerce reality check (to avoid “demo project” perception)

### E8-T1 — Mark demo-only commerce as demo-only OR build real payment flow
- **Priority**: P1
- **Effort**: L
- **Dependencies**: none
- **Acceptance criteria**:
  - Either:
    - “Demo mode” is explicit and safely sandboxed, or
    - real payment provider integration exists with proper webhook handling and order states

### E8-T2 — Product/legal basics (for real commercialization)
- **Priority**: P2
- **Effort**: M
- **Dependencies**: none
- **Acceptance criteria**:
  - Add `docs/PRIVACY.md` + `docs/TERMS.md` placeholders
  - Clarify AI content policy and user content ownership

---

## Suggested backlog order (the fastest path to higher valuation)
1. **Epic 1** (lint/type/build green) + **Epic 4** (CI gate)  
2. **Epic 2** (security: rate limits + RLS + validation)  
3. **Epic 5** (tests)  
4. **Epic 6** (typing + bootstrap)  
5. **Epic 3** (observability) + **Epic 7** (performance)  
6. **Epic 8** (commerce/legal)

---

## Definition of Done (global)
A task is done only when:
- It has acceptance criteria verified
- Docs updated if behavior/config changed
- It is covered by tests where appropriate
- CI is green

