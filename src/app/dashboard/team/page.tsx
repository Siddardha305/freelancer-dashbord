'use client'

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Lock, 
  ArrowRight, 
  Loader2, 
  Shield, 
  Mail, 
  Plus, 
  Check, 
  X,
  Zap,
  BarChart3,
  DollarSign,
  Clock,
  Briefcase,
  ChevronRight,
  TrendingUp,
  Settings
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { usePlan } from '@/context/PlanContext';
import { getCurrentUserAction } from '@/auth/actions/auth-actions';
import { 
  getTeamMembersAction, 
  inviteTeamMemberAction, 
  updateTeamMemberRoleAction, 
  deleteTeamMemberAction,
  updateTeamMemberRateAction,
  getTeamMemberStatsAction
} from '@/dashboard/settings/actions/team-actions';
import { RadixSelect } from '@/components/ui/RadixAnimate';

const roleOptions = [
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' }
];

const inviteRoleOptions = [
  { value: 'editor', label: 'Editor (Task Assignee)' },
  { value: 'admin', label: 'Workspace Admin (Full Control)' },
  { value: 'viewer', label: 'Viewer (Read-Only)' }
];

const invitePaymentOptions = [
  { value: 'per_thumbnail', label: 'Per Thumbnail' },
  { value: 'hourly', label: 'Hourly Rate' },
  { value: 'salary', label: 'Fixed Salary' }
];

const statsPaymentOptions = [
  { value: 'per_thumbnail', label: 'Per Completed Thumbnail' },
  { value: 'hourly', label: 'Hourly Billing' },
  { value: 'salary', label: 'Monthly Flat Rate' }
];

