# Tests, CI, Deployment Scaffold (and what “Deployment” means)
This document explains the practical engineering pieces that typically sit around a web app so it’s **ship-ready and maintainable** in a team/business context.

---

## 1) What are “tests”?
**Tests** are automated checks that verify your code behaves correctly.

### Why teams use tests
- **Regression protection**: prevents “it worked yesterday” bugs after changes.
- **Confidence to refactor**: you can improve code structure without fear.
- **Documentation**: tests show intended behavior (especially for edge cases).
- **Faster reviews**: reviewers can focus on architecture/UI instead of manually re-testing everything.

### Common test types (practical)
#### Unit tests
Test a small piece of logic in isolation.
- Examples in this project:
  - Pricing functions like `calculatePrice(...)`
  - Utility functions (formatters, validators)

#### Integration tests
Test multiple pieces working together.
- Examples:
  - API route `/api/generate` calling provider registry and returning expected shape
  - Supabase session manager flows (save image → load image)

#### End-to-end (E2E) tests
Test the app like a user in a real browser.
- Examples:
  - Open `/davinci`, generate an image, see it appear, open modal, bookmark it
  - Admin login → open `/admin/gallery` → create/update item

#### Visual regression tests (optional but relevant for this UI)
Since your app is UI/UX-heavy (motion, layout, 3D), teams sometimes snapshot pages/components to detect unintended visual changes.

### What tests are *not*
- They’re not a replacement for manual QA, but they reduce how much manual QA you must do.
- They don’t automatically prove “no bugs exist”; they prove “the behaviors we cared to encode still work.”

---

## 2) What is CI?
**CI** stands for **Continuous Integration**.

In plain terms: CI is an automated robot that runs checks (lint, typecheck, build, tests) **on every push / pull request**, so problems are caught early.

### Why CI matters
- **Consistent quality gate**: every contributor must pass the same checks.
- **Stops broken main branch**: prevents merges that break production builds.
- **Saves time**: avoids “works on my machine” surprises.

### Typical CI checks for a Next.js + TypeScript app
- `npm ci` (clean install)
- `npm run lint`
- `npm run build`
- `npm run test` (unit/integration)
- (optional) E2E tests (Playwright/Cypress) on a preview deployment

### Where CI lives
Usually in `.github/workflows/*.yml` if you use GitHub Actions, or similar pipelines for GitLab CI, CircleCI, etc.

---

## 3) What is “deployment”?
**Deployment** is the process of taking your code and running it in an environment where real users can access it (a URL).

### “Deployment” includes more than “upload code”
A real deployment usually includes:
- **Building** the app (e.g. `next build`)
- **Running** the server (or hosting the output)
- **Setting environment variables** (API keys, Supabase keys, secrets)
- **Configuring domains** (e.g. `davinci.yourdomain.com`)
- **Setting SSL/TLS** (HTTPS)
- **Monitoring/logging** (so you can debug issues)

### Common deployment targets for Next.js
- **Vercel**: most common for Next.js; simplest path.
- **Node server on a VPS** (DigitalOcean, AWS EC2, etc.): you manage more.
- **Containers** (Docker) running on a platform (AWS ECS, Render, Fly.io, etc.).

### Typical environments
- **Local**: your dev machine.
- **Staging/Preview**: a “pre-production” environment to test changes safely.
- **Production**: what real users use.

---

## 4) What is “deployment scaffolding”?
**Deployment scaffolding** is the set of repo files/config that makes deployment **repeatable** and **low-risk**.

Think of it as: “If a new engineer joins tomorrow, can they deploy the app reliably without tribal knowledge?”

### Examples of deployment scaffolding
- **Environment templates**: `env.template` (you have this) + clear docs for required variables.
- **Hosting config**:
  - `vercel.json` (Vercel-specific config)
  - `Dockerfile` and `docker-compose.yml` (container deployment)
- **CI workflows**:
  - `.github/workflows/ci.yml` (lint/build/test on PRs)
  - `.github/workflows/deploy.yml` (optional auto-deploy)
- **Scripts**:
  - `npm run typecheck` (separate from lint)
  - `npm run test`
- **Database migration process**:
  - how to apply `supabase/migrations/*`
  - how to set up storage buckets/policies

### Why it affects “project worth”
When a buyer acquires a project, missing scaffolding means they must spend time/money to:
- set up CI checks
- set up deployment environments
- build a release process
- add monitoring/alerting

That effort reduces the “as-is” purchase price, even if the app looks great and works locally.

---

## 5) Why can lint fail while the app still “works smoothly”?
This is normal.

### Linting vs building vs running (important distinction)
- **Linting** (`eslint`): a *quality* tool. It flags risky patterns and style issues (e.g. `any`, unused vars, prefer-const).
  - Lint errors do **not** necessarily stop the app from running.
  - Whether they block CI depends on your rules (in your repo, lint currently fails).

- **Build** (`next build`): compiles the app for production. It can succeed even if lint fails if lint is not enforced during build, or if you don’t run lint as part of build.

- **Runtime** (`next dev`): dev server is forgiving; it can run despite many quality issues.

### Why teams still care
Lint failures are a signal of:
- maintainability risk (harder to extend safely)
- increased bug probability (especially around `any`)
- onboarding friction (harder for new devs to understand boundaries)

So “web app works smoothly” can be true, while “project isn’t cleanly gated for team shipping” is also true.

---

## 6) What CI + tests would look like for this repo (practical suggestions)
This is a typical incremental setup (not all at once).

### Minimal CI (fast, high value)
- Install deps (`npm ci`)
- Lint (`npm run lint`)
- Build (`npm run build`)

### Add unit/integration tests next
Common choices:
- **Vitest** (fast for TypeScript)
- **Jest** (very common)

Start with:
- pricing calculator tests (`lib/pricing/*`)
- provider registry shape tests (`lib/providers/*`)
- session manager tests (mock Supabase calls)

### Add E2E tests when flows stabilize
Common choice:
- **Playwright**

Example E2E flow:
- visit `/davinci`
- generate (mock provider)
- assert image appears
- open modal
- bookmark

---

## 7) A note about “assets will be added through CMS”
That’s totally valid as a product strategy.

However, for someone *buying the repo*, the expectation is usually:
- either the repo includes minimal fallback assets (so it runs out-of-the-box), **or**
- the repo includes clear “bootstrap steps” + seeds so the CMS can populate required assets immediately.

If you plan “all assets live in Supabase storage via CMS,” that’s fine—just document:
- which buckets must exist
- which CMS tables must be populated
- what “minimum dataset” is needed for the 3D experience (models, thumbnails, fallback images)

---

## 8) Glossary (quick)
- **Lint**: static rules to keep code quality consistent.
- **Typecheck**: TypeScript compile checks for type safety.
- **CI**: automated checks on every push/PR.
- **CD** (Continuous Deployment): automatically deploy when CI passes (optional).
- **Deployment**: releasing your app to a user-accessible environment.

