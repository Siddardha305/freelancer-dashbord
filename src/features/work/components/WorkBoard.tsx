import { WorkColumn } from "./WorkColumn";
import { Task } from "./WorkCard";

const tasks: Task[] = [
  { id: "1", client: "MrBeast Gaming", title: "GTA 5 Mod Thumbnail", status: "In Progress", deadline: "2026-05-21T17:00:00Z", priority: "High", revisions: 0, approvedByClient: false, actualHours: 2.5 },
  { id: "2", client: "TechLead", title: "Why I quit Google", status: "Review", deadline: "2026-05-22T10:00:00Z", priority: "Normal", revisions: 1, approvedByClient: false, actualHours: 4 },
  { id: "3", client: "Ali Abdaal", title: "Notion Setup 2024", status: "To Do", deadline: "2026-10-15T00:00:00Z", priority: "Low", revisions: 0, approvedByClient: false, actualHours: 0 },
  { id: "4", client: "Marques Brownlee", title: "iPhone 16 Review", status: "Completed", deadline: "2026-10-10T00:00:00Z", priority: "High", revisions: 0, approvedByClient: true, actualHours: 8 },
];

export function WorkBoard() {
  const handleStatusChange = (id: string, status: string) => {
    console.log("Status change:", id, status);
  };

  const handleDelete = (id: string) => {
    console.log("Delete task:", id);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start pb-8">
      <WorkColumn title="To Do" count={1} tasks={tasks.filter(t => t.status === "To Do")} onStatusChange={handleStatusChange} onDelete={handleDelete} />
      <WorkColumn title="In Progress" count={1} tasks={tasks.filter(t => t.status === "In Progress")} onStatusChange={handleStatusChange} onDelete={handleDelete} />
      <WorkColumn title="Review/Revision" count={1} tasks={tasks.filter(t => t.status === "Review")} onStatusChange={handleStatusChange} onDelete={handleDelete} alert />
      <WorkColumn title="Completed" count={1} tasks={tasks.filter(t => t.status === "Completed")} onStatusChange={handleStatusChange} onDelete={handleDelete} />
    </div>
  );
}

