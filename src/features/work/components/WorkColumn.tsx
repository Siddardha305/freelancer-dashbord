import { WorkCard, Task } from "./WorkCard";

interface WorkColumnProps {
  title: string;
  count: number;
  tasks: Task[];
  onStatusChange: (id: string, newStatus: string) => void;
  alert?: boolean;
  color?: "slate" | "indigo" | "amber" | "emerald";
}

export function WorkColumn({ title, count, tasks, onStatusChange, alert = false, color = "slate" }: WorkColumnProps) {
  const colorClasses = {
    slate: "text-slate-500 bg-slate-100 border-slate-200",
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
  };

  return (
    <div className="flex flex-col gap-6 group/column">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <h3 className={`text-sm font-bold uppercase tracking-wider transition-colors ${
            color === 'slate' ? 'text-slate-500 group-hover/column:text-slate-900' : 
            color === 'indigo' ? 'text-indigo-600 group-hover/column:text-indigo-700' : 
            color === 'amber' ? 'text-amber-600 group-hover/column:text-amber-700' : 
            'text-emerald-600 group-hover/column:text-emerald-700'
          }`}>
            {title}
          </h3>
          <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${colorClasses[color]}`}>
            {count}
          </span>
        </div>
      </div>
      <div className="space-y-4 min-h-[150px]">
        {tasks.map(task => (
          <WorkCard key={task.id} task={task} onStatusChange={onStatusChange} />
        ))}
        {tasks.length === 0 && (
          <div className="h-32 border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No Tasks</span>
          </div>
        )}
      </div>
    </div>
  );
}


