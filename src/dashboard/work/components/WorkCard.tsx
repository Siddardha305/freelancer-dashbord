'use client'

import React from "react";
import { Client } from "@/types/client";
import { Clock, CheckCircle2, AlertCircle, Play, Search, Check, RefreshCcw, Trash2 } from "lucide-react";
import { formatDistanceToNow, isBefore, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  _id?: string;
  client: string;
  title: string;
  description?: string;
  status: string;
  deadline: string;
  priority: "Urgent" | "High" | "Normal" | "Low";
  revisions: number;
  approvedByClient: boolean;
  actualHours: number;
  tags?: string[];
}

interface WorkCardProps {
  task: Task;
  clients: Client[];
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
}

export function WorkCard({ task, clients, onStatusChange, onDelete }: WorkCardProps) {
  const isUrgent = task.priority === 'Urgent';
  const isCompleted = task.status === 'Completed';

  const clientObj = clients.find(c => c.name.toLowerCase() === task.client.toLowerCase());
  const channelLink = clientObj?.channel_link;
  const cleanUrl = channelLink ? (channelLink.startsWith('http') ? channelLink : `https://${channelLink}`) : '';
  
  let deadlineDate = parseISO(task.deadline);
  if (isNaN(deadlineDate.getTime())) {
    deadlineDate = new Date(task.deadline);
  }
  const isDeadlineValid = !isNaN(deadlineDate.getTime());
  const isOverdue = !isCompleted && isDeadlineValid && isBefore(deadlineDate, new Date());

  const statusConfigs = [
    { name: "To Do", icon: RefreshCcw, color: "hover:bg-slate-100 text-slate-500", active: "bg-slate-100 text-slate-900 border-slate-200" },
    { name: "In Progress", icon: Play, color: "hover:bg-indigo-50 text-indigo-500", active: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    { name: "Review", icon: Search, color: "hover:bg-amber-50 text-amber-500", active: "bg-amber-50 text-amber-600 border-amber-100" },
    { name: "Completed", icon: Check, color: "hover:bg-emerald-50 text-emerald-500", active: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  ];
  
  return (
    <div className={cn(
      "glass-bg p-6 rounded-3xl border border-card-border hover:border-indigo-300 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-xl group/card",
      isOverdue && "border-red-200 bg-red-50/30",
      isUrgent && "border-red-400 ring-1 ring-red-100"
    )}>
      {/* Priority Badge */}
      <div className="flex justify-between items-start mb-4">
        <div className={cn(
          "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border",
          task.priority === 'Urgent' ? 'bg-red-600 text-white border-red-600' :
          task.priority === 'High' ? 'bg-red-50 text-red-700 border-red-100' : 
          task.priority === 'Normal' ? 'bg-amber-50 text-amber-700 border-amber-100' : 
          'bg-emerald-50 text-emerald-700 border-emerald-100'
        )}>
          {task.priority}
        </div>
        
        {isUrgent && (
          <div className="flex items-center gap-1 text-red-600">
            <AlertCircle className="h-4 w-4 animate-pulse" />
            <span className="text-[9px] font-black uppercase">Urgent</span>
          </div>
        )}

        {isOverdue && !isUrgent && (
           <div className="flex items-center gap-1 text-red-500">
             <AlertCircle className="h-3.5 w-3.5" />
             <span className="text-[9px] font-bold uppercase">Overdue</span>
           </div>
        )}

        <button 
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id || task._id || "");
          }}
          className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
          title="Delete Task"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <h4 className="font-bold text-slate-900 mb-1 group-hover/card:text-indigo-600 transition-colors line-clamp-1">{task.title}</h4>
      {channelLink ? (
        <a 
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-4 uppercase tracking-widest hover:text-indigo-650 dark:hover:text-indigo-400 hover:underline transition-colors cursor-pointer inline-block"
          onClick={(e) => e.stopPropagation()}
        >
          {task.client}
        </a>
      ) : (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-4 uppercase tracking-widest">{task.client}</p>
      )}
      
      <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className={cn(
            "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest",
            isOverdue ? "text-red-500" : "text-slate-400"
          )}>
            {isCompleted ? (
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Clock className={cn("h-3.5 w-3.5", isOverdue ? "text-red-500" : "text-indigo-500")} />
            )}
            <span>
              {isDeadlineValid 
                ? formatDistanceToNow(deadlineDate, { addSuffix: true }) 
                : task.deadline}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
             {task.revisions > 0 && (
               <div className="flex items-center gap-1.5 text-amber-600" title="Revisions">
                  <RefreshCcw className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold">{task.revisions}</span>
               </div>
             )}
             {task.approvedByClient && (
               <span title="Approved by Client" className="flex items-center">
                 <CheckCircle2 className="h-4 w-4 text-emerald-500" />
               </span>
             )}
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
                className={cn(
                  "p-2 rounded-lg border transition-all duration-200 group/btn",
                  isActive 
                    ? cn(config.active, "shadow-sm scale-110 z-10") 
                    : cn("border-transparent opacity-40 hover:opacity-100", config.color)
                )}
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
