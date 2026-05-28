"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { 
  Settings2, 
  Palette, 
  Image as ImageIcon, 
  Globe, 
  ShieldAlert, 
  Check, 
  Copy, 
  Eye, 
  RefreshCw,
  Upload
} from "lucide-react";
import { Client } from "@/types/client";
import { generatePortalTokenAction, updatePortalSettingsAction } from "@/dashboard/clients/actions/client-actions";
import { resizeAndCompressLogo } from "@/lib/utils";

interface ClientPortalSettingsFormProps {
  client: Client;
  onSuccess?: (updatedClient: Client) => void;
}

/**
 * NOTE: This component uses a `key` prop from the parent (keyed by client.id)
 * to reset all state automatically when the selected client changes, instead of
 * syncing with useEffect. This avoids cascading renders (react-hooks/set-state-in-effect).
 */
export function ClientPortalSettingsForm({ client, onSuccess }: ClientPortalSettingsFormProps) {
  const defaultSlug = client.portalSlug ||
    client.name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

  const [portalActive, setPortalActive] = useState(client.portalActive || false);
  const [portalSlug, setPortalSlug] = useState(defaultSlug);
  const [portalPrimaryColor, setPortalPrimaryColor] = useState(client.portalPrimaryColor || '#4f46e5');
  const [portalLogoUrl, setPortalLogoUrl] = useState(client.portalLogoUrl || '');
  const [portalToken, setPortalToken] = useState(client.portalToken || '');

  const [isUpdatingPortal, setIsUpdatingPortal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isRegeneratingToken, setIsRegeneratingToken] = useState(false);

  const handleSavePortalSettings = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsUpdatingPortal(true);
    try {
      const res = await updatePortalSettingsAction(client.id, {
        portalActive,
        portalSlug,
        portalPrimaryColor,
        portalLogoUrl,
      });

      if (res.success && res.client) {
        toast.success("Portal settings updated successfully");
        setPortalActive(res.client.portalActive || false);
        setPortalSlug(res.client.portalSlug || '');
        setPortalPrimaryColor(res.client.portalPrimaryColor || '#4f46e5');
        setPortalLogoUrl(res.client.portalLogoUrl || '');
        setPortalToken(res.client.portalToken || '');
        if (onSuccess) onSuccess(res.client);
      } else {
        toast.error(res.message || "Failed to update portal settings");
      }
    } catch (error) {
      console.error("Failed to save portal settings:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsUpdatingPortal(false);
    }
  };

  const handleRegenerateToken = async () => {
    if (!confirm("Are you sure you want to regenerate the secure token? This will immediately invalidate the current portal link shared with this client.")) {
      return;
    }
    setIsRegeneratingToken(true);
    try {
      const res = await generatePortalTokenAction(client.id);
      if (res.success && res.token && res.client) {
        toast.success("Secure access token regenerated");
        setPortalToken(res.token);
        if (onSuccess) onSuccess(res.client);
      } else {
        toast.error(res.message || "Failed to regenerate token");
      }
    } catch (error) {
      console.error("Failed to regenerate portal token:", error);
      toast.error("An error occurred");
    } finally {
      setIsRegeneratingToken(false);
    }
  };

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const link = `${origin}/portal/${portalSlug}?token=${portalToken}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    toast.success("Portal link copied to clipboard");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const portalLink = typeof window !== 'undefined' 
    ? `${window.location.origin}/portal/${portalSlug}?token=${portalToken}` 
    : `/portal/${portalSlug}?token=${portalToken}`;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 animate-in fade-in duration-200">
      {/* Settings Form Column */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSavePortalSettings} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-sm dark:shadow-none space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-850 gap-4">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-indigo-500" />
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-50">Portal Configurations</h3>
                <p className="text-xs text-slate-450 dark:text-slate-500 mt-0.5">Define access permissions and customizable parameters</p>
              </div>
            </div>
            
            {/* Active Toggle Switch */}
            <label className="relative inline-flex items-center cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={portalActive}
                onChange={(e) => setPortalActive(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-700 peer-checked:bg-indigo-650"></div>
              <span className="ms-3 text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                {portalActive ? "Active" : "Disabled"}
              </span>
            </label>
          </div>

          {/* Slug Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">Portal URL Slug</label>
            <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <span className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-850 text-slate-400 text-xs font-semibold select-none flex items-center border-r border-slate-200 dark:border-slate-800">
                /portal/
              </span>
              <input 
                type="text" 
                required
                placeholder="client-name-slug"
                value={portalSlug}
                onChange={(e) => setPortalSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''))}
                className="flex-1 px-4 py-2.5 bg-transparent text-xs font-semibold text-slate-950 dark:text-slate-100 placeholder:text-slate-450 focus:outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-normal">
              This forms the URL slug for the portal. Only lowercase alphanumeric characters and dashes are permitted.
            </p>
          </div>

          {/* Primary Theme Accent Color picker */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block flex items-center gap-1.5">
              <Palette className="h-4 w-4 text-indigo-500 shrink-0" /> Theme Highlight Color
            </label>
            <div className="flex items-center gap-3">
              <input 
                type="color"
                value={portalPrimaryColor}
                onChange={(e) => setPortalPrimaryColor(e.target.value)}
                className="w-12 h-10 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer bg-transparent p-0.5"
              />
              <input 
                type="text"
                maxLength={7}
                value={portalPrimaryColor}
                onChange={(e) => setPortalPrimaryColor(e.target.value)}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-slate-850 dark:text-slate-100 focus:outline-none"
              />
            </div>
          </div>

          {/* Logo Image URL Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4 text-indigo-500 shrink-0" /> Custom Logo
            </label>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="https://example.com/logo.png or Base64"
                value={portalLogoUrl}
                onChange={(e) => setPortalLogoUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-955 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none min-w-0"
              />
              <label className="flex items-center justify-center px-4 py-3 bg-indigo-50 dark:bg-indigo-955/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 select-none active:scale-95">
                <Upload className="h-4 w-4 mr-1.5" />
                <span>Upload</span>
                <input 
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      toast.error("File is too large (max 5MB)");
                      return;
                    }
                    try {
                      const compressed = await resizeAndCompressLogo(file);
                      setPortalLogoUrl(compressed);
                      toast.success("Portal logo uploaded and optimized!");
                    } catch (err) {
                      toast.error("Failed to process image");
                      console.error(err);
                    }
                  }}
                />
              </label>
            </div>
            {portalLogoUrl && (
              <div className="pt-2">
                <p className="text-[10px] text-slate-405 dark:text-slate-500 font-bold mb-1.5 uppercase">Branding Logo Preview</p>
                <div className="h-16 w-32 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 flex items-center justify-center p-3 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={portalLogoUrl} 
                    alt="Branding Logo" 
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingPortal}
              className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isUpdatingPortal ? "Saving Configuration..." : "Save Portal Settings"}
            </button>
          </div>
        </form>
      </div>

      {/* Portal Link Preview Sidebar Column */}
      <div className="space-y-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm dark:shadow-none space-y-5">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Globe className="h-4.5 w-4.5 text-indigo-500 animate-pulse" /> Public Portal Link
          </h4>

          {!portalActive ? (
            <div className="p-4.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100/80 dark:border-amber-900/30 text-xs text-amber-800 dark:text-amber-400 leading-normal space-y-1.5 animate-in fade-in duration-300">
              <p className="font-bold flex items-center gap-1">
                <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" /> Portal is Disabled
              </p>
              <p className="font-medium text-[11px] leading-relaxed">
                Toggle portal status to <strong>Active</strong> and save settings to authorize public client access.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-855 space-y-2">
                <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 dark:text-slate-500 block">Secure Tokenized URL</span>
                <p className="text-[11px] font-mono font-bold text-slate-700 dark:text-slate-350 break-all select-all leading-relaxed">
                  {portalLink}
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-xl text-xs font-bold transition-all active:scale-[0.98] cursor-pointer"
                >
                  {copiedLink ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedLink ? "Copied Link!" : "Copy Portal Link"}
                </button>

                {portalSlug && portalToken && (
                  <a
                    href={`/portal/${portalSlug}?token=${portalToken}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-750 dark:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-[0.98]"
                  >
                    <Eye className="h-4 w-4" /> Launch Portal View
                  </a>
                )}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={handleRegenerateToken}
                  disabled={isRegeneratingToken}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-300 text-[10px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isRegeneratingToken ? 'animate-spin' : ''}`} /> Reset Access Token
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
