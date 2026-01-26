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
  
  http.post('*/auth/login', async ({ request }) => {
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

  http.post('*/auth/logout', async () => {
    await delay(200);
    return HttpResponse.json({ success: true });
  }),

  http.get('*/auth/me', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: currentUser });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // PROMOTIONS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('*/promotions', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockPromotions, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, promotions: result.data, data: result.data, pagination: result.pagination });
  }),

  http.get('*/promotions/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockPromotionStats });
  }),

  http.get('*/promotions/:id', async ({ params }) => {
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

  http.post('*/promotions', async ({ request }) => {
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

  http.put('*/promotions/:id', async ({ params, request }) => {
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

  http.delete('*/promotions/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Promotion deleted' });
  }),

  http.post('*/promotions/:id/submit', async ({ params }) => {
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

  http.post('*/promotions/:id/approve', async ({ params }) => {
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

  http.post('*/promotions/:id/reject', async ({ params, request }) => {
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

  http.get('*/claims', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockClaims, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, claims: result.data, data: result.data, pagination: result.pagination });
  }),

  http.get('*/claims/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockClaimStats });
  }),

  http.get('*/claims/:id', async ({ params }) => {
    await delay(200);
    const claim = mockClaims.find(c => c.id === params.id);
    
    if (!claim) {
      return HttpResponse.json({ success: false, error: 'Claim not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ success: true, data: claim });
  }),

  http.post('*/claims', async ({ request }) => {
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

  http.post('*/claims/:id/approve', async ({ params }) => {
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

  http.post('*/claims/:id/reject', async ({ params, request }) => {
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

  http.get('*/customers', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockCustomers, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, customers: result.data, data: result.data, pagination: result.pagination });
  }),

  http.get('*/customers/:id', async ({ params }) => {
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

  http.get('*/products', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockProducts, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, products: result.data, data: result.data, pagination: result.pagination });
  }),

  http.get('*/products/:id', async ({ params }) => {
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

  http.get('*/finance/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockFinanceStats });
  }),

  http.get('*/finance/accruals', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockAccruals, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, accruals: result.data, pagination: result.pagination });
  }),

  http.get('*/finance/deductions', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockDeductions, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, deductions: result.data, pagination: result.pagination });
  }),

  http.get('*/finance/journals', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const filtered = filterItems(mockJournals, url.searchParams);
    const result = paginate(filtered, page, pageSize);

    return HttpResponse.json({ success: true, journals: result.data, pagination: result.pagination });
  }),

  http.get('*/finance/cheques', async ({ request }) => {
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

  http.get('*/operations/deliveries', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const result = paginate(mockDeliveries, page, pageSize);
    return HttpResponse.json({ success: true, deliveries: result.data, data: result.data, pagination: result.pagination });
  }),

  http.get('*/operations/sell-tracking', async () => {
    await delay(300);
    // Transform mock data to match expected format
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

  http.get('*/operations/inventory', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockInventory });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════

  http.get('*/integration/erp/syncs', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockERPSyncs });
  }),

  http.get('*/integration/dms/syncs', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockDMSSyncs });
  }),

  http.get('*/integration/webhooks', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockWebhooks });
  }),

  http.post('*/integration/erp/sync', async () => {
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

  http.get('*/ai/recommendations', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockRecommendations });
  }),

  http.post('*/ai/recommendations/:id/accept', async ({ params }) => {
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

  http.post('*/ai/recommendations/:id/reject', async ({ params }) => {
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

  http.get('*/dashboard/kpis', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockDashboardKPIs });
  }),

  http.get('*/dashboard/charts', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockChartData });
  }),

  http.get('*/bi/reports', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockReports });
  }),

  http.post('*/bi/reports/generate', async ({ request }) => {
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

  http.get('*/bi/analytics', async () => {
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
        summary: {
          totalPromotions: 45,
          activePromotions: 12,
          totalBudget: 5000000000,
          spentBudget: 2500000000,
        }
      }
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

  // ═══════════════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('*/users', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockUsers });
  }),

  http.get('*/users/:id', async ({ params }) => {
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

  http.get('*/notifications', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'n1', type: 'INFO', title: 'Welcome!', message: 'Welcome to Promo Master', read: false, createdAt: new Date().toISOString() },
        { id: 'n2', type: 'SUCCESS', title: 'Promotion Approved', message: 'SUMMER-2026 has been approved', read: true, createdAt: new Date().toISOString() },
      ]
    });
  }),

  http.get('*/notifications/unread-count', async () => {
    await delay(100);
    return HttpResponse.json({ success: true, data: { count: 3 } });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // DASHBOARD STATS & CHARTS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('*/dashboard/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockDashboardKPIs });
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
    return HttpResponse.json({
      success: true,
      data: mockChartData.promotionsByStatus
    });
  }),

  http.get('*/dashboard/charts/top-customers', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: mockChartData.topCustomers
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // PLANNING - TEMPLATES
  // ═══════════════════════════════════════════════════════════════════════

  http.get('*/planning/templates', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');

    const mockTemplates = [
      { id: 'tpl-1', name: 'Summer Sale Template', description: 'Standard summer promotion template', type: 'DISCOUNT', status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-15T00:00:00Z' },
      { id: 'tpl-2', name: 'BOGO Template', description: 'Buy one get one free template', type: 'BOGO', status: 'ACTIVE', createdAt: '2026-01-02T00:00:00Z', updatedAt: '2026-01-16T00:00:00Z' },
      { id: 'tpl-3', name: 'Rebate Template', description: 'Standard rebate promotion', type: 'REBATE', status: 'DRAFT', createdAt: '2026-01-03T00:00:00Z', updatedAt: '2026-01-17T00:00:00Z' },
    ];

    const result = paginate(mockTemplates, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, templates: result.data, pagination: result.pagination });
  }),

  http.get('*/planning/templates/:id', async ({ params }) => {
    await delay(200);
    const template = {
      id: params.id,
      name: 'Sample Template',
      description: 'A sample promotion template',
      type: 'DISCOUNT',
      status: 'ACTIVE',
      config: { discountType: 'PERCENTAGE', discountValue: 10 },
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-15T00:00:00Z',
    };
    return HttpResponse.json({ success: true, data: template });
  }),

  http.post('*/planning/templates', async ({ request }) => {
    await delay(500);
    const body = await request.json() as any;
    const newTemplate = {
      id: `tpl-${Date.now()}`,
      ...body,
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newTemplate }, { status: 201 });
  }),

  http.delete('*/planning/templates/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Template deleted' });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // PLANNING - SCENARIOS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('*/planning/scenarios', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '12');

    const mockScenarios = [
      { id: 'scn-1', name: 'Q1 2026 Budget Scenario', description: 'Planning for Q1 budget allocation', status: 'ACTIVE', type: 'BUDGET', totalBudget: 500000000, projectedROI: 12.5, createdAt: '2026-01-01T00:00:00Z', updatedAt: '2026-01-20T00:00:00Z' },
      { id: 'scn-2', name: 'Summer Campaign Scenario', description: 'Summer promotion planning', status: 'DRAFT', type: 'CAMPAIGN', totalBudget: 300000000, projectedROI: 15.2, createdAt: '2026-01-05T00:00:00Z', updatedAt: '2026-01-21T00:00:00Z' },
      { id: 'scn-3', name: 'New Product Launch', description: 'New product promotion scenario', status: 'APPROVED', type: 'LAUNCH', totalBudget: 200000000, projectedROI: 18.0, createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-01-22T00:00:00Z' },
    ];

    const result = paginate(mockScenarios, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, scenarios: result.data, pagination: result.pagination });
  }),

  http.get('*/planning/scenarios/:id', async ({ params }) => {
    await delay(200);
    const scenario = {
      id: params.id,
      name: 'Sample Scenario',
      description: 'A sample planning scenario',
      status: 'ACTIVE',
      type: 'BUDGET',
      totalBudget: 500000000,
      projectedROI: 12.5,
      promotions: [],
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-20T00:00:00Z',
    };
    return HttpResponse.json({ success: true, data: scenario });
  }),

  http.post('*/planning/scenarios', async ({ request }) => {
    await delay(500);
    const body = await request.json() as any;
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

  http.delete('*/planning/scenarios/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Scenario deleted' });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // PLANNING - CLASHES
  // ═══════════════════════════════════════════════════════════════════════

  http.get('*/planning/clashes/stats', async () => {
    await delay(200);
    return HttpResponse.json({
      success: true,
      data: {
        total: 5,
        critical: 1,
        warning: 3,
        info: 1,
        resolved: 2,
        pending: 3,
      }
    });
  }),

  http.get('*/planning/clashes', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || url.searchParams.get('limit') || '10');

    const mockClashes = [
      { id: 'clash-1', type: 'OVERLAP', severity: 'CRITICAL', status: 'PENDING', promotionIds: ['promo-1', 'promo-2'], description: 'Two promotions overlap on same products', detectedAt: '2026-01-20T00:00:00Z' },
      { id: 'clash-2', type: 'BUDGET', severity: 'WARNING', status: 'PENDING', promotionIds: ['promo-3'], description: 'Budget exceeds allocated limit', detectedAt: '2026-01-21T00:00:00Z' },
      { id: 'clash-3', type: 'TIMING', severity: 'INFO', status: 'RESOLVED', promotionIds: ['promo-4', 'promo-5'], description: 'Promotions run at similar times', detectedAt: '2026-01-19T00:00:00Z', resolvedAt: '2026-01-20T00:00:00Z' },
    ];

    const result = paginate(mockClashes, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, clashes: result.data, pagination: result.pagination });
  }),

  http.post('*/planning/clashes/:id/resolve', async ({ params }) => {
    await delay(500);
    return HttpResponse.json({
      success: true,
      data: {
        id: params.id,
        status: 'RESOLVED',
        resolvedAt: new Date().toISOString(),
      }
    });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // BUDGETS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('*/budgets', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const mockBudgets = [
      { id: 'bud-1', name: 'Q1 2026 Marketing', totalAmount: 500000000, allocatedAmount: 350000000, spentAmount: 120000000, status: 'ACTIVE', period: 'Q1-2026', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'bud-2', name: 'Summer Campaign', totalAmount: 300000000, allocatedAmount: 200000000, spentAmount: 50000000, status: 'ACTIVE', period: 'Q2-2026', createdAt: '2026-01-15T00:00:00Z' },
    ];

    const result = paginate(mockBudgets, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, budgets: result.data, pagination: result.pagination });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // FUNDS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('*/funds', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const mockFunds = [
      { id: 'fund-1', code: 'MKT-001', name: 'Marketing Fund 2026', type: 'MARKETING', totalAmount: 1000000000, availableAmount: 700000000, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'fund-2', code: 'TRD-001', name: 'Trade Fund Q1', type: 'TRADE', totalAmount: 500000000, availableAmount: 400000000, status: 'ACTIVE', createdAt: '2026-01-01T00:00:00Z' },
    ];

    const result = paginate(mockFunds, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, funds: result.data, pagination: result.pagination });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // TARGETS & BASELINES
  // ═══════════════════════════════════════════════════════════════════════

  http.get('*/targets', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const mockTargets = [
      { id: 'tgt-1', name: 'Q1 Sales Target', type: 'SALES', targetValue: 5000000000, currentValue: 2500000000, progress: 50, period: 'Q1-2026', status: 'IN_PROGRESS', createdAt: '2026-01-01T00:00:00Z' },
      { id: 'tgt-2', name: 'Customer Acquisition', type: 'ACQUISITION', targetValue: 100, currentValue: 45, progress: 45, period: 'Q1-2026', status: 'IN_PROGRESS', createdAt: '2026-01-01T00:00:00Z' },
    ];

    const result = paginate(mockTargets, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, targets: result.data, pagination: result.pagination });
  }),

  http.get('*/baselines', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');

    const mockBaselines = [
      { id: 'bsl-1', name: '2025 Q4 Baseline', type: 'QUARTERLY', period: 'Q4-2025', salesVolume: 4500000000, margin: 18.5, status: 'APPROVED', createdAt: '2025-10-01T00:00:00Z' },
      { id: 'bsl-2', name: '2025 Annual Baseline', type: 'ANNUAL', period: '2025', salesVolume: 18000000000, margin: 17.8, status: 'APPROVED', createdAt: '2025-01-01T00:00:00Z' },
    ];

    const result = paginate(mockBaselines, page, pageSize);
    return HttpResponse.json({ success: true, data: result.data, baselines: result.data, pagination: result.pagination });
  }),

];
