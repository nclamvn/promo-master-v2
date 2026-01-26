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
// WAVE PATTERN SVG - Theme-aware
// ============================================================================
const WavePattern = ({ isDark }: { isDark: boolean }) => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none"
    preserveAspectRatio="xMidYMid slice"
    style={{ opacity: isDark ? 0.04 : 0.05 }}
  >
    <defs>
      <pattern id="wave-pattern" x="0" y="0" width="120" height="24" patternUnits="userSpaceOnUse">
        <path
          d="M0 12 Q 30 4, 60 12 T 120 12"
          fill="none"
          stroke={isDark ? 'white' : '#1E4A6E'}
          strokeWidth={isDark ? 1 : 1}
        />
        <path
          d="M0 20 Q 30 12, 60 20 T 120 20"
          fill="none"
          stroke={isDark ? 'white' : '#1E4A6E'}
          strokeWidth={isDark ? 0.5 : 0.5}
          opacity={isDark ? 0.5 : 0.3}
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
  const { sidebarOpen, toggleSidebar, theme } = useUIStore();

  // Theme-aware sidebar colors
  const isDark = theme === 'dark';
  const sidebarBgColor = isDark ? '#0A2744' : '#8DD8E8';

  // Color palette based on theme
  const colors = {
    text: isDark ? '#FFFFFF' : '#0A2744',
    textMuted: isDark ? 'rgba(255,255,255,0.8)' : '#1E3A5F',
    textSubtle: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(10,39,68,0.7)',
    textHover: isDark ? '#FFFFFF' : '#0A2744',
    border: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,39,68,0.12)',
    borderAccent: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(10,39,68,0.25)',
    bgHover: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(10,39,68,0.08)',
    bgActive: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(10,39,68,0.15)',
    bgSubtle: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(10,39,68,0.1)',
    bgGradient: isDark
      ? 'linear-gradient(90deg, rgba(255,255,255,0.06) 0%, transparent 100%)'
      : 'linear-gradient(90deg, rgba(10,39,68,0.08) 0%, transparent 100%)',
    overlayGradient: isDark
      ? 'linear-gradient(180deg, rgba(10,39,68,0.3) 0%, transparent 30%, rgba(10,39,68,0.4) 100%)'
      : 'linear-gradient(180deg, rgba(10,39,68,0.1) 0%, transparent 30%, rgba(10,39,68,0.15) 100%)',
  };

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
        <WavePattern isDark={isDark} />
        {/* Gradient overlay for depth */}
        <div
          className="absolute inset-0"
          style={{
            background: colors.overlayGradient
          }}
        />
      </div>

      {/* Header - Logo & Brand */}
      <div
        className="relative z-10 h-12 flex items-center justify-between px-3"
        style={{ borderBottom: `1px solid ${colors.border}` }}
      >
        {!sidebarCollapsed ? (
          <>
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: colors.bgSubtle }}
              >
                <Package className="h-4 w-4" style={{ color: colors.text }} strokeWidth={1.5} />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold tracking-tight" style={{ color: colors.text }}>
                  Promo Master
                </span>
                <span
                  className="text-[9px] uppercase tracking-wider"
                  style={{ color: colors.textSubtle }}
                >
                  Suntory PepsiCo
                </span>
              </div>
            </div>
            {/* Collapse button - Desktop only */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex h-6 w-6 shrink-0 items-center justify-center rounded transition-colors"
              style={{
                color: colors.textMuted,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.bgSubtle;
                e.currentTarget.style.color = colors.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = colors.textMuted;
              }}
            >
              <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
            </button>
            {/* Mobile close button */}
            {onMobileClose && (
              <button
                className="lg:hidden p-1.5 rounded"
                style={{ color: colors.textMuted }}
                onClick={onMobileClose}
              >
                <X className="h-4 w-4" strokeWidth={1.75} />
              </button>
            )}
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="flex h-7 w-7 items-center justify-center rounded mx-auto transition-opacity"
            style={{ backgroundColor: colors.bgSubtle }}
          >
            <ChevronRight className="h-4 w-4" style={{ color: colors.text }} strokeWidth={1.75} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex-1 overflow-y-auto py-2 px-2 scrollbar-hide">
        {navigation.map((group, idx) => (
          <div key={group.title} className={idx > 0 ? 'mt-3' : ''}>
            {/* Group Header */}
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  'flex w-full items-center justify-between px-2.5 py-1.5 mb-1 rounded',
                  'text-[11px] font-semibold uppercase tracking-wide',
                  'transition-all duration-150'
                )}
                style={{
                  color: colors.textMuted,
                  background: colors.bgGradient,
                  borderLeft: `2px solid ${colors.borderAccent}`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = colors.text;
                  e.currentTarget.style.borderLeftColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,39,68,0.5)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = colors.textMuted;
                  e.currentTarget.style.borderLeftColor = colors.borderAccent;
                }}
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
              <ul className="mt-0.5 space-y-0">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        'flex items-center rounded transition-all duration-100',
                        sidebarCollapsed
                          ? 'justify-center px-2 py-1.5'
                          : 'gap-2.5 px-2.5 py-1.5 text-sm font-medium'
                      )}
                      style={{
                        backgroundColor: isActive(item.href) ? colors.bgActive : 'transparent',
                        color: isActive(item.href) ? colors.text : colors.textMuted,
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive(item.href)) {
                          e.currentTarget.style.backgroundColor = colors.bgHover;
                          e.currentTarget.style.color = colors.text;
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive(item.href)) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = colors.textMuted;
                        }
                      }}
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <item.icon
                        className={cn(
                          'shrink-0',
                          sidebarCollapsed ? 'h-[18px] w-[18px]' : 'h-4 w-4'
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
                                backgroundColor: colors.bgActive,
                                color: colors.text,
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
          className="relative z-10 px-3 py-2"
          style={{ borderTop: `1px solid ${colors.border}` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4" strokeWidth={1.75} style={{ color: colors.textSubtle }} />
            <span
              className="text-[10px] font-semibold uppercase tracking-wider"
              style={{ color: colors.textSubtle }}
            >
              Trạng thái
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: colors.textMuted }}>API</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? '#4ade80' : '#15803D' }} />
                <span className="text-[11px] font-medium" style={{ color: isDark ? '#4ade80' : '#15803D' }}>Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Database</span>
              <div className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isDark ? '#4ade80' : '#15803D' }} />
                <span className="text-[11px] font-medium" style={{ color: isDark ? '#4ade80' : '#15803D' }}>Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium" style={{ color: colors.textMuted }}>Sync</span>
              <span className="text-[11px] font-mono font-medium" style={{ color: colors.textSubtle }}>2 phút trước</span>
            </div>
          </div>
        </div>
      )}

      {/* User Section */}
      <div
        className="relative z-10 flex items-center gap-2 px-3 py-2"
        style={{
          borderTop: `1px solid ${colors.border}`,
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start'
        }}
      >
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
          style={{ backgroundColor: colors.bgSubtle, color: colors.text }}
        >
          QN
        </div>
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate" style={{ color: colors.text }}>Quỳnh Nguyễn</div>
            <div className="text-[10px]" style={{ color: colors.textSubtle }}>Admin</div>
          </div>
        )}
      </div>

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
          backgroundColor: sidebarBgColor,
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
          backgroundColor: sidebarBgColor,
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
