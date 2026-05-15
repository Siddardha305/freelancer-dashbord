'use client'

import { useState, useMemo } from "react";
import { 
  Search, 
  LayoutGrid, 
  List as ListIcon, 
  Plus, 
  Filter, 
  Calendar, 
  Zap, 
  Clock, 
  CheckCircle2,
  AlertTriangle,
  Trash2
} from "lucide-react";
import { WorkColumn } from "./WorkColumn";
import { AddWorkModal } from "./AddWorkModal";
import { updateWorkStatusAction, getWorksAction, deleteWorkAction } from "@/features/work/actions/work-actions";
import { StatCard } from "@/components/shared/StatCard";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

export function WorkManager({ initialTasks = [] }: { initialTasks?: any[] }) {
  const queryClient = useQueryClient();
  const [view, setView] = useState<"board" | "list">("board");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

  const { data: tasks = initialTasks, isLoading } = useQuery({
    queryKey: ['works'],
    queryFn: getWorksAction,
    initialData: initialTasks,
    refetchInterval: 10000, // 10s fallback polling
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: string }) => updateWorkStatusAction(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['works'] });
      const previousTasks = queryClient.getQueryData(['works']);
      queryClient.setQueryData(['works'], (old: any) => 
        old?.map((t: any) => t.id === id ? { ...t, status } : t)
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
  
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteWorkAction(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['works'] });
      const previousTasks = queryClient.getQueryData(['works']);
      queryClient.setQueryData(['works'], (old: any) => 
        old?.filter((t: any) => t.id !== id)
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
    return tasks.filter((task: any) => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.client.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = priorityFilter === "All" || task.priority === priorityFilter;
      const matchesStatus = statusFilter === "All" || task.status === statusFilter;
      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [tasks, searchTerm, priorityFilter, statusFilter]);

  // Workload Analysis
  const now = new Date();
  const weekStart = startOfWeek(now);
  const weekEnd = endOfWeek(now);
  
  const weeklyTasks = tasks.filter((t: any) => {
    try {
      const d = new Date(t.deadline);
      return isWithinInterval(d, { start: weekStart, end: weekEnd });
    } catch { return false; }
  });

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t: any) => t.status === "Completed" || t.status === "Done").length,
    urgent: tasks.filter((t: any) => t.priority === "Urgent").length,
    weekly: weeklyTasks.length,
  };

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

  return (
    <div className="space-y-10">
      {/* Premium Dashboard Header */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
           <StatCard title="Total Scope" value={stats.total} icon={LayoutGrid} />
           <StatCard title="Urgent Action" value={stats.urgent} alert={stats.urgent > 0} icon={Zap} />
           <StatCard title="Success Rate" value={`${completionRate}%`} icon={CheckCircle2} />
        </div>
        
        {/* Weekly Workload Summary Card */}
        <div className="glass-bg p-6 rounded-[2rem] border border-card-border flex flex-col justify-between relative overflow-hidden group hover:shadow-xl transition-all">
           <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 transition-transform">
              <Calendar className="h-16 w-16 text-indigo-600" />
           </div>
           <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Weekly Workload</p>
              <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{stats.weekly} Tasks</h4>
           </div>
           <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mt-4">Due by {format(weekEnd, 'MMM dd')}</p>
        </div>
      </div>

      {/* Advanced Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pt-4">
        <div className="flex items-center gap-6">
          <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
            <button 
              onClick={() => setView("board")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300",
                view === 'board' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              Board
            </button>
            <button 
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl transition-all duration-300",
                view === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
              )}
            >
              <ListIcon className="h-4 w-4" />
              List
            </button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400">
             <Filter className="h-4 w-4" />
             <select 
               value={priorityFilter}
               onChange={(e) => setPriorityFilter(e.target.value)}
               className="bg-transparent text-[10px] font-bold uppercase tracking-widest border-none focus:ring-0 cursor-pointer hover:text-slate-900 transition-colors"
             >
                <option value="All">All Priorities</option>
                <option value="Urgent">Urgent</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
             </select>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full xl:w-auto">
          <div className="relative flex-1 xl:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by client or task title..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-card border border-card-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-8 py-4 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-100 hover:shadow-indigo-200 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
           <div className="h-12 w-12 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Workspace...</p>
        </div>
      ) : view === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-start pb-12">
          <WorkColumn title="To Do" count={filteredTasks.filter((t: any) => t.status === "To Do").length} tasks={filteredTasks.filter((t: any) => t.status === "To Do")} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} color="slate" />
          <WorkColumn title="In Progress" count={filteredTasks.filter((t: any) => t.status === "In Progress").length} tasks={filteredTasks.filter((t: any) => t.status === "In Progress")} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} color="indigo" />
          <WorkColumn title="Review" count={filteredTasks.filter((t: any) => t.status === "Review").length} tasks={filteredTasks.filter((t: any) => t.status === "Review")} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} color="amber" alert />
          <WorkColumn title="Completed" count={filteredTasks.filter((t: any) => t.status === "Completed" || t.status === "Done").length} tasks={filteredTasks.filter((t: any) => t.status === "Completed" || t.status === "Done")} onStatusChange={handleStatusChange} onDelete={handleDeleteTask} color="emerald" />
        </div>
      ) : (
        <div className="glass-bg rounded-[2rem] border border-card-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task Details</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status Control</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                  <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task: any) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-10 py-8">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</span>
                        {task.description && <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{task.description}</span>}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{task.client}</span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit mx-auto">
                        {["To Do", "In Progress", "Review", "Completed"].map((s) => (
                           <button
                             key={s}
                             onClick={() => handleStatusChange(task.id, s)}
                             className={cn(
                               "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all duration-200",
                               task.status === s ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'
                             )}
                           >
                             {s === "Completed" ? "Done" : s}
                           </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <Clock className="h-3.5 w-3.5 text-indigo-500" />
                          {format(new Date(task.deadline), 'MMM dd, yyyy')}
                       </div>
                    </td>
                    <td className="px-10 py-8">
                      <span className={cn(
                        "inline-flex items-center px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border",
                        task.priority === 'Urgent' ? 'bg-red-600 text-white border-red-600' :
                        task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
                        task.priority === 'Normal' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                      )}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => setTaskToDelete(task.id)}
                        className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                        title="Delete Task"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-10 py-32 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-4 rounded-3xl bg-slate-50 text-slate-300">
                          <Search className="h-10 w-10" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-slate-900 font-bold">No tasks matching criteria</p>
                          <p className="text-xs text-slate-400 font-medium tracking-wide">Adjust your filters or try a different search term</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddWorkModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
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
    </div>
  );
}




