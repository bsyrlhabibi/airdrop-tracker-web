# Airdrop Tracker Web — Beginner's Guide

This guide walks you through setting up, running, and using the Airdrop Tracker frontend. No prior experience with Next.js is required.

---

## Table of Contents

1. [What Is This Project?](#what-is-this-project)
2. [Prerequisites](#prerequisites)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Running the App](#running-the-app)
5. [Understanding the Pages](#understanding-the-pages)
6. [How API Integration Works](#how-api-integration-works)
7. [Making Simple UI Changes](#making-simple-ui-changes)
8. [Common Troubleshooting](#common-troubleshooting)

---

## What Is This Project?

This is a **web dashboard** for tracking cryptocurrency airdrops. Think of it as a management tool that lets you:

- Keep a **catalog** of airdrops you're participating in
- Create **accounts** (e.g., different sybil wallets) and assign airdrops to them
- Track **daily tasks** for each account (e.g., "Bridge 0.1 ETH", "Swap on Uniswap")
- Log **gas spent** and **transaction hashes** per task
- Organize tasks with **categories** (e.g., "Bridge", "Swap", "Staking")
- **Export** all data to Excel

The frontend (this project) talks to a **Go backend API** that stores all the data.

---

## Prerequisites

Before you start, make sure you have:

1. **Node.js** version 18 or newer
   ```bash
   node --version
   # Should print v18.x.x or higher
   ```

2. **npm** (comes with Node.js)
   ```bash
   npm --version
   ```

3. **The backend running** — either locally on port 8080 or a deployed URL

---

## Step-by-Step Setup

### Step 1: Get the Code

```bash
git clone <repo-url>
cd airdrop-tracker-web
```

### Step 2: Install Dependencies

```bash
npm install
```

This downloads all the packages the project needs (React, Next.js, Tailwind CSS, etc.) into a `node_modules/` folder.

### Step 3: Configure the Backend URL

Create a `.env.local` file from the example:

```bash
cp .env.example .env.local
```

Open `.env.local` in any text editor. It should look like this:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

- If your backend runs **locally** on port 8080, keep it as-is.
- If your backend is **deployed** somewhere, change the URL:
  ```env
  NEXT_PUBLIC_API_URL=https://your-api-domain.com
  ```

> **Why `NEXT_PUBLIC_`?** — Next.js uses this prefix to expose environment variables to the browser. Variables without this prefix are only available on the server.

### Step 4: Start the Development Server

```bash
npm run dev
```

You should see output like:

```
▲ Next.js 16.2.6
- Local:   http://localhost:3000
```

### Step 5: Open the App

Open your browser and go to **http://localhost:3000**. You should see the login page.

---

## Running the App

| Command | What It Does |
|---|---|
| `npm run dev` | Starts the development server with hot reload |
| `npm run build` | Creates an optimized production build |
| `npm start` | Runs the production build (run `build` first) |
| `npm run lint` | Checks code for style issues |

---

## Understanding the Pages

### Login & Register (`/login`, `/register`)

When you first open the app, you'll see the **login page**. Create an account via the **register** link. After registering, you're automatically logged in and redirected to the dashboard.

Your session is stored in the browser (`localStorage`), so you stay logged in until you click **Logout**.

### Dashboard (`/dashboard`)

The main landing page after login. It shows:

- **Stats cards** — Total airdrops, total tasks, completed tasks, wallets
- **Per-account summary** — Each account's airdrop and task progress at a glance
- **Recent airdrops** — The latest 6 airdrops from your catalog
- **Export Excel button** — Downloads all your data as an `.xlsx` file

### Accounts (`/accounts`)

A list of your sybil accounts (e.g., "Main Account", "Sybil A", "ETH Wallet 1").

**What you can do:**
- **Create** a new account with a name, color, and notes
- **Edit** account details (name, color, notes)
- **Delete** an account (this also deletes all its airdrops, tasks, and wallets)
- **Click** an account card to go to its detail page

### Account Detail (`/accounts/[slug]`)

The most feature-rich page. It's split into several sections:

**1. Today's Tasks** — A daily task tracker with:
   - Date navigation (previous/next day, "Today" button)
   - Add tasks to specific airdrops assigned to this account
   - Change task status via dropdown (pending → ongoing → finish / missed)
   - Edit tasks to update gas spent, transaction hash, frequency
   - Delete tasks

**2. Assigned Airdrops** — Airdrops assigned to this account:
   - Assign new airdrops from the global catalog
   - Expand each airdrop to see its task list
   - Add/edit/delete tasks per airdrop
   - Remove airdrop from account

**3. Wallets** — Wallet addresses for this account:
   - Add wallets with label, address, and chain
   - Delete wallets

### Airdrops (`/airdrops`)

The global airdrop catalog. These are independent of accounts.

**What you can do:**
- **Create** airdrops with name, chain, category, priority (low/medium/high), status, URL, dates, and notes
- **Search** by name, chain, or category
- **Filter** by chain
- **Change status** via dropdown (active / upcoming / end / missed)
- **Edit** airdrop details
- **Delete** airdrops
- **Click** a card to go to the airdrop detail page

### Airdrop Detail (`/airdrops/[slug]`)

Shows full details of one airdrop and its **task templates**.

Task templates are reusable task definitions for the airdrop. When you assign this airdrop to an account, these templates serve as a reference for what tasks need to be done.

**What you can do:**
- View airdrop info (chain, priority, status, dates, notes)
- Visit the airdrop URL
- Add/edit/delete task templates with category, status, and date range
- Delete the entire airdrop

### Categories (`/categories`)

Manage task categories used across all airdrops and accounts.

**What you can do:**
- **Create** categories with a name and color (e.g., "Bridge" in blue, "Swap" in green)
- **Edit** category name and color
- **Delete** categories

Categories appear as colored tags on tasks throughout the app.

### Wallets (`/wallets`)

A global view of all wallet addresses across all accounts.

**What you can do:**
- **Add** wallets (select account, enter label, address, chain)
- **Copy** addresses to clipboard
- **Delete** wallets

---

## How API Integration Works

All backend communication happens through **`src/lib/api.ts`**. Here's how it works:

### The Request Helper

At the core is a `request()` function that:

1. Reads the JWT token from `localStorage`
2. Attaches it as a `Bearer` token in the `Authorization` header
3. Sends the request to `NEXT_PUBLIC_API_URL + path`
4. Parses the JSON response or throws an error

```typescript
// Simplified version of what's in api.ts
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("Request failed");
  return res.json();
}
```

### API Functions

Each resource has dedicated functions:

```typescript
// Examples from api.ts
getAirdrops()                          // GET /api/airdrops
createAirdrop({ name, chain, ... })    // POST /api/airdrops
updateAirdrop(id, { status })          // PUT /api/airdrops/:id
deleteAirdrop(id)                      // DELETE /api/airdrops/:id
```

### How Pages Use the API

Pages use **React Query** (`useQuery` and `useMutation`) to call these functions:

```typescript
// Fetching data
const { data: airdrops, isLoading } = useQuery({
  queryKey: ["airdrops"],      // Cache key
  queryFn: getAirdrops,        // API function to call
});

// Mutating data
const createMutation = useMutation({
  mutationFn: createAirdrop,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["airdrops"] }); // Refetch
    toast.success("Airdrop created");
  },
  onError: (err) => toast.error(err.message),
});
```

React Query handles:
- **Caching** — Data is cached and shared between components
- **Loading states** — `isLoading` is `true` while fetching
- **Auto-refetch** — Data refreshes when the window refocuses
- **Invalidation** — After a mutation, related queries are refetched automatically

---

## Making Simple UI Changes

### Change Colors

The app uses Tailwind CSS classes. For example, to change a button from blue to green:

```tsx
// Before
<Button className="bg-blue-600">Save</Button>

// After
<Button className="bg-green-600">Save</Button>
```

### Add a New Page

1. Create a new folder in `src/app/(dashboard)/`:
   ```
   src/app/(dashboard)/my-page/page.tsx
   ```

2. Add a basic page:
   ```tsx
   "use client";
   
   export default function MyPage() {
     return (
       <div>
         <h1 className="text-2xl font-bold text-gray-900">My New Page</h1>
         <p className="text-sm text-gray-500">Content goes here</p>
       </div>
     );
   }
   ```

3. Add it to the sidebar in `src/components/sidebar.tsx`:
   ```tsx
   const navItems = [
     { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
     { href: "/accounts", label: "Accounts", icon: Users },
     { href: "/airdrops", label: "Airdrops", icon: Rocket },
     { href: "/my-page", label: "My Page", icon: SomeIcon },  // Add this
     // ...
   ];
   ```

### Modify the Sidebar

Edit `src/components/sidebar.tsx`. The `navItems` array defines all sidebar links:

```tsx
const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Users },
  // Add or remove items here
];
```

Icons come from `lucide-react`. Browse available icons at [lucide.dev](https://lucide.dev).

### Add a New API Function

In `src/lib/api.ts`, add a function following the existing pattern:

```typescript
export async function getMyData(): Promise<MyType[]> {
  return request<MyType[]>("/api/my-endpoint");
}
```

Then use it in a page with React Query:

```typescript
const { data, isLoading } = useQuery({
  queryKey: ["my-data"],
  queryFn: getMyData,
});
```

---

## Common Troubleshooting

### "Failed to fetch" or "Network Error"

**Cause:** The backend is not running or the URL is wrong.

**Fix:**
1. Make sure the backend is running: `curl http://localhost:8080/api/dashboard`
2. Check your `.env.local` file has the correct `NEXT_PUBLIC_API_URL`
3. After changing `.env.local`, **restart** the dev server (`Ctrl+C` then `npm run dev`)

### "401 Unauthorized"

**Cause:** Your JWT token expired or is invalid.

**Fix:** Log out and log in again. The app stores the token in `localStorage`.

### Page Shows a Spinning Loader Forever

**Cause:** The API call is failing silently or the backend is slow.

**Fix:**
1. Open browser DevTools (F12) → **Network** tab
2. Look for failed requests (red entries)
3. Check the **Console** tab for error messages

### "Module not found" Error After Pulling New Code

**Cause:** New dependencies were added.

**Fix:**
```bash
npm install
```

### Changes to `.env.local` Not Taking Effect

**Cause:** Next.js reads `.env.local` only at startup.

**Fix:** Restart the dev server:
```bash
# Press Ctrl+C, then:
npm run dev
```

### Port 3000 Already in Use

**Fix:** Use a different port:
```bash
npm run dev -- -p 3001
```

### Build Errors

```bash
# Clean the build cache and rebuild
rm -rf .next
npm run build
```

---

## Key Files Reference

| File | Purpose |
|---|---|
| `src/lib/api.ts` | All API request functions |
| `src/lib/types.ts` | TypeScript interfaces (Account, Airdrop, Task, etc.) |
| `src/lib/utils.ts` | Utility functions (cn, slugify, formatLocalDate) |
| `src/lib/export.ts` | Excel export logic |
| `src/hooks/use-auth.tsx` | Authentication context and useAuth hook |
| `src/app/providers.tsx` | React Query client setup and global providers |
| `src/components/sidebar.tsx` | Sidebar navigation links |
| `src/app/(dashboard)/layout.tsx` | Dashboard layout (sidebar + navbar + main area) |
| `.env.local` | Environment configuration |

---

## Need Help?

- Check the **README.md** for a project overview and API reference
- Look at existing pages for patterns to follow — the codebase is consistent
- All pages use the same structure: `useQuery` for fetching, `useMutation` for changes, `toast` for feedback
