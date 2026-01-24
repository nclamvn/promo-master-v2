export interface Budget {
  id: string;
  code: string;
  name: string;
  type: 'FIXED' | 'VARIABLE';
  year: number;
  totalBudget: number;
  committed: number;
  available: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  companyId: string;
  customerId: string | null;
  customer: { id: string; name: string; channel: string } | null;
  _count?: { promotions: number };
  promotions?: Array<{
    id: string;
    code: string;
    name: string;
    status: string;
    budget: number;
    startDate: string;
    endDate: string;
  }>;
  transactions?: Array<{
    id: string;
    type: string;
    amount: number;
    description: string | null;
    createdAt: string;
  }>;
}

export interface CreateBudgetDto {
  code: string;
  name: string;
  type?: 'FIXED' | 'VARIABLE';
  year: number;
  totalBudget: number;
  customerId?: string;
}

export interface UpdateBudgetDto {
  name?: string;
  type?: 'FIXED' | 'VARIABLE';
  totalBudget?: number;
  isActive?: boolean;
}

export interface BudgetListResponse {
  data: Budget[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
