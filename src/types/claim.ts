export type ClaimStatus = 'PENDING' | 'MATCHED' | 'APPROVED' | 'DISPUTED' | 'SETTLED' | 'REJECTED';

export interface Claim {
  id: string;
  code: string;
  amount: number;
  status: ClaimStatus;
  claimDate: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  customerId: string;
  promotionId: string | null;
  reviewedById: string | null;
  customer: { id: string; name: string; channel?: string } | null;
  promotion: { id: string; code: string; name: string; status?: string } | null;
  reviewedBy?: { id: string; name: string; email: string } | null;
  settlement?: { id: string; settledAmount: number; variance: number | null } | null;
}

export interface CreateClaimDto {
  code: string;
  amount: number;
  customerId: string;
  promotionId?: string;
  claimDate: string;
  description?: string;
}

export interface UpdateClaimDto {
  status?: ClaimStatus;
  amount?: number;
  description?: string;
  reviewedById?: string;
}

export interface ClaimListResponse {
  data: Claim[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
