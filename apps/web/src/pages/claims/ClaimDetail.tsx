/**
 * Claim Detail Page - Full Implementation
 */

import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  FileText,
  User,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { PromotionStatusBadge } from '@/components/promotions/PromotionStatusBadge';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import {
  useClaim,
  useDeleteClaim,
  useSubmitClaim,
  useApproveClaim,
  useRejectClaim,
} from '@/hooks/useClaims';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Claim } from '@/types';

// Demo data
const demoClaim: Claim = {
  id: '1',
  code: 'CLM-2026-001',
  status: 'SUBMITTED',
  claimDate: '2026-01-15',
  claimAmount: 50000000,
  description: 'Q1 rebate claim for January sales performance. Includes display allowance and volume rebate calculations.',
  promotion: {
    id: '1',
    code: 'PROMO-2026-001',
    name: 'Summer Sale Campaign',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    budget: 500000000,
    actualSpend: 320000000,
    promotionType: 'TRADE_PROMOTION',
    customer: { id: '1', code: 'CUST-001', name: 'Customer A', channel: 'MODERN_TRADE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
    fund: { id: '1', code: 'FUND-001', name: 'Trade Fund Q1', fundType: 'TRADE_FUND', totalBudget: 1000000000, allocatedBudget: 500000000, utilizedBudget: 320000000, availableBudget: 180000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' },
    createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdAt: '2025-12-01',
    updatedAt: '2025-12-15',
  },
  createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
  createdAt: '2026-01-15',
  updatedAt: '2026-01-15',
};

export default function ClaimDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch claim
  const { data: claim, isLoading } = useClaim(id || '');
  const deleteClaim = useDeleteClaim();
  const submitClaim = useSubmitClaim();
  const approveClaim = useApproveClaim();
  const rejectClaim = useRejectClaim();

  // Use API data or demo data
  const claimData = claim || demoClaim;

  const handleDelete = async () => {
    await deleteClaim.mutateAsync(id!);
    navigate('/claims');
  };

  const handleSubmit = async () => {
    await submitClaim.mutateAsync(id!);
  };

  const handleApprove = async () => {
    await approveClaim.mutateAsync({ id: id!, approvedAmount: claimData.claimAmount });
  };

  const handleReject = async () => {
    await rejectClaim.mutateAsync({ id: id!, reason: 'Rejected - insufficient documentation' });
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading claim..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/claims">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{claimData.code}</h1>
              <ClaimStatusBadge status={claimData.status} />
            </div>
            <p className="text-muted-foreground">
              Claim for {claimData.promotion?.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Workflow Actions */}
          {claimData.status === 'DRAFT' && (
            <Button onClick={handleSubmit} disabled={submitClaim.isPending}>
              <Send className="mr-2 h-4 w-4" />
              Submit Claim
            </Button>
          )}

          {claimData.status === 'UNDER_REVIEW' && (
            <>
              <Button
                variant="outline"
                onClick={handleReject}
                disabled={rejectClaim.isPending}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button onClick={handleApprove} disabled={approveClaim.isPending}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          )}

          {/* Edit/Delete */}
          {['DRAFT', 'REJECTED'].includes(claimData.status) && (
            <>
              <Button variant="outline" asChild>
                <Link to={`/claims/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Claim</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this claim? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Claim Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(claimData.claimAmount)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approved Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {claimData.approvedAmount ? formatCurrency(claimData.approvedAmount) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Paid Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {claimData.paidAmount ? formatCurrency(claimData.paidAmount) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Claim Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(claimData.claimDate)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Claim Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Receipt className="h-4 w-4" /> Claim Code
                </p>
                <p className="font-medium">{claimData.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-4 w-4" /> Claim Date
                </p>
                <p className="font-medium">{formatDate(claimData.claimDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4" /> Amount
                </p>
                <p className="font-medium">{formatCurrency(claimData.claimAmount)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <ClaimStatusBadge status={claimData.status} />
              </div>
            </div>

            <Separator />

            {claimData.description && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Description</p>
                <p className="text-sm">{claimData.description}</p>
              </div>
            )}

            {claimData.paidAt && (
              <div>
                <p className="text-sm text-muted-foreground">Payment Date</p>
                <p className="font-medium">{formatDate(claimData.paidAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Related Promotion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {claimData.promotion && (
              <>
                <Link
                  to={`/promotions/${claimData.promotion.id}`}
                  className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{claimData.promotion.code}</p>
                      <p className="text-sm text-muted-foreground">
                        {claimData.promotion.name}
                      </p>
                    </div>
                    <PromotionStatusBadge status={claimData.promotion.status} />
                  </div>
                </Link>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <FileText className="h-4 w-4" /> Customer
                    </p>
                    <p className="font-medium">{claimData.promotion.customer?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-4 w-4" /> Fund
                    </p>
                    <p className="font-medium">{claimData.promotion.fund?.name}</p>
                  </div>
                </div>
              </>
            )}

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <User className="h-4 w-4" /> Created By
                </p>
                <p className="font-medium">{claimData.createdBy?.name}</p>
                <p className="text-xs text-muted-foreground">{formatDate(claimData.createdAt)}</p>
              </div>
              {claimData.approvedBy && (
                <div>
                  <p className="text-sm text-muted-foreground">Approved By</p>
                  <p className="font-medium">{claimData.approvedBy.name}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
