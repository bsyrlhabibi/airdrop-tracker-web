# 📖 GUIDE — Cara Menjalankan Airdrop Tracker Web

Panduan **lengkap dari nol** untuk orang yang belum pernah pakai Next.js.
Ikuti langkah-langkah berurutan, jangan skip!

---

## 📋 Daftar Isi

1. [Persiapan](#1-persiapan)
2. [Install Node.js](#2-install-nodejs)
3. [Clone Project](#3-clone-project)
4. [Setup Environment](#4-setup-environment)
5. [Install Dependencies](#5-install-dependencies)
6. [Jalankan Dev Server](#6-jalankan-dev-server)
7. [Halaman yang Tersedia](#7-halaman-yang-tersedia)
8. [Build untuk Production](#8-build-untuk-production)
9. [Deploy ke Vercel](#9-deploy-ke-vercel)
10. [Troubleshooting](#10-troubleshooting)
11. [Cheat Sheet](#11-cheat-sheet)

---

## 1. Persiapan

Pastikan komputer kamu punya **2 tools** ini:

### Cek di Terminal / CMD / PowerShell:

```bash
node --version
```

```bash
npm --version
```

| Tool       | Output yang benar           | Belum punya?                           |
|------------|-----------------------------|-----------------------------------------|
| **Node.js** | `v20.x.x` atau `v22.x.x` | [Install Node.js](#2-install-nodejs)   |
| **npm**    | `10.x.x` atau lebih        | (Otomatis terinstall bersama Node.js)  |

> 💡 **Terminal?**
> - **Windows:** Tekan `Win + R` → ketik `cmd` → Enter. Atau pakai PowerShell.
> - **Mac:** Tekan `Cmd + Space` → ketik `Terminal` → Enter.
> - **Linux:** `Ctrl + Alt + T`

---

## 2. Install Node.js

Pilih sesuai OS kamu:

### 🪟 Windows

1. Buka **https://nodejs.org/**
2. Download **LTS** (bukan Current!) — contoh: `v20.x.x LTS`
3. **Double-click** file `.msi` → Next → Next → Install
4. **Tutup** semua terminal, **buka baru**
5. Ketik:
   ```bash
   node --version
   ```
6. Harus muncul: `v20.x.x` atau `v22.x.x`

> ⚠️ **Kalau belum muncul**, restart komputer dulu, lalu coba lagi.

### 🍎 Mac

```bash
# Cara paling gampang — pakai Homebrew
brew install node

# Belum punya Homebrew? Install dulu:
# /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# Lalu: brew install node
```

Atau download manual dari https://nodejs.org/ → pilih **LTS** → macOS Installer

### 🐧 Linux (Ubuntu / Debian)

```bash
# Install Node.js 20 LTS via NodeSource
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Cek
node --version
npm --version
```

> Harus muncul: `v20.x.x` dan `10.x.x`

---

## 3. Clone Project

### Pastikan Backend Sudah Jalan Dulu!

Frontend butuh backend API. **Setup backend dulu** sebelum lanjut:
→ [Airdrop Tracker API Guide](https://github.com/bsyrlhabibi/airdrop-tracker-api/blob/main/GUIDE.md)

### Clone Frontend:

```bash
git clone https://github.com/bsyrlhabibi/airdrop-tracker-web.git
cd airdrop-tracker-web
```

**Cek isi folder:**
```bash
ls
```

Harus terlihat: `src/`, `package.json`, `.env.example`, dll.

> 💡 **Gak punya git?** Buka https://github.com/bsyrlhabibi/airdrop-tracker-web → klik tombol hijau **Code** → **Download ZIP** → Extract → buka folder di terminal.

---

## 4. Setup Environment

Project butuh file `.env.local` untuk tahu dimana backend API berjalan.

### Buat file .env.local:

```bash
cp .env.example .env.local
```

### Edit file .env.local:

Buka file `.env.local` dengan text editor apapun (Notepad, VS Code, nano, dll):

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

**Penjelasan:**

| Variable              | Apa ini?                              | Contoh                              |
|-----------------------|---------------------------------------|-------------------------------------|
| `NEXT_PUBLIC_API_URL` | URL backend API                       | `http://localhost:8080` (lokal)     |

> 💡 **Kenapa `NEXT_PUBLIC_`?**
> Next.js hanya expose variable yang diawali `NEXT_PUBLIC_` ke browser.
> Tanpa prefix ini, variable tidak bisa diakses di frontend.

> 💡 **Deploy ke production?** Ganti URL ke domain backend kamu:
> `NEXT_PUBLIC_API_URL=https://your-api-domain.com`

---

## 5. Install Dependencies

**Wajib jalankan ini** sebelum pertama kali run:

```bash
npm install
```

Perintah ini akan:
- ✅ Download semua library (Next.js, React, Tailwind, shadcn, dll)
- ✅ Buat folder `node_modules/` (isi semua dependency)
- ✅ Buat file `package-lock.json`

**Tunggu sampai selesai** (mungkin 1-3 menit pertama kali).

Output yang benar:
```
added 500+ packages in 30s
```

> ⚠️ **Error?** Pastikan kamu sudah di dalam folder project (`cd airdrop-tracker-web`).

---

## 6. Jalankan Dev Server

```bash
npm run dev
```

### Output yang benar:

```
  ▲ Next.js 16.2.6
  - Local:        http://localhost:3000
  - Network:      http://192.168.x.x:3000

 ✓ Starting...
 ✓ Ready in 2.1s
```

### Buka Browser:

Ketik di address bar:

```
http://localhost:3000
```

Harus muncul halaman **Login** atau **Register**.

> 🚨 **JANGAN TUTUP terminal ini!** Dev server harus tetap jalan.
> Buka terminal baru kalau mau jalanin command lain.

> ✅ **Hot Reload:** Kalau kamu edit file `.tsx`, browser otomatis refresh!
> Tidak perlu restart server.

---

## 7. Halaman yang Tersedia

Setelah login, sidebar menampilkan semua halaman:

| Halaman            | URL                  | Fungsi                                    |
|--------------------|----------------------|-------------------------------------------|
| **Dashboard**      | `/dashboard`         | Stats overview, progress per account      |
| **Accounts**       | `/accounts`          | Manage multi-account (sybil)              |
| **Account Detail** | `/accounts/:name`    | Assign airdrops, lihat tasks harian       |
| **Airdrops**       | `/airdrops`          | Global airdrop catalog (search + filter)  |
| **Airdrop Detail** | `/airdrops/:name`    | Template tasks, assign ke accounts        |
| **Categories**     | `/categories`        | Kustomisasi kategori task                 |
| **Wallets**        | `/wallets`           | Manage wallet addresses                   |

### Alur Penggunaan:

```
1. Register / Login
2. Buat Account (identitas sybil)
3. Buat Airdrop di catalog
4. Tambah template tasks ke airdrop
5. Assign airdrop ke account → tasks auto-sync!
6. Update task status setiap hari (pending → ongoing → finish)
7. Monitor progress di Dashboard
```

---

## 8. Build untuk Production

### Build:

```bash
npm run build
```

Output:
```
✓ Compiled successfully
  Route (app)                Size     First Load JS
  ┌ ○ /                     ...
  ├ ○ /dashboard            ...
  ├ ○ /airdrops             ...
  └ ...
```

### Jalankan Production Build:

```bash
npm run start
```

Server berjalan di `http://localhost:3000`.

> 💡 **Production build** lebih cepat dan optimized dibanding `npm run dev`.

---

## 9. Deploy ke Vercel

### Cara 1 — Via Website (Paling Mudah ✅)

1. Push code ke GitHub (sudah dilakukan kalau clone dari repo)
2. Buka **[vercel.com](https://vercel.com)**
3. Login dengan GitHub
4. Klik **Add New** → **Project**
5. Cari repo `airdrop-tracker-web` → **Import**
6. Vercel auto-detect Next.js ✅
7. **Important!** Klik **Environment Variables** tambahkan:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://your-backend-api-url.com`
8. Klik **Deploy**
9. Tunggu ~1 menit → Selesai! 🎉

Vercel akan kasih URL: `https://airdrop-tracker-web.vercel.app`

### Cara 2 — Via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set env variable
vercel env add NEXT_PUBLIC_API_URL
# Masukkan: https://your-backend-api-url.com

# Redeploy dengan env
vercel --prod
```

### Auto-Deploy

Setelah pertama kali connect, setiap `git push` ke `main` akan otomatis deploy! ✅

---

## 10. Troubleshooting

### ❌ `command not found: node`

Node.js belum ter-install atau belum masuk PATH.

```bash
# Cek apakah Node ada
which node

# Kalau kosong, install Node.js dulu (Step 2)
# Kalau sudah install, restart terminal / komputer
```

### ❌ `npm ERR! code ERESOLVE`

Dependency conflict. Coba:

```bash
rm -rf node_modules package-lock.json
npm install
```

### ❌ `ECONNREFUSED` / `Failed to fetch`

Backend API tidak jalan atau URL salah.

1. Pastikan backend **sudah jalan** di `http://localhost:8080`
   ```bash
   curl http://localhost:8080/swagger/index.html
   ```
2. Cek `.env.local` — pastikan URL benar:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8080
   ```
3. **Restart dev server** setelah edit `.env.local`:
   ```bash
   # Ctrl+C untuk stop
   npm run dev
   ```

### ❌ Halaman kosong / putih

1. Buka **Browser DevTools** (F12 atau Right-click → Inspect)
2. Tab **Console** — cek error merah
3. Tab **Network** — cek request yang gagal (merah)
4. Biasanya masalah di CORS atau token expired

### ❌ `401 Unauthorized` terus

Token JWT expired. Logout lalu login ulang:
1. Hapus token di localStorage (DevTools → Application → Local Storage → hapus `token`)
2. Atau buka `/login` dan login ulang

### ❌ CSS / layout berantakan

1. Pastikan `npm install` sudah dijalankan
2. Coba hard refresh: `Ctrl + Shift + R` (Windows) / `Cmd + Shift + R` (Mac)
3. Clear browser cache

### ❌ Port 3000 sudah dipakai

Next.js akan otomatis pakai port 3001, 3002, dst. Cek output terminal.

Atau ganti port manual:
```bash
npm run dev -- -p 3001
```

### ❌ `Module not found`

Dependency belum lengkap:

```bash
rm -rf node_modules
npm install
```

### ❌ `.env.local` tidak kebaca

1. Pastikan nama file **persis** `.env.local` (bukan `.env` atau `.env.locale`)
2. **Restart dev server** setelah edit `.env.local`
3. Variable harus diawali `NEXT_PUBLIC_` agar bisa diakses di browser

---

## 11. Cheat Sheet

### Sehari-hari

```bash
# Install dependencies (pertama kali atau setelah pull)
npm install

# Jalankan dev server
npm run dev

# Build production
npm run build

# Jalankan production build
npm run start

# Run linter
npm run lint
```

### Useful Commands

```bash
# Install package baru
npm install <package-name>

# Install dev dependency
npm install -D <package-name>

# Update semua dependencies
npm update

# Cek outdated packages
npm outdated
```

### Environment Variables

```bash
# .env.local          → Local development (TIDAK di-commit ke git)
# .env.production     → Production build
# .env.development    → Development build (override .env.local)

# ⚠️ Semua variable harus NEXT_PUBLIC_ prefix untuk diakses di browser
```

---

## 🎯 Ringkasan Cepat (Copy-Paste)

### Prasyarat
```bash
# Pastikan backend sudah jalan di http://localhost:8080
```

### Setup + Run
```bash
git clone https://github.com/bsyrlhabibi/airdrop-tracker-web.git
cd airdrop-tracker-web
cp .env.example .env.local
npm install
npm run dev
```

Buka browser: **http://localhost:3000** 🚀

---

Selamat mencoba! 🎉

Ada masalah? Cek [Troubleshooting](#10-troubleshooting) dulu sebelum bertanya.
