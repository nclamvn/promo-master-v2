# TÀI LIỆU BÀN GIAO DỰ ÁN PROMO MASTER V2

**Ngày tạo:** 2026-02-05
**Phiên bản:** 2.0
**Dự án:** PROMO MASTER V2 - Trade Promotion Management System (Aforza-style)

---

## MỤC LỤC

1. [Tổng Quan](#1-tổng-quan)
2. [Kiến Trúc Hệ Thống](#2-kiến-trúc-hệ-thống)
3. [Phase 5: Budget & Target Integration](#3-phase-5-budget--target-integration)
4. [API Endpoints](#4-api-endpoints)
5. [Frontend Hooks & Components](#5-frontend-hooks--components)
6. [Cơ Sở Dữ Liệu](#6-cơ-sở-dữ-liệu)
7. [Hướng Dẫn Phát Triển](#7-hướng-dẫn-phát-triển)
8. [Pending Tasks](#8-pending-tasks)

---

## 1. TỔNG QUAN

### 1.1 Mô Tả Dự Án

**PROMO MASTER V2** là phiên bản nâng cấp của hệ thống quản lý khuyến mại thương mại, được thiết kế theo best practices của **Aforza TPM** với các tính năng enterprise-grade:

- Multi-level approval workflow
- Fund Health Score calculation
- Hierarchical Geographic allocation (Country → Region → Province → District → Dealer)
- Activity-Fund ROI tracking
- Period-over-period comparison

### 1.2 Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  React 18 | Vite | TailwindCSS | TanStack Query            │
└─────────────────────────────────────────────────────────────┘
                              ↓ REST API
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                              │
│  Vercel Serverless Functions | Prisma 5 | JWT Auth         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                       DATABASE                              │
│            PostgreSQL (Neon) | Prisma ORM                  │
└─────────────────────────────────────────────────────────────┘
```

### 1.3 Monorepo Structure

```
promo-master-v2/
├── apps/
│   ├── api/                    # Vercel Serverless Functions
│   │   ├── budgets/           # Budget CRUD + Approval
│   │   ├── targets/           # Target + Allocations
│   │   ├── fund-activities/   # Fund-Activity linking
│   │   ├── budget-allocations/
│   │   ├── target-allocations/
│   │   ├── geographic-units/
│   │   ├── _lib/              # Shared utilities
│   │   └── prisma/
│   │       ├── schema.prisma  # Database schema
│   │       └── seeds/         # Seed data
│   │
│   └── web/                    # React + Vite Frontend
│       └── src/
│           ├── pages/
│           │   ├── budget/    # Budget pages
│           │   └── targets/   # Target pages
│           ├── components/
│           │   └── budget/    # Budget components
│           └── hooks/         # React Query hooks
│
└── packages/
    └── shared/                # Shared types
```

---

## 2. KIẾN TRÚC HỆ THỐNG

### 2.1 Approval Workflow (Aforza-style)

```
┌──────────────────────────────────────────────────────────────┐
│                 MULTI-LEVEL APPROVAL WORKFLOW                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Amount Threshold    │  Approval Levels                      │
│  ────────────────────┼─────────────────────────────────────  │
│  < 100M VND          │  KAM only                             │
│  100M - 500M VND     │  KAM → Trade Marketing                │
│  > 500M VND          │  KAM → Trade Marketing → Finance      │
│                                                              │
│  Status Flow:                                                │
│  DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED/REJECTED       │
│                        ↓                                     │
│                   REVISION_NEEDED                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Fund Health Score (4 Dimensions)

```
┌──────────────────────────────────────────────────────────────┐
│                    FUND HEALTH SCORE                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Dimension       │  Weight │  Calculation                    │
│  ────────────────┼─────────┼───────────────────────────────  │
│  Utilization     │   35%   │  (spent/allocated) optimal 80%  │
│  Timeliness      │   25%   │  Expected vs Actual burn rate   │
│  ROI             │   25%   │  Revenue generated / Spent      │
│  Coverage        │   15%   │  Active allocations %           │
│                                                              │
│  Score Levels:                                               │
│  ≥85 = EXCELLENT │ ≥70 = GOOD │ ≥50 = WARNING │ <50 = CRITICAL│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 2.3 Geographic Hierarchy

```
┌──────────────────────────────────────────────────────────────┐
│                  VIETNAM GEOGRAPHIC HIERARCHY                │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  COUNTRY (VN)                                                │
│     └── REGION (Miền Bắc, Miền Trung, Miền Nam, Tây Nguyên)  │
│            └── PROVINCE (63 tỉnh/thành)                      │
│                  └── DISTRICT (Quận/Huyện)                   │
│                        └── DEALER (Đại lý)                   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. PHASE 5: BUDGET & TARGET INTEGRATION

### 3.1 Completed Tasks

| Task | Status | Description |
|------|--------|-------------|
| Budget API Enhancement | ✅ | CRUD + Approval workflow |
| Budget Submit/Review | ✅ | Multi-level approval |
| Approval History | ✅ | Audit trail |
| Fund Health Score | ✅ | 4-dimension calculation |
| Budget Comparison | ✅ | Period-over-period |
| Target Allocation APIs | ✅ | Hierarchical allocation tree |
| Target Progress | ✅ | Progress by geographic level |
| Fund Activity APIs | ✅ | Activity-Fund linking + ROI |
| Frontend Hooks | ✅ | All React Query hooks |
| UI Components | ✅ | Health Score, Comparison, ROI Dashboard |
| Seed Data | ✅ | Geographic + Demo data |

### 3.2 API Files Created

```
apps/api/
├── budgets/
│   ├── index.ts              # GET list, POST create
│   ├── [id].ts               # GET/PUT/DELETE single
│   ├── [id]/
│   │   ├── submit.ts         # POST - Submit for approval
│   │   ├── review.ts         # POST - Approve/Reject
│   │   ├── approval-history.ts # GET - Audit trail
│   │   ├── health-score.ts   # GET - Fund health
│   │   └── comparison.ts     # GET - Period comparison
│
├── targets/
│   ├── [id]/
│   │   ├── progress.ts       # GET - Progress by level
│   │   ├── allocation.ts     # GET tree, POST create
│   │   └── allocation/
│   │       └── [allocId].ts  # GET/PUT/DELETE allocation
│
└── fund-activities/
    ├── index.ts              # GET list, POST create
    ├── [id].ts               # GET/PUT/DELETE single
    └── summary.ts            # GET - ROI summary
```

### 3.3 Frontend Files Created/Modified

```
apps/web/src/
├── hooks/
│   ├── useBudgets.ts         # + Approval, Health, Comparison
│   ├── useTargets.ts         # + Progress, Allocation nested
│   └── useFundActivities.ts  # NEW - Activity hooks
│
├── components/budget/
│   ├── FundHealthScore.tsx   # Health gauge component
│   ├── BudgetComparison.tsx  # Period comparison chart
│   ├── FundActivityROI.tsx   # ROI Dashboard
│   └── index.ts              # Exports
│
└── pages/
    ├── budget/
    │   ├── Approval.tsx      # Wired to real APIs
    │   └── Allocation.tsx    # Wired to real APIs
    └── targets/
        └── TargetAllocation.tsx # Wired with dialogs
```

---

## 4. API ENDPOINTS

### 4.1 Budget APIs

```
# CRUD
GET    /budgets                    # List with pagination
POST   /budgets                    # Create budget
GET    /budgets/:id                # Get single (with comparison)
PUT    /budgets/:id                # Update budget
DELETE /budgets/:id                # Delete budget

# Approval Workflow
POST   /budgets/:id/submit         # Submit for approval
POST   /budgets/:id/review         # Approve/Reject/Revision

# Analytics
GET    /budgets/:id/approval-history # Audit trail
GET    /budgets/:id/health-score     # Fund health calculation
GET    /budgets/:id/comparison       # Period comparison
```

### 4.2 Target APIs

```
# CRUD
GET    /targets                    # List targets
POST   /targets                    # Create target
GET    /targets/:id                # Get single
PUT    /targets/:id                # Update
DELETE /targets/:id                # Delete

# Allocations (Nested Routes)
GET    /targets/:id/allocation     # Get allocation tree + summary
POST   /targets/:id/allocation     # Create allocation
GET    /targets/:id/allocation/:allocId  # Get single allocation
PUT    /targets/:id/allocation/:allocId  # Update allocation
DELETE /targets/:id/allocation/:allocId  # Delete allocation

# Progress
GET    /targets/:id/progress       # Progress by geographic level
```

### 4.3 Fund Activity APIs

```
GET    /fund-activities            # List with filtering
POST   /fund-activities            # Create activity
GET    /fund-activities/:id        # Get single
PUT    /fund-activities/:id        # Update (spent, revenue, status)
DELETE /fund-activities/:id        # Delete (PLANNED only)
GET    /fund-activities/summary    # ROI analysis summary
```

---

## 5. FRONTEND HOOKS & COMPONENTS

### 5.1 Budget Hooks (`useBudgets.ts`)

```typescript
// Basic CRUD
useBudgets(params)                 // List budgets
useBudget(id)                      // Get single
useCreateBudget()                  // Create mutation
useUpdateBudget()                  // Update mutation
useDeleteBudget()                  // Delete mutation

// Approval Workflow
useSubmitBudget()                  // Submit for approval
useReviewBudget()                  // Approve/Reject/Revision
useApprovalHistory(budgetId)       // Audit trail

// Analytics
useFundHealthScore(budgetId)       // Health score data
useBudgetComparison(budgetId)      // Period comparison data
```

### 5.2 Target Hooks (`useTargets.ts`)

```typescript
// Basic CRUD
useTargets(params)                 // List targets
useTarget(id)                      // Get single

// Progress
useTargetProgress(targetId)        // Progress by level
useTargetAllocationTreeWithSummary(targetId)

// Allocations (Nested)
useCreateTargetAllocationNested(targetId)
useUpdateTargetAllocationNested(targetId)
useDeleteTargetAllocationNested(targetId)
useUpdateTargetProgress()          // Update achieved value
```

### 5.3 Fund Activity Hooks (`useFundActivities.ts`)

```typescript
useFundActivities(params)          // List activities
useFundActivity(id)                // Get single
useFundActivitySummary(budgetId?)  // ROI analysis
useCreateFundActivity()            // Create
useUpdateFundActivity()            // Update
useDeleteFundActivity()            // Delete
```

### 5.4 Components

| Component | Description |
|-----------|-------------|
| `FundHealthScore` | Circular gauge with 4-dimension breakdown |
| `BudgetComparison` | Period comparison with trending chart |
| `FundActivityROI` | ROI Dashboard with activity list |

---

## 6. CƠ SỞ DỮ LIỆU

### 6.1 Key Models Added in Phase 5

```prisma
// Budget Approval Workflow
model BudgetApproval {
  id            String   @id @default(cuid())
  budgetId      String
  step          Int
  level         Int
  role          String
  status        BudgetApprovalStatus
  reviewerId    String?
  comments      String?
  submittedAt   DateTime
  reviewedAt    DateTime?
}

// Fund Activity (ROI Tracking)
model FundActivity {
  id               String   @id @default(cuid())
  budgetId         String
  activityType     String   // promotion, display, sampling, event, listing_fee
  activityName     String
  allocatedAmount  Decimal
  spentAmount      Decimal
  revenueGenerated Decimal?
  roi              Decimal? // Calculated: revenue/spent
  status           String   // PLANNED, ACTIVE, COMPLETED, CANCELLED
}

// Enhanced Budget
model Budget {
  // ... existing fields
  fundType        BudgetFundType     // PROMOTIONAL, TACTICAL, etc.
  approvalStatus  BudgetApprovalStatus
  approvalLevel   Int
  minApproval     Decimal?
  maxApproval     Decimal?
}
```

### 6.2 Seed Data

Run seed to populate demo data:

```bash
cd apps/api
npm run db:seed
```

**Creates:**
- Vietnam geographic hierarchy (Country → Region → Province → District → Dealer)
- 4 sample budgets with allocations
- 3 sample targets with allocations
- 6 fund activities with ROI data

---

## 7. HƯỚNG DẪN PHÁT TRIỂN

### 7.1 Quick Start

```bash
# 1. Clone & Install
cd promo-master-v2
pnpm install

# 2. Setup Environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# 3. Database
cd apps/api
npx prisma db push
npm run db:seed

# 4. Start Development
pnpm dev
```

### 7.2 Environment Variables

**API (.env)**
```
DATABASE_URL=postgresql://...@neon.tech/promo_master
JWT_SECRET=your-secret
```

**Web (.env)**
```
VITE_API_URL=http://localhost:3000/api
```

### 7.3 Development URLs

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API (Vercel Dev) | http://localhost:3000/api |
| Prisma Studio | npx prisma studio |

---

## 8. PENDING TASKS

### 8.1 Days 9-10: E2E Testing & Polish

| Task | Priority | Estimate |
|------|----------|----------|
| E2E Tests for Budget Approval | High | 1 day |
| E2E Tests for Target Allocation | High | 0.5 day |
| UI Polish & Error Handling | Medium | 0.5 day |
| Performance Optimization | Low | As needed |

### 8.2 Future Enhancements

- [ ] Bulk allocation import/export
- [ ] Allocation templates
- [ ] Advanced filtering on allocation pages
- [ ] Real-time notifications for approval
- [ ] Dashboard widgets for health scores
- [ ] Mobile-responsive allocation views

---

**Tài liệu này được tạo bởi Claude Code.**
**Cập nhật lần cuối:** 2026-02-05

**Repository:** `/Users/mac/TPM-TPO/promo-master-v2`
