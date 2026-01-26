/**
 * MSW Request Handlers
 * Mock API responses for testing
 */

import { http, HttpResponse } from 'msw';

const API_URL = '/api';

// Mock Data
export const mockPromotion = {
  id: '1',
  code: 'PROMO-001',
  name: 'Summer Sale',
  description: 'Summer promotional campaign',
  status: 'ACTIVE',
  startDate: '2024-01-01',
  endDate: '2024-03-31',
  budget: 100000000,
  actualSpend: 45000000,
  promotionType: 'TRADE_PROMOTION',
  mechanicType: 'DISCOUNT',
  customer: {
    id: 'cust-1',
    code: 'CUST001',
    name: 'ABC Corp',
    channel: 'MODERN_TRADE',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  fund: {
    id: 'fund-1',
    code: 'FUND001',
    name: 'Trade Fund Q1',
    fundType: 'TRADE_FUND',
    totalBudget: 500000000,
    allocatedBudget: 200000000,
    utilizedBudget: 100000000,
    availableBudget: 300000000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  createdBy: {
    id: 'user-1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
    company: { id: 'comp-1', name: 'Company' },
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
};

export const mockPromotions = [
  mockPromotion,
  {
    ...mockPromotion,
    id: '2',
    code: 'PROMO-002',
    name: 'Winter Campaign',
    status: 'DRAFT',
  },
  {
    ...mockPromotion,
    id: '3',
    code: 'PROMO-003',
    name: 'Flash Sale',
    status: 'PENDING_APPROVAL',
  },
];

export const mockCustomers = [
  {
    id: 'cust-1',
    code: 'CUST001',
    name: 'ABC Corp',
    channel: 'MODERN_TRADE',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'cust-2',
    code: 'CUST002',
    name: 'XYZ Ltd',
    channel: 'GENERAL_TRADE',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export const mockProducts = [
  {
    id: 'prod-1',
    sku: 'SKU001',
    name: 'Product A',
    category: 'Beverages',
    brand: 'Brand X',
    price: 50000,
    unit: 'bottle',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

export const mockFunds = [
  {
    id: 'fund-1',
    code: 'FUND001',
    name: 'Trade Fund Q1',
    fundType: 'TRADE_FUND',
    totalBudget: 500000000,
    allocatedBudget: 200000000,
    utilizedBudget: 100000000,
    availableBudget: 300000000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
  {
    id: 'fund-2',
    code: 'FUND002',
    name: 'Marketing Fund',
    fundType: 'MARKETING_FUND',
    totalBudget: 250000000,
    allocatedBudget: 100000000,
    utilizedBudget: 50000000,
    availableBudget: 150000000,
    startDate: '2024-01-01',
    endDate: '2024-12-31',
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01',
  },
];

// Handlers
export const handlers = [
  // Promotions
  http.get(`${API_URL}/promotions`, () => {
    return HttpResponse.json({
      success: true,
      data: mockPromotions,
      metadata: {
        totalCount: mockPromotions.length,
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  http.get(`${API_URL}/promotions/:id`, ({ params }) => {
    const promotion = mockPromotions.find((p) => p.id === params.id);
    if (!promotion) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Promotion not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true, data: promotion });
  }),

  http.post(`${API_URL}/promotions`, async ({ request }) => {
    const body = await request.json();
    const newPromotion = {
      ...mockPromotion,
      ...body,
      id: String(Date.now()),
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newPromotion }, { status: 201 });
  }),

  http.patch(`${API_URL}/promotions/:id`, async ({ params, request }) => {
    const body = await request.json();
    const promotion = mockPromotions.find((p) => p.id === params.id);
    if (!promotion) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Promotion not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: { ...promotion, ...body, updatedAt: new Date().toISOString() },
    });
  }),

  http.delete(`${API_URL}/promotions/:id`, ({ params }) => {
    const promotion = mockPromotions.find((p) => p.id === params.id);
    if (!promotion) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Promotion not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true });
  }),

  // Customers
  http.get(`${API_URL}/customers`, () => {
    return HttpResponse.json({
      success: true,
      data: mockCustomers,
      metadata: {
        totalCount: mockCustomers.length,
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  // Products
  http.get(`${API_URL}/products`, () => {
    return HttpResponse.json({
      success: true,
      data: mockProducts,
      metadata: {
        totalCount: mockProducts.length,
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  // Auth
  http.post(`${API_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.email === 'admin@example.com' && body.password === 'password') {
      return HttpResponse.json({
        success: true,
        data: {
          user: mockPromotion.createdBy,
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
        },
      });
    }
    return HttpResponse.json(
      { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
      { status: 401 }
    );
  }),

  // Dashboard stats
  http.get(`${API_URL}/dashboard/stats`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        totalPromotions: 156,
        activeBudget: 2500000000,
        totalClaims: 423,
        avgROI: 24.5,
      },
    });
  }),

  // Funds
  http.get(`${API_URL}/funds`, () => {
    return HttpResponse.json({
      success: true,
      data: mockFunds,
      metadata: {
        totalCount: mockFunds.length,
        pageSize: 10,
        pageNumber: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  }),

  http.get(`${API_URL}/funds/:id`, ({ params }) => {
    const fund = mockFunds.find((f) => f.id === params.id);
    if (!fund) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Fund not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true, data: fund });
  }),

  http.post(`${API_URL}/funds`, async ({ request }) => {
    const body = await request.json();
    const newFund = {
      ...mockFunds[0],
      ...body,
      id: String(Date.now()),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json({ success: true, data: newFund }, { status: 201 });
  }),

  http.patch(`${API_URL}/funds/:id`, async ({ params, request }) => {
    const body = await request.json();
    const fund = mockFunds.find((f) => f.id === params.id);
    if (!fund) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Fund not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({
      success: true,
      data: { ...fund, ...body, updatedAt: new Date().toISOString() },
    });
  }),

  http.delete(`${API_URL}/funds/:id`, ({ params }) => {
    const fund = mockFunds.find((f) => f.id === params.id);
    if (!fund) {
      return HttpResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Fund not found' } },
        { status: 404 }
      );
    }
    return HttpResponse.json({ success: true });
  }),
];
