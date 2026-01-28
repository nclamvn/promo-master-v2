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
  Calculator,
  CreditCard,
  FileText,
  Banknote,
  FileStack,
  GitBranch,
  AlertTriangle,
  Truck,
  ShoppingCart,
  Boxes,
  Link2,
  // New icons for Budget Management & TPO
  DollarSign,
  Activity,
  CheckSquare,
  Sparkles,
  // New icons for Priority 1 pages
  Gauge,
  Rocket,
  ArrowLeftRight,
  ReceiptText,
  // Analysis icons
  PieChart,
  LineChart,
  FlaskConical,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SidebarItem {
  id: string;
  title: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger';
  children?: Omit<SidebarItem, 'children'>[];
  permissions?: string[];
}

export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
  defaultExpanded?: boolean;
  permissions?: string[];
}

export interface SidebarConfig {
  brand: {
    name: string;
    subtitle: string;
    icon: LucideIcon;
  };
  sections: SidebarSection[];
  footer: {
    showStatus: boolean;
    statusItems?: Array<{
      label: string;
      status: 'online' | 'offline' | 'syncing';
      value?: string;
    }>;
  };
}

// ============================================================================
// SIDEBAR CONFIGURATION - BRD ALIGNED
// Follows business workflow: Budget → Planning → Promotion → Execution → Claims → Finance → Analysis
// ============================================================================

