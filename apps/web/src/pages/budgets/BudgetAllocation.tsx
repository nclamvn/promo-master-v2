/**
 * Budget Allocation Page
 * Hierarchical budget allocation with tree view and flow visualization
 */

import { useState } from 'react';
import {
  ChevronRight, ChevronDown, DollarSign, MapPin, Building2,
  Store, Search, Filter, Plus, MoreHorizontal,
  ArrowRight, AlertCircle, Eye, Edit2,
  FolderTree, GitBranch, Layers, BarChart3, Download, Copy
} from 'lucide-react';

// Types
interface BudgetNode {
  id: string;
  name: string;
  total: number;
  allocated: number;
  spent: number;
  type: 'root' | 'region' | 'province' | 'district' | 'dealer';
  children?: BudgetNode[];
}

interface PathItem {
  id: string;
  name: string;
  type: string;
}

// Mock Data - Hierarchical Budget Structure
const budgetData: BudgetNode = {
  id: 'BUD-2026-Q1',
  name: 'Q1 2026 Marketing',
  total: 500000000000,
  allocated: 485000000000,
  spent: 120000000000,
  type: 'root',
  children: [
    {
      id: 'REG-NORTH',
      name: 'Mien Bac',
      total: 180000000000,
      allocated: 175000000000,
      spent: 45000000000,
      type: 'region',
      children: [
        {
          id: 'PROV-HN',
          name: 'Ha Noi',
          total: 80000000000,
          allocated: 78000000000,
          spent: 22000000000,
          type: 'province',
          children: [
            { id: 'DIST-HN-01', name: 'Quan Hoan Kiem', total: 15000000000, allocated: 15000000000, spent: 5200000000, type: 'district', children: [
              { id: 'DLR-HK-001', name: 'Dai ly Vinmart Trang Tien', total: 3000000000, allocated: 3000000000, spent: 1200000000, type: 'dealer' },
              { id: 'DLR-HK-002', name: 'Dai ly BigC Ho Guom', total: 4000000000, allocated: 4000000000, spent: 1500000000, type: 'dealer' },
              { id: 'DLR-HK-003', name: 'Dai ly CoopMart Ly Thai To', total: 3500000000, allocated: 3500000000, spent: 1100000000, type: 'dealer' },
            ]},
            { id: 'DIST-HN-02', name: 'Quan Ba Dinh', total: 18000000000, allocated: 17500000000, spent: 4800000000, type: 'district', children: [
              { id: 'DLR-BD-001', name: 'Dai ly Lotte Kim Ma', total: 5000000000, allocated: 5000000000, spent: 1800000000, type: 'dealer' },
              { id: 'DLR-BD-002', name: 'Dai ly WinMart Doi Can', total: 4500000000, allocated: 4500000000, spent: 1200000000, type: 'dealer' },
            ]},
            { id: 'DIST-HN-03', name: 'Quan Cau Giay', total: 22000000000, allocated: 21000000000, spent: 6500000000, type: 'district' },
            { id: 'DIST-HN-04', name: 'Quan Dong Da', total: 14000000000, allocated: 13500000000, spent: 3200000000, type: 'district' },
          ]
        },
        {
          id: 'PROV-HP',
          name: 'Hai Phong',
          total: 45000000000,
          allocated: 44000000000,
          spent: 12000000000,
          type: 'province',
          children: [
            { id: 'DIST-HP-01', name: 'Quan Hong Bang', total: 12000000000, allocated: 12000000000, spent: 3500000000, type: 'district' },
            { id: 'DIST-HP-02', name: 'Quan Le Chan', total: 15000000000, allocated: 14500000000, spent: 4200000000, type: 'district' },
          ]
        },
        {
          id: 'PROV-QN',
          name: 'Quang Ninh',
          total: 35000000000,
          allocated: 33000000000,
          spent: 8000000000,
          type: 'province',
        },
      ]
    },
    {
      id: 'REG-CENTRAL',
      name: 'Mien Trung',
      total: 120000000000,
      allocated: 115000000000,
      spent: 28000000000,
      type: 'region',
      children: [
        { id: 'PROV-DN', name: 'Da Nang', total: 50000000000, allocated: 48000000000, spent: 12000000000, type: 'province' },
        { id: 'PROV-HUE', name: 'Thua Thien Hue', total: 30000000000, allocated: 29000000000, spent: 7000000000, type: 'province' },
        { id: 'PROV-QNA', name: 'Quang Nam', total: 25000000000, allocated: 24000000000, spent: 5500000000, type: 'province' },
      ]
    },
    {
      id: 'REG-SOUTH',
      name: 'Mien Nam',
      total: 200000000000,
      allocated: 195000000000,
      spent: 47000000000,
      type: 'region',
      children: [
        { id: 'PROV-HCM', name: 'TP. Ho Chi Minh', total: 120000000000, allocated: 118000000000, spent: 32000000000, type: 'province' },
        { id: 'PROV-BD', name: 'Binh Duong', total: 40000000000, allocated: 38000000000, spent: 8000000000, type: 'province' },
        { id: 'PROV-DN2', name: 'Dong Nai', total: 35000000000, allocated: 34000000000, spent: 6000000000, type: 'province' },
      ]
    },
  ]
};

