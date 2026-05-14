import { PageHeader } from "@/components/shared/PageHeader";
import { User, Bell, Shield, Palette, Globe, Mail } from "lucide-react";

export default function SettingsPage() {
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
    },
    {
      title: "Appearance",
      description: "Customize the look and feel of your dashboard.",
      icon: Palette,
      fields: ["Dark Mode", "Primary Color", "Compact View"]
    }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gray-50/50">
      <PageHeader title="Settings" />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          
          <div className="grid grid-cols-1 gap-8">
            {sections.map((section) => (
              <div key={section.title} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center gap-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{section.title}</h2>
                    <p className="text-sm text-gray-500">{section.description}</p>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  {section.fields.map((field) => (
                    <div key={field} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{field}</span>
                      <button className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              Discard Changes
            </button>
            <button className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              Save All Settings
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}
