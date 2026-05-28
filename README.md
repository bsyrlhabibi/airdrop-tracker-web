# Airdrop Tracker Web

A modern web frontend for tracking cryptocurrency airdrops, managing tasks across multiple accounts, and organizing your airdrop workflow. Built with Next.js and designed to work with the Airdrop Tracker Go backend API.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **UI Components:** shadcn/ui v4 + Base UI
- **Data Fetching:** TanStack React Query v5
- **Forms:** React Hook Form + Zod validation
- **Icons:** Lucide React
- **Toasts:** Sonner
- **Theming:** next-themes

## Features

- **Dashboard** — Overview of all airdrops, tasks, wallets, and per-account statistics with Excel export
- **Airdrop Catalog** — Create, edit, delete airdrops; filter by chain; manage per-airdrop task templates
- **Account Management** — Create sybil accounts with color coding; view per-account airdrops, tasks, and wallets
- **Daily Task Tracking** — Date-based task view per account with status updates, gas tracking, and transaction hash logging
- **Task Management** — Create tasks with categories, frequencies (once/daily/weekly/monthly), start/end dates
- **Category Management** — Organize tasks with named, color-coded categories
- **Wallet Management** — Track wallet addresses per account with chain labels
- **Excel Export** — Export all tracking data to `.xlsx` format
- **Authentication** — JWT-based login and registration with persistent sessions

## Pages & Routes

| Route | Page | Description |
|---|---|---|
| `/login` | Login | User authentication |
| `/register` | Register | New account registration |
| `/dashboard` | Dashboard | Stats overview, per-account summary, recent airdrops |
| `/accounts` | Accounts | List, create, edit, delete sybil accounts |
| `/accounts/[slug]` | Account Detail | Daily tasks, assigned airdrops, wallets for one account |
| `/airdrops` | Airdrops | Global airdrop catalog with search and chain filter |
| `/airdrops/[slug]` | Airdrop Detail | Airdrop info and task template management |
| `/categories` | Categories | Create, edit, delete task categories |
| `/wallets` | Wallets | Global wallet address management |

## Project Structure

```
src/
├── app/
│   ├── (auth)/           # Auth pages (login, register)
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/      # Authenticated dashboard pages
│   │   ├── layout.tsx    # Sidebar + navbar layout
│   │   ├── dashboard/page.tsx
│   │   ├── accounts/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── airdrops/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── categories/page.tsx
│   │   └── wallets/page.tsx
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Root redirect
│   └── providers.tsx     # React Query + Auth + Toaster providers
├── components/
│   ├── ui/               # shadcn/ui primitives (button, card, dialog, etc.)
│   ├── airdrop-card.tsx
│   ├── stats-card.tsx
│   ├── task-item.tsx
│   ├── sidebar.tsx
│   ├── navbar.tsx
│   └── mobile-nav.tsx
├── hooks/
│   └── use-auth.tsx      # Auth context and hook
├── lib/
│   ├── api.ts            # API client functions
│   ├── types.ts          # TypeScript interfaces
│   ├── utils.ts          # Utility functions (cn, slugify, formatLocalDate)
│   └── export.ts         # Excel export helper
```

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm, yarn, or pnpm
- The [Airdrop Tracker Backend](https://github.com/your-org/airdrop-tracker) running locally or deployed

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd airdrop-tracker-web

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Edit `.env.local`:

```env
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8080
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Go backend API | `http://localhost:8080` |

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## API Integration

The frontend communicates with a Go backend via RESTful JSON endpoints. All API functions are centralized in `src/lib/api.ts`.

**Base URL** is configured via `NEXT_PUBLIC_API_URL`.

**Authentication** uses JWT Bearer tokens stored in `localStorage`. The token is automatically attached to every request via the `Authorization` header.

### Key API Endpoints Used

| Category | Endpoints |
|---|---|
| Auth | `POST /api/auth/login`, `POST /api/auth/register` |
| Dashboard | `GET /api/dashboard` |
| Airdrops | `GET/POST /api/airdrops`, `GET/PUT/DELETE /api/airdrops/:id` |
| Airdrop Tasks | `GET/POST /api/airdrops/:id/tasks`, `PUT/DELETE /api/airdrop-tasks/:id` |
| Accounts | `GET/POST /api/accounts`, `GET/PUT/DELETE /api/accounts/:id` |
| Account Airdrops | `GET/POST /api/accounts/:id/airdrops`, `DELETE /api/accounts/:id/airdrops/:aaId` |
| Tasks | `POST /api/account-airdrops/:id/tasks`, `PUT/DELETE /api/tasks/:id` |
| Daily Tasks | `GET /api/accounts/:id/tasks/by-date?date=YYYY-MM-DD` |
| Categories | `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id` |
| Wallets | `GET/POST /api/wallets`, `DELETE /api/wallets/:id` |
| Export | `GET /api/export/excel` |

## Deployment (Vercel)

1. Push the repository to GitHub
2. Import the project in [Vercel](https://vercel.com)
3. Set the `NEXT_PUBLIC_API_URL` environment variable to your production backend URL
4. Deploy — Vercel auto-detects Next.js and handles the build

## Data Types

Core TypeScript interfaces are defined in `src/lib/types.ts`:

- **User** — `id`, `email`, `name`
- **Account** — Sybil account with `name`, `color`, `notes`
- **Airdrop** — Global airdrop entry with `name`, `chain`, `category`, `priority`, `status`, `url`, dates
- **AccountAirdrop** — Airdrop assigned to an account
- **AirdropTask** — Task template per airdrop
- **Task** — Per-account-airdrop task with `status`, `frequency`, `gas_spent`, `tx_hash`
- **Category** — Task category with `name` and `color`
- **Wallet** — Wallet address with `label`, `address`, `chain`
- **DashboardSummary** — Aggregated stats for the dashboard

## License

Private — Internal project.
