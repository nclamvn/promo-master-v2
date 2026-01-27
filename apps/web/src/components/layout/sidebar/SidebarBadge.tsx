import { cn } from '@/lib/utils';
import type { SidebarColors } from '@/config/sidebarConfig';

interface SidebarBadgeProps {
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  colors: SidebarColors;
}

export function SidebarBadge({ value, variant = 'default', colors }: SidebarBadgeProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          backgroundColor: colors.statusOnline,
          color: '#ffffff',
        };
      case 'warning':
        return {
          backgroundColor: colors.statusSyncing,
          color: '#ffffff',
        };
      case 'danger':
        return {
          backgroundColor: colors.statusOffline,
          color: '#ffffff',
        };
      default:
        return {
          backgroundColor: colors.bgActive,
          color: colors.text,
        };
    }
  };

  return (
    <span
      className={cn(
        'px-1.5 py-0.5 text-[10px] font-semibold rounded',
        'shrink-0'
      )}
      style={getVariantStyles()}
    >
      {value}
    </span>
  );
}
