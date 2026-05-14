interface StatCardProps {
  title: string;
  value: string | number;
  alert?: boolean;
}

export function StatCard({ title, value, alert = false }: StatCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 relative overflow-hidden transition-all duration-300 hover:shadow-lg group border border-slate-200">
      <div className={`absolute top-0 left-0 w-1 h-full ${alert ? 'bg-amber-500' : 'bg-indigo-600'}`} />
      
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
        {title}
      </p>
      
      <div className="flex items-baseline gap-2">
        <p className={`text-4xl font-bold tracking-tight ${alert ? 'text-amber-600' : 'text-slate-900'}`}>
          {value}
        </p>
      </div>
    </div>
  );
}


