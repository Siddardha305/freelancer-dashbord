'use client'

import React from 'react';
import { Search, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Work } from "@/types/work";
import { Client } from "@/types/client";

interface WorkListViewProps {
  filteredTasks: Work[];
  clients: Client[];
  teamMembers?: any[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDeleteClick: (taskId: string) => void;
  isEditor?: boolean;
  onEditClick?: (task: Work) => void;
}

export function WorkListView({
  filteredTasks,
  clients = [],
  teamMembers = [],
  onStatusChange,
  onDeleteClick,
  isEditor = false,
  onEditClick
}: WorkListViewProps) {
  return (
    <div className="glass-bg rounded-[2rem] border border-card-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Task Details</th>
              <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Client</th>
              <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Assignee</th>
              <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status Control</th>
              <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Deadline</th>
              <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Priority</th>
              {!isEditor && <th className="px-10 py-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredTasks.map((task: Work) => (
              <tr 
                key={task.id} 
                onClick={() => !isEditor && onEditClick && onEditClick(task)}
                className={cn("hover:bg-slate-50 transition-colors group", !isEditor && "cursor-pointer")}
              >
                <td className="px-10 py-8">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</span>
                      {task.videoLink && (
                        <a 
                          href={task.videoLink.startsWith('http') ? task.videoLink : `https://${task.videoLink}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-wider bg-red-50 text-red-600 border border-red-100 hover:bg-red-105 transition-colors cursor-pointer"
                          title="Open Video / Footage link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Video
                        </a>
                      )}
                    </div>
                    {task.description && <span className="text-[10px] text-slate-400 font-medium line-clamp-1">{task.description}</span>}
                  </div>
                </td>
                <td className="px-10 py-8">
                  {(() => {
                    const clientObj = clients.find(c => c.name.toLowerCase() === task.client.toLowerCase());
                    const channelLink = clientObj?.channel_link;
                    const cleanUrl = channelLink ? (channelLink.startsWith('http') ? channelLink : `https://${channelLink}`) : '';
                    return channelLink ? (
                      <a 
                        href={cleanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-slate-500 hover:text-indigo-655 dark:hover:text-indigo-400 hover:underline transition-colors uppercase tracking-wider cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {task.client}
                      </a>
                    ) : (
                      <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{task.client}</span>
                    );
                  })()}
                </td>
                <td className="px-10 py-8">
                  {(() => {
                    const assignedMember = teamMembers.find(m => m.id === task.assignedTo);
                    return assignedMember ? (
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-405 flex items-center justify-center text-[8px] font-black uppercase border border-indigo-100 dark:border-indigo-900/30">
                          {assignedMember.name?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-205">{assignedMember.name}</span>
                      </div>
                    ) : (
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Unassigned</span>
                    );
                  })()}
                </td>
                <td className="px-10 py-8">
                  <div className="flex items-center justify-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-fit mx-auto">
                    {["To Do", "In Progress", "Review", "Completed"].map((s) => (
                      <button
                        key={s}
                        onClick={(e) => {
                          e.stopPropagation();
                          onStatusChange(task.id, s);
                        }}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all duration-200",
                          task.status === s || (s === "Completed" && task.status === "Done") ? 'bg-indigo-600 text-white shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'
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
                    {(() => {
                      const d = new Date(task.deadline);
                      return !isNaN(d.getTime()) ? format(d, 'MMM dd, yyyy') : task.deadline;
                    })()}
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
                {!isEditor && (
                  <td className="px-10 py-8 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(task.id);
                      }}
                      className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all active:scale-95"
                      title="Delete Task"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filteredTasks.length === 0 && (
              <tr>
                <td colSpan={isEditor ? 6 : 7} className="px-10 py-32 text-center">
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
  );
}
