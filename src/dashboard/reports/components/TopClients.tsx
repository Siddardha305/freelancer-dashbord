const topClients = [
  { rank: 1, name: "Marques Brownlee", revenue: "$14,500", thumbnails: 12 },
  { rank: 2, name: "MrBeast Gaming", revenue: "$12,000", thumbnails: 40 },
  { rank: 3, name: "Iman Gadzhi", revenue: "$9,800", thumbnails: 15 },
];

export function TopClients() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-base font-semibold text-gray-900">Top Clients (YTD)</h2>
      </div>
      <div className="flex-1 p-6 space-y-6">
        {topClients.map((client) => (
          <div key={client.rank} className="flex items-center gap-4">
            <div className="h-10 w-10 shrink-0 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-700 font-bold">
              #{client.rank}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{client.name}</p>
              <p className="text-sm text-gray-500 truncate">{client.thumbnails} thumbnails</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-900">{client.revenue}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
