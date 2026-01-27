// ============================================================================
// BUDGET ALLOCATION PAGE - P0 CRITICAL
// Tree-based hierarchical budget allocation with drag-drop
// Path: apps/web/src/pages/budget/Allocation.tsx
// ============================================================================

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Minus,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  MapPin,
  Users,
  Store,
  Wallet,
  PieChart,
  BarChart3,
  GitBranch,
  Lock,
  Unlock,
  Save,
  Undo,
  Calculator,
  Percent,
  DollarSign,
} from 'lucide-react';
import { cn, formatPercent } from '@/lib/utils';
import { CurrencyDisplay, formatCurrencyCompact } from '@/components/ui/currency-display';

// ============================================================================
// TYPES
// ============================================================================

interface AllocationNode {
  id: string;
  code: string;
  name: string;
  type: 'COUNTRY' | 'REGION' | 'PROVINCE' | 'DISTRICT' | 'DEALER';
  parentId: string | null;
  level: number;
  
  // Budget data
  totalBudget: number;
  allocatedBudget: number;
  spentBudget: number;
  remainingBudget: number;
  
  // Allocation settings
  allocationPercent: number;
  allocationMethod: 'MANUAL' | 'PROPORTIONAL' | 'EQUAL' | 'HISTORICAL';
  isLocked: boolean;
  
  // Status
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'ACTIVE';
  
  // Metadata
  customerCount: number;
  lastYearSpend: number;
  growthTarget: number;
  
  // Children
  children?: AllocationNode[];
  isExpanded?: boolean;
}

