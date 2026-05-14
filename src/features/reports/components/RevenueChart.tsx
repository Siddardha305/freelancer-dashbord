export function RevenueChart() {
  const chartData = [30, 45, 60, 50, 75, 90, 85, 100, 80, 95];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"];

  return (
    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-base font-semibold text-gray-900 mb-6">Revenue Trend (YTD)</h2>
      <div className="h-72 w-full flex items-end justify-between gap-3">
        {chartData.map((h, i) => (
          <div key={i} className="w-full bg-indigo-50 rounded-t-lg relative group flex flex-col justify-end h-full">
            <div 
              className="w-full bg-indigo-500 rounded-t-md transition-all duration-300 group-hover:bg-indigo-600"
              style={{ height: `${h}%` }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4 text-xs text-gray-500 font-medium">
        {months.map(month => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </div>
  );
}