export const sidebarConfig: SidebarConfig = {
  brand: {
    name: 'Promo Master',
    subtitle: 'Suntory PepsiCo',
    icon: Package,
  },
  sections: [
    // 1. TỔNG QUAN (Overview) - Entry point
    {
      id: 'overview',
      title: 'TỔNG QUAN',
      defaultExpanded: true,
      items: [
        { id: 'dashboard', title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { id: 'calendar', title: 'Lịch', href: '/calendar', icon: Calendar },
      ],
    },

    // 2. NGÂN SÁCH (Budget) - BRD 3.1.3
    {
      id: 'budget',
      title: 'NGÂN SÁCH',
      defaultExpanded: true,
      items: [
        { id: 'budget-overview', title: 'Tổng quan NS', href: '/budget', icon: PiggyBank },
        { id: 'budget-definition', title: 'Định nghĩa', href: '/budget/definition', icon: DollarSign },
        { id: 'budget-allocation', title: 'Phân bổ', href: '/budget/allocation', icon: PiggyBank },
        { id: 'budget-monitoring', title: 'Giám sát', href: '/budget/monitoring', icon: Activity },
        { id: 'budget-approval', title: 'Phê duyệt', href: '/budget/approval', icon: CheckSquare, badge: 3, badgeVariant: 'warning' },
      ],
    },

    // 3. KẾ HOẠCH (Planning) - BRD 3.1.4
    {
      id: 'planning',
      title: 'KẾ HOẠCH',
      defaultExpanded: true,
      items: [
        { id: 'tpo', title: 'TPO (AI)', href: '/planning/tpo', icon: Sparkles },
        { id: 'targets', title: 'Mục tiêu', href: '/targets', icon: Target },
        { id: 'baselines', title: 'Baselines', href: '/baselines', icon: TrendingUp },
        { id: 'templates', title: 'Templates', href: '/planning/templates', icon: FileStack },
        { id: 'scenarios', title: 'Kịch bản', href: '/planning/scenarios', icon: GitBranch },
        { id: 'clashes', title: 'Xung đột', href: '/planning/clashes', icon: AlertTriangle },
      ],
    },

    // 4. KHUYẾN MÃI (Promotions) - BRD 3.1.2
    {
      id: 'promotions',
      title: 'KHUYẾN MÃI',
      defaultExpanded: true,
      items: [
        { id: 'promo-list', title: 'Danh sách KM', href: '/promotions', icon: Tag, badge: 67, badgeVariant: 'default' },
        { id: 'promo-efficiency', title: 'Hiệu quả', href: '/promotions/efficiency', icon: Gauge },
        { id: 'promo-deployment', title: 'Triển khai', href: '/promotions/deployment', icon: Rocket },
        { id: 'funds', title: 'Quỹ', href: '/funds', icon: Wallet },
      ],
    },

    // 5. THỰC THI (Execution) - BRD 3.2
    {
      id: 'execution',
      title: 'THỰC THI',
      defaultExpanded: false,
      items: [
        { id: 'psp-budget', title: 'PSP Monitor', href: '/execution/psp-budget', icon: Activity },
        { id: 'spending', title: 'Chi tiêu', href: '/execution/spending', icon: DollarSign },
        { id: 'reallocation', title: 'Điều chuyển', href: '/execution/reallocation', icon: ArrowLeftRight },
      ],
    },

    // 6. CLAIMS - BRD 3.3.1
    {
      id: 'claims',
      title: 'CLAIMS',
      defaultExpanded: false,
      items: [
        { id: 'claims-list', title: 'Danh sách', href: '/claims', icon: Receipt, badge: 12, badgeVariant: 'warning' },
        { id: 'claims-settlement', title: 'Quyết toán', href: '/claims/settlement', icon: ReceiptText },
        { id: 'claims-payment', title: 'Thanh toán', href: '/claims/payment', icon: Banknote },
      ],
    },

    // 7. TÀI CHÍNH (Finance) - BRD 3.3.2
    {
      id: 'finance',
      title: 'TÀI CHÍNH',
      defaultExpanded: false,
      items: [
        { id: 'accruals', title: 'Accruals', href: '/finance/accruals', icon: Calculator },
        { id: 'deductions', title: 'Deductions', href: '/finance/deductions', icon: CreditCard },
        { id: 'journals', title: 'GL Journals', href: '/finance/journals', icon: FileText },
        { id: 'cheques', title: 'Cheques', href: '/finance/cheques', icon: Banknote },
      ],
    },

    // 8. PHÂN TÍCH (Analysis) - BRD 3.4
    {
      id: 'analysis',
      title: 'PHÂN TÍCH',
      defaultExpanded: false,
      items: [
        { id: 'analytics', title: 'Tổng hợp', href: '/analytics', icon: BarChart3 },
        { id: 'roi-analysis', title: 'ROI', href: '/analysis/roi', icon: PieChart },
        { id: 'efficiency-analysis', title: 'Hiệu quả', href: '/analysis/efficiency', icon: LineChart },
        { id: 'what-if', title: 'What-if', href: '/analysis/what-if', icon: FlaskConical },
      ],
    },

    // 9. VẬN HÀNH (Operations)
    {
      id: 'operations',
      title: 'VẬN HÀNH',
      defaultExpanded: false,
      items: [
        { id: 'delivery', title: 'Giao hàng', href: '/operations/delivery', icon: Truck },
        { id: 'sell-tracking', title: 'Theo dõi bán', href: '/operations/sell-tracking', icon: ShoppingCart },
        { id: 'inventory', title: 'Tồn kho', href: '/operations/inventory', icon: Boxes },
      ],
    },

    // 10. HỆ THỐNG (System) - Master data & Settings
    {
      id: 'system',
      title: 'HỆ THỐNG',
      defaultExpanded: false,
      items: [
        { id: 'customers', title: 'Khách hàng', href: '/customers', icon: Users },
        { id: 'products', title: 'Sản phẩm', href: '/products', icon: Package },
        { id: 'integration', title: 'Tích hợp', href: '/integration', icon: Link2 },
        { id: 'settings', title: 'Cài đặt', href: '/settings', icon: Settings },
      ],
    },
  ],
  footer: {
    showStatus: true,
    statusItems: [
      { label: 'API', status: 'online' },
      { label: 'Database', status: 'online' },
      { label: 'Sync', status: 'syncing', value: '2 phút trước' },
    ],
  },
};

// ============================================================================
// THEME COLORS
// ============================================================================

export interface SidebarColors {
  text: string;
  textMuted: string;
  textSubtle: string;
  textHover: string;
  border: string;
  borderAccent: string;
  bgHover: string;
  bgActive: string;
  bgSubtle: string;
  bgGradient: string;
  overlayGradient: string;
  statusOnline: string;
  statusOffline: string;
  statusSyncing: string;
}

export const getSidebarColors = (isDark: boolean): SidebarColors => ({
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
  statusOnline: isDark ? '#4ade80' : '#15803D',
  statusOffline: isDark ? '#f87171' : '#dc2626',
  statusSyncing: isDark ? '#fbbf24' : '#d97706',
});

export const getSidebarBgColor = (isDark: boolean): string =>
  isDark ? '#0A2744' : '#8DD8E8';
