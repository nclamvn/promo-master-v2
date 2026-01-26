import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Tag,
  Receipt,
  Wallet,
  Users,
  Package,
  PiggyBank,
  Target,
  TrendingUp,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Activity,
  X,
  // Finance icons
  Calculator,
  CreditCard,
  FileText,
  Banknote,
  // Planning icons
  FileStack,
  GitBranch,
  AlertTriangle,
  // Operations icons
  Truck,
  ShoppingCart,
  Boxes,
  // Integration icons
  Link2,
  Server,
  Building2,
  Webhook,
  Shield,
  // AI & BI icons
  Brain,
  Lightbulb,
  ThumbsUp,
  Mic,
  PieChart,
  FileBarChart,
  Download,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/stores/uiStore';

// ============================================================================
// WAVE PATTERN SVG - Subtle, Professional (opacity 4%)
// ============================================================================
const WavePattern = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    preserveAspectRatio="xMidYMid slice"
    style={{ opacity: 0.04 }}
  >
    <defs>
      <pattern id="wave-pattern" x="0" y="0" width="120" height="24" patternUnits="userSpaceOnUse">
        <path
          d="M0 12 Q 30 4, 60 12 T 120 12"
          fill="none"
          stroke="white"
          strokeWidth="1"
        />
        <path
          d="M0 20 Q 30 12, 60 20 T 120 20"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#wave-pattern)" />
  </svg>
);

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: string | number;
  children?: Omit<NavItem, 'children'>[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: 'TỔNG QUAN',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Phân tích', href: '/analytics', icon: BarChart3 },
      { title: 'Lịch', href: '/calendar', icon: Calendar },
    ],
  },
  {
    title: 'QUẢN LÝ',
    items: [
      { title: 'Khuyến mãi', href: '/promotions', icon: Tag, badge: 67 },
      { title: 'Claims', href: '/claims', icon: Receipt, badge: 12 },
      { title: 'Quỹ', href: '/funds', icon: Wallet },
    ],
  },
  {
    title: 'TÀI CHÍNH',
    items: [
      { title: 'Accruals', href: '/finance/accruals', icon: Calculator },
      { title: 'Deductions', href: '/finance/deductions', icon: CreditCard },
      { title: 'GL Journals', href: '/finance/journals', icon: FileText },
      { title: 'Cheques', href: '/finance/cheques', icon: Banknote },
    ],
  },
  {
    title: 'KẾ HOẠCH',
    items: [
      { title: 'Ngân sách', href: '/budgets', icon: PiggyBank },
      { title: 'Mục tiêu', href: '/targets', icon: Target },
      { title: 'Baselines', href: '/baselines', icon: TrendingUp },
      { title: 'Templates', href: '/planning/templates', icon: FileStack },
      { title: 'Kịch bản', href: '/planning/scenarios', icon: GitBranch },
      { title: 'Phát hiện xung đột', href: '/planning/clashes', icon: AlertTriangle },
    ],
  },
  {
    title: 'VẬN HÀNH',
    items: [
      { title: 'Giao hàng', href: '/operations/delivery', icon: Truck },
      { title: 'Theo dõi bán', href: '/operations/sell-tracking', icon: ShoppingCart },
      { title: 'Tồn kho', href: '/operations/inventory', icon: Boxes },
    ],
  },
  {
    title: 'DỮ LIỆU',
    items: [
      { title: 'Khách hàng', href: '/customers', icon: Users },
      { title: 'Sản phẩm', href: '/products', icon: Package },
    ],
  },
  {
    title: 'TÍCH HỢP',
    items: [
      { title: 'Tổng quan', href: '/integration', icon: Link2 },
      { title: 'ERP Sync', href: '/integration/erp', icon: Server },
      { title: 'DMS Sync', href: '/integration/dms', icon: Building2 },
      { title: 'Webhooks', href: '/integration/webhooks', icon: Webhook },
      { title: 'Bảo mật', href: '/integration/security', icon: Shield },
    ],
  },
  {
    title: 'AI & BI',
    items: [
      { title: 'AI Dashboard', href: '/ai', icon: Brain },
      { title: 'Insights', href: '/ai/insights', icon: Lightbulb },
      { title: 'Đề xuất', href: '/ai/recommendations', icon: ThumbsUp },
      { title: 'Voice Command', href: '/voice', icon: Mic },
      { title: 'BI Dashboard', href: '/bi', icon: PieChart },
      { title: 'Báo cáo', href: '/bi/reports', icon: FileBarChart },
      { title: 'Export', href: '/bi/export', icon: Download },
    ],
  },
  {
    title: 'HỆ THỐNG',
    items: [
      { title: 'Cài đặt', href: '/settings', icon: Settings },
    ],
  },
];

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen = false, onMobileClose }: SidebarProps) {
  const location = useLocation();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['TỔNG QUAN', 'QUẢN LÝ', 'TÀI CHÍNH', 'KẾ HOẠCH']);

  const sidebarCollapsed = !sidebarOpen;

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const sidebarContent = (
    <>
      {/* Wave Pattern Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <WavePattern />
        {/* Gradient overlay for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(0,45,77,0.3) 0%, transparent 30%, rgba(0,29,61,0.5) 100%)'
          }}
        />
      </div>

      {/* Header - Logo & Brand */}
      <div
        className="relative z-10 h-14 flex items-center justify-between px-4"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        {!sidebarCollapsed ? (
          <>
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
              >
                <Package className="h-5 w-5 text-white" strokeWidth={1.5} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-white tracking-tight">
                  Promo Master
                </span>
                <span
                  className="text-[10px] uppercase tracking-wider"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                >
                  Suntory PepsiCo
                </span>
              </div>
            </div>
            {/* Collapse button - Desktop only */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex h-7 w-7 shrink-0 items-center justify-center rounded transition-colors"
              style={{
                color: 'rgba(255,255,255,0.5)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'rgba(255,255,255,0.5)';
              }}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            {/* Mobile close button */}
            {onMobileClose && (
              <button
                className="lg:hidden p-1.5 rounded"
                style={{ color: 'rgba(255,255,255,0.5)' }}
                onClick={onMobileClose}
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="flex h-8 w-8 items-center justify-center rounded mx-auto transition-opacity"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <ChevronRight className="h-4 w-4 text-white" strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 overflow-y-auto py-3 px-3 scrollbar-hide">
        {navigation.map((group, idx) => (
          <div key={group.title} className={idx > 0 ? 'mt-5' : ''}>
            {/* Group Header */}
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-1.5',
                  'text-[10px] font-semibold uppercase tracking-wider',
                  'transition-colors'
                )}
                style={{ color: 'rgba(255,255,255,0.35)' }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
              >
                <span>{group.title}</span>
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform duration-150',
                    expandedGroups.includes(group.title) ? 'rotate-0' : '-rotate-90'
                  )}
                  strokeWidth={1.75}
                />
              </button>
            )}

            {/* Group Items */}
            {(expandedGroups.includes(group.title) || sidebarCollapsed) && (
              <ul className="mt-1 space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        'flex items-center rounded transition-all duration-100',
                        sidebarCollapsed
                          ? 'justify-center px-2 py-2.5'
                          : 'gap-3 px-3 py-2.5 text-sm font-medium'
                      )}
                      style={{
                        backgroundColor: isActive(item.href) ? 'rgba(255,255,255,0.12)' : 'transparent',
                        color: isActive(item.href) ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item.href)) {
                          e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item.href)) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                        }
                      }}
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <item.icon
                        className={cn(
                          'shrink-0',
                          sidebarCollapsed ? 'h-5 w-5' : 'h-[18px] w-[18px]'
                        )}
                        strokeWidth={1.75}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge && (
                            <span
                              className="px-1.5 py-0.5 text-[10px] font-semibold rounded"
                              style={{
                                backgroundColor: 'rgba(255,255,255,0.15)',
                              }}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </nav>

      {/* System Status - Bottom */}
      {!sidebarCollapsed && (
        <div
          className="relative z-10 p-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4" strokeWidth={1.75} style={{ color: 'rgba(255,255,255,0.4)' }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              Trạng thái
            </span>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>API</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-green-400">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Database</span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-green-400">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>Sync</span>
              <span className="text-xs font-mono font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>2 phút trước</span>
            </div>
          </div>
        </div>
      )}

      {/* User Section */}
      <div
        className="relative z-10 flex items-center gap-3 px-4 py-3"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.08)',
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
        }}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white"
          style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
        >
          QN
        </div>
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">Quỳnh Nguyễn</div>
            <div className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Admin</div>
          </div>
        )}
      </div>

      {/* Collapse Toggle Button - Outside sidebar */}
      <button
        onClick={toggleSidebar}
        className="absolute top-16 -right-3 w-6 h-6 bg-white rounded-full border border-gray-200 hidden lg:flex items-center justify-center hover:bg-gray-50 z-50"
        style={{
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          transition: 'background 0.1s ease'
        }}
      >
        <ChevronRight
          className="w-3.5 h-3.5 text-gray-500"
          strokeWidth={2}
          style={{
            transform: sidebarCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
            transition: 'transform 0.2s ease'
          }}
        />
      </button>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen hidden lg:flex flex-col',
          'transition-all duration-200 ease-in-out'
        )}
        style={{
          width: sidebarCollapsed ? 64 : 256,
          backgroundColor: '#001D3D',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 flex flex-col lg:hidden',
          'transition-transform duration-300'
        )}
        style={{
          backgroundColor: '#001D3D',
          transform: isMobileOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}
    </>
  );
}
