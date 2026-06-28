"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  CalendarDays, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut, 
  HardDrive, 
  Zap, 
  ChevronLeft, 
  ChevronRight,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { getDatabaseDiagnostics } from '@/lib/db-diagnostics';
import { useState, useEffect } from 'react';
import { usePlan } from '@/context/PlanContext';
import { AnimatedThemeToggler } from '@/components/shared/AnimatedThemeToggler';
import { logoutAction } from '@/auth/actions/auth-actions';
import { motion, AnimatePresence } from 'framer-motion';



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
    teamRole?: string;
  } | null;
  onLinkClick?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

// Custom interactive Tooltip for collapsed mode
function SidebarTooltip({ content, show, children }: { content: string; show: boolean; children: React.ReactNode }) {
  const [hovered, setHovered] = useState(false);
  const active = show && hovered;
  return (
    <div 
      className="relative w-full flex justify-center" 
      onMouseEnter={() => setHovered(true)} 
      onMouseLeave={() => setHovered(false)}
    >
      {children}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, x: -10 }}
            transition={{ type: "spring", stiffness: 450, damping: 25 }}
            className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-[100] bg-slate-900 dark:bg-slate-955 text-white text-[10px] font-bold px-3 py-2 rounded-xl whitespace-nowrap shadow-xl border border-slate-800 pointer-events-none tracking-wider uppercase"
          >
            {content}
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900 dark:border-r-slate-950" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar({ user, onLinkClick, isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const [dbStats, setDbStats] = useState<{ storageUsedMB?: string } | null>(null);
  const [isDark, setIsDark] = useState(false);
  const { plan, planName } = usePlan();
  const isAgency = plan === 'agency' || user?.plan === 'agency';

  const isOwner = user?.teamRole === 'owner' || !user?.teamRole;
  const isEditor = user?.teamRole === 'editor';

  const navigation = isEditor ? [
    { name: 'Monthly Work', href: '/dashboard/work', icon: CalendarDays },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/dashboard/clients', icon: Briefcase },
    ...(isOwner ? [{ name: 'Team', href: '/dashboard/team', icon: Users }] : []),
    { name: 'Monthly Work', href: '/dashboard/work', icon: CalendarDays },
    { name: 'Payments', href: '/dashboard/payments', icon: CreditCard },
    { name: 'Reports', href: '/dashboard/reports', icon: BarChart3 },
  ];

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
    <motion.div
      animate={{ width: isCollapsed ? 80 : 288 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="flex h-full flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-105 shadow-sm overflow-hidden select-none"
    >
      {/* Sidebar Header Panel */}
      <div className={`flex h-20 shrink-0 items-center border-b border-slate-100 dark:border-slate-800 justify-between ${isCollapsed ? "px-0 justify-center" : "px-8"}`}>
        {isCollapsed ? (
          <button
            onClick={onToggleCollapse}
            className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-655 transition-all cursor-pointer"
            title="Expand Sidebar"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        ) : (
          <>
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
                  <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-55 truncate block" title={sidebarTitle}>{sidebarTitle}</span>
                  {!isWhiteLabelEnabled && (
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-[0.2em] uppercase leading-none mt-1">Professional</div>
                  )}
                </div>
              )}
            </div>
            
            {onToggleCollapse && (
              <button 
                onClick={onToggleCollapse}
                className="p-1.5 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-350 transition-all cursor-pointer hidden lg:block animate-in fade-in"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>

      {/* Main Navigation Menu */}
      <div className={`flex flex-1 flex-col overflow-y-auto py-8 ${isCollapsed ? "px-2" : "px-4"}`}>
        <AnimatePresence mode="wait">
          {!isCollapsed ? (
            <motion.div
              key="main-menu-text"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 px-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest overflow-hidden whitespace-nowrap"
            >
              Main Menu
            </motion.div>
          ) : (
            <motion.div 
              key="main-menu-divider"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-4 border-b border-slate-100 dark:border-slate-800 mx-2"
            />
          )}
        </AnimatePresence>

        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            const isRestricted = (item.name === 'Payments' && (user?.teamRole === 'editor' || user?.teamRole === 'viewer')) ||
                                 (item.name === 'Team' && !isAgency);
            
            const restrictionTooltip = item.name === 'Team' && !isAgency 
              ? 'Team (Agency Plan Required)' 
              : `${item.name} (Restricted)`;

            if (isRestricted) {
              return (
                <SidebarTooltip key={item.name} content={restrictionTooltip} show={isCollapsed}>
                  <div
                    className={`flex items-center gap-3 rounded-xl py-3 text-sm font-semibold transition-all duration-200 relative w-full opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-950/10 ${isCollapsed ? "justify-center px-0" : "px-4"}`}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-slate-400" />
                    <AnimatePresence mode="wait">
                      {!isCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.15 }}
                          className="whitespace-nowrap overflow-hidden flex items-center gap-1.5"
                        >
                          {item.name}
                          <svg className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </SidebarTooltip>
              );
            }
            
            return (
              <SidebarTooltip key={item.name} content={item.name} show={isCollapsed}>
                <Link
                  href={item.href}
                  onClick={onLinkClick}
                  className={`group flex items-center gap-3 rounded-xl py-3 text-sm font-semibold transition-all duration-200 relative w-full ${
                    isActive 
                      ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400" 
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-950/30 dark:hover:text-slate-100"
                  } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-full" />
                  )}
                  <Icon className={`h-5 w-5 shrink-0 transition-colors ${
                    isActive ? "text-indigo-600 dark:text-indigo-455" : "text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  }`} />
                  
                  <AnimatePresence mode="wait">
                    {!isCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: "auto" }}
                        exit={{ opacity: 0, width: 0 }}
                        transition={{ duration: 0.15 }}
                        className="whitespace-nowrap overflow-hidden"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </SidebarTooltip>
            );
          })}
        </nav>

        {/* Storage Usage Widget */}
        {user?.role === 'admin' && (
          <div className="mt-8 px-2">
            {isCollapsed ? (
              <SidebarTooltip content={`Storage: ${storageUsed.toFixed(1)} MB / 512 MB (${storagePercent.toFixed(1)}%)`} show={isCollapsed}>
                <Link
                  href="/dashboard/diagnostics"
                  className="flex items-center justify-center p-3.5 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-100 dark:border-slate-800 hover:scale-105 transition-all cursor-pointer w-full"
                >
                  <div className="relative flex items-center justify-center">
                    <HardDrive className={`h-4.5 w-4.5 ${storagePercent > 80 ? 'text-red-500' : 'text-indigo-600 dark:text-indigo-400'}`} />
                    <span className="absolute -top-1.5 -right-1.5 flex h-2 w-2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${storagePercent > 80 ? 'bg-red-400' : 'bg-indigo-400'}`}></span>
                      <span className={`relative inline-flex rounded-full h-2 w-2 ${storagePercent > 80 ? 'bg-red-500' : 'bg-indigo-500'}`}></span>
                    </span>
                  </div>
                </Link>
              </SidebarTooltip>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-50 dark:bg-slate-950/40 rounded-2xl p-5 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-2 mb-3">
                   <HardDrive className="h-3.5 w-3.5 text-slate-400 dark:text-slate-550" />
                   <span className="text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-widest">Storage Usage</span>
                </div>
                <div className="space-y-2">
                   <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400 dark:text-slate-500 uppercase tracking-wider">{storageUsed.toFixed(1)} MB used</span>
                      <span className="text-slate-600 dark:text-slate-355">{storagePercent.toFixed(1)}%</span>
                   </div>
                   <div className="h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-1000 ${storagePercent > 80 ? 'bg-red-500' : 'bg-indigo-600'}`}
                        style={{ width: `${storagePercent}%` }}
                      />
                   </div>
                </div>
              </motion.div>
            )}
          </div>
        )}

        {/* Plan Badge Widget */}
        {!isEditor && (
          <div className="mt-6 px-2">
            {(() => {
              const planBadges = {
                hobby:  { bg: 'bg-slate-50 dark:bg-slate-950/40',   border: 'border-slate-200 dark:border-slate-800',  text: 'text-slate-600 dark:text-slate-400',  dot: 'bg-slate-400',   label: 'Hobby',  sub: 'Free Plan'      },
                pro:    { bg: 'bg-indigo-50 dark:bg-indigo-950/20',  border: 'border-indigo-200 dark:border-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-400', dot: 'bg-indigo-500',  label: 'Pro',    sub: '₹2,499 / mo'    },
                agency: { bg: 'bg-purple-50 dark:bg-purple-950/20',  border: 'border-purple-200 dark:border-purple-900/30', text: 'text-purple-700 dark:text-purple-400', dot: 'bg-purple-500',  label: 'Agency', sub: '₹7,499 / mo'    },
              };
              const cfg = planBadges[plan as keyof typeof planBadges] ?? planBadges.hobby;
              
              return isCollapsed ? (
                <SidebarTooltip content={`${planName} Plan - ${cfg.sub}`} show={isCollapsed}>
                  <Link 
                    href="/dashboard/settings?tab=pricing"
                    className={`flex items-center justify-center p-3.5 rounded-2xl border w-full ${cfg.bg} ${cfg.border} hover:scale-105 transition-all cursor-pointer`}
                  >
                    <Zap className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                  </Link>
                </SidebarTooltip>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-2xl border p-4 ${cfg.bg} ${cfg.border}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.text}`}>{planName} Plan</span>
                  </div>
                  <p className={`text-[10px] font-bold ${cfg.text} opacity-70 mb-3`}>{cfg.sub}</p>
                  <Link
                    href="/dashboard/settings?tab=pricing"
                    className="flex items-center gap-1.5 text-[9px] font-black text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/30 px-3 py-1.5 rounded-xl uppercase tracking-wider hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition-all duration-200 w-full justify-center shadow-sm cursor-pointer"
                  >
                    <Zap className="h-3 w-3" />
                    {plan === 'hobby' ? 'Upgrade Plan' : 'Change Plan'}
                  </Link>
                </motion.div>
              );
            })()}
          </div>
        )}
      </div>

      {/* User Profile Footer Section */}
      {user && (
        <div className={`py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex flex-col items-center justify-center gap-3 transition-all duration-200 ${isCollapsed ? "px-2" : "px-6"}`}>
          {isCollapsed ? (
            <SidebarTooltip content={`${user.name} (${user.email})`} show={isCollapsed}>
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200 dark:border-indigo-900/30 cursor-help shrink-0">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </SidebarTooltip>
          ) : (
            <div className="flex items-center justify-between w-full gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-200 dark:border-indigo-900/30 shrink-0">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{user.name || 'User Account'}</p>
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate uppercase tracking-wider">{user.email || ''}</p>
                </div>
              </div>
              <AnimatedThemeToggler className="h-9 w-9 p-2 border border-slate-200 dark:border-slate-850 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/40 shrink-0" />
            </div>
          )}
        </div>
      )}

      {/* Settings & Sign Out Controls */}
      <div className={`space-y-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/10 ${isCollapsed ? "p-3" : "p-6"}`}>
        <SidebarTooltip content="Help & Support" show={isCollapsed}>
          {(() => {
            const isActive = pathname === "/dashboard/support";
            return (
              <Link
                href="/dashboard/support"
                onClick={onLinkClick}
                className={`group flex items-center gap-3 rounded-xl py-3 text-sm font-semibold transition-all duration-200 relative w-full ${
                  isActive 
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 shadow-xs border border-slate-200/20 dark:border-slate-800" 
                    : "text-slate-500 hover:bg-white dark:hover:bg-slate-850 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-xs dark:text-slate-400"
                } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-full" />
                )}
                <HelpCircle className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-550 group-hover:text-indigo-600 dark:group-hover:text-indigo-455"
                }`} />
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      Help & Support
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })()}
        </SidebarTooltip>

        <SidebarTooltip content="Settings" show={isCollapsed}>
          {(() => {
            const isActive = pathname === "/dashboard/settings";
            return (
              <Link
                href="/dashboard/settings"
                onClick={onLinkClick}
                className={`group flex items-center gap-3 rounded-xl py-3 text-sm font-semibold transition-all duration-200 relative w-full ${
                  isActive 
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 shadow-xs border border-slate-200/20 dark:border-slate-800" 
                    : "text-slate-500 hover:bg-white dark:hover:bg-slate-850 hover:text-indigo-600 dark:hover:text-indigo-400 hover:shadow-xs dark:text-slate-400"
                } ${isCollapsed ? "justify-center px-0" : "px-4"}`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 rounded-full" />
                )}
                <Settings className={`h-5 w-5 shrink-0 transition-colors ${
                  isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-550 group-hover:text-indigo-600 dark:group-hover:text-indigo-455"
                }`} />
                
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.15 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      Settings
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })()}
        </SidebarTooltip>

        {isCollapsed && (
          <div className="flex justify-center py-1">
            <AnimatedThemeToggler className="h-9 w-9 p-2 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-white dark:hover:bg-slate-850 shrink-0" />
          </div>
        )}

        <SidebarTooltip content="Sign Out" show={isCollapsed}>
          <button
            onClick={async () => {
              if (onLinkClick) onLinkClick();
              await logoutAction();
            }}
            className={`w-full group flex items-center gap-3 rounded-xl py-3 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 cursor-pointer ${isCollapsed ? "justify-center px-0" : "px-4"}`}
          >
            <LogOut className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-red-500" />
            
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "auto" }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.15 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Sign Out
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </SidebarTooltip>
      </div>
    </motion.div>
  );
}
