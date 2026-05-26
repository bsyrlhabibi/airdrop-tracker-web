# Airdrop Tracker Web

Frontend untuk Airdrop Tracker — built with **Next.js**, **TypeScript**, **Tailwind CSS**, dan **shadcn/ui**.

Professional, responsive UI untuk manage airdrop farming tasks.

---

## Features

- **Dashboard** — Stats overview (airdrops, tasks, wallets)
- **Airdrops** — CRUD dengan search, filter, category & priority badges
- **Tasks** — Checklist per airdrop (one-time, daily, weekly, monthly)
- **Wallets** — Multi-wallet management
- **Auth** — Login & register dengan JWT
- **Responsive** — Desktop & mobile optimized
- **Dark/Light** — Light mode (professional GitHub-style)

---

## Tech Stack

| Component | Library |
|-----------|---------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router) |
| Language | [TypeScript](https://www.typescriptlang.org/) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| Components | [shadcn/ui](https://ui.shadcn.com/) |
| State | [TanStack Query](https://tanstack.com/query) |
| Forms | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Icons | [Lucide](https://lucide.dev/) |
| Dates | [date-fns](https://date-fns.org/) |
| Notifications | [Sonner](https://sonner.emilkowal.dev/) |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx          # Auth layout (redirect if logged in)
│   │   ├── login/page.tsx      # Login page
│   │   └── register/page.tsx   # Register page
│   ├── (dashboard)/
│   │   ├── layout.tsx          # Dashboard layout (sidebar + navbar)
│   │   ├── dashboard/page.tsx  # Stats overview
│   │   ├── airdrops/
│   │   │   ├── page.tsx        # Airdrops list
│   │   │   └── [id]/page.tsx   # Airdrop detail + tasks
│   │   └── wallets/page.tsx    # Wallet management
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Redirect to dashboard
│   └── providers.tsx           # Query + Auth providers
├── components/
│   ├── ui/                     # shadcn/ui components
│   ├── navbar.tsx              # Top navigation
│   ├── sidebar.tsx             # Desktop sidebar
│   ├── mobile-nav.tsx          # Mobile navigation (Sheet)
│   ├── stats-card.tsx          # Stats card component
│   ├── airdrop-card.tsx        # Airdrop list card
│   └── task-item.tsx           # Task checklist item
├── hooks/
│   └── use-auth.tsx            # Auth context + token management
└── lib/
    ├── api.ts                  # API client (fetch wrapper)
    ├── types.ts                # TypeScript interfaces
    └── utils.ts                # Utility functions
```

---

## Quick Start

```bash
# 1. Clone
git clone https://github.com/bsyrlhabibi/airdrop-tracker-web.git
cd airdrop-tracker-web

# 2. Setup env
cp .env.example .env.local

# 3. Install dependencies
npm install

# 4. Run dev server
npm run dev

# 5. Open browser
# http://localhost:3000
```

> **Important:** Backend API harus jalan di `http://localhost:8080` dulu!
> Lihat [airdrop-tracker-api](https://github.com/bsyrlhabibi/airdrop-tracker-api) untuk setup backend.

---

## Pages

| Route | Description |
|-------|-------------|
| `/login` | Login form |
| `/register` | Register form |
| `/dashboard` | Stats overview + recent airdrops |
| `/airdrops` | Airdrop list with search & filter |
| `/airdrops/:id` | Airdrop detail + task checklist |
| `/wallets` | Wallet management |

---

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:8080` |

---

## Related Projects

- [Airdrop Tracker API](https://github.com/bsyrlhabibi/airdrop-tracker-api) — Go backend

---

## License

MIT
