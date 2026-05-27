import { useState, useMemo } from "react";
import { WorkCalendar } from "./WorkCalendar";
import { updateWorkStatusAction, getWorksAction, deleteWorkAction, updateWorkAction } from "@/dashboard/work/actions/work-actions";
import { getClientsAction } from "@/dashboard/clients/actions/client-actions";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { AddWorkModal } from "./AddWorkModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { useCurrency } from "@/context/CurrencyContext";
import { Work } from "@/types/work";
import { Client } from "@/types/client";
import { usePlan } from "@/context/PlanContext";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { Lock } from "lucide-react";
import Link from "next/link";

// Modular Sub-Components
import { WorkStatistics } from "./WorkStatistics";
import { WorkFilterTabs } from "./WorkFilterTabs";
import { WorkBoardView } from "./WorkBoardView";
import { WorkListView } from "./WorkListView";

export function WorkManager({ initialTasks = [] }: { initialTasks?: Work[] }) {
  const { formatCurrency } = useCurrency();
  const queryClient = useQueryClient();
  const { planName, limits, canAddTask } = usePlan();
  const [view, setView] = useState<"board" | "list" | "calendar">("board");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [prefilledDeadline, setPrefilledDeadline] = useState<string | undefined>(undefined);
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const { data: tasks = initialTasks, isLoading } = useQuery({
    queryKey: ['works'],
    queryFn: getWorksAction,
    initialData: initialTasks,
    refetchInterval: 10000, // 10s fallback polling
  });

  const { data: clients = [] } = useQuery({
    queryKey: ['clients'],
    queryFn: getClientsAction,
    refetchInterval: 10000,
  });

  // Calculate monthly task limits
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const monthlyTasksCount = (tasks as Work[]).filter((t: Work) => {
    if (!t.createdAt) return false;
    const d = new Date(t.createdAt);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const atTaskLimit = !canAddTask(monthlyTasksCount);
  const taskLimitText = limits.maxTasksPerMonth === Infinity ? 'Unlimited' : String(limits.maxTasksPerMonth);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateWorkStatusAction(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['works'] });
      const previousTasks = queryClient.getQueryData(['works']);
      queryClient.setQueryData(['works'], (old: Work[] | undefined) => 
        old?.map((t: Work) => t.id === id ? { ...t, status: status as Work["status"] } : t)
      );
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['works'], context?.previousTasks);
      toast.error("Failed to update status");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] });
    },
    onSuccess: () => {
      toast.success("Status updated successfully");
    }
  });

  const handleStatusChange = (taskId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  const updateWorkMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: Partial<Work> }) => updateWorkAction(id, data),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: ['works'] });
      const previousTasks = queryClient.getQueryData(['works']);
      queryClient.setQueryData(['works'], (old: Work[] | undefined) => 
        old?.map((t: Work) => t.id === id ? { ...t, ...data } : t)
      );
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['works'], context?.previousTasks);
      toast.error("Failed to update task deadline");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] });
    },
    onSuccess: () => {
      toast.success("Task deadline updated successfully");
    }
  });

  const handleMoveTaskDeadline = (taskId: string, targetDateStr: string) => {
    updateWorkMutation.mutate({ id: taskId, data: { deadline: targetDateStr } });
  };

  const handleQuickAddTask = (dateStr: string) => {
    if (atTaskLimit) {
      setIsUpgradeModalOpen(true);
      return;
    }
    setPrefilledDeadline(dateStr);
    setIsAddModalOpen(true);
  };
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkAction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['works'] });
      const previousTasks = queryClient.getQueryData(['works']);
      queryClient.setQueryData(['works'], (old: Work[] | undefined) => 
        old?.filter((t: Work) => t.id !== id)
      );
      return { previousTasks };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(['works'], context?.previousTasks);
      toast.error("Failed to delete task");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['works'] });
    },
    onSuccess: () => {
      toast.success("Task deleted successfully");
    }
  });

  const handleDeleteTask = (taskId: string) => {
    deleteMutation.mutate(taskId);
    setTaskToDelete(null);
  };

  const filteredTasks = useMemo(() => {
    return (tasks as Work[]).filter((task: Work) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, searchTerm, priorityFilter, statusFilter]);

  // Workload Analysis
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);

  const weeklyTasks = (tasks as Work[]).filter((t: Work) => {
    try {
      const d = new Date(t.deadline);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    } catch { return false; }
  });
  
  const completedToday = (tasks as Work[]).filter((t: Work) => {
    if ((t.status as string) !== "Completed" && t.status !== "Done") return false;
    if (!t.completedAt && !t.updatedAt) return false;
    try {
      const compDate = new Date(t.completedAt || t.updatedAt);
      const today = new Date();
      return compDate.getDate() === today.getDate() &&
             compDate.getMonth() === today.getMonth() &&
             compDate.getFullYear() === today.getFullYear();
    } catch {
      return false;
    }
  });

  const earnedToday = completedToday.reduce((sum: number, t: Work) => {
    const client = (clients as Client[]).find((c: Client) => c.name === t.client);
    const price = client?.price_per_thumbnail || 400; // Fallback to 400 INR/USD if not set
    return sum + price;
  }, 0);

  const pendingTasksCount = (tasks as Work[]).filter((t: Work) => t.status === "To Do").length;
  const inProgressTasksCount = (tasks as Work[]).filter((t: Work) => t.status === "In Progress").length;

  const stats = {
    total: tasks.length,
    completed: (tasks as Work[]).filter((t: Work) => (t.status as string) === "Completed" || t.status === "Done").length,
    urgent: (tasks as Work[]).filter((t: Work) => t.priority === "Urgent").length,
    weekly: weeklyTasks.length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-10">
      {/* Premium Dashboard Header Stats */}
      <WorkStatistics 
        stats={stats}
        completionRate={completionRate}
        earnedToday={earnedToday}
        pendingTasksCount={pendingTasksCount}
        inProgressTasksCount={inProgressTasksCount}
        formatCurrency={formatCurrency}
      />

      {/* Plan limit warning banner */}
      {atTaskLimit && (
        <div className="flex items-center justify-between gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
          <div className="flex items-center gap-3">
            <Lock className="h-4 w-4 text-amber-600 shrink-0" />
            <p className="text-xs font-bold text-amber-800">
              You&apos;ve reached the <span className="font-black">{planName}</span> plan limit of <span className="font-black">{taskLimitText} tasks this month</span>. Upgrade to add more.
            </p>
          </div>
          <Link href="/pricing" className="text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg uppercase tracking-wider hover:bg-amber-200 transition-all shrink-0">
            View Plans →
          </Link>
        </div>
      )}

      {/* Advanced Toolbar Filters */}
      <WorkFilterTabs 
        view={view}
        setView={setView}
        priorityFilter={priorityFilter}
        setPriorityFilter={setPriorityFilter}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddTaskClick={() => {
          if (atTaskLimit) {
            setIsUpgradeModalOpen(true);
          } else {
            setIsAddModalOpen(true);
          }
        }}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
           <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Workspace...</p>
        </div>
      ) : view === "board" ? (
        /* Board Kanban View */
        <WorkBoardView 
          filteredTasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onDelete={handleDeleteTask}
        />
      ) : view === "calendar" ? (
        /* Calendar Schedule View */
        <WorkCalendar 
          tasks={filteredTasks} 
          onMoveTask={handleMoveTaskDeadline} 
          onAddTask={handleQuickAddTask}
          onStatusChange={handleStatusChange}
        />
      ) : (
        /* List spreadsheet Activity view */
        <WorkListView 
          filteredTasks={filteredTasks}
          onStatusChange={handleStatusChange}
          onDeleteClick={(id) => setTaskToDelete(id)}
        />
      )}

      {isAddModalOpen && (
        <AddWorkModal 
          isOpen={isAddModalOpen} 
          initialDeadline={prefilledDeadline}
          onClose={() => {
            setIsAddModalOpen(false);
            setPrefilledDeadline(undefined);
          }} 
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ['works'] })}
        />
      )}

      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => taskToDelete && handleDeleteTask(taskToDelete)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete Task"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      <UpgradeModal 
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        limitName="Monthly Tasks limit"
        currentLimitText={`${monthlyTasksCount} / ${taskLimitText} tasks used`}
        upgradeToPlanName="Pro"
      />
    </div>
  );
}
