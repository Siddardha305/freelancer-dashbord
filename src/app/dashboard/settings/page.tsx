'use client'

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { User, Shield, Settings, Activity, Loader2, Check } from "lucide-react";
import { DiagnosticsView } from "@/dashboard/diagnostics/components/DiagnosticsView";
import { ResetWorkspaceButton } from "@/dashboard/diagnostics/components/ResetWorkspaceButton";
import { getCurrentUserAction, updateProfileAction, updatePasswordAction } from "@/auth/actions/auth-actions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCurrency } from "@/context/CurrencyContext";

export default function SettingsPage() {
  const { setCurrency: setGlobalCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState<"general" | "diagnostics">("general");
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile Form States
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [profileSaving, setProfileSaving] = useState(false);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUserAction();
        setCurrentUser(user);
        if (user) {
          setName(user.name || "");
          setEmail(user.email || "");
          setBio(user.bio || "");
          setCurrency(user.currency || "INR");
        }
      } catch (error) {
        console.error("Failed to load settings user:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    setProfileSaving(true);
    try {
      const res = await updateProfileAction({ name, email, bio, currency });
      if (res.success) {
        toast.success(res.message);
        setGlobalCurrency(currency);
        // Refresh local details
        const updatedUser = await getCurrentUserAction();
        setCurrentUser(updatedUser);
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setProfileSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setPasswordUpdating(true);
    try {
      const res = await updatePasswordAction({ currentPassword, newPassword });
      if (res.success) {
        toast.success(res.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(res.message || "Failed to update password");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setPasswordUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
        <PageHeader title="Settings" />
        <main className="flex-1 flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Settings Panel...</p>
        </main>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <PageHeader title="Settings" />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          
          {/* Tab Navigation (Only visible to admin) */}
          {isAdmin && (
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit mb-10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
              <button 
                onClick={() => setActiveTab("general")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300",
                  activeTab === "general" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Settings className="h-4 w-4" />
                General
              </button>
              <button 
                onClick={() => setActiveTab("diagnostics")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300",
                  activeTab === "diagnostics" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 hover:text-slate-900"
                )}
              >
                <Activity className="h-4 w-4" />
                Diagnostics
              </button>
            </div>
          )}

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {(!isAdmin || activeTab === "general") ? (
              <div className="space-y-8">
                
                {/* 1. Profile Settings Form Card */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <div className="p-8 border-b border-slate-100 flex items-center gap-5">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                      <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight">Profile Settings</h2>
                      <p className="text-xs text-slate-400 font-medium">Manage your public profile and account details.</p>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Full Name</label>
                        <input 
                          type="text" 
                          value={name} 
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-5 py-4 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                        <input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-5 py-4 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                          placeholder="Enter your email address"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Bio</label>
                      <textarea 
                        value={bio} 
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full px-5 py-4 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all resize-none"
                        placeholder="Tell us about yourself..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Default Currency</label>
                        <div className="relative">
                          <select 
                            value={currency} 
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-5 py-4 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all appearance-none cursor-pointer"
                          >
                            <option value="INR">INR (₹) - Indian Rupee</option>
                            <option value="USD">USD ($) - US Dollar</option>
                            <option value="EUR">EUR (€) - Euro</option>
                            <option value="GBP">GBP (£) - British Pound</option>
                          </select>
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-end justify-end">
                        <button 
                          type="button"
                          onClick={handleSaveProfile}
                          disabled={profileSaving}
                          className="w-full md:w-auto px-8 py-4 text-[10px] font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest"
                        >
                          {profileSaving ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              Saving Profile...
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              Save Profile Settings
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Security Settings Form Card */}
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                  <div className="p-8 border-b border-slate-100 flex items-center gap-5">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-900 tracking-tight">Security</h2>
                      <p className="text-xs text-slate-400 font-medium">Keep your account secure and manage access.</p>
                    </div>
                  </div>
                  
                  <div className="p-8 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Password</label>
                        <input 
                          type="password" 
                          value={currentPassword} 
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-5 py-4 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                        <input 
                          type="password" 
                          value={newPassword} 
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full px-5 py-4 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm Password</label>
                        <input 
                          type="password" 
                          value={confirmPassword} 
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full px-5 py-4 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-2xl focus:bg-white focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 transition-all"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button 
                        type="button"
                        onClick={handleUpdatePassword}
                        disabled={passwordUpdating}
                        className="w-full md:w-auto px-8 py-4 text-[10px] font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest"
                      >
                        {passwordUpdating ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Updating Password...
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" />
                            Update Password
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Reset Workspace action available to standard users under General tab */}
                <ResetWorkspaceButton />
              </div>
            ) : (
              <DiagnosticsView />
            )}
          </div>

        </div>
      </main>
    </div>
  );
}


