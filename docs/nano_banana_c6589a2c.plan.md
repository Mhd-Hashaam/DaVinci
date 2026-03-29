---
name: Nano Banana
overview: Create a production-grade integration of Gemini Nano Banana into your Next.js + React + TypeScript shirt-graphics web app, including prompt engineering guardrails, security/rate-limit controls, and a free-tier testing harness (small quota, sequential generation).
todos:
  - id: epic1-route-contract
    content: Create/replace the server-only generation route (e.g. `app/api/nanobanana/generate/route.ts`) with POST handler, `zod` input validation, and a strict allow-list for Nano Banana model ids.
    status: pending
  - id: epic2-gen-config
    content: "Implement Gemini call using official image generation config: `responseModalities` and `generationConfig.imageConfig` (`aspectRatio`, `imageSize`). Default free-test mode caps `imageSize='512'`."
    status: pending
  - id: epic3-inlineData-parse
    content: Parse Gemini response parts for `inlineData` and convert to `data:` URL or upload to storage; implement stable response shape and error codes.
    status: pending
  - id: epic4-safety-blocks
    content: Add per-request safety settings + block handling using `promptFeedback.blockReason` and candidate safety/finishReason. Return user-friendly errors without leaking raw provider details.
    status: pending
  - id: epic5-prompt-engineering
    content: Add `lib/prompt/buildShirtGraphicPrompt.ts` with structured prompt templates + a policy layer (do/don’t rules, positive framing, IP-safe clauses, optional text rendering rules).
    status: pending
  - id: epic6-quota-free-test
    content: "Add `FREE_TEST_MODE` harness: per-session generation caps, sequential execution (`concurrency=1`), cooldown between calls, and local call counting to avoid quota overrun."
    status: pending
  - id: epic7-security-rate-limit
    content: Add rate limiting middleware/util for `/api/nanobanana/generate` (per IP and optionally per user), plus request timeouts and max payload/prompt length enforcement.
    status: pending
  - id: epic8-cache
    content: Implement caching keyed by prompt+style+aspectRatio+imageSize (in-memory for dev; DB/storage for prod) to reduce unnecessary free-tier calls.
    status: pending
  - id: epic9-tests
    content: "Add unit/integration tests: prompt builder correctness, zod validation, and integration tests mocking Gemini responses for both success and safety-block cases."
    status: pending
  - id: epic10-docs
    content: "Write a complete guide doc: `docs/NANO_BANANA_INTEGRATION_GUIDE.md` covering integration steps, prompt engineering for shirt graphics, security rules, and free-tier testing instructions."
    status: pending
isProject: false
---

## Goal

Integrate Gemini “Nano Banana” image generation (no subscriptions; test with free-tier limits) into a Next.js (App Router) + React + TS app so you can reliably generate shirt graphics and do prompt engineering safely.

## Key research findings (used in this plan)

