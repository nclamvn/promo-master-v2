/**
 * Target Allocation Page
 * Hierarchical target allocation with tree view and progress tracking
 */

import { useState } from 'react';
import {
  ChevronRight, ChevronDown, Target, MapPin, Building2, Store,
  TrendingUp, TrendingDown, Search, Filter, Plus,
  Check, AlertCircle, Eye, Edit2, Layers,
  BarChart3, Calendar
} from 'lucide-react';

// Types
interface TargetNode {
  id: string;
  name: string;
  target: number;
  achieved: number;
  type: 'root' | 'region' | 'province' | 'district' | 'dealer';
  metric: string;
  children?: TargetNode[];
}

interface PathItem {
  id: string;
  name: string;
  type: string;
}

// Mock Data - Target Hierarchy
const targetData: TargetNode = {
  id: 'TGT-2026-Q1',
  name: 'Muc tieu Q1 2026',
  target: 150000,
  achieved: 42500,
  type: 'root',
  metric: 'cases',
  children: [
    {
      id: 'TGT-NORTH',
      name: 'Mien Bac',
      target: 55000,
      achieved: 16500,
      type: 'region',
      metric: 'cases',
      children: [
        {
          id: 'TGT-HN',
          name: 'Ha Noi',
          target: 25000,
          achieved: 8200,
          type: 'province',
          metric: 'cases',
          children: [
            {
              id: 'TGT-HN-HK',
              name: 'Quan Hoan Kiem',
              target: 5000,
              achieved: 1850,
              type: 'district',
              metric: 'cases',
              children: [
                { id: 'TGT-DLR-001', name: 'Dai ly Vinmart Trang Tien', target: 1000, achieved: 420, type: 'dealer', metric: 'cases' },
                { id: 'TGT-DLR-002', name: 'Dai ly BigC Ho Guom', target: 1500, achieved: 580, type: 'dealer', metric: 'cases' },
                { id: 'TGT-DLR-003', name: 'Dai ly CoopMart Ly Thai To', target: 1200, achieved: 450, type: 'dealer', metric: 'cases' },
              ]
            },
            { id: 'TGT-HN-BD', name: 'Quan Ba Dinh', target: 6000, achieved: 2100, type: 'district', metric: 'cases' },
            { id: 'TGT-HN-CG', name: 'Quan Cau Giay', target: 7500, achieved: 2400, type: 'district', metric: 'cases' },
            { id: 'TGT-HN-DD', name: 'Quan Dong Da', target: 4500, achieved: 1450, type: 'district', metric: 'cases' },
          ]
        },
        { id: 'TGT-HP', name: 'Hai Phong', target: 15000, achieved: 4200, type: 'province', metric: 'cases' },
        { id: 'TGT-QN', name: 'Quang Ninh', target: 10000, achieved: 2800, type: 'province', metric: 'cases' },
      ]
    },
    {
      id: 'TGT-CENTRAL',
      name: 'Mien Trung',
      target: 35000,
      achieved: 9500,
      type: 'region',
      metric: 'cases',
      children: [
        { id: 'TGT-DN', name: 'Da Nang', target: 15000, achieved: 4200, type: 'province', metric: 'cases' },
        { id: 'TGT-HUE', name: 'Thua Thien Hue', target: 10000, achieved: 2800, type: 'province', metric: 'cases' },
        { id: 'TGT-QNA', name: 'Quang Nam', target: 8000, achieved: 2100, type: 'province', metric: 'cases' },
      ]
    },
    {
      id: 'TGT-SOUTH',
      name: 'Mien Nam',
      target: 60000,
      achieved: 16500,
      type: 'region',
      metric: 'cases',
      children: [
        { id: 'TGT-HCM', name: 'TP. Ho Chi Minh', target: 35000, achieved: 10200, type: 'province', metric: 'cases' },
        { id: 'TGT-BD', name: 'Binh Duong', target: 12000, achieved: 3200, type: 'province', metric: 'cases' },
        { id: 'TGT-DNa', name: 'Dong Nai', target: 10000, achieved: 2500, type: 'province', metric: 'cases' },
      ]
    },
  ]
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
  root: { icon: Target, label: 'Muc tieu goc', color: '#DC2626', bg: '#FEF2F2' },
  region: { icon: MapPin, label: 'Vung/Mien', color: '#7C3AED', bg: '#F5F3FF' },
  province: { icon: Building2, label: 'Tinh/Thanh', color: '#0891B2', bg: '#ECFEFF' },
  district: { icon: Layers, label: 'Quan/Huyen', color: '#059669', bg: '#ECFDF5' },
  dealer: { icon: Store, label: 'Dai ly', color: '#D97706', bg: '#FFFBEB' },
};

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
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-100"
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
        <span className="text-xs font-semibold text-gray-700">{progress}%</span>
      </div>
    </div>
  );
};

