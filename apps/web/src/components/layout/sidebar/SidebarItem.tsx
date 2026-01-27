import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { SidebarBadge } from './SidebarBadge';
import type { SidebarItem as SidebarItemType, SidebarColors } from '@/config/sidebarConfig';

interface SidebarItemProps {
  item: SidebarItemType;
  isCollapsed: boolean;
  isActive: boolean;
  colors: SidebarColors;
  onNavigate?: () => void;
}

export function SidebarItem({
  item,
  isCollapsed,
  isActive,
  colors,
  onNavigate,
}: SidebarItemProps) {
  const Icon = item.icon;

  return (
    <li>
      <Link
        to={item.href}
        onClick={onNavigate}
        className={cn(
          'flex items-center rounded transition-all duration-100',
          isCollapsed
            ? 'justify-center px-2 py-1.5'
            : 'gap-2.5 px-2.5 py-1.5 text-sm font-medium'
        )}
        style={{
          backgroundColor: isActive ? colors.bgActive : 'transparent',
          color: isActive ? colors.text : colors.textMuted,
        }}
        onMouseEnter={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = colors.bgHover;
            e.currentTarget.style.color = colors.text;
          }
        }}
        onMouseLeave={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = colors.textMuted;
          }
        }}
        title={isCollapsed ? item.title : undefined}
      >
        <Icon
          className={cn('shrink-0', isCollapsed ? 'h-[18px] w-[18px]' : 'h-4 w-4')}
          strokeWidth={1.75}
        />
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge !== undefined && (
              <SidebarBadge
                value={item.badge}
                variant={item.badgeVariant}
                colors={colors}
              />
            )}
          </>
        )}
      </Link>
    </li>
  );
}
