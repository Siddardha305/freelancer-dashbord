'use client'

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { User, Shield, Settings, Activity, Loader2, Check, Zap, Sparkles, ShieldAlert, Lock, Upload } from "lucide-react";
import { DiagnosticsView } from "@/dashboard/diagnostics/components/DiagnosticsView";
import { ResetWorkspaceButton } from "@/dashboard/diagnostics/components/ResetWorkspaceButton";
import { getCurrentUserAction, updateProfileAction, updatePasswordAction } from "@/auth/actions/auth-actions";
import { cn, resizeAndCompressLogo } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCurrency } from "@/context/CurrencyContext";
import { useWorkspace, WorkspaceType } from "@/context/WorkspaceContext";
import { usePlan } from "@/context/PlanContext";
import { PlanId } from "@/lib/plans";
import { useQuery } from "@tanstack/react-query";
import { getClientsAction } from "@/dashboard/clients/client-actions";
import { getWorksAction } from "@/dashboard/work/actions/work-actions";
import { Work } from "@/types/work";
import { Client } from "@/types/client";
import { RadixSelect } from "@/components/ui/RadixAnimate";

const currencyOptions = [
  { value: "INR", label: "INR (₹) - Indian Rupee" },
  { value: "USD", label: "USD ($) - US Dollar" },
  { value: "EUR", label: "EUR (€) - Euro" },
  { value: "GBP", label: "GBP (£) - British Pound" }
];

const workspaceOptions = [
  { value: "video_editing", label: "Video Editing & Design (Thumbnails)" },
  { value: "photography", label: "Photography & Media (Shoots)" },
  { value: "digital_marketing", label: "Digital Marketing (Campaigns)" },
  { value: "general", label: "General Freelancing (Deliverables)" },
  { value: "corporate", label: "Corporate Workspace" }
];