// Target Tree Node Component
interface TargetTreeNodeProps {
  node: TargetNode;
  level?: number;
  expanded: Record<string, boolean>;
  onToggle: (id: string) => void;
  onSelect: (node: TargetNode, path: PathItem[]) => void;
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
  const currentPath: PathItem[] = [...path, { id: node.id, name: node.name, type: node.type }];

  return (
    <div>
      <div
        className={`group flex items-center gap-2 py-2.5 px-3 rounded-lg cursor-pointer transition-all duration-100 ${
          isSelected
            ? 'bg-red-50 border border-red-200'
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
          <div className="text-right w-24">
            <div className="text-sm font-semibold text-gray-900 tabular-nums">
              {formatNumber(node.target)}
            </div>
            <div className="text-xs text-gray-400">Muc tieu</div>
          </div>

          <div className="text-right w-24">
            <div className="text-sm font-semibold tabular-nums" style={{ color: getProgressColor(progress) }}>
              {formatNumber(node.achieved)}
            </div>
            <div className="text-xs text-gray-400">Dat duoc</div>
          </div>

          <ProgressRing progress={progress} color={getProgressColor(progress)} />

          <div className="w-24">
            {progress >= 100 ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-green-50 text-green-700 rounded border border-green-200">
                <Check className="w-3 h-3" strokeWidth={2} />
                Dat
              </span>
            ) : progress >= 75 ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded border border-blue-200">
                <TrendingUp className="w-3 h-3" strokeWidth={2} />
                Tot
              </span>
            ) : progress >= 50 ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded border border-amber-200">
                <AlertCircle className="w-3 h-3" strokeWidth={2} />
                Cham
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-red-50 text-red-700 rounded border border-red-200">
                <TrendingDown className="w-3 h-3" strokeWidth={2} />
                Rui ro
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200">
              <Eye className="w-4 h-4 text-gray-500" strokeWidth={1.75} />
            </button>
            <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-200">
              <Edit2 className="w-4 h-4 text-gray-500" strokeWidth={1.75} />
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

// Comparison Card Component
interface ComparisonCardProps {
  budgetNode: { total: number; spent: number };
  targetNode: TargetNode;
}

const ComparisonCard = ({ budgetNode, targetNode }: ComparisonCardProps) => {
  const budgetUtil = budgetNode ? Math.round((budgetNode.spent / budgetNode.total) * 100) : 0;
  const targetProgress = targetNode ? Math.round((targetNode.achieved / targetNode.target) * 100) : 0;
  const efficiency = budgetUtil > 0 ? Math.round((targetProgress / budgetUtil) * 100) : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-gray-400" strokeWidth={1.75} />
        So sanh Ngan sach vs Muc tieu
      </h3>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="text-sm font-medium text-blue-600 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            Ngan sach
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Da chi tieu</span>
              <span className="font-medium text-gray-900">{budgetUtil}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${budgetUtil}%` }} />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-sm font-medium text-green-600 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            Muc tieu
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Dat duoc</span>
              <span className="font-medium text-gray-900">{targetProgress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full" style={{ width: `${targetProgress}%` }} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Hieu suat chi tieu</span>
          <span className={`text-lg font-semibold ${
            efficiency >= 100 ? 'text-green-600' : efficiency >= 80 ? 'text-blue-600' : 'text-amber-600'
          }`}>
            {efficiency}%
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          {efficiency >= 100
            ? 'Tot: Chi tieu hieu qua, dat muc tieu cao hon ty le ngan sach'
            : efficiency >= 80
            ? 'On: Muc tieu tuong xung voi chi tieu'
            : 'Can cai thien: Chi tieu nhieu nhung muc tieu chua dat tuong xung'
          }
        </p>
      </div>
    </div>
  );
};

