// ══════════════════════════════════════════════════════════════════════════════
//                    MSW HANDLERS - ALL API ENDPOINTS (COMPLETE)
// ══════════════════════════════════════════════════════════════════════════════

import { http, HttpResponse, delay } from 'msw';

// Import mock data
import { mockPromotions, mockPromotionStats } from '../data/promotions';
import { mockClaims, mockClaimStats } from '../data/claims';
import { mockCustomers, mockProducts, mockUsers, currentUser } from '../data/master-data';
import { mockAccruals, mockDeductions, mockJournals, mockCheques, mockFinanceStats } from '../data/finance';
import {
  mockDeliveries, mockSellData, mockInventory,
  mockERPSyncs, mockDMSSyncs, mockWebhooks,
  mockInsights, mockRecommendations,
  mockReports, mockDashboardKPIs, mockChartData
} from '../data/operations-ai-bi';

// ══════════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ══════════════════════════════════════════════════════════════════════════════

function paginate<T>(items: T[], page: number, pageSize: number) {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return {
    data: items.slice(start, end),
    pagination: {
      page,
      pageSize,
      total: items.length,
      totalPages: Math.ceil(items.length / pageSize),
    },
  };
}

function filterItems<T extends Record<string, unknown>>(
  items: T[],
  params: URLSearchParams
): T[] {
  let filtered = [...items];

  const status = params.get('status');
  const type = params.get('type');
  const search = params.get('search') || params.get('q');
  const customerId = params.get('customerId');

  if (status) {
    filtered = filtered.filter(item => item.status === status);
  }
  if (type) {
    filtered = filtered.filter(item => item.type === type);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(item =>
      (typeof item.name === 'string' && item.name.toLowerCase().includes(searchLower)) ||
      (typeof item.code === 'string' && item.code.toLowerCase().includes(searchLower)) ||
      (typeof item.description === 'string' && item.description.toLowerCase().includes(searchLower))
    );
  }
  if (customerId) {
    filtered = filtered.filter(item => item.customerId === customerId);
  }

  return filtered;
}

// ══════════════════════════════════════════════════════════════════════════════
// MOCK DATA (inline for missing entities)
// ══════════════════════════════════════════════════════════════════════════════

