/**
 * Target Allocation Page
 * Hierarchical target allocation with tree view and progress tracking
 * Phase 5: Integrated with Backend APIs
 */

import { useState, useMemo } from 'react';
import {
  ChevronRight, ChevronDown, Target, MapPin, Building2, Store,
  TrendingUp, TrendingDown, Search, Filter, Plus,
  Check, AlertCircle, Eye, Edit2, Layers,
  BarChart3, Calendar, Loader2, FolderTree
} from 'lucide-react';
import {
  useGeographicUnitsTree,
  useTargetAllocationTree,
  type TargetAllocation as TargetAllocationData,
  getMetricLabel,
} from '@/hooks';
import { useTargets } from '@/hooks/useTargets';
import type { Target as TargetType } from '@/types';

// Types
interface TreeNode {
  id: string;
  code: string;
  name: string;
  target: number;
  achieved: number;
  type: 'root' | 'region' | 'province' | 'district' | 'dealer';
  metric: string;
  children?: TreeNode[];
  geographicUnitId?: string;
  allocationId?: string;
}

interface PathItem {
  id: string;
  name: string;
  type: string;
}

// Map geographic level to type
const levelToType: Record<string, TreeNode['type']> = {
  COUNTRY: 'root',
  REGION: 'region',
  PROVINCE: 'province',
  DISTRICT: 'district',
  DEALER: 'dealer',
};

// Utility Functions
const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toLocaleString('vi-VN');
};

const getProgress = (achieved: number, target: number): number => {
  if (!target) return 0;
  return Math.round((achieved / target) * 100);
};

const getProgressColor = (p: number): string => {
  if (p >= 100) return '#10B981';
  if (p >= 75) return '#3B82F6';
  if (p >= 50) return '#F59E0B';
  return '#EF4444';
};

// Type Config
const typeConfig = {
  root: { icon: Target, label: 'Mục tiêu gốc', color: '#DC2626', bg: '#FEF2F2' },
  region: { icon: MapPin, label: 'Vùng/Miền', color: '#7C3AED', bg: '#F5F3FF' },
  province: { icon: Building2, label: 'Tỉnh/Thành', color: '#0891B2', bg: '#ECFEFF' },
  district: { icon: Layers, label: 'Quận/Huyện', color: '#059669', bg: '#ECFDF5' },
  dealer: { icon: Store, label: 'Đại lý', color: '#D97706', bg: '#FFFBEB' },
};

// Transform allocation data to tree nodes
function transformAllocationsToTree(allocations: TargetAllocationData[]): TreeNode[] {
  const transform = (allocation: TargetAllocationData): TreeNode => ({
    id: allocation.code,
    code: allocation.code,
    name: allocation.geographicUnit?.name || 'Unknown',
    type: levelToType[allocation.geographicUnit?.level || 'DEALER'] || 'dealer',
    target: Number(allocation.targetValue) || 0,
    achieved: Number(allocation.achievedValue) || 0,
    metric: allocation.metric || 'CASES',
    geographicUnitId: allocation.geographicUnitId,
    allocationId: allocation.id,
    children: allocation.children?.map(transform),
  });

  return allocations.map(transform);
}

// Progress Ring Component
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}

const ProgressRing = ({ progress, size = 48, strokeWidth = 4, color }: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(progress, 100) / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          style={{ color }}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-foreground-muted">{Math.min(progress, 100)}%</span>
      </div>
    </div>
  );
};

// Target Tree Node Component
interface TargetTreeNodeProps {
  node: TreeNode;
  level?: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (node: TreeNode, path: PathItem[]) => void;
  selectedId: string | null;
  path?: PathItem[];
}

