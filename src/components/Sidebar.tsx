'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  MessageSquare, 
  Settings, 
  CalendarDays,
  Users,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardMetrics } from '@/hooks/useAppointments';
import { useNotifications } from '@/hooks/useNotifications';

interface SidebarProps {
  className?: string;
}

const menuItems = [
  {
    href: '/staff/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    description: 'Overview & quick access'
  },
  {
    href: '/staff/dashboard/today',
    icon: CalendarDays,
    label: 'Today\'s Appointments',
    description: 'View today\'s schedule',
    badgeKey: 'todaysAppointments'
  },
  {
    href: '/staff/dashboard/calendar',
    icon: Calendar,
    label: 'Calendar',
    description: 'Schedule management'
  },
  {
    href: '/staff/dashboard/waiting',
    icon: Clock,
    label: 'Waiting',
    description: 'Queue management',
    badgeKey: 'waitingPatients'
  },
  {
    href: '/staff/dashboard/messages',
    icon: MessageSquare,
    label: 'Messages',
    description: 'Patient communications',
    badgeKey: 'unreadCount'
  },
  {
    href: '/staff/dashboard/settings',
    icon: Settings,
    label: 'Settings',
    description: 'Availability & preferences'
  }
];

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null);

  // Get real-time data for badges
  const { data: metrics } = useDashboardMetrics();
  const { unreadCount } = useNotifications();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/signin' });
  };

  const handleNavigation = (href: string) => {
    setNavigatingTo(href);
    // Reset after navigation completes or timeout
    setTimeout(() => setNavigatingTo(null), 2000);
  };

  // Reset navigation state when pathname changes (successful navigation)
  useEffect(() => {
    if (navigatingTo && pathname !== navigatingTo) {
      setNavigatingTo(null);
    }
  }, [pathname, navigatingTo]);

  // Helper function to get badge value for menu items
  const getBadgeValue = (badgeKey?: string) => {
    if (!badgeKey) return null;
    
    switch (badgeKey) {
      case 'todaysAppointments':
        return metrics?.todaysAppointments;
      case 'waitingPatients':
        return metrics?.waitingPatients;
      case 'unreadCount':
        return unreadCount;
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      'flex flex-col bg-white border-r border-gray-200 h-full transition-all duration-300',
      isCollapsed ? 'w-16' : 'w-64',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900 text-sm">Sydney Med</h2>
              <p className="text-xs text-gray-500">Staff Portal</p>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isNavigating = navigatingTo === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link href={item.href} onClick={() => handleNavigation(item.href)}>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    className={cn(
                      'w-full justify-start gap-3 h-auto py-3 px-3 transition-all duration-200',
                      isActive && 'bg-blue-50 text-blue-700 border-blue-200',
                      isNavigating && 'opacity-60',
                      !isActive && 'hover:bg-gray-100',
                      isCollapsed && 'px-3'
                    )}
                    disabled={isNavigating}
                  >
                    {isNavigating ? (
                      <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-blue-600" />
                    ) : (
                      <Icon className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isActive ? 'text-blue-600' : 'text-gray-500'
                      )} />
                    )}
                    {!isCollapsed && (
                      <div className="flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{item.label}</span>
                          {getBadgeValue(item.badgeKey) && (
                            <Badge variant="secondary" className="ml-2 bg-red-100 text-red-800 text-xs">
                              {getBadgeValue(item.badgeKey)}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                      </div>
                    )}
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-2 border-t border-gray-200">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={cn(
            'w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50',
            isCollapsed && 'justify-center'
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span>Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}
