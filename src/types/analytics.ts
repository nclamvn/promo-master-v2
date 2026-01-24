export interface DashboardKPI {
  totalBudget: number;
  totalCommitted: number;
  totalAvailable: number;
  activePromotions: number;
  pendingClaims: number;
  totalPromotions: number;
  utilizationRate: number;
}

export interface WeeklyKpiData {
  weekLabel: string;
  promotionsCreated: number;
  claimsSubmitted: number;
  budgetAllocated: number;
  claimsAmount: number;
}