export default function SettingsPage() {
  const router = useRouter();
  const { setCurrency: setGlobalCurrency } = useCurrency();
  const { terms, setWorkspaceType: setGlobalWorkspaceType } = useWorkspace();
  const [activeTab, setActiveTab] = useState<"general" | "pricing" | "diagnostics">(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'pricing' || tab === 'diagnostics' || tab === 'general') {
        return tab as "general" | "pricing" | "diagnostics";
      }
    }
    return "general";
  });
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role?: string; currency?: string; plan?: string; workspaceType?: string; teamRole?: string } | null>(null);
  const isEditor = currentUser?.teamRole === 'editor';
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [currency, setCurrency] = useState("INR");
  const [workspaceType, setWorkspaceType] = useState<"video_editing" | "digital_marketing" | "photography" | "general" | "corporate">("video_editing");
  const [agencyName, setAgencyName] = useState("");
  const [agencyLogoUrl, setAgencyLogoUrl] = useState("");
  const [agencyLogoDarkUrl, setAgencyLogoDarkUrl] = useState("");
  const [agencyScannerUrl, setAgencyScannerUrl] = useState("");
  const [agencyBrandingMode, setAgencyBrandingMode] = useState<"logo" | "text" | "both">("both");
  const [profileSaving, setProfileSaving] = useState(false);
  const [brandingResetting, setBrandingResetting] = useState(false);

  // Security Form States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordUpdating, setPasswordUpdating] = useState(false);

  const { plan: currentPlanId, limits } = usePlan();

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClientsAction,
  });

  const { data: tasks = [] } = useQuery({
    queryKey: ['works'],
    queryFn: getWorksAction,
  });

  const totalClients = (clients as Client[]).length;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const monthlyTasksCount = (tasks as Work[]).filter((t: Work) => {
    if (!t.createdAt) return false;
    const d = new Date(t.createdAt);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;


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
          setWorkspaceType((user.workspaceType as WorkspaceType) || "video_editing");
          setAgencyName(user.agencyName || "");
          setAgencyLogoUrl(user.agencyLogoUrl || "");
          setAgencyLogoDarkUrl(user.agencyLogoDarkUrl || "");
          setAgencyScannerUrl(user.agencyScannerUrl || "");
          setAgencyBrandingMode((user.agencyBrandingMode as "logo" | "text" | "both") || "both");
          if (user.teamRole === 'editor' && activeTab === 'pricing') {
            setActiveTab('general');
          }
        }
      } catch (error) {
        console.error("Failed to load settings user:", error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();

  }, [activeTab]);

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
      const res = await updateProfileAction({ 
        name, 
        email, 
        bio, 
        currency,
        workspaceType,
        agencyName: agencyName.trim() || undefined,
        agencyLogoUrl: agencyLogoUrl.trim() || undefined,
        agencyLogoDarkUrl: agencyLogoDarkUrl.trim() || undefined,
        agencyScannerUrl: agencyScannerUrl.trim() || undefined,
        agencyBrandingMode: agencyBrandingMode || "both",
      });
      if (res.success) {
        toast.success(res.message);
        setGlobalCurrency(currency);
        setGlobalWorkspaceType(workspaceType);
        // Refresh local details
        const updatedUser = await getCurrentUserAction();
        setCurrentUser(updatedUser);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(message);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleResetBranding = async () => {
    if (!confirm("Are you sure you want to completely reset your agency branding to defaults? This will clear all custom logos and your agency name.")) {
      return;
    }
    setBrandingResetting(true);
    try {
      const res = await updateProfileAction({
        name,
        email,
        bio,
        currency,
        agencyName: undefined,
        agencyLogoUrl: undefined,
        agencyLogoDarkUrl: undefined,
        agencyScannerUrl: undefined,
        agencyBrandingMode: "both",
      });
      if (res.success) {
        toast.success("Agency branding reset to default!");
        setAgencyName("");
        setAgencyLogoUrl("");
        setAgencyLogoDarkUrl("");
        setAgencyScannerUrl("");
        setAgencyBrandingMode("both");
        const updatedUser = await getCurrentUserAction();
        setCurrentUser(updatedUser);
        router.refresh();
      } else {
        toast.error(res.message || "Failed to reset branding");
      }
    } catch {
      toast.error("Failed to reset branding settings");
    } finally {
      setBrandingResetting(false);
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
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(message);
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
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit mb-10 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
            <button 
              onClick={() => setActiveTab("general")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer",
                activeTab === "general" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              )}
            >
              <Settings className="h-4 w-4" />
              General
            </button>

            {!isEditor && (
              <button 
                onClick={() => setActiveTab("pricing")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300 cursor-pointer",
                  activeTab === "pricing" ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Zap className="h-4 w-4" />
                Pricing
              </button>
            )}
            {isAdmin && (
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
            )}
          </div>

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "general" && (
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

                    <div className={cn("grid grid-cols-1 gap-6", workspaceType !== 'corporate' ? "md:grid-cols-2" : "w-full")}>
                      {workspaceType !== 'corporate' && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Default Currency</label>
                          <RadixSelect 
                            value={currency} 
                            onValueChange={(val) => setCurrency(val)}
                            options={currencyOptions}
                            disabled={isEditor}
                          />
                        </div>
                      )}
 
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Workspace Niche / Type</label>
                        <RadixSelect 
                          value={workspaceType} 
                          onValueChange={(val) => setWorkspaceType(val as WorkspaceType)}
                          options={workspaceOptions}
                          disabled={true}
                        />
                        <p className="text-[10px] text-slate-400 font-medium">
                          To change your workspace type, contact the system administrator.
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <button 
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={profileSaving}
                        className="w-full md:w-auto px-8 py-4 text-[10px] font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest"
                      >
                        {profileSaving ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            <span>Saving Profile...</span>
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Save Profile Settings</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Security Settings Form Card */}
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
                            <span>Updating Password...</span>
                          </>
                        ) : (
                          <>
                            <Shield className="h-4 w-4" />
                            <span>Update Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Agency Branding Settings (White-Label) */}
                {!isEditor && (
                  <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-md transition-all relative">
                    {!limits.whitelabelPortals ? (
                      <div className="absolute inset-0 bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-[2px] z-10 flex flex-col items-center justify-center p-8 text-center space-y-4">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                          <Lock className="h-6 w-6" />
                        </div>
                        <div className="space-y-1 max-w-sm">
                          <h3 className="font-bold text-slate-900 dark:text-slate-50">Agency Branding is Locked</h3>
                          <p className="text-xs text-slate-555 dark:text-slate-400">Upgrade to the elite **Agency Plan** to customize your dashboard logos, colors, and layout white-labeling.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setActiveTab("pricing")}
                          className="px-6 py-3 text-[10px] font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all cursor-pointer uppercase tracking-widest shadow-md active:scale-95"
                        >
                          Upgrade Plan
                        </button>
                      </div>
                    ) : null}

                    <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center gap-5">
                      <div className="p-3 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl group-hover:scale-110 transition-transform">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-50 tracking-tight">Agency Branding (White-Label)</h2>
                        <p className="text-xs text-slate-400 dark:text-slate-505 font-medium">Customize your primary dashboard logo and brand name.</p>
                      </div>
                    </div>
                    
                    <div className="p-8 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Agency Name</label>
                          <input 
                            type="text" 
                            value={agencyName} 
                            onChange={(e) => setAgencyName(e.target.value)}
                            className="w-full px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-955/40 transition-all"
                            placeholder="Replaces 'FreelanceOS' in Sidebar"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Branding Display Mode</label>
                          <select
                            value={agencyBrandingMode}
                            onChange={(e) => setAgencyBrandingMode(e.target.value as "logo" | "text" | "both")}
                            className="w-full px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-955/40 transition-all cursor-pointer"
                          >
                            <option value="both">Both Logo & Text</option>
                            <option value="logo">Logo Only</option>
                            <option value="text">Text Only</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Agency Logo (Light Theme)</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={agencyLogoUrl} 
                              onChange={(e) => setAgencyLogoUrl(e.target.value)}
                              className="flex-1 px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-955/40 transition-all min-w-0"
                              placeholder="Light backdrop logo URL or Base64"
                            />
                            <label className="flex items-center justify-center px-6 py-4 bg-indigo-50 dark:bg-indigo-955/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 select-none active:scale-95">
                              <Upload className="h-4 w-4 mr-1.5" />
                              <span>Upload</span>
                              <input 
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 2 * 1024 * 1024) {
                                    toast.error("File is too large (max 2MB)");
                                    return;
                                  }
                                  try {
                                    const compressed = await resizeAndCompressLogo(file);
                                    setAgencyLogoUrl(compressed);
                                    toast.success("Light logo uploaded and optimized!");
                                  } catch (err) {
                                    toast.error("Failed to process image");
                                    console.error(err);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Agency Logo (Dark Theme)</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={agencyLogoDarkUrl} 
                              onChange={(e) => setAgencyLogoDarkUrl(e.target.value)}
                              className="flex-1 px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-955/40 transition-all min-w-0"
                              placeholder="Dark backdrop logo URL or Base64"
                            />
                            <label className="flex items-center justify-center px-6 py-4 bg-indigo-50 dark:bg-indigo-955/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 select-none active:scale-95">
                              <Upload className="h-4 w-4 mr-1.5" />
                              <span>Upload</span>
                              <input 
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 2 * 1024 * 1024) {
                                    toast.error("File is too large (max 2MB)");
                                    return;
                                  }
                                  try {
                                    const compressed = await resizeAndCompressLogo(file);
                                    setAgencyLogoDarkUrl(compressed);
                                    toast.success("Dark logo uploaded and optimized!");
                                  } catch (err) {
                                    toast.error("Failed to process image");
                                    console.error(err);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {agencyLogoUrl && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Light Logo Preview</label>
                            <div className="h-16 w-32 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-3 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={agencyLogoUrl} 
                                alt="Light Logo Preview" 
                                className="h-full w-full object-contain"
                              />
                            </div>
                          </div>
                        )}
                        {agencyLogoDarkUrl && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Dark Logo Preview</label>
                            <div className="h-16 w-32 rounded-xl bg-slate-950 border border-slate-850 flex items-center justify-center p-3 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={agencyLogoDarkUrl} 
                                alt="Dark Logo Preview" 
                                className="h-full w-full object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">Payment QR Scanner Code</label>
                          <div className="flex gap-2">
                            <input 
                              type="text" 
                              value={agencyScannerUrl} 
                              onChange={(e) => setAgencyScannerUrl(e.target.value)}
                              className="flex-1 px-5 py-4 text-sm font-semibold text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-2xl focus:bg-white dark:focus:bg-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-50 dark:focus:ring-indigo-955/40 transition-all min-w-0"
                              placeholder="QR scanner image URL or Base64 data"
                            />
                            <label className="flex items-center justify-center px-6 py-4 bg-indigo-50 dark:bg-indigo-955/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 select-none active:scale-95">
                              <Upload className="h-4 w-4 mr-1.5" />
                              <span>Upload</span>
                              <input 
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (!file) return;
                                  if (file.size > 2 * 1024 * 1024) {
                                    toast.error("File is too large (max 2MB)");
                                    return;
                                  }
                                  try {
                                    const compressed = await resizeAndCompressLogo(file);
                                    setAgencyScannerUrl(compressed);
                                    toast.success("QR scanner uploaded and optimized!");
                                  } catch (err) {
                                    toast.error("Failed to process image");
                                    console.error(err);
                                  }
                                }}
                              />
                            </label>
                          </div>
                        </div>

                        {agencyScannerUrl && (
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">Scanner QR Preview</label>
                            <div className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center p-2 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img 
                                src={agencyScannerUrl} 
                                alt="Scanner QR Preview" 
                                className="h-full w-full object-contain"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                        <button 
                          type="button"
                          onClick={handleResetBranding}
                          disabled={brandingResetting || profileSaving}
                          className="w-full sm:w-auto px-8 py-4 text-[10px] font-black text-slate-650 dark:text-slate-355 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest border border-slate-200 dark:border-slate-700"
                        >
                          {brandingResetting ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Resetting...</span>
                            </>
                          ) : (
                            <span>Reset to Default</span>
                          )}
                        </button>
                        <button 
                          type="button"
                          onClick={handleSaveProfile}
                          disabled={profileSaving || brandingResetting}
                          className="w-full sm:w-auto px-8 py-4 text-[10px] font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 dark:shadow-none active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-widest"
                        >
                          {profileSaving ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Saving Branding...</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-4 w-4" />
                              <span>Save Branding Settings</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset Workspace action available to standard users under General tab */}
                {!isEditor && <ResetWorkspaceButton />}
              </div>
            )}

            {activeTab === "pricing" && (
              <div className="space-y-8">
                {/* Subscription Management Notice */}
                <div className="bg-amber-50/50 border border-amber-100 rounded-[2rem] p-6 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="h-10 w-10 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <ShieldAlert className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">Plan Upgrades Restricted</h4>
                    <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                      Subscription plan options are managed exclusively by the system administrator. Users are permitted to review details, but changes must be authorized and processed by <strong className="text-indigo-600">Siddardha Admin</strong> inside the System Console.
                    </p>
                  </div>
                </div>

                {/* Plan limit info alert */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                      <Zap className="h-4 w-4 text-indigo-600" />
                      Current Active plan: <span className="font-extrabold text-indigo-600">{currentPlanId.toUpperCase()}</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      You are currently using <span className="text-slate-700 font-bold">{totalClients} / {limits.maxClients === Infinity ? '∞' : limits.maxClients} client(s)</span> and <span className="text-slate-700 font-bold">{monthlyTasksCount} / {limits.maxTasksPerMonth === Infinity ? '∞' : limits.maxTasksPerMonth} {terms.singular.toLowerCase()}(s)</span> this month.
                    </p>
                  </div>
                  
                  {/* Monthly/Yearly switch */}
                  <div className="flex items-center gap-4 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 shrink-0">
                    <button
                      onClick={() => setBillingCycle('monthly')}
                      className={cn(
                        "px-5 py-2 text-xs font-bold rounded-xl transition-all duration-300",
                        billingCycle === 'monthly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      )}
                    >
                      Monthly
                    </button>
                    <button
                      onClick={() => setBillingCycle('yearly')}
                      className={cn(
                        "px-5 py-2 text-xs font-bold rounded-xl transition-all duration-300 flex items-center gap-1.5",
                        billingCycle === 'yearly' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                      )}
                    >
                      Yearly
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-600 text-[8px] font-bold">SAVE 20%</span>
                    </button>
                  </div>
                </div>

                {/* Pricing Cards Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4 items-stretch">
                  {(() => {
                    const prices = {
                      hobby: { monthly: 0, yearly: 0 },
                      pro: { monthly: 2499, yearly: 1999 },
                      agency: { monthly: 7499, yearly: 5999 }
                    };

                    const plans = [
                      {
                        id: 'hobby' as PlanId,
                        name: "Hobby",
                        price: prices.hobby[billingCycle],
                        description: "Perfect for independent creators just starting out.",
                        features: [
                          "Up to 2 active clients",
                          `5 ${terms.singular.toLowerCase()} deliveries / mo`,
                          "1 visual Kanban workboard",
                          "Single-user private workspace",
                          "Standard ledger tracking"
                        ],
                        cta: "Get Started Free",
                        popular: false,
                        colors: {
                          border: 'border-slate-200/80',
                          bg: 'bg-white',
                          text: 'text-slate-900',
                          badge: 'text-slate-500 bg-slate-100 border-slate-200',
                          iconBg: 'bg-slate-100 border-slate-200',
                          iconText: 'text-slate-500',
                          button: 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-100'
                        }
                      },
                      {
                        id: 'pro' as PlanId,
                        name: "Pro",
                        price: prices.pro[billingCycle],
                        description: "Designed for active freelancers scaling their client load.",
                        features: [
                          "Up to 15 active clients",
                          `Unlimited ${terms.singular.toLowerCase()} deliveries`,
                          "Dedicated revision history trackers",
                          "3 collaborative team seats",
                          "Custom welcome email templates",
                          "Direct CSV ledger exports"
                        ],
                        cta: "Start 14-Day Free Trial",
                        popular: true,
                        colors: {
                          border: 'border-indigo-200',
                          bg: 'bg-white',
                          text: 'text-slate-900',
                          badge: 'text-indigo-600 bg-indigo-50 border-indigo-150',
                          iconBg: 'bg-indigo-55/10 border-indigo-100',
                          iconText: 'text-indigo-600',
                          button: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100 hover:shadow-indigo-200'
                        }
                      },
                      {
                        id: 'agency' as PlanId,
                        name: "Agency",
                        price: prices.agency[billingCycle],
                        description: "Built for elite production agencies and growing teams.",
                        features: [
                          "Unlimited active clients",
                          `Unlimited ${terms.singular.toLowerCase()} deliveries`,
                          "10 collaborative team seats",
                          "Role-based workspace permissions",
                          "Custom domain sending verified",
                          "Priority Slack integrations"
                        ],
                        cta: "Upgrade to Agency",
                        popular: false,
                        colors: {
                          border: 'border-purple-200',
                          bg: 'bg-white',
                          text: 'text-slate-900',
                          badge: 'text-purple-600 bg-purple-50 border-purple-150',
                          iconBg: 'bg-purple-55/10 border-purple-100',
                          iconText: 'text-purple-600',
                          button: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-100 hover:shadow-purple-200'
                        }
                      }
                    ];

                    return plans.map((plan, idx) => {
                      const isActive = currentPlanId === plan.id;
                      const pColors = plan.colors;

                      return (
                        <div
                          key={idx}
                          className={cn(
                            "rounded-[2.5rem] p-8 sm:p-10 border transition-all duration-300 flex flex-col justify-between relative bg-white min-h-[550px]",
                            plan.popular 
                              ? 'border-indigo-500 ring-2 ring-indigo-500/10 shadow-xl lg:-translate-y-2' 
                              : 'border-slate-200/80 shadow-sm hover:border-slate-350 hover:shadow-md',
                            isActive && 'ring-2 ring-emerald-500/20 border-emerald-500'
                          )}
                        >
                          {plan.popular && (
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-[9px] font-black tracking-widest uppercase px-5 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                              <Sparkles className="h-3 w-3 fill-white animate-pulse" /> Recommended Tier
                            </span>
                          )}

                          {isActive && !plan.popular && (
                            <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-[9px] font-black tracking-widest uppercase px-5 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
                              Current Active Plan
                            </span>
                          )}

                          <div className="space-y-8 flex-1 flex flex-col justify-between">
                            <div className="space-y-6">
                              {/* Header */}
                              <div>
                                <h4 className="text-lg font-black text-slate-900 uppercase tracking-wider">{plan.name}</h4>
                                <p className="text-xs font-semibold text-slate-400 leading-relaxed mt-2 min-h-[32px]">{plan.description}</p>
                              </div>

                              {/* Price */}
                              <div className="flex items-baseline gap-1 pt-2">
                                {plan.price === 0 ? (
                                  <span className="text-4xl font-black text-slate-900 tracking-tighter">Free</span>
                                ) : (
                                  <>
                                    <span className="text-xl font-black text-slate-400 self-start mt-1">₹</span>
                                    <span className="text-4xl font-black text-slate-900 tracking-tighter">
                                      {plan.price.toLocaleString('en-IN')}
                                    </span>
                                  </>
                                )}
                                {plan.price > 0 && (
                                  <span className="text-xs font-bold text-slate-400 lowercase tracking-wider">/ month</span>
                                )}
                              </div>

                              {/* Yearly Savings Callout */}
                              {plan.price > 0 && billingCycle === 'yearly' && (
                                <div className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg w-fit uppercase tracking-wider">
                                  Save ₹{((plan.id === 'pro' ? 2499 - 1999 : 7499 - 5999) * 12).toLocaleString('en-IN')} / year
                                </div>
                              )}

                              <hr className="border-slate-100" />

                              {/* Features List */}
                              <ul className="space-y-4">
                                {plan.features.map((feature, fIdx) => (
                                  <li key={fIdx} className="flex items-start gap-3.5 text-xs text-slate-600 font-semibold leading-normal">
                                    <div className={cn(
                                      "h-5 w-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5",
                                      pColors.iconBg
                                    )}>
                                      <Check className={cn("h-3.5 w-3.5", pColors.iconText)} />
                                    </div>
                                    <span className="pt-0.5">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            {/* Actions */}
                            <div className="pt-10">
                              {isActive ? (
                                <button
                                  disabled
                                  className="w-full py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  <Check className="h-4 w-4" />
                                  Active Tier
                                </button>
                              ) : (
                                <button
                                  disabled
                                  className="w-full py-4.5 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-slate-50 border border-slate-200 text-slate-400 cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                  Contact Admin to Change
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Pricing disclaimer */}
                <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-6">
                  All prices in Indian Rupees (₹) · GST applicable as per Indian tax regulations · Cancel anytime
                </p>
              </div>
            )}

            {activeTab === "diagnostics" && isAdmin && (
              <DiagnosticsView />
            )}
          </div>

        </div>
      </main>
    </div>
  );
}


