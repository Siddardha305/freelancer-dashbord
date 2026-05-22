import React from 'react';
import { getSessionUser } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getAdminOverviewAction, adminLogoutAction } from '@/admin/actions/admin-actions';
import { ShieldAlert, LogOut } from 'lucide-react';
import Link from 'next/link';
import AdminDashboardClient from '@/admin/components/AdminDashboardClient';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const user = await getSessionUser();

  // Route security: restrict to admins only
  if (!user || user.role !== 'admin') {
    redirect('/admin/login');
  }

  // Retrieve platform telemetry and registry details
  let data;
  try {
    data = await getAdminOverviewAction();
  } catch (error) {
    console.error("Admin dashboard data load failed:", error);
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-[2rem] p-8 shadow-xl text-center space-y-4 font-sans">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">System Error</h2>
          <p className="text-sm font-semibold text-slate-500">
            Failed to gather system metrics. Please confirm your database connection is active.
          </p>
          <Link href="/admin/login" className="inline-block py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-2xl">
            Retry Connection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 pb-16">
      {/* Admin Nav Control Bar */}
      <nav className="bg-white border-b border-slate-200/80 sticky top-0 z-50 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-indigo-600/20">
              F
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900">FreelanceOS</span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-600 rounded-full uppercase tracking-wider">
                System Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/60">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-500">Secure Cluster Connection</span>
            </div>

            <div className="h-8 w-[1px] bg-slate-200 hidden md:block" />

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-900">{user.name}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Primary Administrator</p>
              </div>

              {/* Logout Form Action */}
              <form action={async () => {
                'use server'
                await adminLogoutAction();
                redirect('/admin/login');
              }}>
                <button
                  type="submit"
                  className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all cursor-pointer group"
                  title="Sign Out"
                >
                  <LogOut className="h-5 w-5 group-hover:scale-105 transition-transform" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Admin Console Dashboard */}
      <main className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
        <AdminDashboardClient 
          initialData={data} 
          currentUser={{
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }} 
        />
      </main>
    </div>
  );
}