- Nano Banana models in the Gemini API:
  - Nano Banana (basic): model id `gemini-2.5-flash`
  - Nano Banana 2: model id `gemini-3.1-flash-image-preview`
  - Nano Banana Pro: model id `gemini-3-pro-image-preview`
  Source: [Nano Banana image generation doc export](#) from DeepMind.
- Gemini image generation request shape supports:
  - `responseModalities` in generation config
  - `imageConfig` with `aspectRatio` and `imageSize`
  Example fields from official docs:
  - `imageConfig.aspectRatio`: e.g. `16:9`, `1:1`, `9:16`, and also `21:9`
  - `imageConfig.imageSize`: one of `512`, `1K`, `2K`, `4K` (your free test should cap at `512`)
  - `responseModalities`: `['TEXT','IMAGE']` or `['IMAGE']`
  Sources: [Gemini image generation](https://ai.google.dev/gemini-api/docs/image-generation), [Gemini safety settings](https://ai.google.dev/gemini-api/docs/safety-settings)
- Safety handling should use:
  - `promptFeedback.blockReason` for blocked prompts
  - candidate safety ratings / finishReason when blocked
  Source: [Safety settings](https://ai.google.dev/gemini-api/docs/safety-settings)
- Prompt engineering should follow Nano Banana best practices:
  - Be specific with subject/action/location/composition/style
  - Use positive framing (describe what you want instead of what you don’t)
  - Use “creative director” style directives (lighting, camera, materiality)
  Source: [Ultimate Nano Banana prompting guide](https://cloud.google.com/blog/products/ai-machine-learning/ultimate-prompting-guide-for-nano-banana)

## Implementation design (recommended)

### A) Backend: single server-only generation endpoint

1. Create a Next.js route (server) that:
  - Validates inputs with `zod`
  - Enforces model allow-list (only Nano Banana model ids)
  - Enforces a strict prompt policy (length, forbidden patterns, quota)
  - Implements rate limiting (per IP/user) + sequential generation in free-test mode
  - Calls Gemini from server only (never from client)
  - Uses Gemini image generation config with `imageConfig` and `responseModalities`
  - Parses returned inlineData and returns an image (data URL or uploaded URL)
  - Handles safety blocks gracefully

### B) Prompt engineering layer (shirt graphics)

Create a `buildShirtGraphicPrompt()` function that transforms:

- `userPrompt` (free-form) + chosen “style preset” + constraints into a structured generation prompt.

The prompt should include:

- Subject definition (what the shirt graphic is)
- Composition constraints (centered print, bleed-safe margins)
- Print constraints (flat colors / screen-print friendly instructions)
- IP-safe constraints (explicitly disallow brands/logos/character likeness if you want a strict business posture)
- Optional text instructions (if you allow text, require a font description + exact text in quotes)
- Background constraints (e.g. “transparent background” or “plain solid background”) based on your pipeline

Also implement `negativeConstraints` as *positive omissions* (because Gemini doesn’t reliably support a “true negative prompt” across all image APIs; implement it as a phrase in the prompt like “avoid X, avoid Y”).

### C) Free-tier testing harness

Because you want to test with free limits:

- Add a “free-test mode” configuration:
  - cap `imageSize` to `512`
  - restrict `maxGenerationsPerSession` (e.g. 2-5)
  - force `concurrency=1`
  - optionally add a cooldown timer between requests
- Track your own call count for safety.
  - Gemini/free-tier remaining allowance is not reliably queryable via an endpoint; the practical approach is local tracking + checking quota in Google AI Console.

## Prompt templates (shirt graphics)

### 1) No-text t-shirt graphic (recommended for first version)

Use this base structure:

- “Create a screen-print-ready shirt graphic:”
- Specify: style (vector/flat/retro/abstract), subject, color palette count, lighting (studio lighting), composition (centered, facing front), background (transparent or plain)
- Add safety/IP clause:
  - “Do not include any brand logos, trademarks, or copyrighted characters.”

Example user-facing template:

- User prompt: `cyber cat playing guitar`
- Built prompt (conceptually):
  - “Create an original t-shirt graphic of a cyber cat playing guitar. Centered composition, bold readable shapes, flat color blocks, limited palette (max N colors), high contrast, clean edges, no gradients, no background (transparent). Do not include any brand logos, names, or copyrighted characters. The design must be suitable for 2-color and 4-color screen printing.”

### 2) Text t-shirt graphic

If you allow text:

- Always wrap desired words in quotes
- Provide typography instructions and layout
- Force legibility:
  - “Render crisp, legible text that is readable at 10–15cm print size.”

## Security rules (do not leave loopholes)

1. Never accept arbitrary model ids from the client. Use an allow-list.
2. Validate all request fields (prompt length, aspectRatio allowed values, imageSize allowed values).
3. Rate limit `/generate` and `/edit` endpoints.
4. Enforce request timeouts and max output size.
5. Apply safety settings per request where possible.
6. Redact sensitive data in logs.
7. Consider prompt “policy filters”:
  - block or refuse prompts containing: brand names, copyrighted character keywords (depending on your business policy), or disallowed content categories.
  - return a user-friendly “blocked” message.
8. Avoid returning raw Gemini error strings to the client. Map errors to stable error codes.

## Test plan

- Unit tests:
  - prompt builder generates correct structure
  - zod validation rejects invalid aspectRatio/imageSize
  - safety-block mapping returns correct error codes
- Integration tests:
  - mock Gemini response: inlineData present vs missing
- Manual smoke tests on free-tier:
  - sequential generation with imageSize `512`
  - confirm no crashes and correct UI behavior when Gemini blocks content

## Deliverables

- Production-grade API route for Nano Banana generation
- Prompt engineering module + templates for shirt graphics
- Free-tier testing guardrails
- Security controls + safety handling
- Unit/integration tests
- Documentation guide: `docs/NANO_BANANA_INTEGRATION_GUIDE.md`

---

## Suggested next step

Implement Epic-by-epic in this order:

1. Backend endpoint + prompt builder + validation
2. Safety handling + rate limits + free-test mode caps
3. Caching/quota tracking
4. Tests
5. Documentation

