# InventoryPro — Modern Inventory Management System

InventoryPro is a full-stack, cloud-connected Inventory Management System built for SMEs. It streamlines procurement, sales, and manufacturing workflows with real-time inventory tracking, data visualization, and a premium enterprise-grade user interface.

## 🌐 Live Demo

**Production URL**: *https://inventory-app-sigma-dun.vercel.app/login*
**GitHub**: https://github.com/Jainparth22/inventory-app

**Login Credentials**: `admin` / `admin123`

### 🖥️ Install as Desktop App (Windows)
1. Open the Vercel URL in **Google Chrome** or **Microsoft Edge**
2. Click the **install icon** (⊕) in the browser's address bar
3. Click "Install" — the app launches as a standalone desktop window with its own taskbar icon

## 🚀 Features

### Core Modules
- **Product Management**: Track products with codes, prices, quantities, weights, and descriptions. Sortable columns and low-stock reorder alerts.
- **Sales Orders**: Full pipeline — Quotation → Packing → Dispatch → Complete. Stock auto-deducted on dispatch.
- **Purchase Orders**: Full pipeline — Received → Unpaid → Paid → Complete. Stock auto-added on completion.
- **Manufacturing (WIP)**: Track active batches. Raw materials deducted on start, outputs added on completion.
- **Order History**: Filtered views for sales, purchases, and manufacturing with CSV export.

### Dashboard & Analytics
- Quick Access panel for instant navigation
- Real-time stat cards (inventory value, sales revenue, purchase costs, active WIP)
- Interactive bar charts (Stock Levels, Top Products by Value)
- Donut chart (Sales Status Distribution)
- Live Activity Feed

### UI/UX Enhancements
- 🌙 **Dark Mode** — Toggle with persistence (localStorage)
- ⌨️ **Keyboard Shortcuts** — Alt+D (Dashboard), Alt+P (Products), Alt+S (Sales), Alt+U (Purchases), Alt+M (Manufacturing), Alt+H (History), Alt+T (Toggle theme)
- 🖨️ **Print** — Print-optimized views for orders and products
- ⚠️ **Low-Stock Alerts** — Visual indicators when stock drops below 50 units
- 🔐 **Authentication** — JWT-based login with edge middleware protection

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| Database | PostgreSQL (Neon — serverless) |
| ORM | Prisma v6 |
| Charts | Recharts |
| Styling | Vanilla CSS (Custom Design System) |
| Auth | jose (Edge-compatible JWT) |
| Icons | Lucide React |
| Hosting | Vercel |

## 📦 Local Setup

Depending on how you received this project (ZIP vs GitHub), follow the relevant setup instructions below:

### Option A: Running from the Submission ZIP (For Judges)
The ZIP automatically includes the pre-filled SQLite database for immediate testing.
1. Extract the ZIP and open the folder in your terminal.
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Start the application:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`

### Option B: Running from GitHub Clone
If you are cloning freshly from GitHub, you will need to generate the local database.
1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jainparth22/inventory-app.git
   cd inventory-app
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
   *(This downloads packages and automatically runs `prisma generate`)*
3. **Generate the Database & Seed Data:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```
   *(This creates the physical `dev.db` file and fills it with dummy data)*
4. **Start the application:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`

### 🔄 Resetting the Database
If you ever mess up the data while testing and want to wipe all data and start fresh with the default demo data, run:
```bash
npx prisma db push --force-reset --accept-data-loss
npx prisma db seed
```

### ☁️ Switching Between Local & Cloud Database
The `prisma/schema.prisma` file has **both configurations** — one is active, one is commented out.

**Currently active → Local SQLite (default for local development):**
```prisma
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**To switch to Cloud PostgreSQL (Neon/Vercel):**
1. Open `prisma/schema.prisma`
2. Comment out the SQLite block above
3. Uncomment the PostgreSQL block below it:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
}
```
4. Add `DATABASE_URL` to your `.env` file (get the URL from your [Neon dashboard](https://neon.tech))
5. Run `npx prisma db push` to sync the schema to the cloud

## 🏗 Architecture

- **Server Components + API Routes**: Next.js App Router for SSR pages and REST API endpoints under `/api/`.
- **Edge Middleware**: JWT validation via `jose` — routes are protected before page load.
- **Master-Detail Layout**: Enterprise UI pattern with left-side list navigation and right-side detail panels.
- **Automatic Inventory Reconciliation**: Stock levels are updated automatically via Prisma transactions when order statuses advance.
- **Cloud-Native**: PostgreSQL on Neon (serverless) + Vercel for zero-downtime deployment.

## 📁 Project Structure

```
inventory-app/
├── prisma/
│   ├── schema.prisma          # Database schema (7 models)
│   └── seed.ts                # Demo data seeder
├── src/
│   ├── app/
│   │   ├── api/               # REST API routes
│   │   │   ├── auth/          # Login/Logout/Me endpoints
│   │   │   ├── activity/      # Activity feed endpoint
│   │   │   ├── dashboard/     # Dashboard analytics
│   │   │   ├── products/      # Product CRUD
│   │   │   ├── orders/        # Order CRUD + advance status
│   │   │   ├── customers/     # Customer listing
│   │   │   ├── suppliers/     # Supplier listing
│   │   │   └── manufacturing/ # Manufacturing CRUD
│   │   ├── login/             # Login page
│   │   ├── products/          # Products page
│   │   ├── sales/             # Sales orders page
│   │   ├── purchases/         # Purchase orders page
│   │   ├── manufacturing/     # Manufacturing (WIP) page
│   │   ├── history/           # Order history + CSV export
│   │   ├── page.tsx           # Dashboard
│   │   ├── layout.tsx         # Root layout with conditional sidebar
│   │   └── globals.css        # Complete design system
│   ├── components/
│   │   └── Sidebar.tsx        # Navigation + dark mode + shortcuts
│   ├── lib/
│   │   ├── prisma.ts          # Prisma client singleton
│   │   ├── auth.ts            # JWT sign/verify utilities
│   │   └── utils.ts           # Formatting helpers
│   └── middleware.ts          # Route protection
├── next.config.ts
├── package.json
└── README.md
```

## 📄 License
MIT
