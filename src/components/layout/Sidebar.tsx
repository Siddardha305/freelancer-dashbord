"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, CalendarDays, CreditCard, BarChart3, Settings, LogOut, HardDrive, Zap } from 'lucide-react';
import { getDatabaseDiagnostics } from '@/lib/db-diagnostics';
import { useState, useEffect } from 'react';
import { usePlan } from '@/context/PlanContext';
import { AnimatedThemeToggler } from '@/components/shared/AnimatedThemeToggler';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Clients', href: '/dashboard/clients', icon: Users },
  { name: 'Monthly Work', href: '/dashboard/work', icon: CalendarDays },
  { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
  { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
];

import { logoutAction } from '@/auth/actions/auth-actions';

interface SidebarProps {
  user?: {
    id: string;
    name: string;
    email: string;
    role?: string;
    currency?: string;
    plan?: string;
    agencyName?: string;
    agencyLogoUrl?: string;
    agencyLogoDarkUrl?: string;
    agencyBrandingMode?: string;
  } | null;
  onLinkClick?: () => void;
}

export function Sidebar({ user, onLinkClick }: SidebarProps) {
  const pathname = usePathname();
  const [dbStats, setDbStats] = useState<{ storageUsedMB?: string } | null>(null);
  const [isDark, setIsDark] = useState(false);
  const { plan, planName } = usePlan();

  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkTheme();
    
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (user?.role !== 'admin') return;

    const fetchStats = async () => {
      const result = await getDatabaseDiagnostics();
      if (result.success) {
        setDbStats(result.stats || null);
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

  const isWhiteLabelEnabled = user?.plan === 'agency';
  const sidebarTitle = isWhiteLabelEnabled && user?.agencyName ? user.agencyName : "FreelanceOS";
  
  const brandingMode = isWhiteLabelEnabled ? (user?.agencyBrandingMode || "both") : "both";
  const customLogoUrl = isWhiteLabelEnabled
    ? (isDark && user?.agencyLogoDarkUrl ? user.agencyLogoDarkUrl : user?.agencyLogoUrl)
    : undefined;

  const showLogo = brandingMode === "logo" || brandingMode === "both";
  const showText = brandingMode === "text" || brandingMode === "both";

  return (
    <div className="flex h-full w-72 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-105 shadow-sm">
      <div className="flex h-20 shrink-0 items-center px-8 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          {showLogo && (
            customLogoUrl ? (
              <div className="w-10 h-10 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={customLogoUrl} alt={sidebarTitle} className="h-full w-full object-contain" />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-indigo-200 shrink-0">
                {sidebarTitle.charAt(0).toUpperCase()}
              </div>
            )
          )}
          
          {showText && (
            <div className="min-w-0">
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate block" title={sidebarTitle}>{sidebarTitle}</span>
              {!isWhiteLabelEnabled && (
                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-[0.2em] uppercase leading-none mt-1">Professional</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-8">
        <div className="mb-4 px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
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
                onClick={onLinkClick}
                className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 relative ${
                  isActive 
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-950/30 dark:hover:text-slate-100"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-full" />
                )}
                <Icon className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? "text-indigo-600 dark:text-indigo-455" : "text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                }`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Storage Usage Widget (Only for admins) */}
        {user?.role === 'admin' && (
          <div className="mt-8 px-2">
             <div className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-3">
                   <HardDrive className="h-3.5 w-3.5 text-slate-400 dark:text-slate-550" />
                   <span className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest">Storage Usage</span>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">{storageUsed.toFixed(1)} MB used</span>
                      <span className="text-slate-600 dark:text-slate-350">{storagePercent.toFixed(1)}%</span>
                   </div>
                   <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${storagePercent > 80 ? 'bg-red-500' : 'bg-indigo-600'}`}
                        style={{ width: `${storagePercent}%` }}
                      />
                   </div>
                </div>
             </div>
          </div>
        )}

        {/* Plan Badge Widget */}
        <div className="mt-6 px-2">
          {(() => {
            const planBadges = {
              hobby:  { bg: 'bg-slate-50 dark:bg-slate-950/40',   border: 'border-slate-200 dark:border-slate-800',  text: 'text-slate-600 dark:text-slate-400',  dot: 'bg-slate-400',   label: 'Hobby',  sub: 'Free Plan'      },
              pro:    { bg: 'bg-indigo-50 dark:bg-indigo-950/20',  border: 'border-indigo-200 dark:border-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500',  label: 'Pro',    sub: '₹2,499 / mo'    },
              agency: { bg: 'bg-purple-50 dark:bg-purple-950/20',  border: 'border-purple-200 dark:border-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500',  label: 'Agency', sub: '₹7,499 / mo'    },
            };
            const cfg = planBadges[plan as keyof typeof planBadges] ?? planBadges.hobby;
            return (
              <div className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                  <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.text}`}>{planName} Plan</span>
                </div>
                <p className={`text-[10px] font-bold ${cfg.text} opacity-70 mb-3`}>{cfg.sub}</p>
                {plan === 'hobby' ? (
                  <Link
                    href="/dashboard/settings?tab=pricing"
                    className="flex items-center gap-1.5 text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30 px-3 py-1.5 rounded-xl uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all duration-200 w-full justify-center shadow-sm cursor-pointer"
                  >
                    <Zap className="h-3 w-3" />
                    Upgrade Plan
                  </Link>
                ) : (
                  <Link
                    href="/dashboard/settings?tab=pricing"
                    className="flex items-center gap-1.5 text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30 px-3 py-1.5 rounded-xl uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all duration-200 w-full justify-center shadow-sm cursor-pointer"
                  >
                    Change Plan
                  </Link>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* User profile section */}
      {user && (
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200 dark:border-indigo-900/30 shrink-0">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name || 'User Account'}</p>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate uppercase tracking-wider">{user.email || ''}</p>
            </div>
          </div>
          <AnimatedThemeToggler className="h-9 w-9 p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/40 shrink-0" />
        </div>
      )}

      <div className="p-6 space-y-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10">
        <Link
          href="/dashboard/settings"
          onClick={onLinkClick}
          className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-sm transition-all duration-200"
        >
          <Settings className="h-5 w-5 shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-455" />
          Settings
        </Link>
        <button
          onClick={async () => {
            if (onLinkClick) onLinkClick();
            await logoutAction();
          }}
          className="w-full group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-555 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-655 dark:hover:text-red-400 transition-all duration-200 cursor-pointer"
        >
          <LogOut className="h-5 w-5 shrink-0 text-slate-400" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