// Main Component
export default function TargetAllocation() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ 'TGT-2026-Q1': true, 'TGT-NORTH': true, 'TGT-HN': true });
  const [selectedNode, setSelectedNode] = useState<TargetNode | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggle = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSelect = (node: TargetNode, _path: PathItem[]) => {
    setSelectedNode(node);
  };

  const progress = getProgress(targetData.achieved, targetData.target);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Phan bo Muc tieu</h1>
              <p className="text-sm text-gray-500">Q1 2026 - Cau truc phan cap muc tieu ban hang theo vung mien</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                <Plus className="w-4 h-4" strokeWidth={2} />
                Tao muc tieu
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-red-600" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Tong muc tieu</div>
                <div className="text-xl font-semibold text-gray-900">{formatNumber(targetData.target)} cases</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" strokeWidth={2} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Da dat duoc</div>
                <div className="text-xl font-semibold text-green-600">{formatNumber(targetData.achieved)} cases</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Tien do</div>
                <div className="text-xl font-semibold text-blue-600">{progress}%</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-amber-600" strokeWidth={1.75} />
              </div>
              <div>
                <div className="text-sm text-gray-500">Con lai</div>
                <div className="text-xl font-semibold text-gray-900">{formatNumber(targetData.target - targetData.achieved)} cases</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 pb-6">
        <div className="flex gap-6">
          {/* Tree View */}
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
                    className="w-full h-9 pl-9 pr-3 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>

                <button className="flex items-center gap-2 h-9 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                  <Filter className="w-4 h-4" strokeWidth={1.75} />
                  Loc
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4">
              {/* Legend */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4 text-xs">
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

                {/* Status Legend */}
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-gray-400">Trang thai:</span>
                  <span className="flex items-center gap-1 text-green-600"><Check className="w-3 h-3" /> Dat</span>
                  <span className="flex items-center gap-1 text-blue-600"><TrendingUp className="w-3 h-3" /> Tot</span>
                  <span className="flex items-center gap-1 text-amber-600"><AlertCircle className="w-3 h-3" /> Cham</span>
                  <span className="flex items-center gap-1 text-red-600"><TrendingDown className="w-3 h-3" /> Rui ro</span>
                </div>
              </div>

              <TargetTreeNode
                node={targetData}
                expanded={expanded}
                onToggle={handleToggle}
                onSelect={handleSelect}
                selectedId={selectedNode?.id || null}
              />
            </div>
          </div>

          {/* Right Panel */}
          <div className="w-[380px] flex-shrink-0 space-y-4">
            {selectedNode && (
              <>
                {/* Selected Node Info */}
                <div className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start gap-4">
                    <ProgressRing
                      progress={getProgress(selectedNode.achieved, selectedNode.target)}
                      size={56}
                      strokeWidth={5}
                      color={getProgressColor(getProgress(selectedNode.achieved, selectedNode.target))}
                    />
                    <div>
                      <h3 className="font-semibold text-gray-900">{selectedNode.name}</h3>
                      <p className="text-sm text-gray-500 font-mono">{selectedNode.id}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">Muc tieu</div>
                      <div className="text-lg font-semibold text-gray-900">{formatNumber(selectedNode.target)}</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-xs text-gray-500">Dat duoc</div>
                      <div className="text-lg font-semibold text-green-600">{formatNumber(selectedNode.achieved)}</div>
                    </div>
                  </div>
                </div>

                {/* Comparison Card */}
                <ComparisonCard
                  budgetNode={{ total: 500000000000, spent: 120000000000 }}
                  targetNode={selectedNode}
                />
              </>
            )}

            {!selectedNode && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Target className="w-12 h-12 mx-auto mb-4 text-gray-300" strokeWidth={1.5} />
                <h3 className="font-medium text-gray-900 mb-2">Chon mot muc tieu</h3>
                <p className="text-sm text-gray-500">
                  Click vao bat ky muc nao de xem chi tiet tien do
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
