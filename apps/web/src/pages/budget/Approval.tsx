/**
 * Budget Approval Page
 * Workflow phê duyệt ngân sách với multi-level approval
 */

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
// Select components - available for future filter implementation
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Eye,
  DollarSign,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Types
interface ApprovalRequest {
  id: string;
  budgetCode: string;
  budgetName: string;
  requestType: 'NEW' | 'AMENDMENT' | 'REALLOCATION' | 'EXTENSION';
  amount: number;
  previousAmount?: number;
  requestedBy: string;
  requestedAt: string;
  department: string;
  currentLevel: number;
  totalLevels: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  approvalHistory: ApprovalStep[];
}

interface ApprovalStep {
  level: number;
  approverName: string;
  approverRole: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'RETURNED';
  comment?: string;
  timestamp?: string;
}

// Mock data
const mockRequests: ApprovalRequest[] = [
  {
    id: '1',
    budgetCode: 'BUD-2026-Q2',
    budgetName: 'Q2/2026 Trade Budget',
    requestType: 'NEW',
    amount: 12500000000,
    requestedBy: 'Minh Trần',
    requestedAt: '2026-01-20T09:30:00',
    department: 'Trade Marketing',
    currentLevel: 2,
    totalLevels: 3,
    status: 'PENDING',
    urgency: 'HIGH',
    description: 'Budget allocation for Q2 2026 trade promotions across MT and GT channels.',
    approvalHistory: [
      {
        level: 1,
        approverName: 'Lan Phạm',
        approverRole: 'TM Manager',
        status: 'APPROVED',
        comment: 'Approved. Numbers align with Q2 targets.',
        timestamp: '2026-01-21T14:00:00',
      },
      {
        level: 2,
        approverName: 'Quỳnh Nguyễn',
        approverRole: 'Trade Director',
        status: 'PENDING',
      },
      {
        level: 3,
        approverName: 'Hùng Lê',
        approverRole: 'CFO',
        status: 'PENDING',
      },
    ],
  },
  {
    id: '2',
    budgetCode: 'BUD-2026-REAL-001',
    budgetName: 'MT to GT Reallocation',
    requestType: 'REALLOCATION',
    amount: 500000000,
    requestedBy: 'Hà Nguyễn',
    requestedAt: '2026-01-22T11:00:00',
    department: 'Sales',
    currentLevel: 1,
    totalLevels: 2,
    status: 'PENDING',
    urgency: 'MEDIUM',
    description: 'Reallocate ₫500M from MT underspend to GT channel for Tet campaign.',
    approvalHistory: [
      {
        level: 1,
        approverName: 'Quỳnh Nguyễn',
        approverRole: 'Trade Director',
        status: 'PENDING',
      },
      {
        level: 2,
        approverName: 'Hùng Lê',
        approverRole: 'CFO',
        status: 'PENDING',
      },
    ],
  },
  {
    id: '3',
    budgetCode: 'BUD-2026-AMD-001',
    budgetName: 'Q1 Budget Amendment',
    requestType: 'AMENDMENT',
    amount: 15000000000,
    previousAmount: 12500000000,
    requestedBy: 'Minh Trần',
    requestedAt: '2026-01-18T16:00:00',
    department: 'Trade Marketing',
    currentLevel: 3,
    totalLevels: 3,
    status: 'PENDING',
    urgency: 'CRITICAL',
    description: 'Increase Q1 budget by ₫2.5B to support additional Tet promotions.',
    approvalHistory: [
      {
        level: 1,
        approverName: 'Lan Phạm',
        approverRole: 'TM Manager',
        status: 'APPROVED',
        comment: 'Justified by Tet campaign expansion.',
        timestamp: '2026-01-19T09:00:00',
      },
      {
        level: 2,
        approverName: 'Quỳnh Nguyễn',
        approverRole: 'Trade Director',
        status: 'APPROVED',
        comment: 'Approved with condition to track ROI closely.',
        timestamp: '2026-01-20T11:30:00',
      },
      {
        level: 3,
        approverName: 'Hùng Lê',
        approverRole: 'CFO',
        status: 'PENDING',
      },
    ],
  },
  {
    id: '4',
    budgetCode: 'BUD-2025-Q4-EXT',
    budgetName: 'Q4/2025 Extension',
    requestType: 'EXTENSION',
    amount: 800000000,
    requestedBy: 'Lan Phạm',
    requestedAt: '2026-01-15T10:00:00',
    department: 'Trade Marketing',
    currentLevel: 2,
    totalLevels: 2,
    status: 'REJECTED',
    urgency: 'LOW',
    description: 'Extend Q4 2025 budget validity to cover delayed promotions.',
    approvalHistory: [
      {
        level: 1,
        approverName: 'Quỳnh Nguyễn',
        approverRole: 'Trade Director',
        status: 'APPROVED',
        comment: 'Acceptable given supplier delays.',
        timestamp: '2026-01-16T09:00:00',
      },
      {
        level: 2,
        approverName: 'Hùng Lê',
        approverRole: 'CFO',
        status: 'REJECTED',
        comment: 'Q4 budget should close. Move to Q1 2026 instead.',
        timestamp: '2026-01-17T14:00:00',
      },
    ],
  },
];

