# TMAG Client

The TMAG Client is the main public and user-facing React application. It serves the marketing website, authentication flows, individual travel plan dashboard, HR/company user flows, doctor review workspace, family plan flows, ebook shop, and payment callbacks.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS 4
- React Router 7
- TanStack Query
- Zustand
- Axios
- Framer Motion, GSAP, Recharts, Lucide React

## Local URL

`bun run dev` starts Vite on port `3000`:

```text
http://localhost:3000
```

## Setup

```bash
cd client
bun install
```

Create a local `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8080/api
VITE_API_KEY=<same-value-as-backend-APP_API_KEY>

# Optional role-based redirects after login/onboarding
VITE_SUPER_ADMIN_DASHBOARD_URL=http://localhost:3001/admin
VITE_ADMIN_DASHBOARD_URL=http://localhost:3002/admin
```

Do not commit `.env` files or real secrets.

## Scripts

| Command | Description |
| --- | --- |
| `bun run dev` | Start the development server on port `3000`. |
| `bun run build` | Run TypeScript project build and create the Vite production bundle. |
| `bun run lint` | Run ESLint. |
| `bun run preview` | Preview the production build locally. |
| `bun run pages:dev` | Serve the built `dist` folder with Cloudflare Pages locally. Run `bun run build` first. |
| `bun run deploy` | Build and deploy `dist` to Cloudflare Pages with Wrangler. |

## Cloudflare Pages deployment

This app includes `wrangler.toml` for Cloudflare Pages:

```toml
name = "client"
pages_build_output_dir = "dist"
```

Deploy from this directory after authenticating Wrangler:

```bash
cd client
bun run deploy
```

For Cloudflare dashboard builds, use:

- Build command: `bun run build` or `npm run build`
- Build output directory: `dist`
- Environment variables: set `VITE_API_BASE_URL`, `VITE_API_KEY`, and any dashboard redirect URLs in Pages settings.

`public/_redirects` is included so React Router deep links fall back to `index.html`.

## Main route areas

- `/` marketing home page.
- `/pricing`, `/for-companies`, `/about`, `/faq`, `/blog`, `/contact`, and legal/support content pages.
- `/login`, `/register`, `/forgot-password`, `/reset-password`, and verification callbacks.
- `/dashboard/*` individual user travel plans, family plans, transactions, ebooks, and settings.
- `/hr/*` HR/company user tools for employees, billing, reports, and credit requests.
- `/doctor/*` doctor plan validation workflow.
- `/family/*` family member portal.
- `/shop/*` ebook catalog, cart, checkout, and order confirmation.
- `/payment/callback`, `/family-payment-callback`, and `/hr/billing/callback` payment return routes.
- `/ref/:shortCode` affiliate tracking redirect.

## Project structure

```text
client/
├── src/
│   ├── api/          # Axios client, API functions, hooks, and types
│   ├── components/   # Reusable UI, dashboard, auth, doctor, payment, plan, and marketing components
│   ├── constants/    # Static plan and product constants
│   ├── context/      # Auth, countries, health profile, and onboarding contexts
│   ├── layouts/      # Home, auth, user, HR, doctor, and dashboard layouts
│   ├── lib/          # Query client, role redirects, PDF helpers, validation, utilities
│   ├── pages/        # Route pages
│   ├── routes/       # React Router configuration
│   └── stores/       # Zustand stores
├── public/           # Static assets
├── package.json
└── vite.config.ts
```

## API integration

- API base defaults to `http://localhost:8080/api` when `VITE_API_BASE_URL` is not set.
- Requests send `X-Api-Key: VITE_API_KEY`.
- Auth stores the user JWT in the `access_token` cookie and attaches it as `Authorization: Bearer <token>`.
- Most backend resources are under `/api/v1`; client API helpers include the versioned path where needed.

## Development workflow

1. Start `spring-server` on port `8080` with a matching `APP_API_KEY`.
2. Start this app with `bun run dev`.
3. Run `bun run build` before handing off or deploying.
4. Run `bun run lint` after TypeScript or React changes.
