'use client'

import { Clock, CheckCircle2, AlertCircle, Play, Search, Check, RefreshCcw } from "lucide-react";

export interface Task {
  id: string;
  _id?: string;
  client: string;
  title: string;
  status: string;
  deadline: string;
  priority: string;
}

interface WorkCardProps {
  task: Task;
  onStatusChange: (id: string, newStatus: string) => void;
}

export function WorkCard({ task, onStatusChange }: WorkCardProps) {
  const isHighPriority = task.priority === 'High';
  const isCompleted = task.status === 'Completed';

  const statusConfigs = [
    { name: "To Do", icon: RefreshCcw, color: "hover:bg-slate-100 text-slate-500", active: "bg-slate-100 text-slate-900 border-slate-200" },
    { name: "In Progress", icon: Play, color: "hover:bg-indigo-50 text-indigo-500", active: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    { name: "Review", icon: Search, color: "hover:bg-amber-50 text-amber-500", active: "bg-amber-50 text-amber-600 border-amber-100" },
    { name: "Completed", icon: Check, color: "hover:bg-emerald-50 text-emerald-500", active: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  ];
  
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md group/card">
      <div className="flex justify-between items-start mb-4">
        <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
          task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
          task.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
          'bg-emerald-50 text-emerald-700 border-emerald-100'
        }`}>
          {task.priority}
        </div>
        
        {isHighPriority && (
          <AlertCircle className="h-4 w-4 text-red-500 animate-pulse" />
        )}
      </div>

      <h4 className="font-bold text-slate-900 mb-1 group-hover/card:text-indigo-600 transition-colors line-clamp-1">{task.title}</h4>
      <p className="text-xs text-slate-500 font-semibold mb-6 uppercase tracking-wider">{task.client}</p>
      
      <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {isCompleted ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
            )}
            <span>{task.deadline}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100 w-fit">
          {statusConfigs.map((config) => {
            const Icon = config.icon;
            const isActive = task.status === config.name;
            return (
              <button
                key={config.name}
                onClick={() => onStatusChange(task.id || task._id || "", config.name)}
                title={config.name}
                className={`p-2 rounded-lg border transition-all duration-200 group/btn ${
                  isActive 
                    ? `${config.active} shadow-sm scale-105` 
                    : `border-transparent ${config.color}`
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}





