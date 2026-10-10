# 🏠 RoomSplit (Room Money Splitter)

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/PWA-Installable-purple?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**RoomSplit** is an offline-first, mobile-responsive Progressive Web App (PWA) designed for roommates, flatmates, and hostel groups to track shared expenses, eliminate complex group debts, and settle balances directly via **0%-fee UPI transfers** without relying on third-party payment gateway middlemen.

---

## ✨ Key Features

### 🧮 1. Deterministic Greedy Debt Minimization (FR-BAL Engine)
- Reduces $N$ complicated multi-person shared debts into the **minimum possible number of direct peer-to-peer transfers**.
- Computes accurate net balances down to integer-paise precision (0 rounding errors).
- Invariant check verifies group net balance sum is always strictly $\sum \text{net} = 0$.

### 📱 2. Direct Peer-to-Peer UPI Settlements (Zero Fees)
- **Direct Bank-to-Bank:** Payees receive 100% of their money straight to their bank account with zero platform or payment gateway deduction fees.
- **Deep-Link Launchers:** 1-tap launchers for **Google Pay** (`tez://`), **PhonePe** (`phonepe://`), and **Paytm** (`paytmmp://`).
- **Dynamic QR Codes:** Generates high-contrast camera-ready UPI QR codes (scanned in-app or via screenshot gallery).
- **1-Tap Clipboard Copy:** Copy UPI ID and Amount with visual confirmation to eliminate typing errors.
- **Peer-to-Peer Verification:** Payers mark payment sent, and recipients verify and confirm in their bank account before debt is cleared.

### ⚡ 3. Offline-First Architecture
- Full **Service Worker** caching strategy (`sw.js`) ensures the app boots instantly even with zero connectivity.
- Offline mutations are persisted to **IndexedDB** (`idb-keyval`).
- Automatic background replay and conflict-free reconciliation as soon as internet connection is restored.

### 🔄 4. Synchronized Real-Time Live Balances
- Live balance changes synchronize instantly across all devices using **Supabase Realtime** Postgres channel subscriptions.
- Live **Balance Hero Card** on the main dashboard updates in real time whenever expenses or settlement payments are made.
- Instant visual feedback for in-flight pending settlements awaiting roommate confirmation.

### 📲 5. Progressive Web App (PWA)
- Installable on mobile devices (Android WebAPK prompt & iOS Safari "Add to Home Screen" banner).
- Custom standalone mobile viewport (`theme-color: #0b1c30`), touch icons, and offline fallback banner.

### 🔐 6. Secure Authentication & Room Recovery
- Supports **Google OAuth** (One-click sign-in), Email/Password, and Magic OTP.
- Automatically recovers and loads user rooms and pending invites upon authentication.
- Multi-room switcher with unique 6-character room codes and QR share links.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 19, Vite 8 |
| **Styling** | Tailwind CSS 3, Lucide React Icons |
| **Backend & Database** | Supabase (PostgreSQL, Row Level Security, Realtime CDC) |
| **Authentication** | Supabase Auth (Google OAuth, Email/Password, OTP) |
| **Offline Storage** | IndexedDB via `idb`, Service Worker API |
| **Payments & QR** | NPCI UPI Deep Link Specification, `qrcode` library |
| **Build & Tooling** | Oxlint, Vite, PostCSS, Autoprefixer |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- A free **Supabase** account ([supabase.com](https://supabase.com))

### 2. Clone the Repository
```bash
git clone https://github.com/iamshashankshekhr/roomMoneySpliter.git
cd roomMoneySpliter
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Run the Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 6. Build for Production
```bash
npm run build
```
The optimized bundle will be created in the `dist/` directory.

---

## 🗄️ Supabase Database Setup

Run the following SQL queries in your Supabase SQL Editor to initialize the necessary schema:

```sql
-- 1. Rooms Table
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency text default 'INR',
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

-- 2. Room Members Table
create table public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  display_name text not null,
  upi_id text,
  role text default 'member',
  joined_at timestamptz default now()
);

-- 3. Room Invitations Table
create table public.room_invitations (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  token text unique not null,
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- 4. Expenses Table
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  title text not null,
  amount_paise bigint not null,
  category text default 'groceries',
  paid_by_member_id uuid references public.room_members(id),
  expense_date date default current_date,
  created_at timestamptz default now()
);

-- 5. Expense Splits Table
create table public.expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid references public.expenses(id) on delete cascade,
  member_id uuid references public.room_members(id),
  amount_paise bigint not null
);

-- 6. Settlements Table
create table public.settlements (
  id uuid primary key default gen_random_uuid(),
  room_id uuid references public.rooms(id) on delete cascade,
  status text default 'active',
  created_at timestamptz default now()
);

-- 7. Settlement Payments Table
create table public.settlement_payments (
  id uuid primary key default gen_random_uuid(),
  settlement_id uuid references public.settlements(id) on delete cascade,
  from_member_id uuid references public.room_members(id),
  to_member_id uuid references public.room_members(id),
  amount_paise bigint not null,
  status text default 'pending', -- 'pending' | 'payer_marked_paid' | 'recipient_confirmed' | 'cancelled'
  initiated_at timestamptz,
  payer_acknowledged_at timestamptz,
  recipient_confirmed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable Row Level Security (RLS) on all tables and grant authenticated & anon policies as desired
alter table public.rooms enable row level security;
alter table public.room_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;
alter table public.settlements enable row level security;
alter table public.settlement_payments enable row level security;
alter table public.room_invitations enable row level security;
```

---

## 💡 Troubleshooting UPI "Payment Failed" on Mobile

In India, **NPCI and banks (SBI, HDFC, ICICI, etc.) actively block or flag direct browser-initiated links** if clicked inside mobile web browsers without registered merchant signatures.

**RoomSplit provides three zero-failure alternatives:**
1. **1-Tap Copy UPI ID:** Tap **"Copy UPI ID"** in the payment modal, open Google Pay or PhonePe directly, select *"Pay UPI ID"*, and paste.
2. **Scan Dynamic QR Code:** Switch to the **"Scan QR Code"** tab in the modal:
   - Scan directly with any camera or UPI scanner.
   - Or take a screenshot and tap *"Scan from Gallery / Image"* inside Google Pay or PhonePe. QR camera scans are treated as trusted physical scans and are **never blocked by banks**.
3. **App-Specific Launchers:** Use dedicated buttons for PhonePe (`phonepe://`), Google Pay (`tez://`), or Paytm (`paytmmp://`).

---

## 🌐 Deploying to Vercel with Custom Subdomain

1. Push your repository to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Set your Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. In Vercel Project Settings $\rightarrow$ **Domains**:
   - Add your custom subdomain (e.g. `moneyspliter.imshashank.space`).
5. In your DNS provider (Hostinger / Cloudflare):
   - Add a `CNAME` record:
     - **Host / Name:** `moneyspliter`
     - **Target / Value:** `cname.vercel-dns.com`
     - **TTL:** Automatic or 3600
6. In Supabase Dashboard $\rightarrow$ **Authentication** $\rightarrow$ **URL Configuration**:
   - Add your production URL (`https://moneyspliter.imshashank.space`) to **Site URL** and **Redirect URLs** for Google OAuth.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