const mockTemplates = [
  { id: 'tpl-1', name: 'Summer Sale Template', description: 'Standard summer promotion template', type: 'DISCOUNT', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z', config: { discountType: 'PERCENTAGE', discountValue: 15 } },
  { id: 'tpl-2', name: 'BOGO Template', description: 'Buy one get one free template', type: 'BOGO', status: 'ACTIVE', createdAt: '2026-01-02T00:00:00Z', updatedAt: '2026-01-16T00:00:00Z', config: { buyQty: 1, getQty: 1 } },
  { id: 'tpl-3', name: 'Rebate Template', description: 'Standard rebate promotion', type: 'REBATE', status: 'DRAFT', createdAt: '2026-01-03T00:00:00Z', updatedAt: '2026-01-17T00:00:00Z', config: { rebatePercent: 10 } },
];

// Helper to generate daily projections
function generateDailyProjections(days: number, baselineSales: number) {
  const projections = [];
  let cumulativeNetMargin = 0;
  for (let i = 1; i <= days; i++) {
    const baseline = baselineSales / days;
    const projected = baseline * (1 + 0.18);
    const cost = projected * 0.08;
    const margin = projected * 0.25 - cost;
    cumulativeNetMargin += margin;
    projections.push({
      day: i,
      date: `2026-0${Math.floor(i / 30) + 1}-${String(i % 30 + 1).padStart(2, '0')}`,
      baselineSales: baseline,
      projectedSales: projected,
      promotionCost: cost,
      cumulativeROI: (cumulativeNetMargin / (cost * i)) * 100,
      cumulativeNetMargin,
    });
  }
  return projections;
}

const mockScenarios = [
  {
    id: 'scn-1',
    name: 'Q1 2026 Budget Scenario',
    description: 'Planning for Q1 budget allocation',
    status: 'COMPLETED',
    type: 'BUDGET',
    totalBudget: 500000000,
    projectedROI: 12.5,
    parameters: { duration: 90, budget: 500000000, expectedLiftPercent: 15, redemptionRatePercent: 65, promotionType: 'DISCOUNT', discountPercent: 15, startDate: '2026-01-01' },
    results: {
      roi: 12.5,
      netMargin: 75000000,
      salesLiftPercent: 18.2,
      paybackDays: 45,
      baselineSales: 2500000000,
      projectedSales: 2955000000,
      incrementalSales: 455000000,
      promotionCost: 380000000,
      fundingRequired: 418000000,
      costPerIncrementalUnit: 25000,
      grossMargin: 590000000,
      projectedUnits: 118200,
      incrementalUnits: 18200,
      redemptions: 76830,
      dailyProjections: generateDailyProjections(90, 2500000000),
    },
    baseline: { id: 'bsl-1', name: '2025 Q4 Baseline', code: 'BSL-Q4-2025' },
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z'
  },
  {
    id: 'scn-2',
    name: 'Summer Campaign Scenario',
    description: 'Summer promotion planning',
    status: 'DRAFT',
    type: 'CAMPAIGN',
    totalBudget: 300000000,
    projectedROI: 15.2,
    parameters: { duration: 60, budget: 300000000, expectedLiftPercent: 20, redemptionRatePercent: 70, promotionType: 'BOGO', discountPercent: 50, startDate: '2026-06-01' },
    results: null,
    baseline: { id: 'bsl-2', name: '2025 Annual Baseline', code: 'BSL-2025' },
    createdAt: '2026-01-05T00:00:00Z',
    updatedAt: '2026-01-21T00:00:00Z'
  },
  {
    id: 'scn-3',
    name: 'New Product Launch',
    description: 'New product promotion scenario',
    status: 'COMPLETED',
    type: 'LAUNCH',
    totalBudget: 200000000,
    projectedROI: 18.0,
    parameters: { duration: 30, budget: 200000000, expectedLiftPercent: 25, redemptionRatePercent: 80, promotionType: 'REBATE', discountPercent: 20, startDate: '2026-02-15' },
    results: {
      roi: 18.0,
      netMargin: 36000000,
      salesLiftPercent: 28.5,
      paybackDays: 21,
      baselineSales: 800000000,
      projectedSales: 1028000000,
      incrementalSales: 228000000,
      promotionCost: 160000000,
      fundingRequired: 176000000,
      costPerIncrementalUnit: 18000,
      grossMargin: 257000000,
      projectedUnits: 51400,
      incrementalUnits: 11400,
      redemptions: 41120,
      dailyProjections: generateDailyProjections(30, 800000000),
    },
    baseline: null,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z'
  },
];

const mockClashes = [
  {
    id: 'clash-1',
    clashType: 'PRODUCT_OVERLAP',
    severity: 'HIGH',
    status: 'PENDING',
    promotionA: { id: 'promo-1', name: 'Summer Sale 2026', code: 'SUMMER-2026' },
    promotionB: { id: 'promo-2', name: 'Flash Discount Week', code: 'FLASH-2026' },
    description: 'Both promotions target the same product category (Beverages) during overlapping periods',
    detectedAt: '2026-01-20T00:00:00Z',
    overlapStart: '2026-02-01T00:00:00Z',
    overlapEnd: '2026-02-15T00:00:00Z',
    affectedCustomers: ['cust-001', 'cust-002', 'cust-003'],
    affectedProducts: ['prod-001', 'prod-002', 'prod-003', 'prod-004'],
    potentialImpact: 150000000,
  },
  {
    id: 'clash-2',
    clashType: 'BUDGET_EXCEEDED',
    severity: 'MEDIUM',
    status: 'PENDING',
    promotionA: { id: 'promo-3', name: 'Q1 Rebate Program', code: 'REBATE-Q1' },
    promotionB: { id: 'promo-4', name: 'New Product Launch', code: 'NPL-2026' },
    description: 'Combined budget allocation exceeds quarterly limit by 15%',
    detectedAt: '2026-01-21T00:00:00Z',
    overlapStart: '2026-01-15T00:00:00Z',
    overlapEnd: '2026-03-31T00:00:00Z',
    affectedCustomers: ['cust-001', 'cust-004'],
    affectedProducts: ['prod-005', 'prod-006'],
    potentialImpact: 75000000,
  },
  {
    id: 'clash-3',
    clashType: 'TIMING_CONFLICT',
    severity: 'LOW',
    status: 'RESOLVED',
    promotionA: { id: 'promo-5', name: 'Weekend Special', code: 'WKND-001' },
    promotionB: { id: 'promo-6', name: 'Holiday Promotion', code: 'HOLIDAY-2026' },
    description: 'Promotions scheduled for the same weekend period',
    detectedAt: '2026-01-19T00:00:00Z',
    overlapStart: '2026-01-25T00:00:00Z',
    overlapEnd: '2026-01-27T00:00:00Z',
    affectedCustomers: ['cust-002'],
    affectedProducts: ['prod-001'],
    potentialImpact: 25000000,
    resolution: 'MERGED',
    resolvedAt: '2026-01-20T00:00:00Z',
    resolvedBy: { id: 'user-1', name: 'Admin User' },
  },
];

const mockBudgets = [
  { id: 'bud-1', name: 'Q1 2026 Marketing', code: 'BUD-2026-Q1', totalAmount: 500000000, allocatedAmount: 350000000, spentAmount: 120000000, remainingAmount: 380000000, status: 'ACTIVE', period: 'Q1-2026', year: 2026, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-20T00:00:00Z' },
  { id: 'bud-2', name: 'Summer Campaign', code: 'BUD-2026-SUM', totalAmount: 300000000, allocatedAmount: 200000000, spentAmount: 50000000, remainingAmount: 250000000, status: 'ACTIVE', period: 'Q2-2026', year: 2026, createdAt: '2026-01-15T00:00:00Z', updatedAt: '2026-01-21T00:00:00Z' },
  { id: 'bud-3', name: 'Q3 Regional', code: 'BUD-2026-Q3', totalAmount: 400000000, allocatedAmount: 100000000, spentAmount: 0, remainingAmount: 400000000, status: 'DRAFT', period: 'Q3-2026', year: 2026, createdAt: '2026-01-20T00:00:00Z', updatedAt: '2026-01-22T00:00:00Z' },
];

const mockFunds = [
  { id: 'fund-1', code: 'MKT-001', name: 'Marketing Fund 2026', type: 'MARKETING', totalAmount: 1000000000, allocatedAmount: 600000000, availableAmount: 400000000, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-20T00:00:00Z' },
  { id: 'fund-2', code: 'TRD-001', name: 'Trade Fund Q1', type: 'TRADE', totalAmount: 500000000, allocatedAmount: 300000000, availableAmount: 200000000, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-21T00:00:00Z' },
  { id: 'fund-3', code: 'PRO-001', name: 'Promotional Fund', type: 'PROMOTIONAL', totalAmount: 800000000, allocatedAmount: 400000000, availableAmount: 400000000, status: 'ACTIVE', createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-01-22T00:00:00Z' },
];

const mockTargets = [
  { id: 'tgt-1', name: 'Q1 Sales Target', type: 'SALES', targetValue: 5000000000, currentValue: 2500000000, progress: 50, period: 'Q1-2026', status: 'IN_PROGRESS', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-20T00:00:00Z' },
  { id: 'tgt-2', name: 'Customer Acquisition', type: 'ACQUISITION', targetValue: 100, currentValue: 45, progress: 45, period: 'Q1-2026', status: 'IN_PROGRESS', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-21T00:00:00Z' },
  { id: 'tgt-3', name: 'Market Share', type: 'MARKET_SHARE', targetValue: 25, currentValue: 22, progress: 88, period: 'Q1-2026', status: 'IN_PROGRESS', createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-01-22T00:00:00Z' },
];

const mockBaselines = [
  { id: 'bsl-1', name: '2025 Q4 Baseline', type: 'QUARTERLY', period: 'Q4-2025', salesVolume: 4500000000, margin: 18.5, status: 'APPROVED', createdAt: '2025-10-01T00:00:00Z', updatedAt: '2025-12-31T00:00:00Z' },
  { id: 'bsl-2', name: '2025 Annual Baseline', type: 'ANNUAL', period: '2025', salesVolume: 18000000000, margin: 17.8, status: 'APPROVED', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-12-31T00:00:00Z' },
  { id: 'bsl-3', name: '2026 Q1 Baseline', type: 'QUARTERLY', period: 'Q1-2026', salesVolume: 5000000000, margin: 19.0, status: 'DRAFT', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-20T00:00:00Z' },
];

const mockNotifications = [
  { id: 'n1', type: 'INFO', title: 'Welcome!', message: 'Welcome to Promo Master', read: false, createdAt: new Date().toISOString() },
  { id: 'n2', type: 'SUCCESS', title: 'Promotion Approved', message: 'SUMMER-2026 has been approved', read: false, createdAt: new Date().toISOString() },
  { id: 'n3', type: 'WARNING', title: 'Budget Alert', message: 'Q1 Marketing budget is 80% utilized', read: true, createdAt: new Date().toISOString() },
];

const mockAPIKeys = [
  { id: 'key-1', name: 'Production API Key', key: 'pk_live_xxx...xxx', status: 'ACTIVE', permissions: ['read', 'write'], lastUsed: '2026-01-25T10:00:00Z', createdAt: '2026-01-01T00:00:00Z' },
  { id: 'key-2', name: 'Test API Key', key: 'pk_test_xxx...xxx', status: 'ACTIVE', permissions: ['read'], lastUsed: '2026-01-24T15:00:00Z', createdAt: '2026-01-05T00:00:00Z' },
];

const mockAuditLogs = [
  { id: 'log-1', action: 'CREATE', entityType: 'PROMOTION', entityId: 'promo-1', userId: 'user-1', userName: 'Admin User', details: 'Created promotion SUMMER-2026', timestamp: '2026-01-20T10:00:00Z' },
  { id: 'log-2', action: 'UPDATE', entityType: 'PROMOTION', entityId: 'promo-1', userId: 'user-1', userName: 'Admin User', details: 'Updated promotion budget', timestamp: '2026-01-21T14:00:00Z' },
  { id: 'log-3', action: 'APPROVE', entityType: 'CLAIM', entityId: 'claim-1', userId: 'user-2', userName: 'Finance Manager', details: 'Approved claim CLM-2026-001', timestamp: '2026-01-22T09:00:00Z' },
];

// ══════════════════════════════════════════════════════════════════════════════
// HANDLERS
// ══════════════════════════════════════════════════════════════════════════════

export const handlers = [
  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════════════════════

  http.post('*/auth/login', async ({ request }) => {
    await delay(500);
    const body = await request.json() as { email?: string; password?: string };
    if (body.email && body.password) {
      const timestamp = Date.now();
      return HttpResponse.json({
        success: true,
        data: {
          user: currentUser,
          accessToken: 'mock-access-token-' + timestamp,
          refreshToken: 'mock-refresh-token-' + timestamp,
        },
      });
    }
    return HttpResponse.json({ success: false, error: { message: 'Invalid credentials' } }, { status: 401 });
  }),

  http.post('*/auth/logout', async () => {
    await delay(200);
    return HttpResponse.json({ success: true });
  }),

  http.get('*/auth/me', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: currentUser });
  }),

  http.post('*/auth/refresh', async () => {
    await delay(200);
    const timestamp = Date.now();
    return HttpResponse.json({
      success: true,
      data: {
        accessToken: 'mock-access-token-refreshed-' + timestamp,
        refreshToken: 'mock-refresh-token-refreshed-' + timestamp,
      },
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // PROMOTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/promotions', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const filtered = filterItems(mockPromotions, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/promotions/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockPromotionStats });
  }),

  http.get('*/promotions/:id', async ({ params }) => {
    await delay(200);
    const promotion = mockPromotions.find(p => p.id === params.id);
    if (!promotion) {
      return HttpResponse.json({ success: false, error: { message: 'Promotion not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: promotion });
  }),

  http.post('*/promotions', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newPromotion = {
      id: `promo-${Date.now()}`,
      ...body,
      status: 'DRAFT',
      spentAmount: 0,
      actualRevenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdById: currentUser.id,
    };
    return HttpResponse.json({ success: true, data: newPromotion }, { status: 201 });
  }),

  http.put('*/promotions/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const promotion = mockPromotions.find(p => p.id === params.id);
    if (!promotion) {
      return HttpResponse.json({ success: false, error: { message: 'Promotion not found' } }, { status: 404 });
    }
    const updated = { ...promotion, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.patch('*/promotions/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const promotion = mockPromotions.find(p => p.id === params.id);
    if (!promotion) {
      return HttpResponse.json({ success: false, error: { message: 'Promotion not found' } }, { status: 404 });
    }
    const updated = { ...promotion, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/promotions/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Promotion deleted' });
  }),

  http.post('*/promotions/:id/submit', async ({ params }) => {
    await delay(500);
    const promotion = mockPromotions.find(p => p.id === params.id);
    if (promotion) {
      return HttpResponse.json({ success: true, data: { ...promotion, status: 'PENDING', updatedAt: new Date().toISOString() } });
    }
    return HttpResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 });
  }),

  http.post('*/promotions/:id/approve', async ({ params }) => {
    await delay(500);
    const promotion = mockPromotions.find(p => p.id === params.id);
    if (promotion) {
      return HttpResponse.json({ success: true, data: { ...promotion, status: 'APPROVED', approvedAt: new Date().toISOString(), approvedById: currentUser.id, updatedAt: new Date().toISOString() } });
    }
    return HttpResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 });
  }),

  http.post('*/promotions/:id/reject', async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as { reason?: string };
    const promotion = mockPromotions.find(p => p.id === params.id);
    if (promotion) {
      return HttpResponse.json({ success: true, data: { ...promotion, status: 'REJECTED', rejectedAt: new Date().toISOString(), rejectionReason: body.reason, updatedAt: new Date().toISOString() } });
    }
    return HttpResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // CLAIMS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/claims', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const filtered = filterItems(mockClaims, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/claims/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockClaimStats });
  }),

  http.get('*/claims/:id', async ({ params }) => {
    await delay(200);
    const claim = mockClaims.find(c => c.id === params.id);
    if (!claim) {
      return HttpResponse.json({ success: false, error: { message: 'Claim not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: claim });
  }),

  http.post('*/claims', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newClaim = {
      id: `claim-${Date.now()}`,
      code: `CLM-2026-${Date.now().toString().slice(-3)}`,
      ...body,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdById: currentUser.id,
    };
    return HttpResponse.json({ success: true, data: newClaim }, { status: 201 });
  }),

  http.patch('*/claims/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const claim = mockClaims.find(c => c.id === params.id);
    if (!claim) {
      return HttpResponse.json({ success: false, error: { message: 'Claim not found' } }, { status: 404 });
    }
    const updated = { ...claim, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/claims/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Claim deleted' });
  }),

  http.post('*/claims/:id/submit', async ({ params }) => {
    await delay(500);
    const claim = mockClaims.find(c => c.id === params.id);
    if (claim) {
      return HttpResponse.json({ success: true, data: { ...claim, status: 'PENDING', submittedAt: new Date().toISOString(), updatedAt: new Date().toISOString() } });
    }
    return HttpResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 });
  }),

  http.post('*/claims/:id/approve', async ({ params }) => {
    await delay(500);
    const claim = mockClaims.find(c => c.id === params.id);
    if (claim) {
      return HttpResponse.json({ success: true, data: { ...claim, status: 'APPROVED', approvedAmount: claim.amount, approvedAt: new Date().toISOString(), approvedById: currentUser.id } });
    }
    return HttpResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 });
  }),

  http.post('*/claims/:id/reject', async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as { reason?: string };
    const claim = mockClaims.find(c => c.id === params.id);
    if (claim) {
      return HttpResponse.json({ success: true, data: { ...claim, status: 'REJECTED', rejectedAt: new Date().toISOString(), rejectionReason: body.reason } });
    }
    return HttpResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // CUSTOMERS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/customers', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const filtered = filterItems(mockCustomers, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/customers/:id', async ({ params }) => {
    await delay(200);
    const customer = mockCustomers.find(c => c.id === params.id);
    if (!customer) {
      return HttpResponse.json({ success: false, error: { message: 'Customer not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: customer });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // PRODUCTS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/products', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const filtered = filterItems(mockProducts, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/products/:id', async ({ params }) => {
    await delay(200);
    const product = mockProducts.find(p => p.id === params.id);
    if (!product) {
      return HttpResponse.json({ success: false, error: { message: 'Product not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: product });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // FUNDS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/funds', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const result = paginate(mockFunds, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/funds/:id', async ({ params }) => {
    await delay(200);
    const fund = mockFunds.find(f => f.id === params.id);
    if (!fund) {
      return HttpResponse.json({ success: false, error: { message: 'Fund not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: fund });
  }),

  http.get('*/funds/:id/utilization', async ({ params }) => {
    await delay(200);
    const fund = mockFunds.find(f => f.id === params.id);
    if (!fund) {
      return HttpResponse.json({ success: false, error: { message: 'Fund not found' } }, { status: 404 });
    }
    return HttpResponse.json({
      success: true,
      data: {
        fundId: fund.id,
        totalAmount: fund.totalAmount,
        allocatedAmount: fund.allocatedAmount,
        availableAmount: fund.availableAmount,
        utilizationRate: ((fund.allocatedAmount / fund.totalAmount) * 100).toFixed(1),
        allocations: [
          { promotionId: 'promo-1', promotionName: 'Summer Sale', amount: 100000000, date: '2026-01-15' },
          { promotionId: 'promo-2', promotionName: 'Flash Discount', amount: 50000000, date: '2026-01-20' },
        ]
      }
    });
  }),

  http.post('*/funds', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newFund = {
      id: `fund-${Date.now()}`,
      code: `FND-${Date.now().toString().slice(-4)}`,
      ...body,
      allocatedAmount: 0,
      availableAmount: body.totalAmount || 0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newFund }, { status: 201 });
  }),

  http.patch('*/funds/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const fund = mockFunds.find(f => f.id === params.id);
    if (!fund) {
      return HttpResponse.json({ success: false, error: { message: 'Fund not found' } }, { status: 404 });
    }
    const updated = { ...fund, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/funds/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Fund deleted' });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // BUDGETS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/budgets', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const result = paginate(mockBudgets, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/budgets/years', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: [2024, 2025, 2026] });
  }),

  http.get('*/budgets/:id', async ({ params }) => {
    await delay(200);
    const budget = mockBudgets.find(b => b.id === params.id);
    if (!budget) {
      return HttpResponse.json({ success: false, error: { message: 'Budget not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: budget });
  }),

  http.post('*/budgets', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newBudget = {
      id: `bud-${Date.now()}`,
      code: `BUD-${Date.now().toString().slice(-4)}`,
      ...body,
      allocatedAmount: 0,
      spentAmount: 0,
      remainingAmount: body.totalAmount || 0,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newBudget }, { status: 201 });
  }),

  http.patch('*/budgets/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const budget = mockBudgets.find(b => b.id === params.id);
    if (!budget) {
      return HttpResponse.json({ success: false, error: { message: 'Budget not found' } }, { status: 404 });
    }
    const updated = { ...budget, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/budgets/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Budget deleted' });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // TARGETS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/targets', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const result = paginate(mockTargets, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/targets/:id', async ({ params }) => {
    await delay(200);
    const target = mockTargets.find(t => t.id === params.id);
    if (!target) {
      return HttpResponse.json({ success: false, error: { message: 'Target not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: target });
  }),

  http.post('*/targets', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newTarget = {
      id: `tgt-${Date.now()}`,
      ...body,
      currentValue: 0,
      progress: 0,
      status: 'NOT_STARTED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newTarget }, { status: 201 });
  }),

  http.patch('*/targets/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const target = mockTargets.find(t => t.id === params.id);
    if (!target) {
      return HttpResponse.json({ success: false, error: { message: 'Target not found' } }, { status: 404 });
    }
    const updated = { ...target, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/targets/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Target deleted' });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // BASELINES
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/baselines', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const result = paginate(mockBaselines, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/baselines/:id', async ({ params }) => {
    await delay(200);
    const baseline = mockBaselines.find(b => b.id === params.id);
    if (!baseline) {
      return HttpResponse.json({ success: false, error: { message: 'Baseline not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: baseline });
  }),

  http.post('*/baselines', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newBaseline = {
      id: `bsl-${Date.now()}`,
      ...body,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newBaseline }, { status: 201 });
  }),

  http.patch('*/baselines/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const baseline = mockBaselines.find(b => b.id === params.id);
    if (!baseline) {
      return HttpResponse.json({ success: false, error: { message: 'Baseline not found' } }, { status: 404 });
    }
    const updated = { ...baseline, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/baselines/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Baseline deleted' });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE - ACCRUALS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/finance/accruals', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const filtered = filterItems(mockAccruals, url.searchParams);
    // Transform to match AccrualEntry interface
    const transformed = filtered.map(acc => ({
      ...acc,
      amount: acc.estimatedAmount,
      promotion: { id: acc.promotionId, code: acc.promotionCode, name: acc.promotionName },
      glJournalId: acc.journalId,
    }));
    const result = paginate(transformed, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/finance/accruals/:id', async ({ params }) => {
    await delay(200);
    const accrual = mockAccruals.find(a => a.id === params.id);
    if (!accrual) {
      return HttpResponse.json({ success: false, error: { message: 'Accrual not found' } }, { status: 404 });
    }
    // Transform to match AccrualEntry interface
    const transformed = {
      ...accrual,
      amount: accrual.estimatedAmount,
      promotion: { id: accrual.promotionId, code: accrual.promotionCode, name: accrual.promotionName },
      glJournalId: accrual.journalId,
    };
    return HttpResponse.json({ success: true, data: transformed });
  }),

  http.post('*/finance/accruals/calculate', async ({ request }) => {
    await delay(1000);
    const body = await request.json() as { promotionId?: string };
    return HttpResponse.json({
      success: true,
      data: {
        promotionId: body.promotionId,
        calculatedAmount: 15000000,
        previousAmount: 10000000,
        difference: 5000000,
        breakdown: [
          { customerId: 'cust-1', customerName: 'Customer A', amount: 8000000 },
          { customerId: 'cust-2', customerName: 'Customer B', amount: 7000000 },
        ]
      }
    });
  }),

  http.post('*/finance/accruals/preview', async () => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: {
        totalAmount: 25000000,
        itemCount: 5,
        items: mockAccruals.slice(0, 3),
      }
    });
  }),

  http.put('*/finance/accruals/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const accrual = mockAccruals.find(a => a.id === params.id);
    if (!accrual) {
      return HttpResponse.json({ success: false, error: { message: 'Accrual not found' } }, { status: 404 });
    }
    const updated = { ...accrual, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/finance/accruals/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Accrual deleted' });
  }),

  http.post('*/finance/accruals/:id/post', async ({ params }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'POSTED', postedAt: new Date().toISOString(), journalId: `jnl-${Date.now()}` }
    });
  }),

  http.post('*/finance/accruals/post-batch', async ({ request }) => {
    await delay(1000);
    const body = await request.json() as { ids?: string[] };
    return HttpResponse.json({
      success: true,
      data: {
        posted: body.ids?.length || 0,
        failed: 0,
        journalId: `jnl-batch-${Date.now()}`
      }
    });
  }),

  http.post('*/finance/accruals/:id/reverse', async ({ params }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'REVERSED', reversedAt: new Date().toISOString(), reversalJournalId: `jnl-rev-${Date.now()}` }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE - DEDUCTIONS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/finance/deductions', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const filtered = filterItems(mockDeductions, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/finance/deductions/:id', async ({ params }) => {
    await delay(200);
    const deduction = mockDeductions.find(d => d.id === params.id);
    if (!deduction) {
      return HttpResponse.json({ success: false, error: { message: 'Deduction not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: deduction });
  }),

  http.get('*/finance/deductions/:id/suggestions', async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: mockClaims.slice(0, 3).map((c, idx) => ({
        claimId: c.id,
        claim: {
          id: c.id,
          code: c.code,
          amount: c.amount,
          claimDate: c.submittedAt || c.createdAt,
          status: c.status,
          promotion: {
            id: c.promotionId || 'promo-1',
            code: c.promotionCode || 'SUMMER-2026',
            name: c.promotionName || 'Summer Sale 2026',
          },
        },
        confidence: 0.95 - (idx * 0.15),
        matchReasons: ['Amount match', 'Date proximity', 'Customer match'].slice(0, 3 - idx),
      }))
    });
  }),

  http.post('*/finance/deductions', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newDeduction = {
      id: `ded-${Date.now()}`,
      code: `DED-${Date.now().toString().slice(-4)}`,
      ...body,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newDeduction }, { status: 201 });
  }),

  http.put('*/finance/deductions/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const deduction = mockDeductions.find(d => d.id === params.id);
    if (!deduction) {
      return HttpResponse.json({ success: false, error: { message: 'Deduction not found' } }, { status: 404 });
    }
    const updated = { ...deduction, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/finance/deductions/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Deduction deleted' });
  }),

  http.post('*/finance/deductions/:id/match', async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as { claimId?: string };
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'MATCHED', matchedClaimId: body.claimId, matchedAt: new Date().toISOString() }
    });
  }),

  http.post('*/finance/deductions/:id/dispute', async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as { reason?: string };
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'DISPUTED', disputeReason: body.reason, disputedAt: new Date().toISOString() }
    });
  }),

  http.post('*/finance/deductions/:id/resolve', async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as { resolution?: string; amount?: number };
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'RESOLVED', resolution: body.resolution, resolvedAmount: body.amount, resolvedAt: new Date().toISOString() }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE - JOURNALS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/finance/journals', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const filtered = filterItems(mockJournals, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/finance/journals/:id', async ({ params }) => {
    await delay(200);
    const journal = mockJournals.find(j => j.id === params.id);
    if (!journal) {
      return HttpResponse.json({ success: false, error: { message: 'Journal not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: journal });
  }),

  http.post('*/finance/journals', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newJournal = {
      id: `jnl-${Date.now()}`,
      code: `JNL-${Date.now().toString().slice(-4)}`,
      ...body,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newJournal }, { status: 201 });
  }),

  http.put('*/finance/journals/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const journal = mockJournals.find(j => j.id === params.id);
    if (!journal) {
      return HttpResponse.json({ success: false, error: { message: 'Journal not found' } }, { status: 404 });
    }
    const updated = { ...journal, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/finance/journals/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Journal deleted' });
  }),

  http.post('*/finance/journals/:id/post', async ({ params }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'POSTED', postedAt: new Date().toISOString() }
    });
  }),

  http.post('*/finance/journals/:id/reverse', async ({ params }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'REVERSED', reversedAt: new Date().toISOString(), reversalJournalId: `jnl-rev-${Date.now()}` }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCE - CHEQUES
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/finance/cheques', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const filtered = filterItems(mockCheques, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/finance/cheques/:id', async ({ params }) => {
    await delay(200);
    const cheque = mockCheques.find(c => c.id === params.id);
    if (!cheque) {
      return HttpResponse.json({ success: false, error: { message: 'Cheque not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: cheque });
  }),

  http.post('*/finance/cheques', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newCheque = {
      id: `chq-${Date.now()}`,
      chequeNumber: `CHQ-${Date.now().toString().slice(-6)}`,
      ...body,
      status: 'ISSUED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newCheque }, { status: 201 });
  }),

  http.put('*/finance/cheques/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as { action?: string };
    const cheque = mockCheques.find(c => c.id === params.id);
    if (!cheque) {
      return HttpResponse.json({ success: false, error: { message: 'Cheque not found' } }, { status: 404 });
    }
    let status = cheque.status;
    if (body.action === 'CLEAR') status = 'CLEARED';
    if (body.action === 'VOID') status = 'VOIDED';
    if (body.action === 'STALE') status = 'STALE';
    const updated = { ...cheque, ...body, status, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/finance/cheques/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Cheque deleted' });
  }),

  http.get('*/finance/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockFinanceStats });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/notifications', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockNotifications });
  }),

  http.get('*/notifications/unread-count', async () => {
    await delay(100);
    const unreadCount = mockNotifications.filter(n => !n.read).length;
    return HttpResponse.json({ success: true, data: { count: unreadCount } });
  }),

  http.patch('*/notifications/:id/read', async ({ params }) => {
    await delay(200);
    return HttpResponse.json({ success: true, data: { id: params.id, read: true } });
  }),

  http.patch('*/notifications/mark-all-read', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, message: 'All notifications marked as read' });
  }),

  http.delete('*/notifications/:id', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, message: 'Notification deleted' });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/dashboard/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockDashboardKPIs });
  }),

  http.get('*/dashboard/kpi', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockDashboardKPIs });
  }),

  http.get('*/dashboard/kpis', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockDashboardKPIs });
  }),

  http.get('*/dashboard/activity', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'act-1', type: 'PROMOTION_CREATED', description: 'Created promotion SUMMER-2026', userId: 'user-1', userName: 'Admin', timestamp: '2026-01-25T10:00:00Z' },
        { id: 'act-2', type: 'CLAIM_APPROVED', description: 'Approved claim CLM-2026-001', userId: 'user-2', userName: 'Finance Manager', timestamp: '2026-01-25T09:30:00Z' },
        { id: 'act-3', type: 'BUDGET_UPDATED', description: 'Updated Q1 Marketing budget', userId: 'user-1', userName: 'Admin', timestamp: '2026-01-25T09:00:00Z' },
      ]
    });
  }),

  http.get('*/dashboard/charts', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockChartData });
  }),

  http.get('*/dashboard/charts/promotions-by-status', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockChartData.promotionsByStatus });
  }),

  http.get('*/dashboard/charts/budget-utilization', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { name: 'Q1 Marketing', allocated: 500000000, spent: 120000000, remaining: 380000000 },
        { name: 'Summer Campaign', allocated: 300000000, spent: 50000000, remaining: 250000000 },
        { name: 'Q3 Regional', allocated: 400000000, spent: 0, remaining: 400000000 },
      ]
    });
  }),

  http.get('*/dashboard/charts/claims-trend', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockChartData.claimsTrend });
  }),

  http.get('*/dashboard/charts/spend-trend', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { month: 'Jan', planned: 100, actual: 95 },
        { month: 'Feb', planned: 120, actual: 115 },
        { month: 'Mar', planned: 140, actual: 138 },
        { month: 'Apr', planned: 130, actual: 142 },
        { month: 'May', planned: 150, actual: 148 },
        { month: 'Jun', planned: 160, actual: 155 },
      ]
    });
  }),

  http.get('*/dashboard/charts/status-distribution', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockChartData.promotionsByStatus });
  }),

  http.get('*/dashboard/charts/top-customers', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockChartData.topCustomers });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // PLANNING - TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/planning/templates', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const result = paginate(mockTemplates, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/planning/templates/:id', async ({ params }) => {
    await delay(200);
    const template = mockTemplates.find(t => t.id === params.id) || mockTemplates[0];
    return HttpResponse.json({ success: true, data: { ...template, id: params.id } });
  }),

  http.get('*/planning/templates/:id/versions', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { version: 3, createdAt: '2026-01-15T00:00:00Z', createdBy: 'Admin', changes: 'Updated discount value' },
        { version: 2, createdAt: '2026-01-10T00:00:00Z', createdBy: 'Admin', changes: 'Added product filters' },
        { version: 1, createdAt: '2026-01-01T00:00:00Z', createdBy: 'Admin', changes: 'Initial version' },
      ]
    });
  }),

  http.post('*/planning/templates', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newTemplate = {
      id: `tpl-${Date.now()}`,
      ...body,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newTemplate }, { status: 201 });
  }),

  http.put('*/planning/templates/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const template = mockTemplates.find(t => t.id === params.id) || mockTemplates[0];
    const updated = { ...template, ...body, id: params.id, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/planning/templates/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Template deleted' });
  }),

  http.post('*/planning/templates/:id/apply', async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as { promotionId?: string };
    return HttpResponse.json({
      success: true,
      data: {
        templateId: params.id,
        appliedTo: body.promotionId,
        appliedAt: new Date().toISOString(),
      }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // PLANNING - SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/planning/scenarios', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '12');
    const result = paginate(mockScenarios, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/planning/scenarios/:id', async ({ params }) => {
    await delay(200);
    const scenario = mockScenarios.find(s => s.id === params.id) || mockScenarios[0];
    return HttpResponse.json({ success: true, data: { ...scenario, id: params.id, promotions: mockPromotions.slice(0, 3) } });
  }),

  http.get('*/planning/scenarios/:id/versions', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { version: 2, createdAt: '2026-01-20T00:00:00Z', createdBy: 'Admin', changes: 'Updated budget allocation' },
        { version: 1, createdAt: '2026-01-01T00:00:00Z', createdBy: 'Admin', changes: 'Initial version' },
      ]
    });
  }),

  http.post('*/planning/scenarios', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newScenario = {
      id: `scn-${Date.now()}`,
      ...body,
      status: 'DRAFT',
      projectedROI: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newScenario }, { status: 201 });
  }),

  http.put('*/planning/scenarios/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const scenario = mockScenarios.find(s => s.id === params.id) || mockScenarios[0];
    const updated = { ...scenario, ...body, id: params.id, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/planning/scenarios/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Scenario deleted' });
  }),

  http.post('*/planning/scenarios/:id/run', async ({ params }) => {
    await delay(1000);
    const scenario = mockScenarios.find(s => s.id === params.id) || mockScenarios[0];
    // Return comprehensive results matching ScenarioResults component
    const results = scenario.results || {
      roi: 15.5,
      netMargin: 50000000,
      salesLiftPercent: 20.0,
      paybackDays: 35,
      baselineSales: 1500000000,
      projectedSales: 1800000000,
      incrementalSales: 300000000,
      promotionCost: 200000000,
      fundingRequired: 220000000,
      costPerIncrementalUnit: 22000,
      grossMargin: 360000000,
      projectedUnits: 72000,
      incrementalUnits: 12000,
      redemptions: 48000,
      dailyProjections: generateDailyProjections(60, 1500000000),
    };
    return HttpResponse.json({
      success: true,
      data: {
        ...scenario,
        id: params.id,
        status: 'COMPLETED',
        results,
        completedAt: new Date().toISOString(),
      }
    });
  }),

  http.post('*/planning/scenarios/:id/clone', async ({ params }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: {
        id: `scn-clone-${Date.now()}`,
        originalId: params.id,
        name: 'Cloned Scenario',
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
      }
    });
  }),

  http.post('*/planning/scenarios/:id/versions', async ({ params }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { scenarioId: params.id, version: 3, restoredAt: new Date().toISOString() }
    });
  }),

  http.post('*/planning/scenarios/compare', async ({ request }) => {
    await delay(500);
    const body = await request.json() as { scenarioIds?: string[] };
    return HttpResponse.json({
      success: true,
      data: {
        scenarios: body.scenarioIds?.map((id, idx) => ({
          id,
          name: `Scenario ${idx + 1}`,
          totalBudget: 300000000 + idx * 100000000,
          projectedROI: 12 + idx * 2,
          promotionCount: 5 + idx,
        })),
        comparison: {
          bestROI: body.scenarioIds?.[1],
          lowestBudget: body.scenarioIds?.[0],
        }
      }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // PLANNING - CLASHES
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/planning/clashes/stats', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: { total: 5, critical: 1, warning: 3, info: 1, resolved: 2, pending: 3 }
    });
  }),

  http.get('*/planning/clashes', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    const result = paginate(mockClashes, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/planning/clashes/:id', async ({ params }) => {
    await delay(200);
    const clash = mockClashes.find(c => c.id === params.id) || mockClashes[0];
    // Enrich with full promotion details for ClashDetail page
    const enrichedClash = {
      ...clash,
      id: params.id,
      promotionA: {
        ...clash.promotionA,
        startDate: '2026-01-15T00:00:00Z',
        endDate: '2026-02-28T00:00:00Z',
        customer: { id: 'cust-001', name: 'Siêu thị CoopMart' },
        products: [
          { id: 'prod-001', code: 'BEV-001', name: 'Nước ngọt Cola' },
          { id: 'prod-002', code: 'BEV-002', name: 'Nước cam ép' },
          { id: 'prod-003', code: 'BEV-003', name: 'Nước suối' },
        ],
      },
      promotionB: {
        ...clash.promotionB,
        startDate: '2026-02-01T00:00:00Z',
        endDate: '2026-03-15T00:00:00Z',
        customer: { id: 'cust-002', name: 'Siêu thị Big C' },
        products: [
          { id: 'prod-001', code: 'BEV-001', name: 'Nước ngọt Cola' },
          { id: 'prod-004', code: 'BEV-004', name: 'Trà xanh' },
        ],
      },
      analysis: {
        overlapDays: 14,
        affectedCustomersCount: clash.affectedCustomers?.length || 3,
        affectedProductsCount: clash.affectedProducts?.length || 4,
        recommendations: [
          'Adjust the end date of Promotion A to avoid overlap',
          'Limit product scope for one promotion',
          'Merge into single promotional campaign',
        ],
      },
    };
    return HttpResponse.json({ success: true, data: enrichedClash });
  }),

  http.patch('*/planning/clashes/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const clash = mockClashes.find(c => c.id === params.id) || mockClashes[0];
    const updated = { ...clash, ...body, id: params.id, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.post('*/planning/clashes/:id/resolve', async ({ params }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'RESOLVED', resolvedAt: new Date().toISOString() }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATIONS - DELIVERY
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/operations/delivery', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    // Transform to match DeliveryOrder interface
    const transformed = mockDeliveries.map(d => ({
      ...d,
      orderNumber: d.code,
      customer: { id: d.customerId, name: d.customerName },
      deliveryAddress: d.address,
      totalItems: d.totalItems,
      promotion: d.totalValue ? { id: 'promo-1', name: 'Summer Sale 2026' } : undefined,
    }));
    const result = paginate(transformed, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/operations/deliveries', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');
    // Transform to match DeliveryOrder interface
    const transformed = mockDeliveries.map(d => ({
      ...d,
      orderNumber: d.code,
      customer: { id: d.customerId, name: d.customerName },
      deliveryAddress: d.address,
      totalItems: d.totalItems,
      promotion: d.totalValue ? { id: 'promo-1', name: 'Summer Sale 2026' } : undefined,
    }));
    const result = paginate(transformed, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/operations/delivery/:id', async ({ params }) => {
    await delay(200);
    const delivery = mockDeliveries.find(d => d.id === params.id) || mockDeliveries[0];
    // Transform to match DeliveryOrder interface
    const transformed = {
      ...delivery,
      id: params.id,
      orderNumber: delivery.code,
      customer: { id: delivery.customerId, name: delivery.customerName },
      deliveryAddress: delivery.address,
      promotion: delivery.totalValue ? { id: 'promo-1', name: 'Summer Sale 2026' } : undefined,
    };
    return HttpResponse.json({ success: true, data: transformed });
  }),

  http.get('*/operations/delivery/:id/tracking', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { status: 'CREATED', timestamp: '2026-01-20T08:00:00Z', location: 'Warehouse' },
        { status: 'DISPATCHED', timestamp: '2026-01-20T10:00:00Z', location: 'Distribution Center' },
        { status: 'IN_TRANSIT', timestamp: '2026-01-20T14:00:00Z', location: 'On route' },
      ]
    });
  }),

  http.get('*/operations/delivery/calendar', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: mockDeliveries.map(d => ({
        id: d.id,
        title: `Delivery to ${d.customerName || 'Customer'}`,
        date: d.deliveredDate || d.scheduledDate,
        status: d.status,
      }))
    });
  }),

  http.get('*/operations/delivery/stats', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: {
        total: mockDeliveries.length,
        pending: mockDeliveries.filter(d => d.status === 'PENDING').length,
        inTransit: mockDeliveries.filter(d => d.status === 'IN_TRANSIT').length,
        delivered: mockDeliveries.filter(d => d.status === 'DELIVERED').length,
        onTimeRate: 92.5,
      }
    });
  }),

  http.post('*/operations/delivery', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newDelivery = {
      id: `del-${Date.now()}`,
      code: `DEL-${Date.now().toString().slice(-4)}`,
      ...body,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newDelivery }, { status: 201 });
  }),

  http.put('*/operations/delivery/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const delivery = mockDeliveries.find(d => d.id === params.id) || mockDeliveries[0];
    const updated = { ...delivery, ...body, id: params.id, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.put('*/operations/delivery/:id/status', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as { status?: string };
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: body.status, updatedAt: new Date().toISOString() }
    });
  }),

  http.delete('*/operations/delivery/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Delivery deleted' });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATIONS - SELL TRACKING
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/operations/sell-tracking', async () => {
    await delay(300);
    const transformedData = mockSellData.map(item => ({
      ...item,
      customer: { id: item.customerId, name: item.customerName, code: item.customerId },
      product: { id: item.productId, name: item.productName, code: item.productId },
      sellInQty: item.sellIn,
      sellInValue: item.sellIn * (item.avgPrice || 10000),
      sellOutQty: item.sellOut,
      sellOutValue: item.sellOut * (item.avgPrice || 10000),
      stockQty: item.closingStock,
      stockValue: item.closingStock * (item.avgPrice || 10000),
      sellThroughRate: item.sellThrough,
    }));
    return HttpResponse.json({ success: true, data: transformedData });
  }),

  http.get('*/operations/sell-tracking/:id', async ({ params }) => {
    await delay(200);
    const item = mockSellData.find(s => s.id === params.id) || mockSellData[0];
    return HttpResponse.json({ success: true, data: { ...item, id: params.id } });
  }),

  http.get('*/operations/sell-tracking/summary', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: {
        totalSellIn: mockSellData.reduce((sum, item) => sum + item.sellIn, 0),
        totalSellOut: mockSellData.reduce((sum, item) => sum + item.sellOut, 0),
        avgSellThrough: mockSellData.reduce((sum, item) => sum + item.sellThrough, 0) / mockSellData.length,
        totalRevenue: mockSellData.reduce((sum, item) => sum + item.revenue, 0),
      }
    });
  }),

  http.get('*/operations/sell-tracking/trends', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { period: 'Week 1', sellIn: 1200, sellOut: 1100, sellThrough: 91.7 },
        { period: 'Week 2', sellIn: 1350, sellOut: 1280, sellThrough: 94.8 },
        { period: 'Week 3', sellIn: 1100, sellOut: 1050, sellThrough: 95.5 },
        { period: 'Week 4', sellIn: 1500, sellOut: 1400, sellThrough: 93.3 },
      ]
    });
  }),

  http.post('*/operations/sell-tracking', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newRecord = {
      id: `sell-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newRecord }, { status: 201 });
  }),

  http.put('*/operations/sell-tracking/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const item = mockSellData.find(s => s.id === params.id) || mockSellData[0];
    const updated = { ...item, ...body, id: params.id, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/operations/sell-tracking/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Record deleted' });
  }),

  http.post('*/operations/sell-tracking/bulk', async ({ request }) => {
    await delay(500);
    const body = await request.json() as { action?: string; ids?: string[] };
    return HttpResponse.json({
      success: true,
      data: { action: body.action, affected: body.ids?.length || 0 }
    });
  }),

  http.post('*/operations/sell-tracking/import', async () => {
    await delay(1000);
    return HttpResponse.json({
      success: true,
      data: { imported: 25, errors: 0, warnings: 2 }
    });
  }),

  http.get('*/operations/sell-tracking/export', async () => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { downloadUrl: '/exports/sell-tracking-export.xlsx', expiresAt: new Date(Date.now() + 3600000).toISOString() }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // OPERATIONS - INVENTORY
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/operations/inventory', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockInventory });
  }),

  http.get('*/operations/inventory/:id', async ({ params }) => {
    await delay(200);
    const item = mockInventory.find(i => i.id === params.id) || mockInventory[0];
    return HttpResponse.json({ success: true, data: { ...item, id: params.id } });
  }),

  http.get('*/operations/inventory/summary', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: {
        totalItems: mockInventory.length,
        totalValue: mockInventory.reduce((sum, i) => sum + (i.quantity * 50000), 0), // 50k VND per unit
        lowStock: mockInventory.filter(i => i.quantity < 100).length,
        outOfStock: mockInventory.filter(i => i.quantity === 0).length,
      }
    });
  }),

  http.get('*/operations/inventory/history', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { date: '2026-01-25', action: 'RECEIVED', productId: 'prod-1', quantity: 500, userId: 'user-1' },
        { date: '2026-01-24', action: 'SHIPPED', productId: 'prod-2', quantity: -200, userId: 'user-2' },
        { date: '2026-01-23', action: 'ADJUSTED', productId: 'prod-1', quantity: -10, userId: 'user-1', reason: 'Damaged' },
      ]
    });
  }),

  http.post('*/operations/inventory', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newItem = {
      id: `inv-${Date.now()}`,
      ...body,
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newItem }, { status: 201 });
  }),

  http.put('*/operations/inventory/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const item = mockInventory.find(i => i.id === params.id) || mockInventory[0];
    const updated = { ...item, ...body, id: params.id, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/operations/inventory/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Inventory item deleted' });
  }),

  http.post('*/operations/inventory/bulk', async ({ request }) => {
    await delay(500);
    const body = await request.json() as { action?: string; ids?: string[] };
    return HttpResponse.json({
      success: true,
      data: { action: body.action, affected: body.ids?.length || 0 }
    });
  }),

  http.post('*/operations/inventory/import', async () => {
    await delay(1000);
    return HttpResponse.json({
      success: true,
      data: { imported: 50, errors: 0, warnings: 3 }
    });
  }),

  http.get('*/operations/inventory/export', async () => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { downloadUrl: '/exports/inventory-export.xlsx', expiresAt: new Date(Date.now() + 3600000).toISOString() }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // BI & ANALYTICS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/bi/analytics/dashboard', async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: {
        kpis: [
          { name: 'Total Revenue', value: mockDashboardKPIs.totalRevenue, format: 'CURRENCY', subtitle: 'All time revenue' },
          { name: 'Revenue Growth', value: mockDashboardKPIs.revenueGrowth, format: 'PERCENTAGE', subtitle: 'vs last period' },
          { name: 'Total Promotions', value: mockDashboardKPIs.totalPromotions, format: 'NUMBER', subtitle: 'All promotions' },
          { name: 'Active Promotions', value: mockDashboardKPIs.activePromotions, format: 'NUMBER', subtitle: 'Currently running' },
          { name: 'Pending Claims', value: mockDashboardKPIs.pendingClaims, format: 'NUMBER', subtitle: 'Awaiting review' },
          { name: 'Claim Approval Rate', value: mockDashboardKPIs.claimApprovalRate, format: 'PERCENTAGE', subtitle: 'Approved claims' },
        ],
        charts: [
          { id: 'revenue', title: 'Revenue by Month', type: 'LINE', data: mockChartData.revenueByMonth },
          { id: 'status', title: 'Promotions by Status', type: 'PIE', data: mockChartData.promotionsByStatus },
          { id: 'claims', title: 'Claims Trend', type: 'BAR', data: mockChartData.claimsTrend },
          { id: 'customers', title: 'Top Customers', type: 'BAR', data: mockChartData.topCustomers },
        ],
        summary: { totalPromotions: 45, activePromotions: 12, totalBudget: 5000000000, spentBudget: 2500000000 }
      }
    });
  }),

  http.get('*/bi/analytics/kpis', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { name: 'Total Revenue', value: mockDashboardKPIs.totalRevenue, format: 'CURRENCY' },
        { name: 'Revenue Growth', value: mockDashboardKPIs.revenueGrowth, format: 'PERCENTAGE' },
        { name: 'Total Promotions', value: mockDashboardKPIs.totalPromotions, format: 'NUMBER' },
        { name: 'Active Promotions', value: mockDashboardKPIs.activePromotions, format: 'NUMBER' },
      ]
    });
  }),

  http.get('*/bi/analytics/trends', async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: [
        { period: 'Jan', value: 120000000 },
        { period: 'Feb', value: 150000000 },
        { period: 'Mar', value: 180000000 },
        { period: 'Apr', value: 140000000 },
        { period: 'May', value: 200000000 },
        { period: 'Jun', value: 220000000 },
      ]
    });
  }),

  http.get('*/bi/analytics', async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: { kpis: mockDashboardKPIs, charts: mockChartData, insights: mockInsights.slice(0, 3) }
    });
  }),

  http.post('*/bi/export', async ({ request }) => {
    await delay(1000);
    const body = await request.json() as { format?: string; reportType?: string };
    return HttpResponse.json({
      success: true,
      data: {
        exportId: `exp-${Date.now()}`,
        format: body.format || 'xlsx',
        status: 'COMPLETED',
        downloadUrl: `/exports/report-${Date.now()}.${body.format || 'xlsx'}`,
        expiresAt: new Date(Date.now() + 3600000).toISOString(),
      }
    });
  }),

  http.get('*/bi/reports', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockReports });
  }),

  http.get('*/bi/reports/:id', async ({ params }) => {
    await delay(200);
    const report = mockReports.find(r => r.id === params.id) || mockReports[0];
    return HttpResponse.json({ success: true, data: { ...report, id: params.id } });
  }),

  http.post('*/bi/reports', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newReport = {
      id: `rpt-${Date.now()}`,
      ...body,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newReport }, { status: 201 });
  }),

  http.put('*/bi/reports/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const report = mockReports.find(r => r.id === params.id) || mockReports[0];
    const updated = { ...report, ...body, id: params.id, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/bi/reports/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Report deleted' });
  }),

  http.get('*/bi/reports/:id/execute', async ({ params }) => {
    await delay(1000);
    return HttpResponse.json({
      success: true,
      data: {
        reportId: params.id,
        executedAt: new Date().toISOString(),
        rowCount: 150,
        data: mockPromotions.slice(0, 10),
      }
    });
  }),

  http.post('*/bi/reports/generate', async ({ request }) => {
    await delay(1000);
    const body = await request.json() as Record<string, unknown>;
    return HttpResponse.json({
      success: true,
      data: {
        id: `rpt-${Date.now()}`,
        name: body.name || 'New Report',
        type: body.type,
        status: 'GENERATING',
        progress: 0,
        createdAt: new Date().toISOString(),
      }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // AI - INSIGHTS & RECOMMENDATIONS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/ai/insights', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const severity = url.searchParams.get('severity');
    let filtered = [...mockInsights];
    if (type) filtered = filtered.filter(i => i.type === type);
    if (severity) filtered = filtered.filter(i => i.severity === severity);
    return HttpResponse.json({ success: true, data: filtered });
  }),

  http.get('*/ai/insights/:id', async ({ params }) => {
    await delay(200);
    const insight = mockInsights.find(i => i.id === params.id) || mockInsights[0];
    return HttpResponse.json({ success: true, data: { ...insight, id: params.id } });
  }),

  http.post('*/ai/insights/generate', async () => {
    await delay(2000);
    return HttpResponse.json({
      success: true,
      data: {
        generated: 5,
        insights: mockInsights.slice(0, 3),
        generatedAt: new Date().toISOString(),
      }
    });
  }),

  http.post('*/ai/insights/:id/dismiss', async ({ params }) => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: { id: params.id, status: 'DISMISSED', dismissedAt: new Date().toISOString() }
    });
  }),

  http.post('*/ai/insights/:id/action', async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as { action?: string };
    return HttpResponse.json({
      success: true,
      data: { id: params.id, action: body.action, actionTakenAt: new Date().toISOString() }
    });
  }),

  http.get('*/ai/recommendations', async () => {
    await delay(300);
    // Transform to add uplift field for RecommendationCard
    const transformed = mockRecommendations.map(rec => ({
      ...rec,
      impact: {
        ...rec.impact,
        uplift: rec.impact.roiImprovement || rec.impact.expectedROI || 10,
      },
      reasoning: rec.description,
      entityType: 'PROMOTION',
      entityId: 'promo-1',
    }));
    return HttpResponse.json({ success: true, data: transformed });
  }),

  http.get('*/ai/recommendations/:id', async ({ params }) => {
    await delay(200);
    const rec = mockRecommendations.find(r => r.id === params.id) || mockRecommendations[0];
    // Transform to add uplift field
    const transformed = {
      ...rec,
      id: params.id,
      impact: {
        ...rec.impact,
        uplift: rec.impact.roiImprovement || rec.impact.expectedROI || 10,
      },
      reasoning: rec.description,
      entityType: 'PROMOTION',
      entityId: 'promo-1',
    };
    return HttpResponse.json({ success: true, data: transformed });
  }),

  http.post('*/ai/recommendations/generate', async () => {
    await delay(2000);
    return HttpResponse.json({
      success: true,
      data: {
        generated: 3,
        recommendations: mockRecommendations.slice(0, 2),
        generatedAt: new Date().toISOString(),
      }
    });
  }),

  http.post('*/ai/recommendations/:id/accept', async ({ params }) => {
    await delay(500);
    const rec = mockRecommendations.find(r => r.id === params.id);
    if (rec) {
      return HttpResponse.json({ success: true, data: { ...rec, status: 'ACCEPTED', acceptedAt: new Date().toISOString() } });
    }
    return HttpResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 });
  }),

  http.post('*/ai/recommendations/:id/reject', async ({ params }) => {
    await delay(500);
    const rec = mockRecommendations.find(r => r.id === params.id);
    if (rec) {
      return HttpResponse.json({ success: true, data: { ...rec, status: 'REJECTED', rejectedAt: new Date().toISOString() } });
    }
    return HttpResponse.json({ success: false, error: { message: 'Not found' } }, { status: 404 });
  }),

  http.post('*/ai/predict', async ({ request }) => {
    await delay(1500);
    const body = await request.json() as { type?: string };
    return HttpResponse.json({
      success: true,
      data: {
        predictionType: body.type || 'SALES',
        predictions: [
          { period: 'Q2-2026', value: 5500000000, confidence: 0.85 },
          { period: 'Q3-2026', value: 6200000000, confidence: 0.78 },
          { period: 'Q4-2026', value: 7100000000, confidence: 0.72 },
        ],
        generatedAt: new Date().toISOString(),
      }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION - WEBHOOKS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/integration/webhooks', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockWebhooks });
  }),

  http.get('*/integration/webhooks/:id', async ({ params }) => {
    await delay(200);
    const webhook = mockWebhooks.find(w => w.id === params.id) || mockWebhooks[0];
    return HttpResponse.json({ success: true, data: { ...webhook, id: params.id } });
  }),

  http.post('*/integration/webhooks', async ({ request }) => {
    await delay(500);
    const body = await request.json() as Record<string, unknown>;
    const newWebhook = {
      id: `wh-${Date.now()}`,
      ...body,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newWebhook }, { status: 201 });
  }),

  http.put('*/integration/webhooks/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as Record<string, unknown>;
    const webhook = mockWebhooks.find(w => w.id === params.id) || mockWebhooks[0];
    const updated = { ...webhook, ...body, id: params.id, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('*/integration/webhooks/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Webhook deleted' });
  }),

  http.post('*/integration/webhooks/:id/test', async ({ params }) => {
    await delay(1000);
    return HttpResponse.json({
      success: true,
      data: {
        webhookId: params.id,
        testResult: 'SUCCESS',
        responseCode: 200,
        responseTime: 245,
        testedAt: new Date().toISOString(),
      }
    });
  }),

  http.get('*/integration/webhooks/:id/deliveries', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'del-1', event: 'promotion.created', status: 'SUCCESS', responseCode: 200, timestamp: '2026-01-25T10:00:00Z' },
        { id: 'del-2', event: 'claim.approved', status: 'SUCCESS', responseCode: 200, timestamp: '2026-01-25T09:30:00Z' },
        { id: 'del-3', event: 'promotion.updated', status: 'FAILED', responseCode: 500, timestamp: '2026-01-25T09:00:00Z' },
      ]
    });
  }),

  http.post('*/integration/webhooks/:id/retry', async ({ params }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: { webhookId: params.id, retried: true, retriedAt: new Date().toISOString() }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION - SECURITY
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/integration/security/api-keys', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockAPIKeys });
  }),

  http.get('*/integration/security/api-keys/:id', async ({ params }) => {
    await delay(200);
    const key = mockAPIKeys.find(k => k.id === params.id) || mockAPIKeys[0];
    return HttpResponse.json({ success: true, data: { ...key, id: params.id } });
  }),

  http.post('*/integration/security/api-keys', async ({ request }) => {
    await delay(500);
    const body = await request.json() as { name?: string };
    const newKey = {
      id: `key-${Date.now()}`,
      name: body.name || 'New API Key',
      key: `pk_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      status: 'ACTIVE',
      permissions: ['read'],
      createdAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newKey }, { status: 201 });
  }),

  http.delete('*/integration/security/api-keys/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'API key revoked' });
  }),

  http.get('*/integration/security/audit-logs', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '20');
    const result = paginate(mockAuditLogs, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, pagination: result.pagination });
  }),

  http.get('*/integration/security/audit-logs/:entityType/:entityId', async ({ params }) => {
    await delay(200);
    const logs = mockAuditLogs.filter(l => l.entityType === String(params.entityType).toUpperCase() && l.entityId === params.entityId);
    return HttpResponse.json({ success: true, data: logs.length > 0 ? logs : mockAuditLogs.slice(0, 2) });
  }),

  http.get('*/integration/security/dashboard', async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: {
        activeApiKeys: mockAPIKeys.filter(k => k.status === 'ACTIVE').length,
        totalApiCalls: 15420,
        failedAttempts: 23,
        lastSecurityEvent: '2026-01-25T08:30:00Z',
        recentActivity: mockAuditLogs.slice(0, 5),
      }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // INTEGRATION - ERP & DMS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/integration/erp/syncs', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockERPSyncs });
  }),

  http.get('*/integration/erp/:id', async ({ params }) => {
    await delay(200);
    const sync = mockERPSyncs.find(s => s.id === params.id) || mockERPSyncs[0];
    return HttpResponse.json({ success: true, data: { ...sync, id: params.id } });
  }),

  http.post('*/integration/erp/sync', async () => {
    await delay(1000);
    return HttpResponse.json({
      success: true,
      data: { id: `erp-${Date.now()}`, status: 'STARTED', message: 'Sync started successfully' }
    });
  }),

  http.get('*/integration/dms/syncs', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockDMSSyncs });
  }),

  http.get('*/integration/dms/:id', async ({ params }) => {
    await delay(200);
    const sync = mockDMSSyncs.find(s => s.id === params.id) || mockDMSSyncs[0];
    return HttpResponse.json({ success: true, data: { ...sync, id: params.id } });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════════════════

  http.get('*/users', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockUsers });
  }),

  http.get('*/users/:id', async ({ params }) => {
    await delay(200);
    const user = mockUsers.find(u => u.id === params.id);
    if (!user) {
      return HttpResponse.json({ success: false, error: { message: 'User not found' } }, { status: 404 });
    }
    return HttpResponse.json({ success: true, data: user });
  }),

  // ═══════════════════════════════════════════════════════════════════════════
  // VOICE COMMANDS (stub)
  // ═══════════════════════════════════════════════════════════════════════════

  http.post('*/voice/command', async ({ request }) => {
    await delay(500);
    const body = await request.json() as { command?: string };
    return HttpResponse.json({
      success: true,
      data: {
        command: body.command,
        recognized: true,
        action: 'SEARCH_PROMOTIONS',
        result: 'Found 5 promotions matching your query',
      }
    });
  }),

  http.get('*/voice/history', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'vc-1', command: 'Show active promotions', action: 'SEARCH_PROMOTIONS', timestamp: '2026-01-25T10:00:00Z' },
        { id: 'vc-2', command: 'Create new claim', action: 'CREATE_CLAIM', timestamp: '2026-01-25T09:30:00Z' },
      ]
    });
  }),

];
