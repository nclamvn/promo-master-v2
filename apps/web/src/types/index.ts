/**
 * Type Definitions
 */

// ============================================
// USER & AUTH
// ============================================
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  company: Company;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'ANALYST' | 'VIEWER';

export interface Company {
  id: string;
  name: string;
  code?: string;
  logo?: string;
}

// ============================================
// PROMOTION
// ============================================
export interface Promotion {
  id: string;
  code: string;
  name: string;
  description?: string;
  status: PromotionStatus;
  startDate: string;
  endDate: string;
  budget: number;
  actualSpend: number;
  promotionType: PromotionType;
  mechanicType?: MechanicType;
  customer: Customer;
  fund: Fund;
  products?: Product[];
  createdBy: User;
  approvedBy?: User;
  createdAt: string;
  updatedAt: string;
}

export type PromotionStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'ACTIVE'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'REJECTED';

export type PromotionType =
  | 'TRADE_PROMOTION'
  | 'CONSUMER_PROMOTION'
  | 'SHOPPER_MARKETING'
  | 'DISPLAY'
  | 'LISTING_FEE';

export type MechanicType =
  | 'DISCOUNT'
  | 'REBATE'
  | 'FREE_GOODS'
  | 'BOGO'
  | 'BUNDLE'
  | 'LOYALTY_POINTS';

// ============================================
// CLAIM
// ============================================
export interface Claim {
  id: string;
  code: string;
  status: ClaimStatus;
  claimDate: string;
  claimAmount: number;
  approvedAmount?: number;
  paidAmount?: number;
  description?: string;
  evidenceUrls?: string[];
  promotion: Promotion;
  createdBy: User;
  approvedBy?: User;
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ClaimStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAID'
  | 'CANCELLED';

// ============================================
// FUND
// ============================================
export interface Fund {
  id: string;
  code: string;
  name: string;
  fundType: FundType;
  totalBudget: number;
  allocatedBudget: number;
  utilizedBudget: number;
  availableBudget: number;
  startDate: string;
  endDate: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type FundType =
  | 'TRADE_FUND'
  | 'MARKETING_FUND'
  | 'PROMOTIONAL_FUND'
  | 'CO_OP_FUND';

// ============================================
// CUSTOMER
// ============================================
export interface Customer {
  id: string;
  code: string;
  name: string;
  channel: CustomerChannel;
  tier?: CustomerTier;
  address?: string;
  city?: string;
  region?: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export type CustomerChannel =
  | 'MODERN_TRADE'
  | 'GENERAL_TRADE'
  | 'KEY_ACCOUNT'
  | 'DISTRIBUTOR'
  | 'WHOLESALER'
  | 'E_COMMERCE';

export type CustomerTier = 'PLATINUM' | 'GOLD' | 'SILVER' | 'BRONZE';

// ============================================
// PRODUCT
// ============================================
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  unit: string;
  description?: string;
  imageUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

// ============================================
// API RESPONSE
// ============================================
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: PaginationMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginationMeta {
  totalCount: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ============================================
// COMMON TYPES
// ============================================
export interface SelectOption {
  value: string;
  label: string;
}

export interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

export interface SortConfig {
  column: string;
  direction: 'asc' | 'desc';
}

export interface FilterConfig {
  [key: string]: string | number | boolean | string[] | undefined;
}

// ============================================
// BUDGET
// ============================================
export interface Budget {
  id: string;
  code: string;
  name: string;
  year: number;
  totalAmount: number;
  allocatedAmount: number;
  spentAmount: number;
  availableAmount: number;
  status: BudgetStatus;
  category: string;
  department?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BudgetStatus = 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'CLOSED';

export interface CreateBudgetInput {
  code: string;
  name: string;
  year: number;
  totalAmount: number;
  category: string;
  department?: string;
  notes?: string;
}

export type UpdateBudgetInput = Partial<CreateBudgetInput>;

// ============================================
// TARGET
// ============================================
export interface Target {
  id: string;
  code: string;
  name: string;
  year: number;
  month?: number;
  quarter?: number;
  targetType: TargetType;
  targetValue: number;
  actualValue: number;
  achievementRate: number;
  customerId?: string;
  customerName?: string;
  productId?: string;
  productName?: string;
  regionId?: string;
  regionName?: string;
  status: TargetStatus;
  createdAt: string;
  updatedAt: string;
}

export type TargetType = 'REVENUE' | 'VOLUME' | 'DISTRIBUTION' | 'COVERAGE';
export type TargetStatus = 'DRAFT' | 'ACTIVE' | 'ACHIEVED' | 'MISSED';

export interface CreateTargetInput {
  code: string;
  name: string;
  year: number;
  month?: number;
  quarter?: number;
  targetType: TargetType;
  targetValue: number;
  customerId?: string;
  productId?: string;
  regionId?: string;
}

// ============================================
// BASELINE
// ============================================
export interface Baseline {
  id: string;
  code: string;
  name: string;
  year: number;
  period: BaselinePeriod;
  periodValue: number;
  baselineType: BaselineType;
  baselineValue: number;
  actualValue?: number;
  variance?: number;
  variancePercent?: number;
  customerId?: string;
  customerName?: string;
  productId?: string;
  productName?: string;
  categoryId?: string;
  categoryName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BaselinePeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type BaselineType = 'REVENUE' | 'VOLUME' | 'PRICE' | 'COST';

export interface CreateBaselineInput {
  code: string;
  name: string;
  year: number;
  period: BaselinePeriod;
  periodValue: number;
  baselineType: BaselineType;
  baselineValue: number;
  customerId?: string;
  productId?: string;
  categoryId?: string;
  notes?: string;
}

// ============================================
// PLANNING (Re-export from planning.ts)
// ============================================
export * from './planning';
