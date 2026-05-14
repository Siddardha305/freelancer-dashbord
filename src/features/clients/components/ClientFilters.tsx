import { Search, Filter } from "lucide-react";

export function ClientFilters() {
  return (
    <div className="flex flex-col sm:flex-row justify-between gap-4 mt-6">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search clients..." 
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
      <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
        <Filter className="h-4 w-4" />
        Filter
      </button>
    </div>
  );
}