// Utility functions
const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `₫${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `₫${(value / 1000000).toFixed(0)}M`;
  }
  return `₫${value.toLocaleString('vi-VN')}`;
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusBadge = (status: ApprovalRequest['status']) => {
  const config = {
    PENDING: { label: 'Pending', variant: 'warning' as const, icon: Clock },
    APPROVED: { label: 'Approved', variant: 'success' as const, icon: CheckCircle },
    REJECTED: { label: 'Rejected', variant: 'destructive' as const, icon: XCircle },
    RETURNED: { label: 'Returned', variant: 'outline' as const, icon: RotateCcw },
  };
  const { label, variant, icon: Icon } = config[status];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {label}
    </Badge>
  );
};

const getUrgencyBadge = (urgency: ApprovalRequest['urgency']) => {
  const config = {
    LOW: { label: 'Low', className: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20' },
    MEDIUM: { label: 'Medium', className: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20' },
    HIGH: { label: 'High', className: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20' },
    CRITICAL: { label: 'Critical', className: 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20' },
  };
  const { label, className } = config[urgency];
  return <Badge className={className}>{label}</Badge>;
};

const getRequestTypeBadge = (type: ApprovalRequest['requestType']) => {
  const config = {
    NEW: { label: 'New Budget', variant: 'default' as const },
    AMENDMENT: { label: 'Amendment', variant: 'secondary' as const },
    REALLOCATION: { label: 'Reallocation', variant: 'outline' as const },
    EXTENSION: { label: 'Extension', variant: 'outline' as const },
  };
  return <Badge variant={config[type].variant}>{config[type].label}</Badge>;
};

export default function BudgetApprovalPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<ApprovalRequest | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [approvalComment, setApprovalComment] = useState('');

  // Filter requests based on tab
  const filteredRequests = mockRequests.filter((req) => {
    const matchesSearch =
      req.budgetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.budgetCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      selectedTab === 'all' ||
      (selectedTab === 'pending' && req.status === 'PENDING') ||
      (selectedTab === 'approved' && req.status === 'APPROVED') ||
      (selectedTab === 'rejected' && req.status === 'REJECTED');
    return matchesSearch && matchesTab;
  });

  // Stats
  const stats = {
    pending: mockRequests.filter((r) => r.status === 'PENDING').length,
    approved: mockRequests.filter((r) => r.status === 'APPROVED').length,
    rejected: mockRequests.filter((r) => r.status === 'REJECTED').length,
    totalAmount: mockRequests
      .filter((r) => r.status === 'PENDING')
      .reduce((sum, r) => sum + r.amount, 0),
  };

  const handleApprove = () => {
    // Handle approval logic
    setIsApproveDialogOpen(false);
    setApprovalComment('');
  };

  const handleReject = () => {
    // Handle rejection logic
    setIsApproveDialogOpen(false);
    setApprovalComment('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Approval</h1>
          <p className="text-muted-foreground mt-1">
            Workflow phê duyệt ngân sách với multi-level approval
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">requests waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">total value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved (MTD)</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected (MTD)</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Approval Queue */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Approval Queue</CardTitle>
              <CardDescription>Review and process budget requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Tabs & Search */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center mb-4">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({stats.pending})
                </TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="all">All</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="relative flex-1 md:max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Urgency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.budgetName}</div>
                        <div className="text-sm text-muted-foreground">
                          {request.budgetCode}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getRequestTypeBadge(request.requestType)}</TableCell>
                    <TableCell className="text-right">
                      <div className="font-mono">{formatCurrency(request.amount)}</div>
                      {request.previousAmount && (
                        <div className="text-xs text-muted-foreground">
                          from {formatCurrency(request.previousAmount)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {request.requestedBy
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm">{request.requestedBy}</div>
                          <div className="text-xs text-muted-foreground">
                            {request.department}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {request.approvalHistory.map((step, idx) => (
                          <div
                            key={idx}
                            className={`h-2 w-6 rounded-full ${
                              step.status === 'APPROVED'
                                ? 'bg-green-500'
                                : step.status === 'REJECTED'
                                ? 'bg-red-500'
                                : step.status === 'PENDING'
                                ? 'bg-yellow-500'
                                : 'bg-gray-300'
                            }`}
                            title={`${step.approverRole}: ${step.status}`}
                          />
                        ))}
                        <span className="text-xs text-muted-foreground ml-1">
                          {request.currentLevel}/{request.totalLevels}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getUrgencyBadge(request.urgency)}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsDetailOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {request.status === 'PENDING' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsApproveDialogOpen(true);
                              }}
                            >
                              <ThumbsUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600"
                              onClick={() => {
                                setSelectedRequest(request);
                                setIsApproveDialogOpen(true);
                              }}
                            >
                              <ThumbsDown className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              {selectedRequest?.budgetCode} - {selectedRequest?.budgetName}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Request Type</Label>
                  <div className="mt-1">{getRequestTypeBadge(selectedRequest.requestType)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <div className="mt-1 font-mono font-medium">
                    {formatCurrency(selectedRequest.amount)}
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requested By</Label>
                  <div className="mt-1">{selectedRequest.requestedBy}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Requested At</Label>
                  <div className="mt-1">{formatDate(selectedRequest.requestedAt)}</div>
                </div>
              </div>

              <div>
                <Label className="text-muted-foreground">Description</Label>
                <p className="mt-1 text-sm">{selectedRequest.description}</p>
              </div>

              <div>
                <Label className="text-muted-foreground">Approval Workflow</Label>
                <div className="mt-2 space-y-3">
                  {selectedRequest.approvalHistory.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-3 p-3 rounded-lg border ${
                        step.status === 'APPROVED'
                          ? 'bg-green-50 dark:bg-green-950'
                          : step.status === 'REJECTED'
                          ? 'bg-red-50 dark:bg-red-950'
                          : step.status === 'PENDING'
                          ? 'bg-yellow-50 dark:bg-yellow-950'
                          : ''
                      }`}
                    >
                      <div
                        className={`mt-0.5 rounded-full p-1 ${
                          step.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                            : step.status === 'REJECTED'
                            ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {step.status === 'APPROVED' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : step.status === 'REJECTED' ? (
                          <XCircle className="h-4 w-4" />
                        ) : (
                          <Clock className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{step.approverName}</span>
                            <span className="text-muted-foreground"> - {step.approverRole}</span>
                          </div>
                          <Badge variant="outline">Level {step.level}</Badge>
                        </div>
                        {step.comment && (
                          <p className="text-sm mt-1">{step.comment}</p>
                        )}
                        {step.timestamp && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(step.timestamp)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {selectedRequest?.status === 'PENDING' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setIsDetailOpen(false);
                    setIsApproveDialogOpen(true);
                  }}
                >
                  <ThumbsDown className="mr-2 h-4 w-4" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setIsDetailOpen(false);
                    setIsApproveDialogOpen(true);
                  }}
                >
                  <ThumbsUp className="mr-2 h-4 w-4" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve/Reject Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Please provide a comment for your decision on {selectedRequest?.budgetName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="comment">Comment (Required)</Label>
              <Textarea
                id="comment"
                placeholder="Enter your approval/rejection reason..."
                value={approvalComment}
                onChange={(e) => setApprovalComment(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsApproveDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!approvalComment}>
              <ThumbsDown className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={handleApprove} disabled={!approvalComment}>
              <ThumbsUp className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
