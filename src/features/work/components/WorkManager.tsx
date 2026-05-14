'use client'

import { useState, useEffect, useCallback } from "react";
import { Search, LayoutGrid, List as ListIcon, Plus } from "lucide-react";
import { WorkColumn } from "./WorkColumn";
import { AddWorkModal } from "./AddWorkModal";
import { updateWorkStatusAction, getWorksAction } from "@/features/work/actions/work-actions";
import { StatCard } from "@/components/shared/StatCard";

export function WorkManager({ initialTasks = [] }: { initialTasks?: any[] }) {
  const [view, setView] = useState<"board" | "list">("board");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [tasks, setTasks] = useState(initialTasks);

  const refreshData = useCallback(async () => {
    const latestTasks = await getWorksAction();
    setTasks(latestTasks);
  }, []);

  // Sync state if initialTasks changes (e.g. from server revalidation)
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    // 1. Optimistic Update
    const previousTasks = [...tasks];
    setTasks(currentTasks => 
      currentTasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    );

    // 2. Server Sync
    try {
      const result = await updateWorkStatusAction(taskId, newStatus);
      if (result.message !== 'success') {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert if failed
      setTasks(previousTasks);
    }
  };

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate real-time stats
  const totalRequested = tasks.length;
  const delivered = tasks.filter(t => t.status === "Completed").length;
  const inRevision = tasks.filter(t => t.status === "Review").length;
  const completionRate = totalRequested > 0 ? Math.round((delivered / totalRequested) * 100) + "%" : "0%";

  return (
    <div className="space-y-10">
      {/* Quick Stats Grid - Updated in Real-Time */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in slide-in-from-top-4 duration-500">
        <StatCard title="Total Requested" value={totalRequested} />
        <StatCard title="Delivered" value={delivered} />
        <StatCard title="In Revision" value={inRevision} alert />
        <StatCard title="Completion Rate" value={completionRate} />
      </div>

      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-4">
        <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200 shadow-inner">
          <button 
            onClick={() => setView("board")}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${view === 'board' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <LayoutGrid className="h-4 w-4" />
            Board View
          </button>
          <button 
            onClick={() => setView("list")}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ${view === 'list' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <ListIcon className="h-4 w-4" />
            List View
          </button>
        </div>

        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm text-slate-900 placeholder-slate-400 transition-all duration-200 shadow-sm"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-indigo-600 text-white px-6 py-3.5 rounded-2xl text-sm font-bold flex items-center gap-2 hover:bg-indigo-700 transition-all duration-200 shadow-lg shadow-indigo-100"
          >
            <Plus className="h-4 w-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {view === "board" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-start pb-12">
          <WorkColumn title="To Do" count={filteredTasks.filter(t => t.status === "To Do").length} tasks={filteredTasks.filter(t => t.status === "To Do")} onStatusChange={handleStatusChange} color="slate" />
          <WorkColumn title="In Progress" count={filteredTasks.filter(t => t.status === "In Progress").length} tasks={filteredTasks.filter(t => t.status === "In Progress")} onStatusChange={handleStatusChange} color="indigo" />
          <WorkColumn title="Review" count={filteredTasks.filter(t => t.status === "Review").length} tasks={filteredTasks.filter(t => t.status === "Review")} onStatusChange={handleStatusChange} color="amber" alert />
          <WorkColumn title="Completed" count={filteredTasks.filter(t => t.status === "Completed").length} tasks={filteredTasks.filter(t => t.status === "Completed")} onStatusChange={handleStatusChange} color="emerald" />
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task Details</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-8 py-6">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</span>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500 font-medium">{task.client}</td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100 w-fit">
                        {["To Do", "In Progress", "Review", "Completed"].map((s) => (
                           <button
                             key={s}
                             onClick={() => handleStatusChange(task.id, s)}
                             className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all duration-200 ${task.status === s ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                           >
                             {s}
                           </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-sm text-slate-500">{task.deadline}</td>
                    <td className="px-8 py-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
                        task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
                        'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredTasks.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-slate-300 mb-2" />
                        <p className="text-slate-500 font-bold">No tasks found</p>
                        <p className="text-xs text-slate-400">Try a different search term</p>
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
          onSuccess={refreshData}
        />
      )}
    </div>
  );
}



