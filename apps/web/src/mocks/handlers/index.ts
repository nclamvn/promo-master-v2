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
  
  http.post('/api/auth/login', async ({ request }) => {
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

  http.post('/api/auth/logout', async () => {
    await delay(200);
    return HttpResponse.json({ success: true });
  }),

  http.get('/api/auth/me', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: currentUser });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // PROMOTIONS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('/api/promotions', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const filtered = filterItems(mockPromotions, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    
    return HttpResponse.json({ success: true, ...result });
  }),

  http.get('/api/promotions/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockPromotionStats });
  }),

  http.get('/api/promotions/:id', async ({ params }) => {
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

  http.post('/api/promotions', async ({ request }) => {
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

  http.put('/api/promotions/:id', async ({ params, request }) => {
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

  http.delete('/api/promotions/:id', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, message: 'Promotion deleted' });
  }),

  http.post('/api/promotions/:id/submit', async ({ params }) => {
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

  http.post('/api/promotions/:id/approve', async ({ params }) => {
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

  http.post('/api/promotions/:id/reject', async ({ params, request }) => {
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

  http.get('/api/claims', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const filtered = filterItems(mockClaims, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    
    return HttpResponse.json({ success: true, ...result });
  }),

  http.get('/api/claims/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockClaimStats });
  }),

  http.get('/api/claims/:id', async ({ params }) => {
    await delay(200);
    const claim = mockClaims.find(c => c.id === params.id);
    
    if (!claim) {
      return HttpResponse.json({ success: false, error: 'Claim not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ success: true, data: claim });
  }),

  http.post('/api/claims', async ({ request }) => {
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

  http.post('/api/claims/:id/approve', async ({ params }) => {
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

  http.post('/api/claims/:id/reject', async ({ params, request }) => {
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

  http.get('/api/customers', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const filtered = filterItems(mockCustomers, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    
    return HttpResponse.json({ success: true, ...result });
  }),

  http.get('/api/customers/:id', async ({ params }) => {
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

  http.get('/api/products', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const filtered = filterItems(mockProducts, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    
    return HttpResponse.json({ success: true, ...result });
  }),

  http.get('/api/products/:id', async ({ params }) => {
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

  http.get('/api/finance/stats', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockFinanceStats });
  }),

  http.get('/api/finance/accruals', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const filtered = filterItems(mockAccruals, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    
    return HttpResponse.json({ success: true, ...result });
  }),

  http.get('/api/finance/deductions', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const filtered = filterItems(mockDeductions, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    
    return HttpResponse.json({ success: true, ...result });
  }),

  http.get('/api/finance/journals', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const filtered = filterItems(mockJournals, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    
    return HttpResponse.json({ success: true, ...result });
  }),

  http.get('/api/finance/cheques', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const filtered = filterItems(mockCheques, url.searchParams);
    const result = paginate(filtered, page, pageSize);
    
    return HttpResponse.json({ success: true, ...result });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // OPERATIONS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('/api/operations/deliveries', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10');
    
    const result = paginate(mockDeliveries, page, pageSize);
    return HttpResponse.json({ success: true, ...result });
  }),

  http.get('/api/operations/sell-tracking', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockSellData });
  }),

  http.get('/api/operations/inventory', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockInventory });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // INTEGRATION
  // ═══════════════════════════════════════════════════════════════════════

  http.get('/api/integration/erp/syncs', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockERPSyncs });
  }),

  http.get('/api/integration/dms/syncs', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockDMSSyncs });
  }),

  http.get('/api/integration/webhooks', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockWebhooks });
  }),

  http.post('/api/integration/erp/sync', async () => {
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

  http.get('/api/ai/insights', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const type = url.searchParams.get('type');
    const severity = url.searchParams.get('severity');
    
    let filtered = [...mockInsights];
    if (type) filtered = filtered.filter(i => i.type === type);
    if (severity) filtered = filtered.filter(i => i.severity === severity);
    
    return HttpResponse.json({ success: true, data: filtered });
  }),

  http.get('/api/ai/recommendations', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockRecommendations });
  }),

  http.post('/api/ai/recommendations/:id/accept', async ({ params }) => {
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

  http.post('/api/ai/recommendations/:id/reject', async ({ params }) => {
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

  http.get('/api/dashboard/kpis', async () => {
    await delay(200);
    return HttpResponse.json({ success: true, data: mockDashboardKPIs });
  }),

  http.get('/api/dashboard/charts', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockChartData });
  }),

  http.get('/api/bi/reports', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockReports });
  }),

  http.post('/api/bi/reports/generate', async ({ request }) => {
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

  http.get('/api/bi/analytics', async () => {
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

  // ═══════════════════════════════════════════════════════════════════════
  // USERS
  // ═══════════════════════════════════════════════════════════════════════

  http.get('/api/users', async () => {
    await delay(300);
    return HttpResponse.json({ success: true, data: mockUsers });
  }),

  http.get('/api/users/:id', async ({ params }) => {
    await delay(200);
    const user = mockUsers.find(u => u.id === params.id);
    
    if (!user) {
      return HttpResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }
    
    return HttpResponse.json({ success: true, data: user });
  }),

  // ═══════════════════════════════════════════════════════════════════════
  // CATCH-ALL FOR UNHANDLED ROUTES
  // ═══════════════════════════════════════════════════════════════════════

  http.all('/api/*', ({ request }) => {
    console.warn(`[MSW] Unhandled ${request.method} request to ${request.url}`);
    return HttpResponse.json(
      { success: false, error: 'Endpoint not implemented in mock' },
      { status: 501 }
    );
  }),
];
