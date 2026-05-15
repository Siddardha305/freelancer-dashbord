'use client'

import { useState } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { User, Bell, Shield, Settings, Activity } from "lucide-react";
import { DiagnosticsView } from "@/features/diagnostics/components/DiagnosticsView";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "diagnostics">("general");

  const sections = [
    {
      title: "Profile Settings",
      description: "Manage your public profile and account details.",
      icon: User,
      fields: ["Full Name", "Email Address", "Bio", "Profile Image", "Default Currency"]
    },
    {
      title: "Notifications",
      description: "Configure how you receive alerts and updates.",
      icon: Bell,
      fields: ["Email Notifications", "Push Notifications", "Monthly Reports"]
    },
    {
      title: "Security",
      description: "Keep your account secure and manage access.",
      icon: Shield,
      fields: ["Change Password", "Two-Factor Auth", "Active Sessions"]
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <PageHeader title="Settings" />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 w-fit mb-10 shadow-sm">
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

          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {activeTab === "general" ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8">
                  {sections.map((section) => (
                    <div key={section.title} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden group hover:shadow-md transition-all">
                      <div className="p-8 border-b border-slate-100 flex items-center gap-5">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                          <section.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 tracking-tight">{section.title}</h2>
                          <p className="text-xs text-slate-400 font-medium">{section.description}</p>
                        </div>
                      </div>
                      <div className="p-8 space-y-6">
                        {section.fields.map((field) => (
                          <div key={field} className="flex items-center justify-between group/field">
                            <span className="text-sm font-bold text-slate-600 group-hover/field:text-slate-900 transition-colors">{field}</span>
                            <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:bg-indigo-50 px-4 py-2 rounded-xl transition-all active:scale-95">
                              Configure
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-100 rounded-2xl transition-all">
                    Discard Changes
                  </button>
                  <button className="px-10 py-4 text-[10px] font-black text-white bg-indigo-600 rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95">
                    Save All Settings
                  </button>
                </div>
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