const TargetTreeNode = ({ node, level = 0, expanded, onToggle, onSelect, selectedId, path = [] }: TargetTreeNodeProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded[node.id];
  const isSelected = selectedId === node.id;
  const config = typeConfig[node.type] || typeConfig.dealer;
  const Icon = config.icon;

  const progress = getProgress(node.achieved, node.target);
  const progressColor = getProgressColor(progress);
  const currentPath: PathItem[] = [...path, { id: node.id, name: node.name, type: node.type }];

  return (
    <div>
      <div
        className={`group flex items-center gap-3 py-2 px-3 rounded-lg cursor-pointer transition-all duration-100 ${
          isSelected
            ? 'bg-primary-muted border border-primary'
            : 'hover:bg-surface-hover border border-transparent'
        }`}
        style={{ marginLeft: level * 24 }}
        onClick={() => onSelect(node, currentPath)}
      >
        <button
          className={`w-6 h-6 flex items-center justify-center rounded hover:bg-surface-active transition-colors ${
            !hasChildren ? 'invisible' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>

        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: config.bg }}
        >
          <Icon className="w-4 h-4" style={{ color: config.color }} strokeWidth={1.75} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground truncate">{node.name}</span>
            <span className="text-xs font-mono text-foreground-subtle">{node.code}</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-3 mt-0.5">
            <span>{config.label}</span>
            {hasChildren && (
              <span className="text-foreground-subtle">• {node.children?.length} cấp dưới</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-right">
            <div className="text-sm font-semibold text-foreground tabular-nums">
              {formatNumber(node.achieved)} / {formatNumber(node.target)}
            </div>
            <div className="text-xs text-foreground-subtle">{getMetricLabel(node.metric as 'CASES' | 'VOLUME_LITERS' | 'REVENUE_VND' | 'UNITS')}</div>
          </div>

          <ProgressRing progress={progress} size={40} strokeWidth={3} color={progressColor} />

          <div className="w-24">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Tiến độ</span>
              <span style={{ color: progressColor }} className="font-medium">
                {progress}%
              </span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: progressColor }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-active">
              <Eye className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-surface-active">
              <Edit2 className="w-4 h-4 text-muted-foreground" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="relative">
          <div
            className="absolute left-6 top-0 bottom-4 w-px bg-muted"
            style={{ marginLeft: level * 24 + 12 }}
          />
          {node.children?.map((child) => (
            <TargetTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
              selectedId={selectedId}
              path={currentPath}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Detail Panel Component
interface DetailPanelProps {
  node: TreeNode | null;
}

const DetailPanel = ({ node }: DetailPanelProps) => {
  if (!node) return null;

  const config = typeConfig[node.type];
  const Icon = config.icon;
  const progress = getProgress(node.achieved, node.target);
  const progressColor = getProgressColor(progress);
  const remaining = Math.max(0, node.target - node.achieved);

  const getStatusInfo = () => {
    if (progress >= 100) return { label: 'Hoàn thành', icon: Check, color: 'text-success', bg: 'bg-success-muted' };
    if (progress >= 75) return { label: 'Đang tốt', icon: TrendingUp, color: 'text-primary', bg: 'bg-primary-muted' };
    if (progress >= 50) return { label: 'Cần cải thiện', icon: AlertCircle, color: 'text-warning', bg: 'bg-warning-muted' };
    return { label: 'Rủi ro', icon: TrendingDown, color: 'text-danger', bg: 'bg-danger-muted' };
  };

  const status = getStatusInfo();
  const StatusIcon = status.icon;

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: config.bg }}
          >
            <Icon className="w-6 h-6" style={{ color: config.color }} strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-foreground">{node.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground font-mono">{node.code}</p>
            <div className={`inline-flex items-center gap-1.5 mt-2 px-2 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              {status.label}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-center mb-4">
          <ProgressRing progress={progress} size={100} strokeWidth={8} color={progressColor} />
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {formatNumber(node.achieved)}
          </div>
          <div className="text-sm text-muted-foreground">
            trên {formatNumber(node.target)} {getMetricLabel(node.metric as 'CASES' | 'VOLUME_LITERS' | 'REVENUE_VND' | 'UNITS')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Mục tiêu</div>
          <div className="text-xl font-semibold text-foreground">{formatNumber(node.target)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Đạt được</div>
          <div className="text-xl font-semibold text-success">{formatNumber(node.achieved)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Còn lại</div>
          <div className="text-xl font-semibold text-warning">{formatNumber(remaining)}</div>
        </div>
        <div className="bg-card rounded-xl border border-border p-4">
          <div className="text-sm text-muted-foreground mb-1">Tiến độ</div>
          <div className="text-xl font-semibold" style={{ color: progressColor }}>{progress}%</div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-4">
        <div className="text-sm font-medium text-foreground mb-3">Thao tác</div>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors">
            <Plus className="w-4 h-4" strokeWidth={2} />
            Thêm cấp dưới
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors">
            <Edit2 className="w-4 h-4" strokeWidth={1.75} />
            Cập nhật
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors">
            <BarChart3 className="w-4 h-4" strokeWidth={1.75} />
            Báo cáo
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-foreground-muted bg-muted hover:bg-surface-hover rounded-lg transition-colors">
            <Calendar className="w-4 h-4" strokeWidth={1.75} />
            Lịch sử
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function TargetAllocation() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedNode, setSelectedNode] = useState<TreeNode | null>(null);
  const [, setSelectedPath] = useState<PathItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');

  // Fetch targets for selection
  const { data: targetsData, isLoading: targetsLoading } = useTargets({ limit: 100 });
  const targets = targetsData?.targets || [];

  // Fetch geographic units tree (for future use in creating allocations)
  const { isLoading: geoLoading } = useGeographicUnitsTree();

  // Fetch target allocations tree for selected target
  const { data: allocations, isLoading: allocationsLoading } = useTargetAllocationTree(selectedTargetId);

  // Transform allocations to tree nodes
  const treeData = useMemo(() => {
    if (!allocations || allocations.length === 0) {
      return null;
    }
    return transformAllocationsToTree(allocations);
  }, [allocations]);

  // Create root node from selected target
  const rootNode = useMemo(() => {
    if (!selectedTargetId || !targets.length) return null;

    const target = targets.find((t: TargetType) => t.id === selectedTargetId);
    if (!target) return null;

    return {
      id: target.code || target.id,
      code: target.code || target.id,
      name: target.name,
      type: 'root' as const,
      target: Number(target.totalTarget) || 0,
      achieved: Number(target.totalAchieved) || 0,
      metric: target.metric || 'CASES',
      children: treeData || [],
    };
  }, [selectedTargetId, targets, treeData]);

  const handleToggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelect = (node: TreeNode, path: PathItem[]) => {
    setSelectedNode(node);
    setSelectedPath(path);
  };

  const expandAll = () => {
    if (!rootNode) return;
    const getAllIds = (node: TreeNode): Record<string, boolean> => {
      let ids: Record<string, boolean> = { [node.id]: true };
      if (node.children) {
        node.children.forEach(child => {
          ids = { ...ids, ...getAllIds(child) };
        });
      }
      return ids;
    };
    setExpanded(getAllIds(rootNode));
  };

  const collapseAll = () => {
    if (!rootNode) return;
    setExpanded({ [rootNode.id]: true });
  };

  const isLoading = targetsLoading || geoLoading || allocationsLoading;

  // Calculate overall stats
  const overallProgress = rootNode ? getProgress(rootNode.achieved, rootNode.target) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-foreground">Phân bổ Mục tiêu</h1>
              <p className="text-sm text-muted-foreground">Cấu trúc phân cấp mục tiêu theo vùng miền</p>
            </div>
            <div className="flex items-center gap-3">
              {/* Target Selector */}
              <select
                value={selectedTargetId}
                onChange={(e) => {
                  setSelectedTargetId(e.target.value);
                  setSelectedNode(null);
                  setSelectedPath([]);
                  setExpanded({});
                }}
                className="h-9 px-3 pr-8 text-sm bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-foreground"
              >
                <option value="">Chọn mục tiêu...</option>
                {targets.map((target: TargetType) => (
                  <option key={target.id} value={target.id}>
                    {target.name} ({target.code || target.id})
                  </option>
                ))}
              </select>

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" strokeWidth={2} />
                Tạo phân bổ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        {/* No Target Selected State */}
        {!selectedTargetId && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Target className="w-16 h-16 mx-auto mb-4 text-foreground-subtle" strokeWidth={1.5} />
            <h3 className="text-lg font-medium text-foreground mb-2">Chọn mục tiêu để xem phân bổ</h3>
            <p className="text-muted-foreground mb-6">
              Vui lòng chọn một mục tiêu từ danh sách để xem và quản lý cấu trúc phân bổ
            </p>
            {targets.length === 0 && !targetsLoading && (
              <p className="text-warning text-sm">
                Chưa có mục tiêu nào. Vui lòng tạo mục tiêu trước khi phân bổ.
              </p>
            )}
          </div>
        )}

        {/* Loading State */}
        {selectedTargetId && isLoading && (
          <div className="bg-card rounded-xl border border-border p-12 text-center">
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-blue-500 animate-spin" />
            <p className="text-muted-foreground">Đang tải dữ liệu phân bổ...</p>
          </div>
        )}

        {/* Main Content when target is selected */}
        {selectedTargetId && !isLoading && rootNode && (
          <div className="flex gap-6">
            {/* Left Panel */}
            <div className="flex-1 min-w-0">
              {/* Stats Bar */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-1">Mục tiêu tổng</div>
                  <div className="text-2xl font-semibold text-foreground">{formatNumber(rootNode.target)}</div>
                  <div className="text-xs text-foreground-subtle">{getMetricLabel(rootNode.metric as 'CASES' | 'VOLUME_LITERS' | 'REVENUE_VND' | 'UNITS')}</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-1">Đã đạt</div>
                  <div className="text-2xl font-semibold text-success">{formatNumber(rootNode.achieved)}</div>
                  <div className="text-xs text-foreground-subtle">{overallProgress}% hoàn thành</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-1">Còn lại</div>
                  <div className="text-2xl font-semibold text-warning">{formatNumber(Math.max(0, rootNode.target - rootNode.achieved))}</div>
                  <div className="text-xs text-foreground-subtle">cần đạt thêm</div>
                </div>
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="text-sm text-muted-foreground mb-1">Tiến độ</div>
                  <div className="flex items-center gap-3">
                    <div className="text-2xl font-semibold" style={{ color: getProgressColor(overallProgress) }}>
                      {overallProgress}%
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(overallProgress, 100)}%`, backgroundColor: getProgressColor(overallProgress) }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Toolbar */}
              <div className="bg-card rounded-xl border border-border p-4 mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.75} />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên, mã..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 text-sm bg-muted border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-foreground placeholder:text-muted-foreground"
                    />
                  </div>

                  <button className="flex items-center gap-2 h-9 px-3 text-sm font-medium text-foreground-muted bg-card border border-border rounded-lg hover:bg-surface-hover">
                    <Filter className="w-4 h-4" strokeWidth={1.75} />
                    Lọc
                  </button>

                  <div className="flex items-center gap-1 border-l border-border pl-4">
                    <button
                      onClick={expandAll}
                      className="h-9 px-3 text-sm font-medium text-foreground-muted hover:bg-surface-hover rounded-lg"
                    >
                      Mở rộng
                    </button>
                    <button
                      onClick={collapseAll}
                      className="h-9 px-3 text-sm font-medium text-foreground-muted hover:bg-surface-hover rounded-lg"
                    >
                      Thu gọn
                    </button>
                  </div>
                </div>
              </div>

              {/* Tree View */}
              <div className="bg-card rounded-xl border border-border p-4">
                {/* Legend */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border text-xs">
                  {Object.entries(typeConfig).map(([key, cfg]) => {
                    const LegendIcon = cfg.icon;
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                          <LegendIcon className="w-3 h-3" style={{ color: cfg.color }} strokeWidth={2} />
                        </div>
                        <span className="text-foreground-subtle">{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>

                {rootNode.children && rootNode.children.length > 0 ? (
                  <TargetTreeNode
                    node={rootNode}
                    expanded={{ ...expanded, [rootNode.id]: true }}
                    onToggle={handleToggle}
                    onSelect={handleSelect}
                    selectedId={selectedNode?.id || null}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FolderTree className="w-12 h-12 mx-auto mb-4 text-foreground-subtle" strokeWidth={1.5} />
                    <h3 className="font-medium text-foreground mb-2">Chưa có phân bổ</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Mục tiêu này chưa có dữ liệu phân bổ theo vùng miền
                    </p>
                    <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                      <Plus className="w-4 h-4" />
                      Tạo phân bổ đầu tiên
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel - Details */}
            <div className="w-[360px] flex-shrink-0">
              {selectedNode ? (
                <DetailPanel node={selectedNode} />
              ) : (
                <div className="bg-card rounded-xl border border-border p-8 text-center">
                  <Target className="w-12 h-12 mx-auto mb-4 text-foreground-subtle" strokeWidth={1.5} />
                  <h3 className="font-medium text-foreground mb-2">Chọn một mục</h3>
                  <p className="text-sm text-muted-foreground">
                    Click vào bất kỳ mục nào trong cây để xem chi tiết
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