// Utility Functions
const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B`;
  } else if (value >= 1000000) {
    return `${(value / 1000000).toFixed(0)}M`;
  }
  return value.toLocaleString('vi-VN');
};

const formatFullCurrency = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value) + ' VND';
};

const getUtilization = (spent: number, total: number): number => {
  if (!total) return 0;
  return Math.round((spent / total) * 100);
};

const getAllocation = (allocated: number, total: number): number => {
  if (!total) return 0;
  return Math.round((allocated / total) * 100);
};

// Type Config
const typeConfig = {
  root: { icon: DollarSign, label: 'Ngan sach goc', color: '#0047AB', bg: '#F0F5FF' },
  region: { icon: MapPin, label: 'Vung/Mien', color: '#7C3AED', bg: '#F5F3FF' },
  province: { icon: Building2, label: 'Tinh/Thanh', color: '#0891B2', bg: '#ECFEFF' },
  district: { icon: Layers, label: 'Quan/Huyen', color: '#059669', bg: '#ECFDF5' },
  dealer: { icon: Store, label: 'Dai ly', color: '#D97706', bg: '#FFFBEB' },
};

// Tree Node Component
interface TreeNodeProps {
  node: BudgetNode;
  level?: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (node: BudgetNode, path: PathItem[]) => void;
  selectedId: string | null;
  path?: PathItem[];
}

const TreeNode = ({ node, level = 0, expanded, onToggle, onSelect, selectedId, path = [] }: TreeNodeProps) => {
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = expanded[node.id];
  const isSelected = selectedId === node.id;
  const config = typeConfig[node.type] || typeConfig.dealer;
  const Icon = config.icon;

  const utilization = getUtilization(node.spent, node.total);
  const allocation = getAllocation(node.allocated, node.total);

  const currentPath: PathItem[] = [...path, { id: node.id, name: node.name, type: node.type }];

  return (
    <div>
      <div
        className={`group flex items-center gap-2 py-2 px-3 rounded-lg cursor-pointer transition-all duration-100 ${
          isSelected
            ? 'bg-blue-50 border border-blue-200'
            : 'hover:bg-gray-50 border border-transparent'
        }`}
        style={{ marginLeft: level * 24 }}
        onClick={() => onSelect(node, currentPath)}
      >
        <button
          className={`w-6 h-6 flex items-center justify-center rounded hover:bg-gray-200 transition-colors ${
            !hasChildren ? 'invisible' : ''
          }`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(node.id);
          }}
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
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
            <span className="font-medium text-gray-900 truncate">{node.name}</span>
            <span className="text-xs font-mono text-gray-400">{node.id}</span>
          </div>
          <div className="text-xs text-gray-500 flex items-center gap-3 mt-0.5">
            <span>{config.label}</span>
            {hasChildren && (
              <span className="text-gray-400">• {node.children?.length} cap duoi</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6 flex-shrink-0">
          <div className="text-right w-28">
            <div className="text-sm font-semibold text-gray-900 tabular-nums">
              {formatCurrency(node.total)}
            </div>
            <div className="text-xs text-gray-400">Tong</div>
          </div>

          <div className="w-32">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Phan bo</span>
              <span className={`font-medium ${allocation === 100 ? 'text-green-600' : 'text-amber-600'}`}>
                {allocation}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${allocation}%`,
                  backgroundColor: allocation === 100 ? '#10B981' : '#F59E0B'
                }}
              />
            </div>
          </div>

          <div className="w-32">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-gray-500">Su dung</span>
              <span className={`font-medium ${
                utilization >= 80 ? 'text-red-600' : utilization >= 50 ? 'text-amber-600' : 'text-blue-600'
              }`}>
                {utilization}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${utilization}%`,
                  backgroundColor: utilization >= 80 ? '#EF4444' : utilization >= 50 ? '#F59E0B' : '#3B82F6'
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200">
              <Eye className="w-4 h-4 text-gray-500" strokeWidth={1.75} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200">
              <Edit2 className="w-4 h-4 text-gray-500" strokeWidth={1.75} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200">
              <MoreHorizontal className="w-4 h-4 text-gray-500" strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className="relative">
          <div
            className="absolute left-6 top-0 bottom-4 w-px bg-gray-200"
            style={{ marginLeft: level * 24 + 12 }}
          />
          {node.children?.map((child) => (
            <TreeNode
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

// Flow Visualization Component
interface FlowVisualizationProps {
  node: BudgetNode | null;
  path: PathItem[];
}

const FlowVisualization = ({ node, path }: FlowVisualizationProps) => {
  if (!node) return null;

  const config = typeConfig[node.type];
  const Icon = config.icon;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <GitBranch className="w-5 h-5 text-gray-400" strokeWidth={1.75} />
        Luong phan bo ngan sach
      </h3>

      {path.length > 0 && (
        <div className="flex items-center gap-2 mb-6 text-sm overflow-x-auto pb-2">
          {path.map((item, index) => {
            const itemConfig = typeConfig[item.type as keyof typeof typeConfig];
            return (
              <div key={item.id} className="flex items-center gap-2">
                {index > 0 && <ArrowRight className="w-4 h-4 text-gray-300 flex-shrink-0" />}
                <span
                  className="px-2 py-1 rounded flex items-center gap-1.5 flex-shrink-0"
                  style={{ backgroundColor: itemConfig.bg, color: itemConfig.color }}
                >
                  {item.name}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {hasChildren && (
        <div className="relative">
          <div className="flex justify-center mb-4">
            <div
              className="px-6 py-3 rounded-xl border-2 flex items-center gap-3"
              style={{ borderColor: config.color, backgroundColor: config.bg }}
            >
              <Icon className="w-5 h-5" style={{ color: config.color }} strokeWidth={1.75} />
              <div>
                <div className="font-semibold" style={{ color: config.color }}>{node.name}</div>
                <div className="text-sm text-gray-600">{formatCurrency(node.total)}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-4">
            <div className="w-px h-8 bg-gray-300" />
          </div>

          <div className="flex items-start justify-center gap-4 overflow-x-auto pb-4">
            {node.children?.map((child) => {
              const childConfig = typeConfig[child.type];
              const ChildIcon = childConfig.icon;
              const percentage = Math.round((child.total / node.total) * 100);
              const utilization = getUtilization(child.spent, child.total);

              return (
                <div key={child.id} className="flex flex-col items-center min-w-[140px]">
                  <div className="flex items-center gap-0">
                    <div className="w-8 h-px bg-gray-300" />
                    <div className="w-px h-6 bg-gray-300" />
                  </div>

                  <div className="px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium text-gray-600 mb-2">
                    {percentage}%
                  </div>

                  <div
                    className="w-full p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
                    style={{ borderColor: childConfig.color + '40', backgroundColor: childConfig.bg }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <ChildIcon className="w-4 h-4" style={{ color: childConfig.color }} strokeWidth={1.75} />
                      <span className="font-medium text-gray-900 text-sm truncate">{child.name}</span>
                    </div>
                    <div className="text-sm font-semibold text-gray-900 mb-2">
                      {formatCurrency(child.total)}
                    </div>
                    <div className="h-1.5 bg-white rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${utilization}%`,
                          backgroundColor: childConfig.color
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Da dung: {utilization}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!hasChildren && (
        <div className="text-center text-gray-500 py-8">
          <Store className="w-12 h-12 mx-auto mb-3 text-gray-300" strokeWidth={1.5} />
          <p>Day la cap cuoi cung (Dai ly)</p>
          <p className="text-sm">Khong co cap duoi de phan bo</p>
        </div>
      )}
    </div>
  );
};

