'use client'

import { useState } from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  CalendarDays
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { Work } from "@/types/work";

interface WorkCalendarProps {
  tasks: Work[];
  onMoveTask: (taskId: string, targetDateStr: string) => void;
  onAddTask: (dateStr: string) => void;
  onStatusChange?: (taskId: string, newStatus: string) => void;
}

export function WorkCalendar({ tasks, onMoveTask, onAddTask }: WorkCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverDateStr, setDragOverDateStr] = useState<string | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Helper: date -> YYYY-MM-DD
  const getLocalDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Get date string from task deadline (robust parser)
  const getTaskDateString = (deadlineStr: string) => {
    try {
      const d = new Date(deadlineStr);
      if (isNaN(d.getTime())) return '';
      return getLocalDateString(d);
    } catch {
      return '';
    }
  };

  // Build grid days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  const gridDays = [];

  // Previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const date = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
    gridDays.push({
      date,
      isCurrentMonth: false,
      dateStr: getLocalDateString(date),
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(currentYear, currentMonth, i);
    gridDays.push({
      date,
      isCurrentMonth: true,
      dateStr: getLocalDateString(date),
    });
  }

  // Next month padding to align standard 6-week grid (42 days)
  const remainingCells = 42 - gridDays.length;
  for (let i = 1; i <= remainingCells; i++) {
    const date = new Date(currentYear, currentMonth + 1, i);
    gridDays.push({
      date,
      isCurrentMonth: false,
      dateStr: getLocalDateString(date),
    });
  }

  const todayStr = getLocalDateString(new Date());

  // HTML5 Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverDateStr(null);
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    if (dragOverDateStr !== dateStr) {
      setDragOverDateStr(dateStr);
    }
  };

  const handleDragLeave = () => {
    setDragOverDateStr(null);
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain") || draggedTaskId;
    if (taskId) {
      onMoveTask(taskId, targetDateStr);
    }
    setDraggedTaskId(null);
    setDragOverDateStr(null);
  };

  // Status colors helper
  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Completed":
      case "Done":
        return "bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100/70";
      case "Review":
        return "bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100/70";
      case "In Progress":
        return "bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100/70";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100/70";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
      case "Done":
        return <CheckCircle2 className="h-3 w-3 shrink-0" />;
      case "Review":
        return <AlertCircle className="h-3 w-3 shrink-0" />;
      case "In Progress":
        return <TrendingUp className="h-3 w-3 shrink-0 animate-pulse" />;
      default:
        return <Clock className="h-3 w-3 shrink-0" />;
    }
  };

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 lg:p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
            <CalendarDays className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">
              {format(currentDate, "MMMM yyyy")}
            </h3>
            <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">
              Drag tasks to re-schedule deadlines
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/60 shadow-inner">
          <button
            onClick={handlePrevMonth}
            className="p-2.5 hover:bg-white text-slate-500 hover:text-slate-900 rounded-xl transition-all active:scale-95"
            title="Previous Month"
          >
            <ChevronLeft className="h-4.5 w-4.5" />
          </button>
          
          <button
            onClick={handleToday}
            className="px-5 py-2 bg-white text-indigo-600 hover:bg-slate-50 shadow-sm text-xs font-black uppercase tracking-wider rounded-xl transition-all active:scale-95"
          >
            Today
          </button>

          <button
            onClick={handleNextMonth}
            className="p-2.5 hover:bg-white text-slate-500 hover:text-slate-900 rounded-xl transition-all active:scale-95"
            title="Next Month"
          >
            <ChevronRight className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>

      {/* Weekday columns */}
      <div className="grid grid-cols-7 gap-2.5 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 select-none pb-2">
        {weekdays.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2.5">
        {gridDays.map(({ date, isCurrentMonth, dateStr }) => {
          const isToday = dateStr === todayStr;
          const isOver = dateStr === dragOverDateStr;
          const dayTasks = tasks.filter((task) => {
            const taskDateStr = getTaskDateString(task.deadline);
            if (!taskDateStr) return false;
            if (taskDateStr === dateStr) return true;
            
            // Overdue tasks rollover: If not completed, show on subsequent calendar cells up to today
            const isCompleted = task.status === "Done";
            return !isCompleted && taskDateStr < dateStr && dateStr <= todayStr;
          });

          return (
            <div
              key={dateStr}
              onDragOver={(e) => handleDragOver(e, dateStr)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, dateStr)}
              className={cn(
                "min-h-[140px] p-3 rounded-3xl border flex flex-col justify-between group transition-all duration-300 relative",
                isCurrentMonth 
                  ? "bg-slate-50/30 border-slate-200/80 text-slate-800" 
                  : "bg-slate-100/10 border-slate-100 text-slate-300",
                isToday && "bg-indigo-50/20 border-indigo-200/60 ring-2 ring-indigo-600/5",
                isOver && "border-dashed border-2 border-indigo-500 bg-indigo-50/40 scale-[1.02] shadow-md shadow-indigo-100/30 z-10"
              )}
            >
              {/* Day Cell Header */}
              <div className="flex justify-between items-center select-none">
                <span className={cn(
                  "text-sm font-black flex items-center justify-center w-7 h-7 rounded-full",
                  isToday && "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                )}>
                  {date.getDate()}
                </span>
                
                {/* Quick Add Button */}
                <button
                  onClick={() => onAddTask(dateStr)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 bg-white border border-slate-200 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer shadow-sm"
                  title="Create task for this date"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>

              {/* Tasks List */}
              <div className="flex-1 mt-2.5 space-y-1.5 overflow-y-auto max-h-[100px] no-scrollbar">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "px-2.5 py-1.5 rounded-2xl border text-[10px] font-bold tracking-tight flex items-center gap-1.5 transition-all duration-200 cursor-grab active:cursor-grabbing border-slate-200/50 shadow-sm",
                      getStatusStyles(task.status)
                    )}
                    title={`${task.title} - ${task.client}`}
                  >
                    {getStatusIcon(task.status)}
                    <span className="truncate flex-1 font-extrabold">{task.title}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
