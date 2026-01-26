// ══════════════════════════════════════════════════════════════════════════════
//                    MSW HANDLERS - ALL API ENDPOINTS
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

// Helper function for pagination
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

// Helper function to filter items
function filterItems<T extends Record<string, any>>(
  items: T[],
  params: URLSearchParams
): T[] {
  let filtered = [...items];
  
  // Common filters
  const status = params.get('status');
  const type = params.get('type');
  const search = params.get('search') || params.get('q');
  const customerId = params.get('customerId');
  // Note: startDate and endDate filters can be added here if needed

  if (status) {
    filtered = filtered.filter(item => item.status === status);
  }
  if (type) {
    filtered = filtered.filter(item => item.type === type);
  }
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = filtered.filter(item => 
      (item.name?.toLowerCase().includes(searchLower)) ||
      (item.code?.toLowerCase().includes(searchLower)) ||
      (item.description?.toLowerCase().includes(searchLower))
    );
  }
  if (customerId) {
    filtered = filtered.filter(item => item.customerId === customerId);
  }
  
  return filtered;
}

export const handlers = [
  // ═══════════════════════════════════════════════════════════════════════
  // AUTH
  // ═══════════════════════════════════════════════════════════════════════
  
  http.post('http://localhost:4000/auth/login', async ({ request }) => {
    await delay(500);
    const { email, password } = await request.json() as any;

    if (email && password) {
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

    return HttpResponse.json(
      { success: false, error: 'Invalid credentials' },
      { status: 401 }
    );
  }),

  http.post('http://localhost:4000/auth/logout', async () => {
    await delay(200);
    return HttpResponse.json({ success: true });
  }),

  http.get('http://localhost:4000/auth/me', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: currentUser });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // PROMOTIONS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/promotions', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockPromotions, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, promotions: result.data, data: result.data, pagination: result.pagination });
  }),

  http.get('http://localhost:4000/promotions/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockPromotionStats });
  }),

  http.get('http://localhost:4000/promotions/:id', async ({ params }) => {
    await delay(200);
    const promotion = mockPromotions.find(p => p.id === params.id);
    
    if (!promotion) {
      return HttpResponse.json(
        { success: false, error: 'Promotion not found' },
        { status: 404 }
      );
    }
    
    return HttpResponse.json({ success: true, data: promotion });
  }),

  http.post('http://localhost:4000/promotions', async ({ request }) => {
    await delay(500);
    const body = await request.json() as any;
    
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

  http.put('http://localhost:4000/promotions/:id', async ({ params, request }) => {
    await delay(300);
    const body = await request.json() as any;
    const promotion = mockPromotions.find(p => p.id === params.id);
    
    if (!promotion) {
      return HttpResponse.json(
        { success: false, error: 'Promotion not found' },
        { status: 404 }
      );
    }
    
    const updated = { ...promotion, ...body, updatedAt: new Date().toISOString() };
    return HttpResponse.json({ success: true, data: updated });
  }),

  http.delete('http://localhost:4000/promotions/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Promotion deleted' });
  }),

  http.post('http://localhost:4000/promotions/:id/submit', async ({ params }) => {
    await delay(500);
    const promotion = mockPromotions.find(p => p.id === params.id);
    if (promotion) {
      return HttpResponse.json({ 
        success: true, 
        data: { ...promotion, status: 'PENDING', updatedAt: new Date().toISOString() }
      });
    }
    return HttpResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }),

  http.post('http://localhost:4000/promotions/:id/approve', async ({ params }) => {
    await delay(500);
    const promotion = mockPromotions.find(p => p.id === params.id);
    if (promotion) {
      return HttpResponse.json({ 
        success: true, 
        data: { 
          ...promotion, 
          status: 'APPROVED', 
          approvedAt: new Date().toISOString(),
          approvedById: currentUser.id,
          updatedAt: new Date().toISOString() 
        }
      });
    }
    return HttpResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }),

  http.post('http://localhost:4000/promotions/:id/reject', async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as any;
    const promotion = mockPromotions.find(p => p.id === params.id);
    if (promotion) {
      return HttpResponse.json({ 
        success: true, 
        data: { 
          ...promotion, 
          status: 'REJECTED', 
          rejectedAt: new Date().toISOString(),
          rejectionReason: body.reason,
          updatedAt: new Date().toISOString() 
        }
      });
    }
    return HttpResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // CLAIMS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/claims', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockClaims, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, claims: result.data, data: result.data, pagination: result.pagination });
  }),

  http.get('http://localhost:4000/claims/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockClaimStats });
  }),

  http.get('http://localhost:4000/claims/:id', async ({ params }) => {
    await delay(200);
    const claim = mockClaims.find(c => c.id === params.id);
    
    if (!claim) {
      return HttpResponse.json({ success: false, error: 'Claim not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ success: true, data: claim });
  }),

  http.post('http://localhost:4000/claims', async ({ request }) => {
    await delay(500);
    const body = await request.json() as any;
    
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

  http.post('http://localhost:4000/claims/:id/approve', async ({ params }) => {
    await delay(500);
    const claim = mockClaims.find(c => c.id === params.id);
    if (claim) {
      return HttpResponse.json({ 
        success: true, 
        data: { 
          ...claim, 
          status: 'APPROVED',
          approvedAmount: claim.amount,
          approvedAt: new Date().toISOString(),
          approvedById: currentUser.id,
        }
      });
    }
    return HttpResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }),

  http.post('http://localhost:4000/claims/:id/reject', async ({ params, request }) => {
    await delay(500);
    const body = await request.json() as any;
    const claim = mockClaims.find(c => c.id === params.id);
    if (claim) {
      return HttpResponse.json({ 
        success: true, 
        data: { 
          ...claim, 
          status: 'REJECTED',
          rejectedAt: new Date().toISOString(),
          rejectionReason: body.reason,
        }
      });
    }
    return HttpResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // CUSTOMERS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/customers', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockCustomers, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, customers: result.data, data: result.data, pagination: result.pagination });
  }),

  http.get('http://localhost:4000/customers/:id', async ({ params }) => {
    await delay(200);
    const customer = mockCustomers.find(c => c.id === params.id);
    
    if (!customer) {
      return HttpResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ success: true, data: customer });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // PRODUCTS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/products', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockProducts, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, products: result.data, data: result.data, pagination: result.pagination });
  }),

  http.get('http://localhost:4000/products/:id', async ({ params }) => {
    await delay(200);
    const product = mockProducts.find(p => p.id === params.id);
    
    if (!product) {
      return HttpResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ success: true, data: product });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // FINANCE
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/finance/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockFinanceStats });
  }),

  http.get('http://localhost:4000/finance/accruals', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockAccruals, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, accruals: result.data, pagination: result.pagination });
  }),

  http.get('http://localhost:4000/finance/deductions', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockDeductions, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, deductions: result.data, pagination: result.pagination });
  }),

  http.get('http://localhost:4000/finance/journals', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockJournals, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, journals: result.data, pagination: result.pagination });
  }),

  http.get('http://localhost:4000/finance/cheques', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockCheques, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, cheques: result.data, pagination: result.pagination });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/operations/deliveries', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const result = paginate(mockDeliveries, page, pageSize);
    return HttpResponse.json({ success: true, deliveries: result.data, data: result.data, pagination: result.pagination });
  }),

  http.get('http://localhost:4000/operations/sell-tracking', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockSellData });
  }),

  http.get('http://localhost:4000/operations/inventory', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockInventory });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/integration/erp/syncs', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockERPSyncs });
  }),

  http.get('http://localhost:4000/integration/dms/syncs', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockDMSSyncs });
  }),

  http.get('http://localhost:4000/integration/webhooks', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockWebhooks });
  }),

  http.post('http://localhost:4000/integration/erp/sync', async () => {
    await delay(1000);
    return HttpResponse.json({ 
      success: true, 
      data: { 
        id: `erp-${Date.now()}`,
        status: 'STARTED',
        message: 'Sync started successfully'
      }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // AI
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/ai/insights', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const severity = url.searchParams.get('severity');
    
    let filtered = [...mockInsights];
    if (type) filtered = filtered.filter(i => i.type === type);
    if (severity) filtered = filtered.filter(i => i.severity === severity);
    
    return HttpResponse.json({ success: true, data: filtered });
  }),

  http.get('http://localhost:4000/ai/recommendations', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockRecommendations });
  }),

  http.post('http://localhost:4000/ai/recommendations/:id/accept', async ({ params }) => {
    await delay(500);
    const rec = mockRecommendations.find(r => r.id === params.id);
    if (rec) {
      return HttpResponse.json({ 
        success: true, 
        data: { ...rec, status: 'ACCEPTED', acceptedAt: new Date().toISOString() }
      });
    }
    return HttpResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }),

  http.post('http://localhost:4000/ai/recommendations/:id/reject', async ({ params }) => {
    await delay(500);
    const rec = mockRecommendations.find(r => r.id === params.id);
    if (rec) {
      return HttpResponse.json({ 
        success: true, 
        data: { ...rec, status: 'REJECTED', rejectedAt: new Date().toISOString() }
      });
    }
    return HttpResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // BI / DASHBOARD
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/dashboard/kpis', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockDashboardKPIs });
  }),

  http.get('http://localhost:4000/dashboard/charts', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockChartData });
  }),

  http.get('http://localhost:4000/bi/reports', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockReports });
  }),

  http.post('http://localhost:4000/bi/reports/generate', async ({ request }) => {
    await delay(1000);
    const body = await request.json() as any;
    
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

  http.get('http://localhost:4000/bi/analytics', async () => {
    await delay(300);
    return HttpResponse.json({
      success: true,
      data: {
        kpis: mockDashboardKPIs,
        charts: mockChartData,
        insights: mockInsights.slice(0, 3),
      }
    });
  }),

  http.get('http://localhost:4000/bi/analytics/dashboard', async () => {
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
        summary: {
          totalPromotions: 45,
          activePromotions: 12,
          totalBudget: 5000000000,
          spentBudget: 2500000000,
        }
      }
    });
  }),

  http.get('http://localhost:4000/bi/analytics/trends', async () => {
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

  // ═══════════════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/users', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockUsers });
  }),

  http.get('http://localhost:4000/users/:id', async ({ params }) => {
    await delay(200);
    const user = mockUsers.find(u => u.id === params.id);

    if (!user) {
      return HttpResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return HttpResponse.json({ success: true, data: user });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // NOTIFICATIONS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/notifications', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'n1', type: 'INFO', title: 'Welcome!', message: 'Welcome to Promo Master', read: false, createdAt: new Date().toISOString() },
        { id: 'n2', type: 'SUCCESS', title: 'Promotion Approved', message: 'SUMMER-2026 has been approved', read: true, createdAt: new Date().toISOString() },
      ]
    });
  }),

  http.get('http://localhost:4000/notifications/unread-count', async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { count: 3 } });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // DASHBOARD STATS & CHARTS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('http://localhost:4000/dashboard/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockDashboardKPIs });
  }),

  http.get('http://localhost:4000/dashboard/charts/spend-trend', async () => {
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

  http.get('http://localhost:4000/dashboard/charts/status-distribution', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: mockChartData.promotionsByStatus
    });
  }),

  http.get('http://localhost:4000/dashboard/charts/top-customers', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: mockChartData.topCustomers
    });
  }),

];
