/**
 * Claim List Page - Full Implementation
 */

import { useState, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ColumnDef } from '@tanstack/react-table';
import { Plus, LayoutGrid, List, MoreHorizontal, Eye, Edit, Trash2, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DataTable } from '@/components/shared/DataTable';
import { Pagination } from '@/components/shared/Pagination';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { SearchInput } from '@/components/shared/SearchInput';
import { ClaimStatusBadge } from '@/components/claims/ClaimStatusBadge';
import { useClaims, useDeleteClaim } from '@/hooks/useClaims';
import { formatDate } from '@/lib/utils';
import { CurrencyDisplay } from '@/components/ui/currency-display';
import type { Claim, ClaimStatus } from '@/types';

type ViewMode = 'table' | 'grid';

// Demo data when API not connected
const demoClaims: Claim[] = [
  {
    id: '1',
    code: 'CLM-2026-001',
    status: 'SUBMITTED',
    claimDate: '2026-01-15',
    claimAmount: 50000000,
    description: 'Q1 rebate claim for January sales',
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
  },
  {
    id: '2',
    code: 'CLM-2026-002',
    status: 'APPROVED',
    claimDate: '2026-01-10',
    claimAmount: 75000000,
    approvedAmount: 72000000,
    description: 'December trade deal settlement',
    promotion: {
      id: '2',
      code: 'PROMO-2026-002',
      name: 'Q1 Trade Deal',
      status: 'ACTIVE',
      startDate: '2026-02-01',
      endDate: '2026-04-30',
      budget: 300000000,
      actualSpend: 0,
      promotionType: 'TRADE_PROMOTION',
      customer: { id: '2', code: 'CUST-002', name: 'Customer B', channel: 'KEY_ACCOUNT', status: 'ACTIVE', createdAt: '', updatedAt: '' },
      fund: { id: '1', code: 'FUND-001', name: 'Trade Fund Q1', fundType: 'TRADE_FUND', totalBudget: 1000000000, allocatedBudget: 500000000, utilizedBudget: 320000000, availableBudget: 180000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' },
      createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
      createdAt: '2025-12-10',
      updatedAt: '2025-12-20',
    },
    approvedBy: { id: '2', email: 'manager@example.com', name: 'Jane Smith', role: 'ADMIN', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdAt: '2026-01-10',
    updatedAt: '2026-01-12',
  },
  {
    id: '3',
    code: 'CLM-2026-003',
    status: 'PAID',
    claimDate: '2025-12-20',
    claimAmount: 30000000,
    approvedAmount: 30000000,
    paidAmount: 30000000,
    paidAt: '2026-01-05',
    description: 'Flash sale promotional spend',
    promotion: {
      id: '4',
      code: 'PROMO-2026-004',
      name: 'Flash Sale Weekend',
      status: 'COMPLETED',
      startDate: '2025-12-01',
      endDate: '2025-12-31',
      budget: 200000000,
      actualSpend: 195000000,
      promotionType: 'TRADE_PROMOTION',
      customer: { id: '1', code: 'CUST-001', name: 'Customer A', channel: 'MODERN_TRADE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
      fund: { id: '1', code: 'FUND-001', name: 'Trade Fund Q1', fundType: 'TRADE_FUND', totalBudget: 1000000000, allocatedBudget: 500000000, utilizedBudget: 320000000, availableBudget: 180000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' },
      createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
      createdAt: '2025-11-15',
      updatedAt: '2025-12-31',
    },
    createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdAt: '2025-12-20',
    updatedAt: '2026-01-05',
  },
  {
    id: '4',
    code: 'CLM-2026-004',
    status: 'UNDER_REVIEW',
    claimDate: '2026-01-18',
    claimAmount: 120000000,
    description: 'Large display promotion settlement',
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
    createdAt: '2026-01-18',
    updatedAt: '2026-01-20',
  },
  {
    id: '5',
    code: 'CLM-2026-005',
    status: 'REJECTED',
    claimDate: '2026-01-08',
    claimAmount: 45000000,
    description: 'Invalid claim - missing documentation',
    promotion: {
      id: '3',
      code: 'PROMO-2026-003',
      name: 'New Product Launch',
      status: 'DRAFT',
      startDate: '2026-03-01',
      endDate: '2026-05-31',
      budget: 800000000,
      actualSpend: 0,
      promotionType: 'CONSUMER_PROMOTION',
      customer: { id: '3', code: 'CUST-003', name: 'Customer C', channel: 'GENERAL_TRADE', status: 'ACTIVE', createdAt: '', updatedAt: '' },
      fund: { id: '2', code: 'FUND-002', name: 'Marketing Fund', fundType: 'MARKETING_FUND', totalBudget: 2000000000, allocatedBudget: 800000000, utilizedBudget: 0, availableBudget: 1200000000, startDate: '2026-01-01', endDate: '2026-12-31', createdAt: '', updatedAt: '' },
      createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
      createdAt: '2025-12-15',
      updatedAt: '2025-12-22',
    },
    createdBy: { id: '1', email: 'user@example.com', name: 'John Doe', role: 'MANAGER', company: { id: '1', name: 'Company' }, createdAt: '', updatedAt: '' },
    createdAt: '2026-01-08',
    updatedAt: '2026-01-10',
  },
];

const statusOptions: { value: ClaimStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'PAID', label: 'Paid' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function ClaimList() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Get filters from URL
  const filters = {
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') || '') as ClaimStatus | '',
    promotionId: searchParams.get('promotionId') || '',
  };

  const page = Number(searchParams.get('page')) || 1;
  const pageSize = Number(searchParams.get('pageSize')) || 20;

  // Fetch claims
  const { data, isLoading, error } = useClaims({
    page,
    pageSize,
    status: filters.status || undefined,
    promotionId: filters.promotionId || undefined,
    search: filters.search || undefined,
  });

  const deleteClaim = useDeleteClaim();

  // Use API data or demo data
  const claims = (data?.claims?.length ? data.claims : demoClaims);
  const metadata = data?.metadata || {
    totalCount: demoClaims.length,
    pageSize: 20,
    pageNumber: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  };

  // Filter demo data locally when API not connected
  const filteredClaims = useMemo(() => {
    if (data?.claims) return claims; // API handles filtering

    return claims.filter((claim: Claim) => {
      if (filters.search && !claim.code.toLowerCase().includes(filters.search.toLowerCase()) &&
          !claim.promotion?.name.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      if (filters.status && claim.status !== filters.status) return false;
      if (filters.promotionId && claim.promotion?.id !== filters.promotionId) return false;
      return true;
    });
  }, [claims, filters, data?.claims]);

  // Update URL params
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    const merged = { ...filters, ...newFilters };
    const params = new URLSearchParams();
    if (merged.search) params.set('search', merged.search);
    if (merged.status) params.set('status', merged.status);
    if (merged.promotionId) params.set('promotionId', merged.promotionId);
    params.set('page', '1');
    params.set('pageSize', String(pageSize));
    setSearchParams(params);
  };

  const updatePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    setSearchParams(params);
  };

  const updatePageSize = (newSize: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('pageSize', String(newSize));
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this claim?')) {
      await deleteClaim.mutateAsync(id);
    }
  };

  // Table columns
  const columns: ColumnDef<Claim>[] = useMemo(
    () => [
      {
        accessorKey: 'code',
        header: 'Claim Code',
        cell: ({ row }) => (
          <Link
            to={`/claims/${row.original.id}`}
            className="font-medium text-primary hover:underline"
          >
            {row.original.code}
          </Link>
        ),
      },
      {
        accessorKey: 'promotion',
        header: 'Promotion',
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.promotion?.name}</p>
            <p className="text-sm text-muted-foreground">
              {row.original.promotion?.code}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <ClaimStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'claimAmount',
        header: 'Amount',
        cell: ({ row }) => (
          <div>
            <CurrencyDisplay amount={row.original.claimAmount} size="sm" />
            {row.original.approvedAmount && (
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                Approved: <CurrencyDisplay amount={row.original.approvedAmount} size="sm" showToggle={false} />
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'claimDate',
        header: 'Claim Date',
        cell: ({ row }) => formatDate(row.original.claimDate),
      },
      {
        id: 'actions',
        cell: ({ row }) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/claims/${row.original.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate(`/claims/${row.original.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleDelete(row.original.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    [navigate]
  );

  if (isLoading) {
    return <LoadingSpinner fullScreen text="Loading claims..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Claims</h1>
          <p className="text-muted-foreground">
            Manage promotion claims and settlements
          </p>
        </div>
        <Button asChild>
          <Link to="/claims/new">
            <Plus className="mr-2 h-4 w-4" />
            New Claim
          </Link>
        </Button>
      </div>

      {/* Filters & View Toggle */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <SearchInput
            value={filters.search}
            onChange={(search) => updateFilters({ search })}
            placeholder="Search claims..."
            className="w-full sm:w-80"
          />

          <Select
            value={filters.status || 'all'}
            onValueChange={(status) => updateFilters({ status: status === 'all' ? '' : status as ClaimStatus })}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('table')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      {filteredClaims.length === 0 ? (
        <EmptyState
          title="No claims found"
          description={
            filters.search || filters.status
              ? 'Try adjusting your filters'
              : 'Get started by creating your first claim'
          }
          action={
            <Button asChild>
              <Link to="/claims/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Claim
              </Link>
            </Button>
          }
        />
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <DataTable
              columns={columns}
              data={filteredClaims}
              error={error?.message}
              onRowClick={(row) => navigate(`/claims/${row.id}`)}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredClaims.map((claim: Claim) => (
            <Link key={claim.id} to={`/claims/${claim.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {claim.code}
                      </p>
                      <CardTitle className="mt-1 text-lg">{claim.promotion?.name}</CardTitle>
                    </div>
                    <ClaimStatusBadge status={claim.status} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Receipt className="h-4 w-4" />
                      <span>{formatDate(claim.claimDate)}</span>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Claimed</span>
                        <CurrencyDisplay amount={claim.claimAmount} size="sm" />
                      </div>
                      {claim.approvedAmount && (
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-sm text-muted-foreground">Approved</span>
                          <CurrencyDisplay amount={claim.approvedAmount} size="sm" valueClassName="text-emerald-600 dark:text-emerald-400" />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {filteredClaims.length > 0 && (
        <Pagination
          currentPage={metadata.pageNumber}
          totalPages={metadata.totalPages}
          pageSize={metadata.pageSize}
          totalCount={metadata.totalCount}
          onPageChange={updatePage}
          onPageSizeChange={updatePageSize}
        />
      )}
    </div>
  );
}
