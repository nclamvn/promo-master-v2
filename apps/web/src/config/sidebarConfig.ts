import {
  LayoutDashboard,
  FileText,
  GitBranch,
  Activity,
  Wallet,
  TrendingUp,
  Target,
  Sparkles,
  Calendar,
  Tag,
  Settings,
  FileStack,
  Rocket,
  Link2,
  AlertTriangle,
  ShoppingCart,
  DollarSign,
  Truck,
  Package,
  ClipboardList,
  Receipt,
  CreditCard,
  BookOpen,
  BarChart3,
  Lightbulb,
  PieChart,
  Brain,
  MessageSquare,
  Webhook,
  Shield,
  Database,
  Building2,
  Cog,
  Users,
  type LucideIcon,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface SidebarItem {
  id: string;
  title: string;
  titleVi?: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  badgeVariant?: 'default' | 'success' | 'warning' | 'danger';
  children?: Omit<SidebarItem, 'children'>[];
  permissions?: string[];
  brdRef?: string;
  isNew?: boolean;
  isBeta?: boolean;
  description?: string;
}

export interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
  defaultExpanded?: boolean;
  defaultCollapsed?: boolean;
  permissions?: string[];
  brdSection?: string;
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
// SIDEBAR CONFIGURATION - 100% BRD ALIGNED
// 11 Sections | 52 Items | Full BRD Compliance
// ============================================================================

export const sidebarConfig: SidebarConfig = {
  brand: {
    name: 'Promo Master',
    subtitle: 'Suntory PepsiCo',
    icon: Package,
  },
  sections: [
    // ============================================
    // 1. TỔNG QUAN
    // ============================================
    {
      id: 'overview',
      title: 'TỔNG QUAN',
      defaultExpanded: true,
      items: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          titleVi: 'Tổng quan',
          href: '/dashboard',
          icon: LayoutDashboard,
          description: 'Tổng quan KPI và báo cáo',
        },
      ],
    },

    // ============================================
    // 2. QUẢN LÝ NGÂN SÁCH (BRD 3.1)
    // ============================================
    {
      id: 'budget-management',
      title: 'QUẢN LÝ NGÂN SÁCH',
      defaultExpanded: true,
      brdSection: '3.1',
      items: [
        {
          id: 'budget-definition',
          title: 'Budget Definition',
          titleVi: 'Định nghĩa & Kiểm soát',
          href: '/budget/definition',
          icon: FileText,
          brdRef: '3.1.1',
          isNew: true,
        },
        {
          id: 'budget-allocation',
          title: 'Budget Allocation',
          titleVi: 'Phân bổ Ngân sách',
          href: '/budget/allocation',
          icon: GitBranch,
          brdRef: '3.1.2',
          isNew: true,
        },
        {
          id: 'budget-monitoring',
          title: 'Budget Monitoring',
          titleVi: 'Giám sát Ngân sách',
          href: '/budget/monitoring',
          icon: Activity,
          brdRef: '3.1.3',
          isNew: true,
        },
        {
          id: 'fund-management',
          title: 'Fund Management',
          titleVi: 'Quản lý Quỹ',
          href: '/funds',
          icon: Wallet,
          description: 'Quản lý các quỹ FIXED/VARIABLE',
        },
      ],
    },

    // ============================================
    // 3. LẬP KẾ HOẠCH KINH DOANH (BRD 3.2)
    // ============================================
    {
      id: 'business-planning',
      title: 'LẬP KẾ HOẠCH KINH DOANH',
      defaultExpanded: true,
      brdSection: '3.2',
      items: [
        {
          id: 'baselines',
          title: 'Baseline Management',
          titleVi: 'Quản lý Baseline',
          href: '/baselines',
          icon: TrendingUp,
          brdRef: '3.2.1',
        },
        {
          id: 'targets',
          title: 'Target Management',
          titleVi: 'Quản lý Mục tiêu',
          href: '/targets',
          icon: Target,
          brdRef: '3.2.2',
        },
        {
          id: 'scenarios',
          title: 'Scenario Planning',
          titleVi: 'Lập kế hoạch Kịch bản',
          href: '/planning/scenarios',
          icon: GitBranch,
          brdRef: '3.2.3',
        },
        {
          id: 'tpo-suggestion',
          title: 'TPO - AI Suggestion',
          titleVi: 'Gợi ý Khuyến mãi (AI)',
          href: '/planning/tpo',
          icon: Sparkles,
          brdRef: '3.2.4',
          isNew: true,
          isBeta: true,
        },
      ],
    },

    // ============================================
    // 4. LẬP KẾ HOẠCH KHUYẾN MÃI (BRD 3.3)
    // ============================================
    {
      id: 'promotion-planning',
      title: 'LẬP KẾ HOẠCH KHUYẾN MÃI',
      defaultExpanded: true,
      brdSection: '3.3',
      items: [
        {
          id: 'promotion-calendar',
          title: 'Promotion Calendar',
          titleVi: 'Lịch Khuyến mãi',
          href: '/calendar',
          icon: Calendar,
          brdRef: '3.3.1',
          description: 'Calendar view theo tuần/tháng',
        },
        {
          id: 'promotion-scheme',
          title: 'Promotion Scheme',
          titleVi: 'Chương trình Khuyến mãi',
          href: '/promotions',
          icon: Tag,
          badge: 67,
          badgeVariant: 'default',
          brdRef: '3.3.2',
        },
        {
          id: 'mechanics-slab',
          title: 'Mechanics / Slab',
          titleVi: 'Cơ chế Khuyến mãi',
          href: '/promotions/mechanics',
          icon: Cog,
          brdRef: '3.3.3',
          description: 'Cấu hình discount %, rebate, free goods',
        },
        {
          id: 'templates',
          title: 'Templates',
          titleVi: 'Mẫu Khuyến mãi',
          href: '/planning/templates',
          icon: FileStack,
        },
        {
          id: 'projected-efficiency',
          title: 'Projected Efficiency',
          titleVi: 'Hiệu quả Dự kiến',
          href: '/promotions/efficiency',
          icon: BarChart3,
          brdRef: '3.3.4',
          isNew: true,
        },
        {
          id: 'deployment-plan',
          title: 'Deployment Plan',
          titleVi: 'Kế hoạch Triển khai',
          href: '/promotions/deployment',
          icon: Rocket,
          brdRef: '3.3.5',
          isNew: true,
        },
        {
          id: 'dms-integration',
          title: 'DMS Integration',
          titleVi: 'Tích hợp DMS',
          href: '/integration/dms',
          icon: Link2,
          brdRef: '3.3.6',
          description: 'Export promotion sang DMS',
        },
        {
          id: 'clash-detection',
          title: 'Clash Detection',
          titleVi: 'Phát hiện Xung đột',
          href: '/planning/clashes',
          icon: AlertTriangle,
        },
      ],
    },

    // ============================================
    // 5. THỰC THI & GIÁM SÁT (BRD 3.4.1-3.4.5)
    // ============================================
    {
      id: 'execution-monitoring',
      title: 'THỰC THI & GIÁM SÁT',
      defaultExpanded: false,
      brdSection: '3.4 (1-5)',
      items: [
        {
          id: 'psp-budget-monitoring',
          title: 'PSP Budget Monitoring',
          titleVi: 'Giám sát Ngân sách PSP',
          href: '/execution/psp-budget',
          icon: Activity,
          brdRef: '3.4.1',
          isNew: true,
        },
        {
          id: 'sell-in-monitoring',
          title: 'Sell-in Monitoring',
          titleVi: 'Giám sát Sell-in',
          href: '/operations/sell-tracking/sell-in',
          icon: ShoppingCart,
          brdRef: '3.4.2',
        },
        {
          id: 'sell-out-monitoring',
          title: 'Sell-out Monitoring',
          titleVi: 'Giám sát Sell-out',
          href: '/operations/sell-tracking/sell-out',
          icon: TrendingUp,
          brdRef: '3.4.3',
        },
        {
          id: 'spending-monitoring',
          title: 'Spending Monitoring',
          titleVi: 'Giám sát Chi tiêu',
          href: '/execution/spending',
          icon: DollarSign,
          brdRef: '3.4.4',
          isNew: true,
        },
        {
          id: 'delivery-tracking',
          title: 'Delivery Tracking',
          titleVi: 'Theo dõi Giao hàng',
          href: '/operations/delivery',
          icon: Truck,
        },
        {
          id: 'inventory-tracking',
          title: 'Inventory Tracking',
          titleVi: 'Theo dõi Tồn kho',
          href: '/operations/inventory',
          icon: Package,
        },
        {
          id: 'budget-reallocation',
          title: 'Budget Reallocation',
          titleVi: 'Điều chuyển Ngân sách',
          href: '/execution/reallocation',
          icon: GitBranch,
          brdRef: '3.4.5',
          isNew: true,
        },
      ],
    },

    // ============================================
    // 6. YÊU CẦU & THANH TOÁN (BRD 3.4.6-3.4.8)
    // ============================================
    {
      id: 'claims-settlement',
      title: 'YÊU CẦU & THANH TOÁN',
      defaultExpanded: false,
      brdSection: '3.4 (6-8)',
      items: [
        {
          id: 'claims-reporting',
          title: 'Claims Reporting',
          titleVi: 'Báo cáo Claims',
          href: '/claims',
          icon: FileText,
          badge: 12,
          badgeVariant: 'warning',
          brdRef: '3.4.6',
        },
        {
          id: 'claims-processing',
          title: 'Claims Processing',
          titleVi: 'Xử lý Claims',
          href: '/claims/processing',
          icon: ClipboardList,
        },
        {
          id: 'settlement',
          title: 'Settlement',
          titleVi: 'Thanh quyết toán',
          href: '/claims/settlement',
          icon: Receipt,
          brdRef: '3.4.7',
          isNew: true,
        },
        {
          id: 'payment',
          title: 'Payment',
          titleVi: 'Thanh toán',
          href: '/claims/payment',
          icon: CreditCard,
          brdRef: '3.4.8',
          isNew: true,
        },
      ],
    },

    // ============================================
    // 7. TÀI CHÍNH & KẾ TOÁN
    // ============================================
    {
      id: 'finance-accounting',
      title: 'TÀI CHÍNH & KẾ TOÁN',
      defaultExpanded: false,
      items: [
        {
          id: 'accruals',
          title: 'Accruals',
          titleVi: 'Dồn tích Chi phí',
          href: '/finance/accruals',
          icon: BookOpen,
        },
        {
          id: 'deductions',
          title: 'Deductions',
          titleVi: 'Khấu trừ',
          href: '/finance/deductions',
          icon: FileText,
        },
        {
          id: 'gl-journals',
          title: 'GL Journals',
          titleVi: 'Sổ cái Tổng hợp',
          href: '/finance/journals',
          icon: BookOpen,
        },
        {
          id: 'cheques',
          title: 'Cheques',
          titleVi: 'Séc Thanh toán',
          href: '/finance/cheques',
          icon: CreditCard,
        },
      ],
    },

    // ============================================
    // 8. PHÂN TÍCH HIỆU QUẢ (BRD Section 2)
    // ============================================
    {
      id: 'performance-analysis',
      title: 'PHÂN TÍCH HIỆU QUẢ',
      defaultExpanded: false,
      brdSection: 'Section 2',
      items: [
        {
          id: 'roi-analysis',
          title: 'ROI Analysis',
          titleVi: 'Phân tích ROI',
          href: '/analysis/roi',
          icon: TrendingUp,
          isNew: true,
        },
        {
          id: 'efficiency-report',
          title: 'Efficiency Report',
          titleVi: 'Báo cáo Hiệu quả',
          href: '/analysis/efficiency',
          icon: BarChart3,
          isNew: true,
        },
        {
          id: 'whatif-analysis',
          title: 'What-if Analysis',
          titleVi: 'Phân tích Giả định',
          href: '/analysis/what-if',
          icon: Lightbulb,
          isNew: true,
        },
        {
          id: 'bi-dashboard',
          title: 'BI Dashboard',
          titleVi: 'Dashboard BI',
          href: '/bi',
          icon: PieChart,
        },
      ],
    },

    // ============================================
    // 9. AI & PHÂN TÍCH (GIỮ LẠI - KHÔNG XÓA)
    // ============================================
    {
      id: 'ai-analytics',
      title: 'AI & PHÂN TÍCH',
      defaultExpanded: false,
      defaultCollapsed: true,
      items: [
        {
          id: 'ai-insights',
          title: 'AI Insights',
          titleVi: 'Nhận diện AI',
          href: '/ai/insights',
          icon: Brain,
          isBeta: true,
        },
        {
          id: 'ai-recommendations',
          title: 'AI Recommendations',
          titleVi: 'Đề xuất AI',
          href: '/ai/recommendations',
          icon: Sparkles,
          isBeta: true,
        },
        {
          id: 'voice-commands',
          title: 'Voice Commands',
          titleVi: 'Lệnh Giọng nói',
          href: '/voice',
          icon: MessageSquare,
          isBeta: true,
        },
      ],
    },

    // ============================================
    // 10. TÍCH HỢP HỆ THỐNG (GIỮ LẠI - KHÔNG XÓA)
    // ============================================
    {
      id: 'integration',
      title: 'TÍCH HỢP HỆ THỐNG',
      defaultExpanded: false,
      defaultCollapsed: true,
      items: [
        {
          id: 'erp-integration',
          title: 'ERP Integration',
          titleVi: 'Tích hợp ERP',
          href: '/integration/erp',
          icon: Building2,
        },
        {
          id: 'webhooks',
          title: 'Webhooks',
          titleVi: 'Webhooks',
          href: '/integration/webhooks',
          icon: Webhook,
        },
        {
          id: 'security',
          title: 'Security',
          titleVi: 'Bảo mật',
          href: '/integration/security',
          icon: Shield,
        },
      ],
    },

    // ============================================
    // 11. CÀI ĐẶT
    // ============================================
    {
      id: 'settings',
      title: 'CÀI ĐẶT',
      defaultExpanded: false,
      defaultCollapsed: true,
      items: [
        {
          id: 'customers',
          title: 'Customers',
          titleVi: 'Khách hàng',
          href: '/customers',
          icon: Users,
        },
        {
          id: 'products',
          title: 'Products',
          titleVi: 'Sản phẩm',
          href: '/products',
          icon: Package,
        },
        {
          id: 'system-config',
          title: 'System Config',
          titleVi: 'Cấu hình Hệ thống',
          href: '/settings',
          icon: Settings,
          permissions: ['ADMIN'],
        },
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
