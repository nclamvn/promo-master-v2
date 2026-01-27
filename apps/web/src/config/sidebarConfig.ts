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
  Server,
  Building2,
  Webhook,
  Shield,
  Brain,
  Lightbulb,
  ThumbsUp,
  Mic,
  PieChart,
  FileBarChart,
  Download,
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
// SIDEBAR CONFIGURATION
// ============================================================================

export const sidebarConfig: SidebarConfig = {
  brand: {
    name: 'Promo Master',
    subtitle: 'Suntory PepsiCo',
    icon: Package,
  },
  sections: [
    {
      id: 'overview',
      title: 'TỔNG QUAN',
      defaultExpanded: true,
      items: [
        { id: 'dashboard', title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { id: 'analytics', title: 'Phân tích', href: '/analytics', icon: BarChart3 },
        { id: 'calendar', title: 'Lịch', href: '/calendar', icon: Calendar },
      ],
    },
    {
      id: 'management',
      title: 'QUẢN LÝ',
      defaultExpanded: true,
      items: [
        { id: 'promotions', title: 'Khuyến mãi', href: '/promotions', icon: Tag, badge: 67, badgeVariant: 'default' },
        { id: 'promo-efficiency', title: 'Hiệu quả KM', href: '/promotions/efficiency', icon: Gauge },
        { id: 'promo-deployment', title: 'Triển khai', href: '/promotions/deployment', icon: Rocket },
        { id: 'claims', title: 'Claims', href: '/claims', icon: Receipt, badge: 12, badgeVariant: 'warning' },
        { id: 'claims-settlement', title: 'Quyết toán', href: '/claims/settlement', icon: ReceiptText },
        { id: 'funds', title: 'Quỹ', href: '/funds', icon: Wallet },
      ],
    },
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
    {
      id: 'finance',
      title: 'TÀI CHÍNH',
      defaultExpanded: true,
      items: [
        { id: 'accruals', title: 'Accruals', href: '/finance/accruals', icon: Calculator },
        { id: 'deductions', title: 'Deductions', href: '/finance/deductions', icon: CreditCard },
        { id: 'journals', title: 'GL Journals', href: '/finance/journals', icon: FileText },
        { id: 'cheques', title: 'Cheques', href: '/finance/cheques', icon: Banknote },
      ],
    },
    {
      id: 'budget-mgmt',
      title: 'NGÂN SÁCH',
      defaultExpanded: true,
      items: [
        { id: 'budget-definition', title: 'Định nghĩa', href: '/budget/definition', icon: DollarSign },
        { id: 'budget-allocation', title: 'Phân bổ', href: '/budget/allocation', icon: PiggyBank },
        { id: 'budget-monitoring', title: 'Giám sát', href: '/budget/monitoring', icon: Activity },
        { id: 'budget-approval', title: 'Phê duyệt', href: '/budget/approval', icon: CheckSquare, badge: 3, badgeVariant: 'warning' },
      ],
    },
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
        { id: 'clashes', title: 'Phát hiện xung đột', href: '/planning/clashes', icon: AlertTriangle },
      ],
    },
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
    {
      id: 'data',
      title: 'DỮ LIỆU',
      defaultExpanded: false,
      items: [
        { id: 'customers', title: 'Khách hàng', href: '/customers', icon: Users },
        { id: 'products', title: 'Sản phẩm', href: '/products', icon: Package },
      ],
    },
    {
      id: 'integration',
      title: 'TÍCH HỢP',
      defaultExpanded: false,
      items: [
        { id: 'integration-overview', title: 'Tổng quan', href: '/integration', icon: Link2 },
        { id: 'erp', title: 'ERP Sync', href: '/integration/erp', icon: Server },
        { id: 'dms', title: 'DMS Sync', href: '/integration/dms', icon: Building2 },
        { id: 'webhooks', title: 'Webhooks', href: '/integration/webhooks', icon: Webhook },
        { id: 'security', title: 'Bảo mật', href: '/integration/security', icon: Shield },
      ],
    },
    {
      id: 'ai-bi',
      title: 'AI & BI',
      defaultExpanded: false,
      items: [
        { id: 'ai-dashboard', title: 'AI Dashboard', href: '/ai', icon: Brain },
        { id: 'insights', title: 'Insights', href: '/ai/insights', icon: Lightbulb },
        { id: 'recommendations', title: 'Đề xuất', href: '/ai/recommendations', icon: ThumbsUp },
        { id: 'voice', title: 'Voice Command', href: '/voice', icon: Mic },
        { id: 'bi-dashboard', title: 'BI Dashboard', href: '/bi', icon: PieChart },
        { id: 'reports', title: 'Báo cáo', href: '/bi/reports', icon: FileBarChart },
        { id: 'export', title: 'Export', href: '/bi/export', icon: Download },
      ],
    },
    {
      id: 'system',
      title: 'HỆ THỐNG',
      defaultExpanded: false,
      items: [
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
