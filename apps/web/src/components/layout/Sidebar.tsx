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
  Zap,
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

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  children?: Omit<NavItem, 'children'>[];
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navigation: NavGroup[] = [
  {
    title: 'COMMAND',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Analytics', href: '/analytics', icon: BarChart3 },
      { title: 'Calendar', href: '/calendar', icon: Calendar },
    ],
  },
  {
    title: 'TRADE PROMO',
    items: [
      { title: 'Promotions', href: '/promotions', icon: Tag, badge: 24 },
      { title: 'Claims', href: '/claims', icon: Receipt, badge: 12 },
      { title: 'Funds', href: '/funds', icon: Wallet },
    ],
  },
  {
    title: 'FINANCE',
    items: [
      { title: 'Accruals', href: '/finance/accruals', icon: Calculator },
      { title: 'Deductions', href: '/finance/deductions', icon: CreditCard },
      { title: 'GL Journals', href: '/finance/journals', icon: FileText },
      { title: 'Cheques', href: '/finance/cheques', icon: Banknote },
    ],
  },
  {
    title: 'PLANNING',
    items: [
      { title: 'Budgets', href: '/budgets', icon: PiggyBank },
      { title: 'Targets', href: '/targets', icon: Target },
      { title: 'Baselines', href: '/baselines', icon: TrendingUp },
      { title: 'Templates', href: '/planning/templates', icon: FileStack },
      { title: 'Scenarios', href: '/planning/scenarios', icon: GitBranch },
      { title: 'Clash Detection', href: '/planning/clashes', icon: AlertTriangle },
    ],
  },
  {
    title: 'OPERATIONS',
    items: [
      { title: 'Delivery', href: '/operations/delivery', icon: Truck },
      { title: 'Sell Tracking', href: '/operations/sell-tracking', icon: ShoppingCart },
      { title: 'Inventory', href: '/operations/inventory', icon: Boxes },
    ],
  },
  {
    title: 'MASTER DATA',
    items: [
      { title: 'Customers', href: '/customers', icon: Users },
      { title: 'Products', href: '/products', icon: Package },
    ],
  },
  {
    title: 'INTEGRATION',
    items: [
      { title: 'Dashboard', href: '/integration', icon: Link2 },
      { title: 'ERP Sync', href: '/integration/erp', icon: Server },
      { title: 'DMS Sync', href: '/integration/dms', icon: Building2 },
      { title: 'Webhooks', href: '/integration/webhooks', icon: Webhook },
      { title: 'Security', href: '/integration/security', icon: Shield },
    ],
  },
  {
    title: 'AI & INTELLIGENCE',
    items: [
      { title: 'AI Dashboard', href: '/ai', icon: Brain },
      { title: 'Insights', href: '/ai/insights', icon: Lightbulb },
      { title: 'Recommendations', href: '/ai/recommendations', icon: ThumbsUp },
      { title: 'Voice Command', href: '/voice', icon: Mic },
    ],
  },
  {
    title: 'BI & REPORTS',
    items: [
      { title: 'BI Dashboard', href: '/bi', icon: PieChart },
      { title: 'Report Builder', href: '/bi/reports', icon: FileBarChart },
      { title: 'Analytics', href: '/bi/analytics', icon: BarChart3 },
      { title: 'Export Center', href: '/bi/export', icon: Download },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { title: 'Settings', href: '/settings', icon: Settings },
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
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['COMMAND', 'TRADE PROMO', 'FINANCE', 'PLANNING']);

  // sidebarOpen = true means expanded, false means collapsed
  const sidebarCollapsed = !sidebarOpen;

  const toggleGroup = (title: string) => {
    setExpandedGroups((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const sidebarContent = (
    <>
      {/* Header - Logo & Brand with Collapse Toggle */}
      <div className="flex h-12 items-center justify-between px-3 border-b border-sidebar-border">
        {!sidebarCollapsed && (
          <>
            <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-primary">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-bold text-foreground tracking-tight truncate">
                  PROMO MASTER
                </span>
                <span className="text-[10px] text-foreground-subtle uppercase tracking-wide truncate">
                  Trade Operations
                </span>
              </div>
            </div>
            {/* Collapse button - Desktop only */}
            <button
              onClick={toggleSidebar}
              className="hidden lg:flex h-6 w-6 shrink-0 items-center justify-center rounded hover:bg-sidebar-accent text-foreground-subtle hover:text-foreground transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {/* Mobile close button */}
            {onMobileClose && (
              <button
                className="lg:hidden p-1.5 hover:bg-surface-hover rounded"
                onClick={onMobileClose}
              >
                <X className="h-4 w-4 text-foreground-muted" />
              </button>
            )}
          </>
        )}
        {sidebarCollapsed && (
          <button
            onClick={toggleSidebar}
            className="flex h-7 w-7 items-center justify-center rounded bg-primary mx-auto hover:opacity-90 transition-opacity"
          >
            <ChevronRight className="h-4 w-4 text-primary-foreground" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-2 scrollbar-hide">
        {navigation.map((group) => (
          <div key={group.title} className="mb-2">
            {/* Group Header */}
            {!sidebarCollapsed && (
              <button
                onClick={() => toggleGroup(group.title)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-1',
                  'text-[10px] font-semibold text-foreground-subtle uppercase tracking-wider',
                  'hover:text-foreground-muted transition-colors'
                )}
              >
                <span>{group.title}</span>
                <ChevronDown
                  className={cn(
                    'h-3 w-3 transition-transform',
                    expandedGroups.includes(group.title) ? 'rotate-0' : '-rotate-90'
                  )}
                />
              </button>
            )}

            {/* Group Items */}
            {(expandedGroups.includes(group.title) || sidebarCollapsed) && (
              <ul className="mt-0.5 space-y-px px-2">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      to={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        'flex items-center rounded transition-all duration-100',
                        sidebarCollapsed
                          ? 'justify-center px-2 py-2.5'
                          : 'gap-3 px-2.5 py-2 text-sm',
                        isActive(item.href)
                          ? [
                              'bg-primary-muted text-primary',
                              'border-l-2 border-primary',
                              'shadow-sm',
                            ].join(' ')
                          : [
                              'text-sidebar-foreground',
                              'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                            ].join(' ')
                      )}
                      title={sidebarCollapsed ? item.title : undefined}
                    >
                      <item.icon
                        className={cn(
                          'shrink-0',
                          sidebarCollapsed ? 'h-5 w-5' : 'h-4 w-4',
                          isActive(item.href) ? 'text-primary' : 'text-foreground-subtle'
                        )}
                      />
                      {!sidebarCollapsed && (
                        <>
                          <span className="flex-1 truncate font-semibold">{item.title}</span>
                          {item.badge && (
                            <span
                              className={cn(
                                'flex h-5 min-w-[20px] items-center justify-center rounded',
                                'px-1.5 text-xs font-semibold',
                                isActive(item.href)
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-surface-hover text-foreground-muted'
                              )}
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

      {/* System Status */}
      {!sidebarCollapsed && (
        <div className="border-t border-sidebar-border p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-4 w-4 text-foreground-subtle" />
            <span className="text-xs font-semibold text-foreground-subtle uppercase tracking-wide">
              System Status
            </span>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted font-medium">API</span>
              <div className="flex items-center gap-1.5">
                <div className="status-dot status-dot-success" />
                <span className="text-xs text-success font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted font-medium">Database</span>
              <div className="flex items-center gap-1.5">
                <div className="status-dot status-dot-success" />
                <span className="text-xs text-success font-medium">Online</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground-muted font-medium">Last Sync</span>
              <span className="text-xs text-foreground-muted font-mono font-medium">2m ago</span>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen hidden lg:flex flex-col',
          'bg-sidebar-background border-r border-sidebar-border',
          'transition-all duration-200 ease-in-out',
          sidebarCollapsed ? 'w-14' : 'w-56'
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-56 flex flex-col lg:hidden',
          'bg-sidebar-background border-r border-sidebar-border',
          'transition-transform duration-300',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
