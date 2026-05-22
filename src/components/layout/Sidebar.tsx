"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarDays, CreditCard, BarChart3, Settings, LogOut, HardDrive, Activity } from 'lucide-react';
import { getDatabaseDiagnostics } from '@/lib/db-diagnostics';
import { useState, useEffect } from 'react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Monthly Work', href: '/dashboard/work', icon: CalendarDays },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
];

import { logoutAction } from '@/auth/actions/auth-actions';

interface SidebarProps {
  user?: any;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [dbStats, setDbStats] = useState<any>(null);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchStats = async () => {
      const result = await getDatabaseDiagnostics();
      if (result.success) {
        setDbStats(result.stats);
      }
    };
    fetchStats();
    // Poll every 60 seconds
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, [user?.id, user?.role]);

  const storageUsed = Number(dbStats?.storageUsedMB || 0);
  const storageLimit = 512;
  const storagePercent = Math.min((storageUsed / storageLimit) * 100, 100);

  return (
    <div className="flex h-full w-72 flex-col bg-white border-r border-slate-200 text-slate-900 shadow-sm">
      <div className="flex h-20 shrink-0 items-center px-8 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-200">
            F
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-slate-900">FreelanceOS</span>
            <div className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase leading-none mt-1">Professional</div>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-8">
        <div className="mb-4 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Main Menu
        </div>
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 relative ${
                  isActive 
                    ? "bg-indigo-50 text-indigo-700" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-full" />
                )}
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-indigo-600"
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Storage Usage Widget (Only for admins) */}
        {user?.role === 'admin' && (
          <div className="mt-8 px-2">
             <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center gap-2 mb-3">
                   <HardDrive className="h-3.5 w-3.5 text-slate-400" />
                   <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Storage Usage</span>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400 uppercase tracking-wider">{storageUsed.toFixed(1)} MB used</span>
                      <span className="text-slate-600">{storagePercent.toFixed(1)}%</span>
                   </div>
                   <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${storagePercent > 80 ? 'bg-red-500' : 'bg-indigo-600'}`}
                        style={{ width: `${storagePercent}%` }}
                      />
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>

      {/* User profile section */}
      {user && (
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold border border-indigo-200 shrink-0">
            {user.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-900 truncate">{user.name || 'User Account'}</p>
            <p className="text-[10px] font-bold text-slate-400 truncate uppercase tracking-wider">{user.email || ''}</p>
          </div>
        </div>
      )}

      <div className="p-6 space-y-2 border-t border-slate-100 bg-slate-50/30">
        <Link
          href="/dashboard/settings"
          className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all duration-200"
        >
          <Settings className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-indigo-600" />
          Settings
        </Link>
        <button
          onClick={async () => {
            await logoutAction();
          }}
          className="w-full group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
