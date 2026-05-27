# 🪂 Airdrop Tracker Web

Frontend untuk Airdrop Tracker — manage airdrop farming tasks, multi-account tracking, wallet management, dan daily task monitoring.

Built with **Next.js 16 + TypeScript + Tailwind CSS v4 + shadcn/ui**.

---

## ✨ Features

- **Dashboard** — Stats overview, per-account progress, recent airdrops
- **Accounts** — Multi-account (sybil) management dengan color coding
- **Airdrops** — Global catalog dengan search, filter, category & priority badges
- **Airdrop Detail** — Template tasks, assign ke account, progress tracking
- **Categories** — Kustomisasi kategori task
- **Wallets** — Multi-wallet per account & chain
- **Excel Export** — Download data as styled Excel (5 sheets)
- **Auth** — Login & register dengan JWT
- **Responsive** — Mobile-first, sidebar + bottom nav
- **URL Slugs** — Clean URLs (`/airdrops/zksync` bukan `/airdrops/1`)

---

## 🏗️ Tech Stack

| Component    | Library                                                        |
|--------------|----------------------------------------------------------------|
| Framework    | [Next.js 16](https://nextjs.org/) (App Router)                |
| Language     | [TypeScript](https://www.typescriptlang.org/)                  |
| Styling      | [Tailwind CSS v4](https://tailwindcss.com/)                    |
| Components   | [shadcn/ui](https://ui.shadcn.com/)                           |
| State        | [TanStack Query](https://tanstack.com/query)                  |
| Forms        | [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) |
| Icons        | [Lucide](https://lucide.dev/)                                  |
| Dates        | [date-fns](https://date-fns.org/)                              |
| Notifications| [Sonner](https://sonner.emilkowal.dev/)                        |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx              # Auth layout (redirect if logged in)
│   │   ├── login/page.tsx          # Login page
│   │   └── register/page.tsx       # Register page
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Dashboard layout (sidebar + navbar)
│   │   ├── dashboard/page.tsx      # Stats overview + recent airdrops
│   │   ├── accounts/
│   │   │   ├── page.tsx            # Accounts list (card grid)
│   │   │   └── [slug]/page.tsx     # Account detail + assign airdrops
│   │   ├── airdrops/
│   │   │   ├── page.tsx            # Airdrops list (search + filter)
│   │   │   └── [slug]/page.tsx     # Airdrop detail + template tasks
│   │   ├── categories/page.tsx     # Categories management
│   │   └── wallets/page.tsx        # Wallet management
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Redirect → /dashboard
│   └── providers.tsx               # QueryClient + Auth providers
├── components/
│   ├── ui/                         # shadcn/ui primitives
│   ├── navbar.tsx                  # Top navigation bar
│   ├── sidebar.tsx                 # Desktop sidebar
│   ├── mobile-nav.tsx              # Mobile slide-out nav
│   ├── stats-card.tsx              # Dashboard stats card
│   ├── airdrop-card.tsx            # Airdrop list card
│   └── task-item.tsx               # Task checklist item
├── hooks/
│   └── use-auth.tsx                # Auth context + JWT management
└── lib/
    ├── api.ts                      # API client (fetch wrapper + auth)
    ├── export.ts                   # Excel export trigger
    ├── types.ts                    # TypeScript interfaces
    └── utils.ts                    # Utility functions (cn, slugify)
```

---

## 📄 Pages

| Route                    | Description                        |
|--------------------------|------------------------------------|
| `/login`                 | Login form                         |
| `/register`              | Register form                      |
| `/dashboard`             | Stats overview + per-account cards |
| `/accounts`              | Accounts list (card grid)          |
| `/accounts/:slug`        | Account detail + assign airdrops   |
| `/airdrops`              | Airdrops catalog (search + filter) |
| `/airdrops/:slug`        | Airdrop detail + template tasks    |
| `/categories`            | Categories CRUD                    |
| `/wallets`               | Wallet management (card grid)      |

---

## 🚀 Quick Start

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

# 5. Buka browser
# → http://localhost:3000
```

> ⚠️ **Backend API harus jalan dulu!**
> Lihat [airdrop-tracker-api](https://github.com/bsyrlhabibi/airdrop-tracker-api) untuk setup backend.

> 📖 **Belum pernah pakai Next.js?** Baca [GUIDE.md](./GUIDE.md)!

---

## ⚙️ Environment Variables

| Variable              | Required | Default                      | Description            |
|-----------------------|----------|------------------------------|------------------------|
| `NEXT_PUBLIC_API_URL` | **Yes**  | `http://localhost:8080`      | Backend API URL        |

> 💡 Variable harus diawali `NEXT_PUBLIC_` agar bisa diakses di browser.

---

## 📦 NPM Scripts

```bash
npm run dev        # Jalankan dev server (hot reload)
npm run build      # Build untuk production
npm run start      # Jalankan production build
npm run lint       # Run ESLint
```

---

## 🚀 Deploy

### Vercel (Recommended)

1. Push code ke GitHub
2. Buka [vercel.com](https://vercel.com) → Import Repository
3. Pilih repo `airdrop-tracker-web`
4. Set Environment Variable:
   - `NEXT_PUBLIC_API_URL` = `https://your-api-domain.com`
5. Deploy!

Vercel auto-detect Next.js dan deploy otomatis. ✅

### Manual / VPS

```bash
npm run build
npm run start
```

Server berjalan di `http://localhost:3000` (bisa ganti dengan `-p` flag).

---

## 📂 Related Projects

- [Airdrop Tracker API](https://github.com/bsyrlhabibi/airdrop-tracker-api) — Go backend (Gin + SQLite)

---

## 📄 License

MIT

---

> 📖 **Butuh panduan lengkap?** Lihat [GUIDE.md](./GUIDE.md)