interface BudgetSummary {
  totalBudget: number;
  allocated: number;
  unallocated: number;
  spent: number;
  committed: number;
  available: number;
  utilizationRate: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockAllocationTree: AllocationNode[] = [
  {
    id: 'vn',
    code: 'VN',
    name: 'Vietnam',
    type: 'COUNTRY',
    parentId: null,
    level: 0,
    totalBudget: 50000000000,
    allocatedBudget: 48500000000,
    spentBudget: 32000000000,
    remainingBudget: 16500000000,
    allocationPercent: 100,
    allocationMethod: 'MANUAL',
    isLocked: false,
    status: 'ACTIVE',
    customerCount: 15420,
    lastYearSpend: 45000000000,
    growthTarget: 11.1,
    isExpanded: true,
    children: [
      {
        id: 'north',
        code: 'NORTH',
        name: 'Miền Bắc',
        type: 'REGION',
        parentId: 'vn',
        level: 1,
        totalBudget: 20000000000,
        allocatedBudget: 19500000000,
        spentBudget: 13000000000,
        remainingBudget: 6500000000,
        allocationPercent: 40,
        allocationMethod: 'MANUAL',
        isLocked: false,
        status: 'ACTIVE',
        customerCount: 5840,
        lastYearSpend: 18000000000,
        growthTarget: 11.1,
        isExpanded: true,
        children: [
          {
            id: 'hanoi',
            code: 'HN',
            name: 'Hà Nội',
            type: 'PROVINCE',
            parentId: 'north',
            level: 2,
            totalBudget: 12000000000,
            allocatedBudget: 11800000000,
            spentBudget: 8000000000,
            remainingBudget: 3800000000,
            allocationPercent: 60,
            allocationMethod: 'PROPORTIONAL',
            isLocked: false,
            status: 'ACTIVE',
            customerCount: 3200,
            lastYearSpend: 10500000000,
            growthTarget: 14.3,
            isExpanded: false,
            children: [
              {
                id: 'hoankiem',
                code: 'HK',
                name: 'Hoàn Kiếm',
                type: 'DISTRICT',
                parentId: 'hanoi',
                level: 3,
                totalBudget: 3500000000,
                allocatedBudget: 3500000000,
                spentBudget: 2400000000,
                remainingBudget: 1100000000,
                allocationPercent: 29.2,
                allocationMethod: 'HISTORICAL',
                isLocked: true,
                status: 'APPROVED',
                customerCount: 850,
                lastYearSpend: 3200000000,
                growthTarget: 9.4,
                children: [],
              },
              {
                id: 'badinh',
                code: 'BD',
                name: 'Ba Đình',
                type: 'DISTRICT',
                parentId: 'hanoi',
                level: 3,
                totalBudget: 2800000000,
                allocatedBudget: 2700000000,
                spentBudget: 1800000000,
                remainingBudget: 900000000,
                allocationPercent: 23.3,
                allocationMethod: 'HISTORICAL',
                isLocked: false,
                status: 'ACTIVE',
                customerCount: 620,
                lastYearSpend: 2500000000,
                growthTarget: 12.0,
                children: [],
              },
              {
                id: 'dongda',
                code: 'DD',
                name: 'Đống Đa',
                type: 'DISTRICT',
                parentId: 'hanoi',
                level: 3,
                totalBudget: 2500000000,
                allocatedBudget: 2400000000,
                spentBudget: 1600000000,
                remainingBudget: 800000000,
                allocationPercent: 20.8,
                allocationMethod: 'MANUAL',
                isLocked: false,
                status: 'ACTIVE',
                customerCount: 580,
                lastYearSpend: 2300000000,
                growthTarget: 8.7,
                children: [],
              },
            ],
          },
          {
            id: 'haiphong',
            code: 'HP',
            name: 'Hải Phòng',
            type: 'PROVINCE',
            parentId: 'north',
            level: 2,
            totalBudget: 5000000000,
            allocatedBudget: 4800000000,
            spentBudget: 3200000000,
            remainingBudget: 1600000000,
            allocationPercent: 25,
            allocationMethod: 'PROPORTIONAL',
            isLocked: false,
            status: 'ACTIVE',
            customerCount: 1540,
            lastYearSpend: 4500000000,
            growthTarget: 11.1,
            children: [],
          },
          {
            id: 'quangninh',
            code: 'QN',
            name: 'Quảng Ninh',
            type: 'PROVINCE',
            parentId: 'north',
            level: 2,
            totalBudget: 3000000000,
            allocatedBudget: 2900000000,
            spentBudget: 1800000000,
            remainingBudget: 1100000000,
            allocationPercent: 15,
            allocationMethod: 'EQUAL',
            isLocked: false,
            status: 'PENDING',
            customerCount: 1100,
            lastYearSpend: 2800000000,
            growthTarget: 7.1,
            children: [],
          },
        ],
      },
      {
        id: 'central',
        code: 'CENTRAL',
        name: 'Miền Trung',
        type: 'REGION',
        parentId: 'vn',
        level: 1,
        totalBudget: 12000000000,
        allocatedBudget: 11500000000,
        spentBudget: 7500000000,
        remainingBudget: 4000000000,
        allocationPercent: 24,
        allocationMethod: 'MANUAL',
        isLocked: false,
        status: 'ACTIVE',
        customerCount: 3580,
        lastYearSpend: 11000000000,
        growthTarget: 9.1,
        isExpanded: false,
        children: [
          {
            id: 'danang',
            code: 'DN',
            name: 'Đà Nẵng',
            type: 'PROVINCE',
            parentId: 'central',
            level: 2,
            totalBudget: 6000000000,
            allocatedBudget: 5800000000,
            spentBudget: 3800000000,
            remainingBudget: 2000000000,
            allocationPercent: 50,
            allocationMethod: 'PROPORTIONAL',
            isLocked: false,
            status: 'ACTIVE',
            customerCount: 1800,
            lastYearSpend: 5500000000,
            growthTarget: 9.1,
            children: [],
          },
        ],
      },
      {
        id: 'south',
        code: 'SOUTH',
        name: 'Miền Nam',
        type: 'REGION',
        parentId: 'vn',
        level: 1,
        totalBudget: 18000000000,
        allocatedBudget: 17500000000,
        spentBudget: 11500000000,
        remainingBudget: 6000000000,
        allocationPercent: 36,
        allocationMethod: 'MANUAL',
        isLocked: false,
        status: 'ACTIVE',
        customerCount: 6000,
        lastYearSpend: 16000000000,
        growthTarget: 12.5,
        isExpanded: false,
        children: [
          {
            id: 'hcm',
            code: 'HCM',
            name: 'TP. Hồ Chí Minh',
            type: 'PROVINCE',
            parentId: 'south',
            level: 2,
            totalBudget: 12000000000,
            allocatedBudget: 11800000000,
            spentBudget: 7800000000,
            remainingBudget: 4000000000,
            allocationPercent: 66.7,
            allocationMethod: 'PROPORTIONAL',
            isLocked: false,
            status: 'ACTIVE',
            customerCount: 4200,
            lastYearSpend: 10500000000,
            growthTarget: 14.3,
            children: [],
          },
        ],
      },
    ],
  },
];

const mockBudgetSummary: BudgetSummary = {
  totalBudget: 50000000000,
  allocated: 48500000000,
  unallocated: 1500000000,
  spent: 32000000000,
  committed: 8000000000,
  available: 10000000000,
  utilizationRate: 64,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getTypeIcon = (type: AllocationNode['type']) => {
  switch (type) {
    case 'COUNTRY':
      return Building2;
    case 'REGION':
      return MapPin;
    case 'PROVINCE':
      return MapPin;
    case 'DISTRICT':
      return Store;
    case 'DEALER':
      return Users;
    default:
      return Building2;
  }
};

const getTypeColor = (type: AllocationNode['type']) => {
  switch (type) {
    case 'COUNTRY':
      return 'text-purple-600 bg-purple-50';
    case 'REGION':
      return 'text-blue-600 bg-blue-50';
    case 'PROVINCE':
      return 'text-green-600 bg-green-50';
    case 'DISTRICT':
      return 'text-orange-600 bg-orange-50';
    case 'DEALER':
      return 'text-gray-600 bg-gray-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getStatusBadge = (status: AllocationNode['status']) => {
  switch (status) {
    case 'DRAFT':
      return <Badge variant="outline">Nháp</Badge>;
    case 'PENDING':
      return <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20 hover:bg-amber-500/20">Chờ duyệt</Badge>;
    case 'APPROVED':
      return <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20">Đã duyệt</Badge>;
    case 'ACTIVE':
      return <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20">Đang hoạt động</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const getMethodLabel = (method: AllocationNode['allocationMethod']) => {
  switch (method) {
    case 'MANUAL':
      return 'Thủ công';
    case 'PROPORTIONAL':
      return 'Theo tỷ lệ';
    case 'EQUAL':
      return 'Chia đều';
    case 'HISTORICAL':
      return 'Theo lịch sử';
    default:
      return method;
  }
};

// ============================================================================
// COMPONENTS
// ============================================================================

// Summary Cards Component
const SummaryCards = ({ summary }: { summary: BudgetSummary }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <Wallet className="absolute -right-2 -bottom-2 h-16 w-16 text-blue-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Tổng ngân sách</p>
          <CurrencyDisplay amount={summary.totalBudget} size="md" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <CheckCircle2 className="absolute -right-2 -bottom-2 h-16 w-16 text-emerald-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Đã phân bổ</p>
          <CurrencyDisplay amount={summary.allocated} size="md" valueClassName="text-emerald-600 dark:text-emerald-400" />
          <p className="text-xs text-muted-foreground mt-1">{formatPercent(summary.allocated / summary.totalBudget * 100)}</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <AlertTriangle className="absolute -right-2 -bottom-2 h-16 w-16 text-amber-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Chưa phân bổ</p>
          <CurrencyDisplay amount={summary.unallocated} size="md" valueClassName="text-amber-600 dark:text-amber-400" />
          <p className="text-xs text-muted-foreground mt-1">{formatPercent(summary.unallocated / summary.totalBudget * 100)}</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <TrendingUp className="absolute -right-2 -bottom-2 h-16 w-16 text-violet-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Đã chi tiêu</p>
          <CurrencyDisplay amount={summary.spent} size="md" valueClassName="text-violet-600 dark:text-violet-400" />
          <p className="text-xs text-muted-foreground mt-1">{formatPercent(summary.spent / summary.totalBudget * 100)}</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <Clock className="absolute -right-2 -bottom-2 h-16 w-16 text-orange-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Cam kết</p>
          <CurrencyDisplay amount={summary.committed} size="md" valueClassName="text-orange-600 dark:text-orange-400" />
          <p className="text-xs text-muted-foreground mt-1">{formatPercent(summary.committed / summary.totalBudget * 100)}</p>
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardContent className="pt-4 pb-4">
          <DollarSign className="absolute -right-2 -bottom-2 h-16 w-16 text-blue-500/10" />
          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Còn khả dụng</p>
          <CurrencyDisplay amount={summary.available} size="md" valueClassName="text-blue-600 dark:text-blue-400" />
          <p className="text-xs text-muted-foreground mt-1">{formatPercent(summary.available / summary.totalBudget * 100)}</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Tree Node Component
const TreeNode = ({
  node,
  onToggle,
  onEdit,
  onDelete,
  onLockToggle,
  selectedId,
  onSelect,
}: {
  node: AllocationNode;
  onToggle: (id: string) => void;
  onEdit: (node: AllocationNode) => void;
  onDelete: (id: string) => void;
  onLockToggle: (id: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) => {
  const Icon = getTypeIcon(node.type);
  const hasChildren = node.children && node.children.length > 0;
  const utilizationPercent = (node.spentBudget / node.totalBudget) * 100;
  const allocationPercent = (node.allocatedBudget / node.totalBudget) * 100;
  
  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-colors',
          'hover:bg-accent',
          selectedId === node.id && 'bg-accent ring-2 ring-primary/20'
        )}
        style={{ paddingLeft: `${node.level * 24 + 12}px` }}
        onClick={() => onSelect(node.id)}
      >
        {/* Expand/Collapse Button */}
        <button
          className={cn(
            'p-0.5 rounded hover:bg-muted transition-colors',
            !hasChildren && 'invisible'
          )}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          {node.isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </button>
        
        {/* Type Icon */}
        <div className={cn('p-1.5 rounded', getTypeColor(node.type))}>
          <Icon className="h-4 w-4" />
        </div>
        
        {/* Name & Code */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{node.name}</span>
            <span className="text-xs text-muted-foreground">({node.code})</span>
            {node.isLocked && <Lock className="h-3 w-3 text-muted-foreground" />}
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{node.customerCount.toLocaleString()} KH</span>
            <span>•</span>
            <span>{getMethodLabel(node.allocationMethod)}</span>
          </div>
        </div>
        
        {/* Allocation Percent */}
        <div className="text-right w-20">
          <div className="font-semibold text-primary">{formatPercent(node.allocationPercent)}</div>
          <div className="text-xs text-muted-foreground">phân bổ</div>
        </div>
        
        {/* Budget Info */}
        <div className="text-right w-36">
          <CurrencyDisplay amount={node.totalBudget} size="sm" />
          <div className="text-xs text-muted-foreground">
            Chi: {formatCurrencyCompact(node.spentBudget)}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-24">
          <div className="flex items-center gap-1 mb-1">
            <Progress value={utilizationPercent} className="h-2 flex-1" />
            <span className="text-xs font-medium w-10 text-right">
              {utilizationPercent.toFixed(0)}%
            </span>
          </div>
          <div className="text-xs text-muted-foreground text-center">
            sử dụng
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="w-24">
          {getStatusBadge(node.status)}
        </div>
        
        {/* Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(node)}>
              <Edit2 className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onLockToggle(node.id)}>
              {node.isLocked ? (
                <>
                  <Unlock className="h-4 w-4 mr-2" />
                  Mở khóa
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Khóa
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Copy className="h-4 w-4 mr-2" />
              Sao chép
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Calculator className="h-4 w-4 mr-2" />
              Tính lại phân bổ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => onDelete(node.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Children */}
      {hasChildren && node.isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onLockToggle={onLockToggle}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Allocation Form Dialog
const AllocationFormDialog = ({
  node,
  open,
  onOpenChange,
  onSave,
}: {
  node: AllocationNode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<AllocationNode>) => void;
}) => {
  const [formData, setFormData] = useState({
    totalBudget: node?.totalBudget || 0,
    allocationPercent: node?.allocationPercent || 0,
    allocationMethod: node?.allocationMethod || 'MANUAL',
    growthTarget: node?.growthTarget || 0,
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {node ? `Chỉnh sửa phân bổ: ${node.name}` : 'Thêm phân bổ mới'}
          </DialogTitle>
          <DialogDescription>
            Điều chỉnh ngân sách và phương thức phân bổ
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Ngân sách</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-9"
                  value={formData.totalBudget}
                  onChange={(e) => setFormData({ ...formData, totalBudget: Number(e.target.value) })}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Tỷ lệ phân bổ (%)</label>
              <div className="relative">
                <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  className="pl-9"
                  value={formData.allocationPercent}
                  onChange={(e) => setFormData({ ...formData, allocationPercent: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Phương thức phân bổ</label>
            <Select
              value={formData.allocationMethod}
              onValueChange={(value) => setFormData({ ...formData, allocationMethod: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">Thủ công</SelectItem>
                <SelectItem value="PROPORTIONAL">Theo tỷ lệ doanh thu</SelectItem>
                <SelectItem value="EQUAL">Chia đều</SelectItem>
                <SelectItem value="HISTORICAL">Theo lịch sử chi tiêu</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Mục tiêu tăng trưởng (%)</label>
            <div className="relative">
              <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                className="pl-9"
                value={formData.growthTarget}
                onChange={(e) => setFormData({ ...formData, growthTarget: Number(e.target.value) })}
              />
            </div>
          </div>
          
          {node && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <h4 className="font-medium text-sm">Thông tin tham khảo</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Chi tiêu năm trước:</span>
                  <span className="ml-2 font-medium">{formatCurrencyCompact(node.lastYearSpend)}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Số khách hàng:</span>
                  <span className="ml-2 font-medium">{node.customerCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={() => onSave(formData)}>
            <Save className="h-4 w-4 mr-2" />
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BudgetAllocationPage() {
  // State
  const [allocationTree, setAllocationTree] = useState<AllocationNode[]>(mockAllocationTree);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<AllocationNode | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMethod, setFilterMethod] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'tree' | 'table' | 'flow'>('tree');
  
  // Toggle node expansion
  const toggleNode = (id: string) => {
    const updateTree = (nodes: AllocationNode[]): AllocationNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, isExpanded: !node.isExpanded };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };
    setAllocationTree(updateTree(allocationTree));
  };
  
  // Handle edit
  const handleEdit = (node: AllocationNode) => {
    setEditingNode(node);
    setIsEditDialogOpen(true);
  };
  
  // Handle save
  const handleSave = (data: Partial<AllocationNode>) => {
    console.log('Saving:', data);
    setIsEditDialogOpen(false);
    setEditingNode(null);
  };
  
  // Handle delete
  const handleDelete = (id: string) => {
    console.log('Delete:', id);
  };
  
  // Handle lock toggle
  const handleLockToggle = (id: string) => {
    const updateTree = (nodes: AllocationNode[]): AllocationNode[] => {
      return nodes.map((node) => {
        if (node.id === id) {
          return { ...node, isLocked: !node.isLocked };
        }
        if (node.children) {
          return { ...node, children: updateTree(node.children) };
        }
        return node;
      });
    };
    setAllocationTree(updateTree(allocationTree));
  };
  
  // Expand all
  const expandAll = () => {
    const updateTree = (nodes: AllocationNode[]): AllocationNode[] => {
      return nodes.map((node) => ({
        ...node,
        isExpanded: true,
        children: node.children ? updateTree(node.children) : undefined,
      }));
    };
    setAllocationTree(updateTree(allocationTree));
  };
  
  // Collapse all
  const collapseAll = () => {
    const updateTree = (nodes: AllocationNode[]): AllocationNode[] => {
      return nodes.map((node) => ({
        ...node,
        isExpanded: false,
        children: node.children ? updateTree(node.children) : undefined,
      }));
    };
    setAllocationTree(updateTree(allocationTree));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Phân Bổ Ngân Sách</h1>
          <p className="text-muted-foreground">
            Quản lý phân bổ ngân sách theo cấp bậc địa lý
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Thêm phân bổ
          </Button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <SummaryCards summary={mockBudgetSummary} />
      
      {/* Main Content */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              {/* Filter by method */}
              <Select value={filterMethod} onValueChange={setFilterMethod}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Phương thức" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="MANUAL">Thủ công</SelectItem>
                  <SelectItem value="PROPORTIONAL">Theo tỷ lệ</SelectItem>
                  <SelectItem value="EQUAL">Chia đều</SelectItem>
                  <SelectItem value="HISTORICAL">Theo lịch sử</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
                <TabsList className="h-9">
                  <TabsTrigger value="tree" className="px-3">
                    <GitBranch className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="table" className="px-3">
                    <BarChart3 className="h-4 w-4" />
                  </TabsTrigger>
                  <TabsTrigger value="flow" className="px-3">
                    <PieChart className="h-4 w-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {/* Expand/Collapse */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={expandAll}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mở rộng tất cả</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" onClick={collapseAll}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Thu gọn tất cả</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Tree View */}
          {viewMode === 'tree' && (
            <div className="border rounded-lg">
              {/* Header Row */}
              <div className="flex items-center gap-2 py-2 px-3 bg-muted/50 border-b text-sm font-medium text-muted-foreground">
                <div className="w-8" />
                <div className="w-10" />
                <div className="flex-1">Tên / Mã</div>
                <div className="w-20 text-right">Tỷ lệ</div>
                <div className="w-32 text-right">Ngân sách</div>
                <div className="w-24 text-center">Sử dụng</div>
                <div className="w-24 text-center">Trạng thái</div>
                <div className="w-10" />
              </div>
              
              {/* Tree Nodes */}
              <div className="divide-y">
                {allocationTree.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    onToggle={toggleNode}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onLockToggle={handleLockToggle}
                    selectedId={selectedNode}
                    onSelect={setSelectedNode}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Table View (placeholder) */}
          {viewMode === 'table' && (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Table view đang được phát triển</p>
            </div>
          )}
          
          {/* Flow View (placeholder) */}
          {viewMode === 'flow' && (
            <div className="text-center py-12 text-muted-foreground">
              <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Flow view đang được phát triển</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Dialog */}
      <AllocationFormDialog
        node={editingNode}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSave={handleSave}
      />
    </div>
  );
}
