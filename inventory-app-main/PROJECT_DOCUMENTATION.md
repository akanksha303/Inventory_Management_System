# InventoryPro — Project Documentation

## 1. System Overview

InventoryPro is a cloud-connected Inventory Management System designed for small and medium-sized enterprises (SMEs) to streamline their procurement, sales, and manufacturing workflows. The system replaces fragmented spreadsheet-based tracking with a centralized, modern web application that provides real-time inventory visibility and automated stock reconciliation.

### Key Features Implemented

| Module | Functionality |
|---|---|
| **Product Management** | Full CRUD with product codes, prices, quantities, weights. Sortable columns, low-stock alerts (< 50 units). |
| **Sales Orders** | Pipeline: Quotation → Packing → Dispatch → Completed. Auto-fill customer details, unlimited product rows. Stock auto-deducted on dispatch. |
| **Purchase Orders** | Pipeline: Received → Unpaid → Paid → Completed. Auto-fill supplier details. Stock auto-added on completion. |
| **Manufacturing (WIP)** | Batch tracking with raw material deduction on start and output addition on completion. |
| **Dashboard** | Summary stat cards, Stock Level bar chart, Top Products chart, Sales Status donut chart, Activity Feed, Quick Access panel. |
| **Order History** | Filtered views (Sales/Purchases/Manufacturing) with CSV export, sortable data tables. |
| **Dark Mode** | Full theme toggle with localStorage persistence. |
| **Keyboard Shortcuts** | Alt+key navigation for all modules. |
| **Print View** | Print-optimized output for order and product detail panels. |
| **Authentication** | Single shared login with JWT-based session management and edge middleware route protection. |

---

## 2. Architecture & Technology Stack

### Technology Stack

- **Frontend + Backend**: Next.js 16 (App Router) with TypeScript — server-side rendered pages and RESTful API routes in a single codebase.
- **Database**: PostgreSQL via Neon (serverless cloud database).
- **ORM**: Prisma v6 — type-safe database queries with automatic migrations and seeding.
- **Charts**: Recharts for interactive data visualizations on the dashboard.
- **Styling**: Custom vanilla CSS design system with CSS variables, supporting both light and dark themes.
- **Authentication**: `jose` library for JWT operations, compatible with Next.js Edge Runtime middleware.
- **Deployment**: Vercel (auto-deploys from GitHub).

### Architecture Highlights

1. **Edge Middleware Authentication**: All routes except `/login` and `/api/auth/*` are protected by middleware that validates JWT tokens at the edge layer — before any page content loads.

2. **Automatic Inventory Reconciliation**: Stock quantities are never manually adjusted. Instead, Prisma transactions automatically update product quantities when order statuses advance (e.g., dispatching a sale deducts stock atomically).

3. **Master-Detail UI Pattern**: All data pages (Products, Sales, Purchases, Manufacturing) use an enterprise-standard layout with a searchable list panel on the left and a contextual detail panel on the right.

---

## 3. How the System Addresses the Problem Statement

| Problem Statement Requirement | Our Implementation |
|---|---|
| Centralized inventory tracking | Single PostgreSQL database with real-time updates across all modules |
| Sales order pipeline (Quotation → Dispatch → History) | Full 4-stage pipeline with visual progress indicators |
| Purchase order pipeline (Received → Paid → Completed) | Full 4-stage pipeline with auto-stock updates |
| Manufacturing/WIP tracking | Batch tracking with raw material deduction and output addition |
| Dashboard with summary metrics | 6 stat cards + 3 interactive charts + activity feed |
| Clean, modern UI | Enterprise design system with dark mode, animations, and responsive layouts |
| Cloud-hosted with shared login | Deployed on Vercel + Neon PostgreSQL; single JWT-based login |
| Export capabilities | CSV export from Order History page |
| Sortable data tables | Sortable columns on Products page (Name, Qty, Price) |
| ₹ currency formatting | All monetary values displayed as ₹X,XXX.XX |

---

## 4. Instructions to Run / Access

### Live Application
- **URL**: *https://inventory-app-sigma-dun.vercel.app/login*
- **Credentials**: Username: `admin` | Password: `admin123`

### Local Development
```bash
git clone https://github.com/Jainparth22/inventory-app.git
cd inventory-app
npm install
# Configure .env with DATABASE_URL, DIRECT_URL, JWT_SECRET, ADMIN_USERNAME, ADMIN_PASSWORD
npx prisma generate && npx prisma db push && npx prisma db seed
npm run dev
# Open http://localhost:3000
```

---

**Member 1**: Akanksha Tripathi
**Email**: *tripathiakanksha339@gmail.com*



**Member 2**: Parth Jain
**Email**: *jain22parth@gmail.com*


**GitHub**: https://github.com/Jainparth22/inventory-app