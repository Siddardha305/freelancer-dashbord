export type StatusType = "Active" | "Paused" | "Inactive" | "Completed" | "Pending" | "Overdue" | "Paid" | "Review" | "To Do" | "In Progress";

export function StatusBadge({ status }: { status: StatusType | string }) {
  let colorClass = "bg-gray-100 text-gray-800"; // default

  switch (status) {
    case "Active":
    case "Completed":
    case "Paid":
      colorClass = "bg-green-100 text-green-800";
      break;
    case "Paused":
    case "Pending":
    case "Review":
    case "Medium":
      colorClass = "bg-yellow-100 text-yellow-800";
      break;
    case "Inactive":
    case "Overdue":
    case "High":
      colorClass = "bg-red-100 text-red-800";
      break;
    case "To Do":
    case "Low":
      colorClass = "bg-gray-100 text-gray-800";
      break;
    case "In Progress":
      colorClass = "bg-blue-100 text-blue-800";
      break;
  }

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
}
