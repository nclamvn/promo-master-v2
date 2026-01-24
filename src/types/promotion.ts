export type PromotionStatus = 'DRAFT' | 'PLANNED' | 'CONFIRMED' | 'EXECUTING' | 'COMPLETED' | 'CANCELLED';

export interface Promotion {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: PromotionStatus;
  startDate: string;
  endDate: string;
  budget: number;
  actualSpend: number | null;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  fundId: string;
  createdById: string;
  customer: { id: string; name: string; channel: string; code?: string } | null;
  fund: { id: string; name: string; code: string; type?: string } | null;
  createdBy?: { id: string; name: string; email: string };
  _count?: { tactics: number; claims: number };
  tactics?: Tactic[];
  claims?: Array<{
    id: string;
    code: string;
    amount: number;
    status: string;
    claimDate: string;
  }>;
}

export interface Tactic {
  id: string;
  type: string;
  mechanic: string | null;
  value: number | null;
  budget: number;
  items: TacticItem[];
}

export interface TacticItem {
  id: string;
  quantity: number | null;
  discount: number | null;
  product: { id: string; name: string; sku: string };
}

export interface CreatePromotionDto {
  code: string;
  name: string;
  description?: string;
  customerId: string;
  fundId: string;
  startDate: string;
  endDate: string;
  budget: number;
}

export interface UpdatePromotionDto {
  name?: string;
  description?: string;
  status?: PromotionStatus;
  startDate?: string;
  endDate?: string;
  budget?: number;
}

export interface PromotionListResponse {
  data: Promotion[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CalendarPromotion {
  id: string;
  code: string;
  name: string;
  status: PromotionStatus;
  startDate: string;
  endDate: string;
  budget: number;
  customer: { id: string; name: string; channel: string } | null;
}
