# Generic Payroll

**Generic Payroll** is a project for exploring how to build a payroll and DTR (Daily Time Record) checking system. It's a local Vue 3 single-page app built around a **Payroll Generator → Batch Generator** screen, with **Email Token Configuration** and **Recipient Directory & Staff List** modals, a cycle dashboard and an employee masterlist.

> **Status: early and mostly front-end.** There is no spreadsheet parsing and no payroll dispatch yet. The one live feature is **Gmail sign-in**: sign in with Google in the Email Token modal and send a real test email (see [Gmail sign-in setup](#gmail-sign-in-setup)). The pages show demo ("test") data from the fixtures in `src/models/*/data`; clear a fixture to see that table's empty state. A demo build runs on Vercel at <https://generic-payroll-vue.vercel.app> (see [Deploy on Vercel](#deploy-on-vercel)); otherwise the app runs locally.

## What's in it

- **Cycle Overview** (`/cycle-overview`, the landing page; `/` and unknown paths redirect here): five summary cards (personnel, lost hours, gross earnings, statutory & taxes, net payable) and three bar graphs: personnel by bureau (Regular vs COS), lost hours per pay period against a target, and the disbursement mix. Each graph has a keyboard-reachable tooltip and a "View as table" twin.
- **Batch Generator** (`/batch-generator`): DTR source banner, action toolbar, summary metrics, filterable-looking payroll ledger with pager, and a sticky dispatch bar.
- **Email Token Configuration** modal: Gmail is the only active relay provider. MS 365 and Custom SMTP are greyed out ("Unavailable"), and the sender email and app-password fields are greyed out too, because the sender and credential come from the Gmail sign-in. **Sign in with Google** authorizes the app to send mail as you (send-only permission); the token status card, the toolbar tile on the Batch page and the "Verified Active" badge then follow the live session. **Send Test Dispatch** sends one real, clearly labelled test email (no payslip data) to a recipient you type.
- **Recipient Directory & Staff List** modal: stats strip, import bar, filters and a six-column staff table.
- **Employee Masterlist & Compensation Directory** (`/employee-records`): breadcrumb and registry status, four overview cards (personnel, statutory compliance, monthly gross commitment, SSL VI rate matrix), filters, a table with each employee's GSIS, Pag-IBIG and PhilHealth identities, SSL VI compensation with PERA, quick-edit / audit-history / detail actions, and statutory guideline cards.
- **Everything else** in the navigation (Audit Trail & Logs, BIR Withholding Tax, General Ledger Export) shows a **Coming Soon** page.
- Accessible by default: labelled dialogs with focus trap and Esc/backdrop close, skip link, `aria-current` navigation, labelled controls.

## Tech stack

Vue 3 (`<script setup lang="ts">`) · Vite · Vue Router · Tailwind CSS v4 · Vitest + Vue Test Utils · ESLint (+ oxlint) · Prettier. Fonts (Public Sans, JetBrains Mono) and the Material Symbols icon font are installed from npm, so the app works offline.

## Getting started

Requires **Node 22.18+ or 24.12+**.

```bash
npm install
cp env/.env.example env/.env.local   # optional, for personal overrides
npm run dev                  # http://localhost:5173
```

### Scripts

| Script               | What it does                                            |
| -------------------- | ------------------------------------------------------- |
| `npm run dev`        | Start the Vite dev server                               |
| `npm run build`      | Type-check, then build to `dist/`                       |
| `npm run preview`    | Serve the production build locally                      |
| `npm run type-check` | `vue-tsc --build` for the app, node and test projects   |
| `npm run lint`       | oxlint + ESLint with autofix (`src/` and `*.config.ts`) |
| `npm run format`     | Prettier over `src/`                                    |
| `npm run test:unit`  | Vitest in watch mode (`npx vitest run` for one pass)    |

### Environment variables

The env files live in the **`env/`** folder (`envDir: 'env'` in `vite.config.ts`), not the project root: `env/.env.example` (tracked template), `env/.env.development` and your own `env/.env.local` (both git-ignored). Variables are typed in `env.d.ts` and read through `src/config/env.ts`.

| Variable                | Default                        | Used for                                                                                     |
| ----------------------- | ------------------------------ | -------------------------------------------------------------------------------------------- |
| `VITE_APP_TITLE`        | `Generic Payroll`              | Header title, document title                                                                 |
| `VITE_APP_VERSION`      | `1.0`                          | Version badge                                                                                |
| `VITE_APP_STAGE`        | `PROD`                         | Stage badge                                                                                  |
| `VITE_ORG_NAME`         | `Payroll Generator`            | Header subtitle                                                                              |
| `VITE_ORG_UNIT`         | `Admin & Financial Management` | Header subtitle                                                                              |
| `VITE_GOOGLE_CLIENT_ID` | _(blank)_                      | Google OAuth Client ID for Gmail sign-in. Blank disables sign-in. Put it in `env/.env.local` |

> ⚠️ Every `VITE_*` value is compiled into the client bundle. **Never put SMTP passwords, app tokens, client secrets or API keys in them.** A Google OAuth _Client ID_ is public by design; a client _secret_ is not, and this app never needs one.

### Gmail sign-in setup

Sign-in uses Google Identity Services in the browser (no backend). It is off until you provide an OAuth Client ID:

1. In the [Google Cloud Console](https://console.cloud.google.com/), create or pick a project and **enable the Gmail API**.
2. **OAuth consent screen**: choose **Internal** if everyone uses the same Google Workspace (no Google verification needed), otherwise **External** and add the sender mailboxes as _test users_. Add the scope `https://www.googleapis.com/auth/gmail.send` (plus the default `openid`, `email`, `profile`).
3. **Credentials → Create credentials → OAuth client ID**, type **Web application**. Under _Authorized JavaScript origins_ add `http://localhost:5173` (and `http://localhost:8080` if you run it in Docker, or any other origin you serve the app from). No redirect URI is needed.
4. Copy the Client ID (`…apps.googleusercontent.com`) into a new `env/.env.local`:

   ```bash
   VITE_GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
   ```

5. Restart `npm run dev`, open **Email Token** and click **Sign in with Google**.

What to expect:

- The access token lives **in memory only**. It is never written to storage or logged, and it is revoked on **Sign out**. Reloading the page signs you out.
- A browser-only sign-in yields a token that lasts about **one hour**, with no refresh token. The modal shows when the session expires; sign in again afterwards. A longer-lived token needs a small backend, which is out of scope here.
- Google opens in a popup, so allow popups for the app's origin.
- **Send Test Dispatch** sends a real email from the signed-in account. It only runs when you click, to a recipient you entered.

Troubleshooting (what Google shows, and the fix, all in the Cloud Console under **Google Auth Platform**):

- **"Access blocked: … has not completed the Google verification process" (Error 403: access_denied)**: the app is _External_ and in _Testing_, and the account you picked isn't a test user. Open **Audience → Test users → Add users**, add the exact Gmail address you sign in with, save, and try again. Or, if everyone is on one Google Workspace, set the audience to **Internal** (not available for a personal project that has no organization).
- **Sign-in works but Send Test Dispatch says the Gmail API is not enabled** (or "Google refused the request"): the Gmail API must be enabled in the _same_ Cloud project that owns the OAuth Client ID. The number before the first `-` in the Client ID is that project's number. Open **APIs & Services → Library → Gmail API → Enable** with that project selected, wait a minute, and send again. The message in the modal now names the project and links to the right page.
- **"Error 400: origin_mismatch"**: the address in the browser bar isn't listed under **Clients → your client → Authorized JavaScript origins**. Add it exactly, including the port.
- **"Google hasn't verified this app" with an _Advanced_ link**: the app was published to production without verification. Continue via _Advanced_, or complete Google's verification (the send permission is a sensitive scope). Unverified apps are capped at 100 users.
- **The popup closes at once**: the browser blocked it. Allow popups for the app's address.

### Run with Docker

The app ships as a small static image: a Node stage type-checks and builds it, then a non-root nginx serves `dist/`.

```bash
cp env/.env.example env/.env.local     # once; put VITE_GOOGLE_CLIENT_ID in it for Gmail sign-in
docker compose --env-file env/.env.local up --build -d
# open http://localhost:8080
docker compose down                    # stop and remove
```

- **Settings are build-time.** Vite compiles every `VITE_*` value into the bundle, so the compose file passes them as build args. Change one in `env/.env.local`, then run `up --build` again. Plain `docker compose up` reuses the existing image. Never pass secrets as build args: they stay readable in the image history.
- **`env/` is not copied into the image.** `.dockerignore` keeps it out of the build context, so your `.env.local` cannot leak into a layer. Without `--env-file`, the defaults apply and Gmail sign-in stays off.
- **Gmail sign-in needs a second origin.** Add `http://localhost:8080` to the OAuth client's _Authorized JavaScript origins_, next to `http://localhost:5173`. The port is bound to `127.0.0.1` only, because Google rejects plain-HTTP LAN addresses as OAuth origins anyway.
- **What nginx does:** serves `index.html` for every client-side route (`/employee-records` works on refresh), caches the fingerprinted `/assets/` for a year while `index.html` is never cached, answers `/healthz` for the container health check, and returns 404 (not the app shell) for a missing asset.
- **Hardened by default:** runs as the non-root `nginx` user on port 8080, with a read-only filesystem, all Linux capabilities dropped and `no-new-privileges`.
- **No TLS is included.** For anything beyond localhost, put it behind a TLS-terminating proxy. Google also requires HTTPS for non-localhost OAuth origins.
- No Content-Security-Policy is set yet. Add one only after testing it against the real Google sign-in popup, which needs `accounts.google.com`, `www.googleapis.com` and `gmail.googleapis.com`.

### Deploy on Vercel

Vercel detects Vite, runs `npm run build` and serves `dist/`. `vercel.json` gives it the same serving rules as `nginx.conf`:

- **History-mode fallback.** Routes like `/cycle-overview` exist only in the browser, so without a rewrite Vercel answers `404 NOT_FOUND` when you open or refresh one (`/` still works because `index.html` is a real file). The rewrite serves `index.html` for every path that is not a real file. `/assets/` is left out, so a missing chunk still returns 404 instead of the app shell.
- **Headers.** The same `X-Content-Type-Options`, `Referrer-Policy` and `X-Frame-Options` as nginx, and a one-year immutable cache for the fingerprinted `/assets/`. No CSP yet, for the reason given above. Don't add `Cross-Origin-Opener-Policy: same-origin`: it cuts the Google sign-in popup off from the app.
- **Settings are build-time.** Set `VITE_*` values under _Project → Settings → Environment Variables_ and redeploy; never put secrets there.
- **Gmail sign-in needs the Vercel origin.** Add `https://generic-payroll-vue.vercel.app` to the OAuth client's _Authorized JavaScript origins_. Google allows no wildcards, so register only the production domain (and one named preview domain if you need it) rather than every preview URL.

## Project structure

The code follows **MVVM**: models hold the domain, ViewModels turn it into page state and commands, and views render it.

```
src/
  App.vue, main.ts           app entry; App creates the Gmail session and renders AppShell + RouterView
  models/                    M: types, fixtures, domain rules, API services, session state (no Vue components)
    cycle-overview/          rows for the cards and graphs, plus the lost-hours and disbursement rules
    batch-generator/         ledger rows, batch summary, metrics, filters
    employee-masterlist/     employees, summary, filters, statutory guidelines
    email-token/             relay providers, token config, the Gmail session and its
                             services/ (Google Identity, Gmail API)
    recipients/              recipient rows and stats
    shared/                  fixtures shared across features (organization.ts)
  viewmodels/                VM: one use<Name>ViewModel() per page or modal (state + commands, no DOM)
    cycle-overview/, batch-generator/, employee-masterlist/, recipients/
    email-token/             token modal, Gmail sign-in panel, test dispatch form
  views/                     V: the .vue templates
    pages/                   thin route-level pages (CycleOverview, BatchGenerator, EmployeeMasterlist, ComingSoon)
    cycle-overview/          header, bar graphs (personnel, lost hours, disbursement mix)
    batch-generator/         ledger, toolbars, dispatch bar
    employee-masterlist/     masterlist header, filters, employee table, guideline cards
    email-token/             token modal and its parts, Gmail sign-in panel
    recipients/              recipient directory modal and its parts
    components/ui/           BaseModal, BaseButton, BaseBadge, MetricsGrid, PagerNav, ChartCard, fields, …
    components/layout/       AppHeader, AppTopNav, AppSidebar, NavLink
    layouts/                 AppShell: fixed header, sidebar, <main>
    composables/             useDialogBehavior (focus trap, Esc, scroll lock), view-only
  types/ui.ts                presentation types shared by fixtures and views (Metric, BadgeTone, SelectOption, …)
  config/                    env.ts, navigation.ts, shell.ts
  router/                    route table built from config/navigation.ts
  utils/                     format (₱, numbers), pagination and chart helpers
  assets/styles/main.css     Tailwind import, fonts, design tokens (@theme)
env/                         .env.example (tracked), .env.development, .env.local (git-ignored)
Dockerfile, nginx.conf, docker-compose.yml, .dockerignore   container build and static serving
vercel.json                  Vercel history-mode fallback
```

The layers only depend downwards: **views → viewmodels → models**.

- Pages and modals (and the Gmail sign-in panel) get their state and commands from their ViewModel. They never import fixtures, services or the session from `models/` (type-only imports are fine). Leaf components only take props and emit events.
- ViewModels read the fixtures and the Gmail session, derive what the page shows, and own UI state such as which modal is open. They never import `.vue` files.
- Models know nothing about Vue components, ViewModels or views. The Gmail session is a model: `App.vue` creates one and provides it to the ViewModels.

Tests sit in `__tests__/` folders next to the code they cover: model specs under `src/models/`, ViewModel specs under `src/viewmodels/`, component and page specs under `src/views/`.

### The demo data

All the demo ("test") data lives in typed fixtures under `src/models/*/data` (plus `src/models/shared`), and nothing is hard-coded in templates. To see a table's empty state, set its array to `[]` and its counts to zero. When real data arrives, swap the fixture import in the page's ViewModel; the views don't change.

| File (under `src/models/`)                      | What it holds                                         |
| ----------------------------------------------- | ----------------------------------------------------- |
| `batch-generator/data/ledgerRows.ts`            | Payroll ledger rows                                   |
| `batch-generator/data/batchSummary.ts`          | Batch counts, DTR source and pager                    |
| `batch-generator/data/metrics.ts`               | The four summary cards                                |
| `employee-masterlist/data/employees.ts`         | Employee records                                      |
| `employee-masterlist/data/masterlistSummary.ts` | Masterlist header, cards and pager                    |
| `recipients/data/recipients.ts`                 | Recipient directory rows                              |
| `recipients/data/recipientStats.ts`             | Recipient counts and sync info                        |
| `cycle-overview/data/cycleOverview.ts`          | Cycle Overview rows; every total is derived from them |

### Adding a real page

1. Create the page in `src/views/pages/`.
2. Create its ViewModel, `use<Name>ViewModel()`, in `src/viewmodels/<feature>/`, reading from the models in `src/models/<feature>/`.
3. Register the page in `implementedViews` in `src/router/index.ts`. The nav entry already exists in `src/config/navigation.ts`; add one if it doesn't.

## Roadmap

1. **Spreadsheet upload** → populate the recipient directory (Import Excel / CSV, template download).
2. **Email dispatch** → send payslips through the signed-in Gmail session (sign-in and test email are done). A longer-lived token (backend) if one-hour sessions prove too short.
3. Employee Masterlist import (`Import Master (.xlsx)`), quick edit and audit history.
4. Remaining navigation pages (Audit Trail & Logs, BIR Withholding Tax, General Ledger Export).
5. Add Pinia once uploaded roster and token config become shared state.

## Notes

- `npm install` may print `EBADENGINE` warnings (a transitive dependency of jsdom asks for Node 24.15+). They're harmless for development.
- The Material Symbols icon font is a single ~4 MB file. Fine for local use; subset it before any real deployment.
- Design notes and the deliberate layout choices are listed in [`CLAUDE.md`](CLAUDE.md).
