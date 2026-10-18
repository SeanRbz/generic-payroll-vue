# CLAUDE.md

Guidance for Claude Code when working in this repository.

## What this is

**Generic Payroll**: a project for exploring how to build a payroll and DTR (Daily Time Record) checking system. It is a local Vue 3 single-page app built around the *Payroll Generator → Batch Generator* screen, plus its two modals (**Email Token Configuration** and **Recipient Directory & Staff List**). It runs locally, and a demo build is deployed on Vercel (see "Vercel" below).

## Scope: read this first

This is **mostly front-end so far** (fixtures and inert controls), with one deliberate exception: **Gmail sign-in and a real test email** (see "Gmail sign-in" below).

- No backend APIs, no persistence, no spreadsheet parsing, no payslip dispatch. The only network calls are Google Identity Services, the Google userinfo/revoke endpoints and the Gmail `messages/send` endpoint, and only from the Email Token modal. Don't add other network calls.
- All data comes from typed fixtures in `src/models/*/data` (and `src/models/shared`); nothing is hard-coded in templates.
- **The sample ("test") data is live.** It was commented out for a while, so every page started empty, and was restored on 2026-10-17. `ledgerRows`, `employees` and `recipients` hold the demo records again, and `batchSummary`, `metrics`, `masterlistSummary`, `recipientStats` and the Cycle Overview data hold the demo figures. The empty-state UI was kept (see below), so clearing a fixture shows that table's empty state again.
- **Email relay is Gmail-only.** In `models/email-token/data/relayProviders.ts`, MS 365 and Custom SMTP carry `disabled: true` (greyed out, unselectable, "Unavailable") and Gmail carries `usesSignIn: true` (the sender and credential fields are greyed out because they come from the Gmail sign-in). Each provider also has a `transport` label shown in the test panel. To enable a provider again, drop its `disabled` flag; to make the fields editable, drop `usesSignIn`. The Gmail compliance note describes what the code really does (OAuth, token in memory, revoked on sign-out). Don't describe it as encrypted credential storage; nothing is stored.
- Every table still renders a proper empty state when it has no rows (`TableEmptyRow`, "No source loaded", "Not configured", disabled dispatch). Keep it working. Never put sample rows in templates.
- **Component specs must not depend on app fixtures.** Table, chart and header specs pass their own tiny `TEST …` records through props, and the table specs cover the empty state. Page and ViewModel specs may import the fixtures, but they derive expected values from them (`formatPeso(metric.value)`, `rows.length`) instead of hard-coding sample numbers.
- Buttons such as *Import Excel / CSV*, *Generate & Dispatch Payroll* and the ledger filters/pager are **intentionally inert**. Don't add handlers that imply work happened (no fake toasts or fake "saved" states). The email-token buttons are the exception and are real: *Sign in with Google*, *Sign out*, *Generate/Regenerate Token* (re-runs sign-in), *Send Test Dispatch*. *Save & Verify Token* is enabled only while signed in and just closes the modal, because the live session is the token.
- Three screens are real: `/cycle-overview` (the landing page, `DEFAULT_ROUTE_PATH` in `config/navigation.ts`; KPI cards plus bar graphs of personnel, lost hours and the payable mix), `/batch-generator` and `/employee-records` (Employee Masterlist & Compensation Directory). Every other navigation path renders `ComingSoonView`.
- **Cycle Overview figures are illustrative sample data** (the per-bureau Regular/COS split, the target hours and the fund names). Every total is derived from its rows in `models/cycle-overview/data`, so the cards and charts cannot disagree. A pipeline stepper and an exceptions table are planned but not built.
- GSIS / Pag-IBIG / PhilHealth have no sidebar entry of their own. Their identity numbers live in the Employee Masterlist table.
- Planned, not built: spreadsheet upload (feeds Recipients and the Masterlist import), payslip dispatch through the Gmail session, the remaining pages.

## Gmail sign-in

Real Google sign-in (Google Identity Services **token model**, browser only) plus a real test email through the Gmail API. The model (session and services) lives in `src/models/email-token/`, its ViewModels in `src/viewmodels/email-token/` and the modal UI in `src/views/email-token/`.

