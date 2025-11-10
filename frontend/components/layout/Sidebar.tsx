'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import {
  LayoutDashboard,
  Calendar,
  Package,
  Users,
  BarChart3,
  Settings,
  Building2,
  Wrench,
  Boxes,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface NavItem {
  title: string;
  href: string;
  icon: any;
  roles?: ('ADMIN' | 'ENGINEER')[];
}

const mainNavItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Appointments',
    href: '/dashboard/appointments',
    icon: Calendar,
  },
  {
    title: 'Inventory',
    href: '/dashboard/inventory',
    icon: Package,
  },
  {
    title: 'Worker Counts',
    href: '/dashboard/worker-counts',
    icon: Users,
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: BarChart3,
    roles: ['ADMIN'],
  },
];

const masterNavItems: NavItem[] = [
  {
    title: 'Clients',
    href: '/dashboard/clients',
    icon: Building2,
  },
  {
    title: 'Engineers',
    href: '/dashboard/engineers',
    icon: Wrench,
    roles: ['ADMIN'],
  },
  {
    title: 'Materials',
    href: '/dashboard/materials',
    icon: Boxes,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const filterByRole = (items: NavItem[]) => {
    return items.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(user?.role as any);
    });
  };

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-800 transition-all duration-300',
        // Z-index: higher than overlay (z-30) but below modals
        'z-40',
        // Mobile: always full width when visible, hide/show with translate
        'w-72',
        // Desktop: collapse/expand behavior (width only, no translation)
        sidebarCollapsed ? 'lg:w-20' : 'lg:w-72',
        // Mobile: hide/show behavior (translate off-screen when collapsed)
        // On mobile, translate when collapsed; on desktop, never translate
        sidebarCollapsed 
          ? '-translate-x-full lg:translate-x-0' 
          : 'translate-x-0'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-800">
          {!sidebarCollapsed && (
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-xl font-bold text-white">C</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Concreexpo
                </h1>
              </div>
            </Link>
          )}
          {sidebarCollapsed && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto">
              <span className="text-xl font-bold text-white">C</span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-6">
          {/* Main Navigation */}
          <div>
            {!sidebarCollapsed && (
              <h2 className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Main
              </h2>
            )}
            <ul className="space-y-1">
              {filterByRole(mainNavItems).map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center px-3 py-3 rounded-lg transition-all duration-200 group',
                        isActive
                          ? 'bg-blue-500/10 text-blue-400 border-l-4 border-blue-500 shadow-lg shadow-blue-500/20'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'flex-shrink-0',
                          sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'
                        )}
                      />
                      {!sidebarCollapsed && (
                        <span className="ml-3 font-medium">{item.title}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <Separator className="bg-slate-800" />

          {/* Masters Section */}
          <div>
            {!sidebarCollapsed && (
              <h2 className="px-3 mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Masters
              </h2>
            )}
            <ul className="space-y-1">
              {filterByRole(masterNavItems).map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        'flex items-center px-3 py-3 rounded-lg transition-all duration-200',
                        isActive
                          ? 'bg-purple-500/10 text-purple-400 border-l-4 border-purple-500'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                      )}
                    >
                      <item.icon
                        className={cn(
                          'flex-shrink-0',
                          sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5'
                        )}
                      />
                      {!sidebarCollapsed && (
                        <span className="ml-3 font-medium">{item.title}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Settings at Bottom */}
        <div className="px-3 py-4 border-t border-slate-800">
          <Link
            href="/dashboard/settings"
            className="flex items-center px-3 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all duration-200"
          >
            <Settings className={cn('flex-shrink-0', sidebarCollapsed ? 'w-6 h-6' : 'w-5 h-5')} />
            {!sidebarCollapsed && <span className="ml-3 font-medium">Settings</span>}
          </Link>
        </div>

        {/* Collapse Toggle */}
        <div className="px-3 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="w-full justify-center hover:bg-slate-800 text-slate-400 hover:text-slate-200"
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </Button>
        </div>
      </div>
    </aside>
  );
}