export default function TeamPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { plan } = usePlan();
  const isAgency = plan === 'agency';

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUserAction();
        if (user?.teamRole === 'editor') {
          router.replace('/dashboard/work');
          return;
        }
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to load user on team page:", err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, [router]);

  const isOwner = currentUser?.teamRole === 'owner' || !currentUser?.teamRole;
  const isOwnerOrAdmin = isOwner || currentUser?.teamRole === 'admin';

  // State for invite form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [inviteRate, setInviteRate] = useState<number>(0);
  const [invitePaymentType, setInvitePaymentType] = useState<'per_thumbnail' | 'hourly' | 'salary'>('per_thumbnail');
  const [isInviteOpen, setIsInviteOpen] = useState(false);

  // State for stats view
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  // Fetch team members
  const { data: members = [], isLoading } = useQuery({
    queryKey: ['teamMembers'],
    queryFn: getTeamMembersAction,
    enabled: isAgency,
    refetchInterval: 8000,
  });

  // Invite member mutation
  const inviteMutation = useMutation({
    mutationFn: inviteTeamMemberAction,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        setName('');
        setEmail('');
        setPassword('');
        setRole('editor');
        setInviteRate(0);
        setInvitePaymentType('per_thumbnail');
        setIsInviteOpen(false);
        queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      } else {
        toast.error(res.message || 'Failed to invite team member');
      }
    },
    onError: (err) => {
      toast.error('An error occurred. Please try again.');
      console.error(err);
    }
  });

  // Update role mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ memberId, role }: { memberId: string, role: 'admin' | 'editor' | 'viewer' }) => 
      updateTeamMemberRoleAction(memberId, role),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (err) => {
      toast.error('Failed to update member role.');
      console.error(err);
    }
  });

  // Delete member mutation
  const deleteMutation = useMutation({
    mutationFn: deleteTeamMemberAction,
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ['teamMembers'] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (err) => {
      toast.error('Failed to remove team member.');
      console.error(err);
    }
  });

  if (loadingUser) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    inviteMutation.mutate({ 
      name, 
      email, 
      password, 
      role, 
      memberRate: Number(inviteRate), 
      memberPaymentType: invitePaymentType 
    });
  };

  // ── RENDER UPSORT STATE IF NOT ON AGENCY PLAN ──
  if (!isAgency) {
    return (
      <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/20">
        <PageHeader 
          title="Team Management" 
          description="Access control and member directory." 
        />
        <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
          <div className="max-w-2xl w-full text-center py-20 px-10 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200/80 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center animate-in fade-in duration-500">
            <div className="h-24 w-24 rounded-3xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center mb-8 border border-purple-100 dark:border-purple-900/30">
              <Lock className="h-10 w-10 text-purple-650 dark:text-purple-400 animate-pulse" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Workspace Sharing & Collaboration
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 font-bold max-w-lg mx-auto mb-10 uppercase tracking-widest leading-relaxed">
              Invite editors, assign tasks, and build your production workflow with the Agency Plan.
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-lg w-full text-left mb-12">
              <div className="flex gap-3 items-start bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">10 Team Seats</h4>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Invite admins, editors, and viewer clients.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Task Assignments</h4>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Assign tasks to editors in Monthly Work.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">White-Label Portals</h4>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Hide system branding for a fully custom design.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start bg-slate-50/50 dark:bg-slate-950/40 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                <Check className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-widest">Role Customization</h4>
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-wider">Manage edit privileges and payment block rules.</p>
                </div>
              </div>
            </div>

            <Link
              href="/dashboard/settings?tab=pricing"
              className="inline-flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:-translate-y-0.5 transition-all"
            >
              <Zap className="h-4 w-4" />
              Upgrade to Agency Plan
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // ── ACTIVE AGENCY USER INTERFACE ──
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-slate-950/10">
      <PageHeader 
        title="Team Directory" 
        description="Invite and manage workspace collaborators, editors, and roles."
        action={isOwner ? (
          <button
            onClick={() => setIsInviteOpen(true)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-bold hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-100 cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Invite Member
          </button>
        ) : undefined}
      />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-10 items-start">
            
            {/* Team Directory List */}
            <div className="xl:col-span-2 space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Workspace Members ({members.length})</h3>
              
              {isLoading ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Syncing Registry...</p>
                </div>
              ) : members.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center shadow-sm">
                  <Users className="h-10 w-10 text-slate-300 mb-4" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-1">No collaborators invited yet</h4>
                  <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold uppercase tracking-widest max-w-xs mx-auto">Invite editors to begin assigning work nodes.</p>
                </div>
              ) : (
                <div className="glass-bg rounded-[2.5rem] border border-card-border overflow-hidden shadow-sm">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {members.map((member: any) => {
                      const isThisMemberOwner = !member.parentUserId || member.id === currentUser?.workspaceId;
                      return (
                        <div 
                          key={member.id} 
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-8 gap-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/40 transition-all"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Initials Badge */}
                            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-650 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-center font-bold text-md uppercase shrink-0">
                              {member.name?.charAt(0) || 'U'}
                            </div>
                            
                            <div className="min-w-0">
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">{member.name}</h4>
                              <p className="text-[10px] text-slate-450 dark:text-slate-500 font-bold uppercase tracking-wide mt-0.5 truncate">{member.email}</p>
                            </div>
                          </div>

                          {/* Actions & Role Selectors */}
                          <div className="flex items-center gap-4 justify-end">
                            {isOwnerOrAdmin && !isThisMemberOwner && (
                              <button
                                onClick={() => {
                                  setSelectedMemberId(member.id);
                                  setIsStatsOpen(true);
                                }}
                                className="p-3 text-slate-450 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 rounded-xl transition-all active:scale-95 cursor-pointer"
                                title="Performance & Payouts"
                              >
                                <BarChart3 className="h-4.5 w-4.5" />
                              </button>
                            )}

                            {isThisMemberOwner ? (
                              <span className="px-4 py-2 bg-indigo-50 dark:bg-indigo-955 text-indigo-650 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-900/20 rounded-xl text-[10px] font-black uppercase tracking-widest">
                                Workspace Owner
                              </span>
                            ) : isOwner ? (
                              <>
                                <RadixSelect
                                  value={member.teamRole}
                                  onValueChange={(val) => updateRoleMutation.mutate({ memberId: member.id, role: val as any })}
                                  disabled={updateRoleMutation.isPending}
                                  options={roleOptions}
                                  className="!px-4 !py-2 !rounded-xl !text-xs !bg-slate-50 dark:!bg-slate-955 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 font-bold uppercase tracking-wider min-w-[120px]"
                                />

                                <button
                                  onClick={() => {
                                    if (confirm(`Are you sure you want to remove ${member.name} from your workspace?`)) {
                                      deleteMutation.mutate(member.id);
                                    }
                                  }}
                                  disabled={deleteMutation.isPending}
                                  className="p-3 text-slate-355 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl transition-all active:scale-90"
                                  title="Remove Member"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              </>
                            ) : (
                              <span className="px-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 rounded-xl text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                {member.teamRole}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Invite Form Side Panel / Modal */}
            <div className="space-y-6">
              <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest ml-1">Collaboration Guide</h3>
              
              <div className="glass-bg p-8 border border-card-border rounded-[2.5rem] shadow-sm space-y-6">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Workspace Roles</h4>
                  <p className="text-[10px] text-slate-450 dark:text-slate-500 leading-relaxed font-bold uppercase tracking-wider mt-2">
                    Understanding permissions and access logs:
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3 items-start">
                    <Shield className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Workspace Admin</span>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Full editing and invoice creation control, restricted from plan deletion.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Shield className="h-4 w-4 text-purple-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Editor</span>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Assigned specific thumbnail delivery nodes inside Monthly Work panel.</p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Shield className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">Viewer</span>
                      <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-0.5">Read-only monitoring board for client reviews.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Invite Member Drawer Modal */}
      {isInviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative border border-slate-200/50 dark:border-slate-800 animate-in zoom-in-95 duration-300">
            
            <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Invite Team Member</h3>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mt-1 uppercase tracking-widest">Add collaborator credentials</p>
              </div>
              <button onClick={() => setIsInviteOpen(false)} className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            <form onSubmit={handleInviteSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Collaborator Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 font-bold placeholder-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="jane@agency.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 font-bold placeholder-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Password</label>
                <input
                  type="password"
                  required
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 font-bold placeholder-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Workspace Role</label>
                <RadixSelect
                  value={role}
                  onValueChange={(val) => setRole(val as any)}
                  options={inviteRoleOptions}
                  className="dark:!bg-slate-950 text-slate-900 dark:text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Model</label>
                  <RadixSelect
                    value={invitePaymentType}
                    onValueChange={(val) => setInvitePaymentType(val as any)}
                    options={invitePaymentOptions}
                    className="dark:!bg-slate-955 text-slate-900 dark:text-white font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate (₹)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 500"
                    value={inviteRate}
                    onChange={(e) => setInviteRate(Number(e.target.value))}
                    className="w-full px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 font-bold placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setIsInviteOpen(false)}
                  className="flex-1 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviteMutation.isPending}
                  className="flex-2 flex items-center justify-center gap-2 bg-indigo-600 text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-lg"
                >
                  {inviteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Send Invitation"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isStatsOpen && selectedMemberId && (
        <MemberStatsModal
          memberId={selectedMemberId}
          onClose={() => {
            setIsStatsOpen(false);
            setSelectedMemberId(null);
          }}
          isOwner={isOwner}
        />
      )}

    </div>
  );
}

function MemberStatsModal({ memberId, onClose, isOwner }: { memberId: string, onClose: () => void, isOwner: boolean }) {
  const queryClient = useQueryClient();
  const [rate, setRate] = useState<number>(0);
  const [paymentType, setPaymentType] = useState<'per_thumbnail' | 'hourly' | 'salary'>('per_thumbnail');
  const [hasSyncRate, setHasSyncRate] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['memberStats', memberId],
    queryFn: () => getTeamMemberStatsAction(memberId),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (data?.member && !hasSyncRate) {
      setRate(data.member.memberRate);
      setPaymentType(data.member.memberPaymentType);
      setHasSyncRate(true);
    }
  }, [data, hasSyncRate]);

  const updateRateMutation = useMutation({
    mutationFn: ({ rate, paymentType }: { rate: number, paymentType: 'per_thumbnail' | 'hourly' | 'salary' }) => 
      updateTeamMemberRateAction(memberId, rate, paymentType),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message);
        queryClient.invalidateQueries({ queryKey: ['memberStats', memberId] });
      } else {
        toast.error(res.message);
      }
    },
    onError: (err) => {
      toast.error('Failed to update payout settings');
      console.error(err);
    }
  });

  const handleRateUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRateMutation.mutate({ rate, paymentType });
  };

  const getPaymentTypeLabel = (type: string) => {
    if (type === 'per_thumbnail') return 'Per Thumbnail';
    if (type === 'hourly') return 'Hourly Rate';
    if (type === 'salary') return 'Flat Salary';
    return type;
  };

  const getStatusColor = (status: string) => {
    if (status === 'Completed' || status === 'Done') return 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/20';
    if (status === 'In Progress') return 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/20';
    if (status === 'Review') return 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/20';
    return 'bg-slate-50 dark:bg-slate-900/40 text-slate-500 border-slate-100 dark:border-slate-800';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200/50 dark:border-slate-800 shadow-2xl relative animate-in slide-in-from-right duration-300">
        
        {/* Close Button / Header */}
        <div className="flex justify-between items-center p-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/20 flex items-center justify-center font-black text-md uppercase">
              {data?.member?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight uppercase">
                {isLoading ? "Loading Editor..." : data?.member?.name}
              </h3>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                {isLoading ? "Syncing stats..." : data?.member?.email}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[70vh]">
            <Loader2 className="h-8 w-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aggregating workload registry...</p>
          </div>
        ) : error || !data?.success ? (
          <div className="p-8 text-center text-red-500 uppercase tracking-wide text-xs font-bold">
            Failed to load member statistics.
          </div>
        ) : (
          <div className="p-8 space-y-8">
            
            {/* Overview Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
              
              {/* Estimated Payout */}
              <div className="bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-[2rem] p-6 text-emerald-800 dark:text-emerald-350">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Payout Due</span>
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-black tracking-tight mt-3">
                  ₹{data.stats.estimatedPayout.toLocaleString('en-IN')}
                </p>
                <p className="text-[8px] font-bold uppercase tracking-wide mt-1 text-emerald-600 dark:text-emerald-500 truncate">
                  Model: {getPaymentTypeLabel(data.stats.paymentType)}
                </p>
              </div>

              {/* Completed Tasks */}
              <div className="bg-indigo-50/50 dark:bg-indigo-950/10 border border-indigo-100/50 dark:border-indigo-900/20 rounded-[2rem] p-6 text-indigo-800 dark:text-indigo-300">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">Thumbnails</span>
                  <Briefcase className="h-4 w-4 text-indigo-500" />
                </div>
                <p className="text-2xl font-black tracking-tight mt-3">
                  {data.stats.completedTasks} / {data.stats.totalTasks}
                </p>
                <p className="text-[8px] font-bold uppercase tracking-wide mt-1 text-indigo-600 dark:text-indigo-500">
                  Completed / Assigned
                </p>
              </div>

              {/* Hours Logged */}
              <div className="bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100/50 dark:border-purple-900/20 rounded-[2rem] p-6 text-purple-800 dark:text-purple-300">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">Hours Work</span>
                  <Clock className="h-4 w-4 text-purple-500" />
                </div>
                <p className="text-2xl font-black tracking-tight mt-3 font-mono">
                  {data.stats.totalHours.toFixed(1)}
                </p>
                <p className="text-[8px] font-bold uppercase tracking-wide mt-1 text-purple-600 dark:text-purple-500">
                  Total Hours Logged
                </p>
              </div>
            </div>

            {/* Payout Settings Rate Config Form (Owners Only) */}
            {isOwner ? (
              <form onSubmit={handleRateUpdateSubmit} className="bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 p-6 rounded-[2rem] space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Configure payout structure</h4>
                    <p className="text-[9px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Adjust compensation rate settings for this member.</p>
                  </div>
                  <Settings className="h-4 w-4 text-slate-400" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Payment Method</label>
                    <RadixSelect
                      value={paymentType}
                      onValueChange={(val) => setPaymentType(val as any)}
                      options={statsPaymentOptions}
                      className="!px-4 !py-2.5 !rounded-xl !text-xs !bg-white dark:!bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Rate Value (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={rate}
                      onChange={(e) => setRate(Number(e.target.value))}
                      className="w-full px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updateRateMutation.isPending}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-indigo-700 transition-all cursor-pointer disabled:opacity-50 shadow-lg"
                  >
                    {updateRateMutation.isPending ? "Saving..." : "Save Payout Settings"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
                <span>Contracted Rate:</span>
                <span className="text-slate-800 dark:text-white">₹{data.stats.rate} / {getPaymentTypeLabel(data.stats.paymentType)}</span>
              </div>
            )}

            {/* Task Log Details */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">Assigned task logs</h4>
              
              {data.tasks.length === 0 ? (
                <div className="text-center py-10 bg-slate-50/40 dark:bg-slate-950/20 rounded-[2rem] border border-slate-200/50 dark:border-slate-800">
                  <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">No work items logged under this editor.</p>
                </div>
              ) : (
                <div className="border border-slate-100 dark:border-slate-800 rounded-[2rem] overflow-hidden bg-slate-50/20 dark:bg-slate-950/5">
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {data.tasks.map((task: any) => (
                      <div key={task.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-indigo-650 dark:text-indigo-400 uppercase tracking-wider">{task.client}</span>
                            <span className="text-[8px] text-slate-300 dark:text-slate-700">•</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Due {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</span>
                          </div>
                          <h5 className="text-sm font-bold text-slate-800 dark:text-white">{task.title}</h5>
                          {task.completedAt && (
                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wide">Done on {task.completedAt}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {task.actualHours > 0 && (
                            <span className="text-[9px] font-mono font-bold bg-slate-100 dark:bg-slate-955 text-slate-500 px-2.5 py-1 rounded-lg border border-slate-200/30">
                              {task.actualHours.toFixed(1)}h
                            </span>
                          )}
                          <span className={`px-3 py-1.5 border rounded-full text-[9px] font-black uppercase tracking-wider ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