// Detail Panel Component
interface DetailPanelProps {
  node: BudgetNode | null;
}

const DetailPanel = ({ node }: DetailPanelProps) => {
  if (!node) return null;

  const config = typeConfig[node.type];
  const Icon = config.icon;
  const utilization = getUtilization(node.spent, node.total);
  const allocation = getAllocation(node.allocated, node.total);
  const available = node.total - node.spent;
  const unallocated = node.total - node.allocated;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-start gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: config.bg }}
          >
            <Icon className="w-6 h-6" style={{ color: config.color }} strokeWidth={1.75} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-lg font-semibold text-gray-900">{node.name}</h2>
              <span
                className="px-2 py-0.5 rounded text-xs font-medium"
                style={{ backgroundColor: config.bg, color: config.color }}
              >
                {config.label}
              </span>
            </div>
            <p className="text-sm text-gray-500 font-mono">{node.id}</p>
          </div>
          <button className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
            Chinh sua
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Tong ngan sach</div>
          <div className="text-xl font-semibold text-gray-900">{formatFullCurrency(node.total)}</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Da phan bo</div>
          <div className="text-xl font-semibold text-green-600">{formatFullCurrency(node.allocated)}</div>
          <div className="text-xs text-gray-400">{allocation}% tong</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Da chi tieu</div>
          <div className="text-xl font-semibold text-blue-600">{formatFullCurrency(node.spent)}</div>
          <div className="text-xs text-gray-400">{utilization}% tong</div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="text-sm text-gray-500 mb-1">Con kha dung</div>
          <div className="text-xl font-semibold text-gray-900">{formatFullCurrency(available)}</div>
          <div className="text-xs text-gray-400">{100 - utilization}% tong</div>
        </div>
      </div>

      {unallocated > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" strokeWidth={2} />
          <div>
            <div className="font-medium text-amber-800">Chua phan bo het</div>
            <div className="text-sm text-amber-700">
              Con {formatFullCurrency(unallocated)} ({100 - allocation}%) chua duoc phan bo xuong cap duoi
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="text-sm font-medium text-gray-900 mb-3">Thao tac nhanh</div>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Plus className="w-4 h-4" strokeWidth={2} />
            Them cap duoi
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Copy className="w-4 h-4" strokeWidth={1.75} />
            Nhan ban
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <BarChart3 className="w-4 h-4" strokeWidth={1.75} />
            Bao cao
          </button>
          <button className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
            <Download className="w-4 h-4" strokeWidth={1.75} />
            Xuat Excel
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export default function BudgetAllocation() {
  const [viewMode, setViewMode] = useState<'tree' | 'flow'>('tree');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'BUD-2026-Q1': true, 'REG-NORTH': true, 'PROV-HN': true });
  const [selectedNode, setSelectedNode] = useState<BudgetNode | null>(null);
  const [selectedPath, setSelectedPath] = useState<PathItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelect = (node: BudgetNode, path: PathItem[]) => {
    setSelectedNode(node);
    setSelectedPath(path);
  };

  const expandAll = () => {
    const getAllIds = (node: BudgetNode): Record<string, boolean> => {
      let ids: Record<string, boolean> = { [node.id]: true };
      if (node.children) {
        node.children.forEach(child => {
          ids = { ...ids, ...getAllIds(child) };
        });
      }
      return ids;
    };
    setExpanded(getAllIds(budgetData));
  };

  const collapseAll = () => {
    setExpanded({ 'BUD-2026-Q1': true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Phan bo Ngan sach</h1>
              <p className="text-sm text-gray-500">Q1 2026 Marketing - Cau truc phan cap ngan sach theo vung mien</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'tree' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setViewMode('tree')}
                >
                  <FolderTree className="w-4 h-4" strokeWidth={1.75} />
                  Cay thu muc
                </button>
                <button
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'flow' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  }`}
                  onClick={() => setViewMode('flow')}
                >
                  <GitBranch className="w-4 h-4" strokeWidth={1.75} />
                  Luong phan bo
                </button>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" strokeWidth={2} />
                Tao phan bo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-6">
        <div className="flex gap-6">
          {/* Left Panel */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" strokeWidth={1.75} />
                  <input
                    type="text"
                    placeholder="Tim kiem theo ten, ma..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <button className="flex items-center gap-2 h-9 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" strokeWidth={1.75} />
                  Loc
                </button>

                <div className="flex items-center gap-1 border-l border-gray-200 pl-4">
                  <button
                    onClick={expandAll}
                    className="h-9 px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Mo rong
                  </button>
                  <button
                    onClick={collapseAll}
                    className="h-9 px-3 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    Thu gon
                  </button>
                </div>
              </div>
            </div>

            {/* Tree View */}
            {viewMode === 'tree' && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                {/* Legend */}
                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100 text-xs">
                  {Object.entries(typeConfig).map(([key, cfg]) => {
                    const LegendIcon = cfg.icon;
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
                          <LegendIcon className="w-3 h-3" style={{ color: cfg.color }} strokeWidth={2} />
                        </div>
                        <span className="text-gray-600">{cfg.label}</span>
                      </div>
                    );
                  })}
                </div>

                <TreeNode
                  node={budgetData}
                  expanded={expanded}
                  onToggle={handleToggle}
                  onSelect={handleSelect}
                  selectedId={selectedNode?.id || null}
                />
              </div>
            )}

            {/* Flow View */}
            {viewMode === 'flow' && (
              <FlowVisualization node={selectedNode || budgetData} path={selectedPath} />
            )}
          </div>

          {/* Right Panel - Details */}
          <div className="w-[380px] flex-shrink-0">
            {selectedNode ? (
              <DetailPanel node={selectedNode} />
            ) : (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <FolderTree className="w-12 h-12 mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
                <h3 className="font-medium text-gray-900 mb-2">Chon mot muc</h3>
                <p className="text-sm text-gray-500">
                  Click vao bat ky muc nao trong cay de xem chi tiet va thao tac
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