- `models/email-token/services/googleIdentity.ts` loads `https://accounts.google.com/gsi/client` on demand and wraps `initTokenClient` / `revoke`. `services/gmailApi.ts` builds the RFC 2822 message (base64url `raw`), fetches the profile and calls `users/me/messages/send`. Both throw typed errors (`GoogleSignInError`, `GmailApiError`) with user-facing messages.
- `models/email-token/gmailSession.ts` is the single source of truth, and it is a **model**, not a ViewModel: `createGmailSession(deps)` returns `status`, `account`, `expiresAt`, `error`, `signIn`, `signOut`, `sendTestEmail`, `prepare`. `App.vue` creates **one** session and `provide`s it with `gmailSessionKey`, so the toolbar tile and the modal always agree. ViewModels read it with `useGmailSession()` (throws if not provided); views never inject it themselves. `useEmailTokenViewModel` (modal), `useGmailSignInViewModel` (sign-in panel) and `useTestDispatchViewModel` (test-recipient form state, composed by the modal's ViewModel) live in `viewmodels/email-token/`.
- **The access token never leaves the session closure.** It is not in a ref, in a ViewModel, in `localStorage`/`sessionStorage`, in the URL, in logs or in props. It is revoked on sign-out, when a new sign-in replaces it, and when the profile lookup fails; on expiry or a 401 it is just dropped (it is already dead). Keep it that way.
- Scopes are minimal: `openid`, `userinfo.email`, `userinfo.profile`, `gmail.send` (send-only; can't read mail). If the user doesn't tick the send permission, sign-in fails with `scope-denied`.
- The session expires after about one hour (no refresh token without a backend). A timer clears it with a message; a 401 from Gmail does the same.
- `VITE_GOOGLE_CLIENT_ID` is the only config. It is public, so it is fine in `VITE_*`. A client secret must never be added. With no client ID the panel explains how to enable sign-in and the button is disabled.
- **Tests never touch Google.** Inject `GmailSessionDeps` fakes in service/session specs, and use `createFakeSession()` + `provideSession()` from `src/models/email-token/__tests__/fakeSession.ts` in ViewModel, component and page specs. The real OAuth round trip is only verifiable by hand with a real Client ID.

## Commands

```bash
npm run dev          # http://localhost:5173
npm run build        # type-check + production build
npm run preview      # serve the production build
npm run type-check   # vue-tsc --build (app, node and test projects)
npm run lint         # oxlint + eslint with autofix; scoped to src/ and *.config.ts
npm run format       # prettier --write src/
npm run test:unit    # vitest in watch mode
npx vitest run       # one-off run
npx vitest run src/views/components/ui/__tests__/BaseModal.spec.ts -t "keeps Tab"   # a single test
```

Before calling work done: `npm run type-check && npm run lint && npx vitest run && npm run build-only`.

### Docker

```bash
docker compose --env-file env/.env.local up --build -d   # http://localhost:8080
docker compose down
```

- `Dockerfile` is two stages: `node:24-alpine` runs `npm ci` + `npm run build` (type-check included), then `nginxinc/nginx-unprivileged` serves `dist/` on 8080 as a non-root user. `nginx.conf` does the history-mode fallback, long-cache for `/assets/`, no-cache for `index.html`, and `/healthz`.
- `VITE_*` settings are **build args** (listed in the Dockerfile and `docker-compose.yml`), because Vite bakes them into the bundle. A new `VITE_*` variable must be added in three places: `env.d.ts`, the Dockerfile `ARG` list and the compose `args`. Never pass secrets as build args.
- `.dockerignore` excludes `env/`, so local env files never enter the build context. Don't remove that line.
- nginx locations use `expires` rather than `add_header` for caching, because `add_header` in a location silently drops the server-level security headers.
- If you change anything under `docker-compose.yml`'s hardening (`read_only`, `cap_drop`), re-run the container and check `docker compose ps` shows `healthy`.

### Vercel

- Deployed at https://generic-payroll-vue.vercel.app. Vercel runs `npm run build` and serves `dist/`.
- `vercel.json` mirrors `nginx.conf`. Its rewrite is the history-mode fallback: every path that isn't a real file goes to `/index.html`, except `/assets/`, so a missing chunk still 404s. Without it, opening or refreshing any route other than `/` returns Vercel's `404 NOT_FOUND`. Don't remove it, and keep the `assets/` exclusion. It also sets the same three security headers as nginx and a one-year immutable cache on `/assets/`. If you change the headers in one file, change the other too. Never add COOP `same-origin` (it breaks the Google sign-in popup); there is no CSP on either host yet.
- `VITE_*` values go in the Vercel project's environment variables (build-time, public). The Vercel origin must be in the OAuth client's Authorized JavaScript origins for Gmail sign-in to work there. Register the production domain only, not every preview URL.

## Architecture

The app is **MVVM**: models hold the domain, ViewModels turn it into page state and commands, views render it.

```
src/
  App.vue                 # composition root: creates the Gmail session (a model), provides it, then <AppShell><RouterView/></AppShell>
  main.ts                 # createApp + router + global CSS
  models/                 # M: domain types, fixtures, domain rules, API services, session state. No Vue components.
    batch-generator/      # types.ts, data/{batchSummary,filters,ledgerRows,metrics}.ts
    cycle-overview/       # types.ts, data/cycleOverview.ts, disbursement.ts, lostHours.ts (pure domain rules)
    email-token/          # types.ts, data/{relayProviders,tokenConfig}.ts, gmailSession.ts, services/{googleIdentity,gmailApi}.ts, __tests__/fakeSession.ts
    employee-masterlist/  # types.ts, data/{employees,filters,guidelines,masterlistSummary}.ts
    recipients/           # types.ts, data/{recipients,recipientStats}.ts
    shared/organization.ts  # fixtures shared by several features (bureau options)
  viewmodels/             # VM: one composable per page/modal, use<Name>ViewModel(); reads models, exposes state + commands, no DOM
    batch-generator/useBatchGeneratorViewModel.ts
    cycle-overview/useCycleOverviewViewModel.ts
    employee-masterlist/useEmployeeMasterlistViewModel.ts
    email-token/          # useEmailTokenViewModel.ts, useGmailSignInViewModel.ts, useTestDispatchViewModel.ts
    recipients/useRecipientDirectoryViewModel.ts
  views/                  # V: .vue templates bound to a ViewModel (pages, modals) or to props (leaf components)
    pages/                # BatchGeneratorView, CycleOverviewView, EmployeeMasterlistView, ComingSoonView
    batch-generator/ cycle-overview/ email-token/ employee-masterlist/ recipients/   # feature view components
    components/ui/        # generic primitives (BaseModal, MetricsGrid/MetricCard, PagerNav, ChartCard, …), no feature knowledge
    components/layout/    # header, top nav, sidebar, NavLink
    layouts/AppShell.vue  # fixed header + sidebar + <main>
    composables/useDialogBehavior.ts  # view-only DOM behaviour (focus trap, scroll lock), not a ViewModel
  types/ui.ts             # presentation contract types shared by fixtures and views (Metric, BadgeTone, SelectOption, …)
  config/                 # env.ts (typed VITE_*), navigation.ts, shell.ts
  router/                 # createAppRouter() factory + RouteMeta typing; implementedViews → @/views/pages/*.vue
  utils/                  # pure functions (format, pagination, chart)
  assets/styles/main.css  # Tailwind v4 import, fonts, @theme design tokens
```

- **Dependency direction is views → viewmodels → models.** Models never import viewmodels or views. ViewModels never import `.vue` files. `config/`, `types/` and `utils/` can be used from any layer. `App.vue` is the composition root, outside the layers: it is the one `.vue` file that imports a model at runtime, to create the Gmail session.
- **Views never import runtime values from `models/`**: no fixtures, services, session or pure model functions. `import type` from `models/` is fine, and so are the `utils/` formatters. Pages and modals (and a stateful panel with its own ViewModel, such as `GmailSignInPanel`) get their state and commands from their ViewModel. Leaf components stay props-in / events-out; filter options and similar lists are passed in as props, not imported.
- **ViewModels own the page state.** Each page or modal has a `use<Name>ViewModel()` composable in `src/viewmodels/<feature>/`. It reads the fixtures and the session (`useGmailSession()`), derives presentation state with `computed`, and owns UI state such as "which modal is open" (`useBatchGeneratorViewModel`) plus the commands. When real data arrives, swap the fixture import inside the ViewModel (or behind a model repository). Views don't change.
- **Pages stay thin.** A page in `views/pages/` calls its ViewModel, passes the state down as props and wires child events to its commands. Child components don't change when the data source does.
- **Navigation is data.** `config/navigation.ts` is the single source for the top tabs and sidebar. `router/index.ts` builds one route per unique path. A path renders its real view only if it is listed in `implementedViews`; everything else gets `ComingSoonView`. To ship a page: create the view in `views/pages/`, its ViewModel in `viewmodels/<feature>/`, then register the view in `implementedViews`.
- **One modal primitive.** `BaseModal` (teleported to `body`) handles `role="dialog"`, labelling, Esc/backdrop/✕ close, focus move + return, Tab trap and body scroll lock (via `views/composables/useDialogBehavior`). Both feature modals compose it. Don't re-implement dialogs.
- **Charts are plain HTML/CSS, with no chart library.** `ChartCard` gives every chart a labelled section, a legend/footer slot and a collapsed "View as table" twin. `ChartTooltip` is the hover/focus tooltip, shown by a `group/mark` parent. Marks follow the `dataviz` skill: bars at most 24px thick, 4px rounded data end only, 2px gaps between segments, a legend whenever there are two or more series, and text in ink tokens, never the series colour. Bar maths lives in `utils/chart.ts` (`percentOf`, `percentReduction`).
- **Pinia is deliberately not installed.** Add it when real cross-feature state appears (uploaded roster, saved token config). Follow the `vue-pinia-best-practices` skill when you do.

## Conventions

- `<script setup lang="ts">`; SFC order is script → template → style; PascalCase component names.
- Typed props with `defineProps<{...}>()` and Vue 3.5 reactive destructure; typed emits; `defineModel` for `v-model`; never mutate props.
- `shallowRef` for primitives, `computed` for anything derivable, ViewModels for page/modal state and commands, composables for other stateful/side-effect logic.
- ViewModels are named `use<Name>ViewModel()`, expose state (refs, computeds) and commands (functions), and never touch the DOM. DOM-only behaviour (focus, scroll lock) belongs in `views/composables/`.
- Split a component once it has more than one responsibility. Keep pages as composition surfaces.
- **Design tokens live in `main.css` `@theme`.** Use token classes (`bg-surface-container-low`, `text-on-surface-variant`, `font-label-code`, `px-gutter-desktop`, `gap-space-md`). Don't hard-code hex values.
  - ⚠️ This theme overrides radii: `rounded-sm` = 2px, `rounded-lg` = 4px, `rounded-xl` = 8px (not Tailwind's defaults). `rounded-full` is a true circle/pill.
  - `top-header`, `pt-header` (7.75rem) and `w-sidebar`, `pl-sidebar` (16rem) are theme spacings for the fixed chrome.
- **Icons:** `<MaterialIcon name="…" />` with a Material Symbols ligature name; size it with `text-[18px]`-style classes. The icon CSS is imported into `layer(components)` so utilities win. Unlayered icon CSS would override them.
- **Money:** keep amounts as numbers in fixtures and format with `formatPeso` / `formatNumber` (`en-PH`). Never let an amount clip; `MetricCard` sizes its value with a container query for that reason.
- **Env:** `VITE_*` values are compiled into the client bundle and are public. Never put SMTP passwords, app tokens or keys in them. The env files live in `env/` (`envDir: 'env'` in `vite.config.ts`, so `.env.development` and `.env.local` go there, not in the project root). `env/*` is git-ignored except the `env/.env.example` template. Variables are typed in `env.d.ts` and read through `config/env.ts`. The credential field in the token modal is a disabled placeholder ("Managed by Google sign-in"); no password or app token is ever collected.
- **Tests** live in `__tests__/` folders next to the code. That matches the scaffold's ESLint/tsconfig globs, and `eslint.config.ts` is guarded by a config-protection hook, so don't widen the globs. Model specs (services, session, domain rules, fixtures) sit under `src/models/`. ViewModel specs go in `src/viewmodels/<feature>/__tests__/`; when the ViewModel needs the session, call it from a tiny host component mounted with `global: { provide: provideSession(createFakeSession()) }` (both from `src/models/email-token/__tests__/fakeSession.ts`). Component and page specs go in `src/views/**/__tests__/`, and component specs still pass their own `TEST …` records instead of importing app fixtures. Stub the teleport (`global: { stubs: { teleport: true } }`) when mounting modals. After mounting a modal, `await nextTick()` before moving focus, since the modal focuses its panel on the next tick.

## Skills to use

The Vue plugins are enabled in `.claude/settings.json` (installed in the user plugin cache, not copied into this repo):
`vue-best-practices`, `vue-router-best-practices`, `vue-pinia-best-practices`, `vue-testing-best-practices`, `vue-debug-guides`. The UI-design skills (`ui-ux-pro-max`, `design-system`, …) are copied into `.claude/skills/`.

## ECC reviewers (required every session)

The ECC plugin's hooks run on their own, but its agents do not. Use them without being asked: before reporting work done, run the matching agent on the files you changed. Naming them here is the standing instruction to start them.

- `ecc:vue-reviewer` for any `.vue` or Vue-related `.ts` change.
- `ecc:security-reviewer` for anything touching Gmail / Google sign-in (`src/models/email-token/`, `src/viewmodels/email-token/`, `src/views/email-token/`), env handling, `vite.config.ts`, the Dockerfile or nginx config, or dependencies.
- `ecc:build-error-resolver` when `type-check` or the build fails.
- This is a git repo (see "Known notes"), so diff-based reviews (`/ecc:code-review`) can review uncommitted changes against `HEAD`. Still give the agent the changed file paths and a short description of what changed and why, so it reviews your change rather than the whole working tree.
- Run reviewers in parallel, apply the real findings, and say in the final reply what each one found. Skipping them is only fine for a pure docs or comment edit, and say so when you skip.

## Design notes

The design tokens live in `main.css` `@theme`. Deliberate layout choices:

- Header offset is 7.75rem (7.5rem clipped the cycle tag under the nav).
- Native scrollbars are kept visible.
- The Recipients modal is `3xl` wide so all six columns fit without clipping.
- Metric values scale with a container query instead of overflowing at ~1280px.

The Employee Masterlist uses SSL VI compensation with PERA, and its row actions are quick edit, audit history and details. The statutory rules come from public sources (GSIS 9%/12%, HDMF Circular 460 ₱10,000 ceiling, PhilHealth 5%). The salary figures are sample values, not an official salary schedule; check them against the current SSL tranche before treating them as real. The sidebar deliberately has no GSIS / Pag-IBIG / PhilHealth entry.

## Known notes

- `npm install` prints `EBADENGINE` warnings (jsdom's transitive deps ask for Node ≥ 24.15). They're harmless on 24.14; tests run fine.
- `npm audit` reports `braces` ReDoS findings reachable only through the ESLint toolchain (dev-only, not shipped). Don't `audit fix --force`; it downgrades `@vue/eslint-config-typescript`.
- The Material Symbols font is one ~4 MB variable woff2. Fine locally; subset it before any real deployment.
- This directory is a git repository: branch `master`, remote `origin` at github.com/SeanRbz/generic-crm-vue. The `package.json` name and the Docker image (`generic-payroll-vue:latest`) say `generic-payroll-vue`; only the GitHub repo slug and the local folder name still say `generic-crm-vue`.
- Dev-mode obfuscation (`obfuscateDevModules` in `vite.config.ts`) is a deterrent, not a boundary, same as the release build. `?raw` module requests return the plain source by design (the obfuscator can't hide a string value), and `vite-plugin-vue-devtools` bundles `vite-plugin-inspect`, which keeps every pre-obfuscation transform step in memory and serves it at `/__inspect__` and from the Vue DevTools overlay. Both are reachable by anyone with the dev server open, same as any other dev-only endpoint.
- `javascript-obfuscator`'s shared options (`vite.config.ts`) carry `ignoreImports: true`. Without it the obfuscator mangles the literal specifier inside `import('@/views/pages/X.vue')`-style dynamic imports, which breaks Vite's alias resolution in dev (every lazy route renders blank) and is a known footgun of the library with any bundler's code-split imports. Keep it set.


