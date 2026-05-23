import { useCurrency } from "@/context/CurrencyContext";
import { DollarSign } from "lucide-react";

export function KpiCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  alert = false 
}: { 
  title: string, 
  value: string | number, 
  icon: any, 
  trend: string, 
  alert?: boolean 
}) {
  const { symbol } = useCurrency();
  const isCurrencyIcon = Icon === DollarSign;

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 group relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className={`p-4 rounded-2xl ${
          alert 
            ? 'bg-red-50 text-red-600' 
            : 'bg-indigo-50 text-indigo-600'
        } transition-all duration-300 group-hover:scale-110 flex items-center justify-center`}>
          {isCurrencyIcon ? (
            <span className="w-6 h-6 flex items-center justify-center text-lg font-black leading-none select-none">{symbol}</span>
          ) : (
            <Icon className="h-6 w-6" />
          )}
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{value}</p>
        </div>
      </div>
      
      <div className="mt-6 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${alert ? 'bg-red-500' : 'bg-emerald-500'}`} />
          <span className={`text-xs font-bold ${alert ? 'text-red-600' : 'text-emerald-600'}`}>
            {trend}
          </span>
        </div>
      </div>
    </div>
  );
}



