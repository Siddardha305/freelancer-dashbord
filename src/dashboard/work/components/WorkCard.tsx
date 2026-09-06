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
  assignedTo?: string;
  reviewerId?: string;
  videoLink?: string;
  isPaid?: boolean;
  isPaidByClient?: boolean;
}

interface WorkCardProps {
  task: Task;
  clients: Client[];
  teamMembers?: any[];
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  isEditor?: boolean;
  isViewer?: boolean;
  onEditClick?: (task: Task) => void;
  onPaymentStatusChange?: (id: string, isPaid: boolean) => void;
  onClientPaymentStatusChange?: (id: string, isPaidByClient: boolean) => void;
}

export function WorkCard({ 
  task, 
  clients, 
  teamMembers = [], 
  onStatusChange, 
  onDelete, 
  isEditor = false, 
  isViewer = false, 
  onEditClick,
  onPaymentStatusChange,
  onClientPaymentStatusChange
}: WorkCardProps) {
  const isReadOnly = isEditor || isViewer;
  const isUrgent = task.priority === 'Urgent';
  const isCompleted = task.status === 'Completed' || task.status === 'Done';

  const clientObj = clients.find(c => c.name.toLowerCase() === task.client.toLowerCase());
  const channelLink = !isEditor && !isViewer ? clientObj?.channel_link : undefined;
  const cleanUrl = channelLink ? (channelLink.startsWith('http') ? channelLink : `https://${channelLink}`) : '';
  
  const assignedMember = teamMembers.find(m => m.id === task.assignedTo);
  const assignedName = assignedMember ? assignedMember.name : '';

  const reviewerMember = teamMembers.find(m => m.id === task.reviewerId);
  const reviewerName = reviewerMember ? reviewerMember.name : '';
  
  let deadlineDate = parseISO(task.deadline);
  if (isNaN(deadlineDate.getTime())) {
    deadlineDate = new Date(task.deadline);
  }
  const isDeadlineValid = !isNaN(deadlineDate.getTime());
  const isOverdue = !isCompleted && isDeadlineValid && isBefore(deadlineDate, new Date());

  const isPerDelivery = assignedMember?.memberPaymentType === 'per_thumbnail';
  const isClientPerDelivery = clientObj?.pricing_model === 'per_thumbnail';
  const clientQuota = clientObj?.thumbnails_per_month || 8;
  const clientRate = clientObj?.price_per_thumbnail && clientObj.price_per_thumbnail > 0
    ? clientObj.price_per_thumbnail
    : (clientQuota > 0 ? (clientObj?.monthly_price || 0) / clientQuota : 0);
  const isManager = !isEditor && !isViewer;

  const statusConfigs = [
    { name: "To Do", icon: RefreshCcw, color: "hover:bg-slate-100 text-slate-500", active: "bg-slate-100 text-slate-900 border-slate-200" },
    { name: "In Progress", icon: Play, color: "hover:bg-indigo-50 text-indigo-500", active: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    { name: "Review", icon: Search, color: "hover:bg-amber-50 text-amber-500", active: "bg-amber-50 text-amber-600 border-amber-100" },
    { name: "Completed", icon: Check, color: "hover:bg-emerald-50 text-emerald-500", active: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  ];
  
  return (
    <div 
      onClick={() => !isReadOnly && onEditClick && onEditClick(task)}
      style={assignedMember?.color ? { 
        backgroundColor: `${assignedMember.color}0F`, 
        borderColor: `${assignedMember.color}45` 
      } : undefined}
      className={cn(
        "glass-bg p-6 rounded-3xl border border-card-border hover:border-indigo-300 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-xl group/card",
        !isReadOnly && "cursor-pointer",
        isOverdue && !assignedMember?.color && "border-red-200 bg-red-50/30",
        isUrgent && !assignedMember?.color && "border-red-400 ring-1 ring-red-100"
      )}
    >
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

        {!isEditor && (
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
        )}
      </div>

      <h4 className="font-bold text-slate-900 mb-1 group-hover/card:text-indigo-600 transition-colors line-clamp-1">{task.title}</h4>
      {channelLink ? (
        <a 
          href={cleanUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-slate-400 dark:text-slate-500 font-bold mb-4 uppercase tracking-widest hover:text-indigo-655 dark:hover:text-indigo-400 hover:underline transition-colors cursor-pointer inline-block"
          onClick={(e) => e.stopPropagation()}
        >
          {task.client}
        </a>
      ) : (
        <p className="text-[10px] text-slate-400 dark:text-slate-505 font-bold mb-4 uppercase tracking-widest">{task.client}</p>
      )}
      
      {task.videoLink && (
        <div className="mb-4 mt-[-4px]">
          <a 
            href={task.videoLink.startsWith('http') ? task.videoLink : `https://${task.videoLink}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider bg-red-50 text-red-650 border border-red-100/50 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-950/60 transition-all cursor-pointer shadow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <Play className="h-2.5 w-2.5 fill-current" /> Watch Video / Footage
          </a>
        </div>
      )}
      
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 mt-[-8px]">
        <div className="flex items-center gap-1.5">
          {task.assignedTo ? (
            <>
              <div 
                style={assignedMember?.color ? {
                  backgroundColor: `${assignedMember.color}15`,
                  borderColor: `${assignedMember.color}40`,
                  color: assignedMember.color
                } : undefined}
                className={cn(
                  "h-5 w-5 rounded-md flex items-center justify-center text-[8px] font-black uppercase border",
                  !assignedMember?.color && "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/35"
                )}
              >
                {assignedName?.charAt(0) || 'U'}
              </div>
              <span className="text-[9px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
                Assigned: {assignedName}
              </span>
            </>
          ) : (
            <>
              <div className="h-5 w-5 rounded-md bg-slate-50 dark:bg-slate-900/40 text-slate-400 dark:text-slate-500 flex items-center justify-center text-[8px] font-black uppercase border border-slate-200 dark:border-slate-800/35">
                U
              </div>
              <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Assigned: Unassigned
              </span>
            </>
          )}
        </div>

        {task.reviewerId && (
          <div className="flex items-center gap-1.5">
            <div className="h-5 w-5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-[8px] font-black uppercase border border-amber-100 dark:border-amber-900/35">
              {reviewerName?.charAt(0) || 'R'}
            </div>
            <span className="text-[9px] font-bold text-slate-550 dark:text-slate-400 uppercase tracking-wider">
              Reviewer: {reviewerName}
            </span>
          </div>
        )}
      </div>
      
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

        <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-50 rounded-xl border border-slate-100 w-fit">
            {statusConfigs.map((config) => {
              const Icon = config.icon;
              const isActive = task.status === config.name;
              return (
                <button
                  key={config.name}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusChange(task.id || task._id || "", config.name);
                  }}
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

          {isCompleted && isEditor && (
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2 select-none w-full">
              <span className="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Payout Status
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border",
                  task.isPaid
                    ? "bg-emerald-50 text-emerald-700 border-emerald-250 dark:bg-emerald-950/20 dark:text-emerald-400"
                    : "bg-amber-50 text-amber-700 border-amber-250 dark:bg-amber-950/20 dark:text-amber-400"
                )}
              >
                {task.isPaid ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span>Paid</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                    <span>Unpaid</span>
                  </>
                )}
              </span>
            </div>
          )}

          {isCompleted && isManager && (
            <div className="flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800/80 pt-4 mt-2 select-none w-full">
              {isClientPerDelivery && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Client Invoice
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onClientPaymentStatusChange) {
                        onClientPaymentStatusChange(task.id || task._id || "", !task.isPaidByClient);
                      }
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 border cursor-pointer",
                      task.isPaidByClient
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30"
                        : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30"
                    )}
                    title="Toggle Client Payment Status"
                  >
                    {task.isPaidByClient ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Paid</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 animate-pulse" />
                        <span>Unpaid</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {assignedMember && (
                <div className="flex items-center justify-between w-full">
                  <span className="text-[9.5px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    Assignee Payout
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onPaymentStatusChange) {
                        onPaymentStatusChange(task.id || task._id || "", !task.isPaid);
                      }
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all active:scale-95 border cursor-pointer",
                      task.isPaid
                        ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30"
                        : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 dark:bg-rose-955/20 dark:text-rose-400 dark:border-rose-900/30"
                    )}
                    title="Toggle Assignee Payout Status"
                  >
                    {task.isPaid ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Paid</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400 animate-pulse" />
                        <span>Unpaid</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
