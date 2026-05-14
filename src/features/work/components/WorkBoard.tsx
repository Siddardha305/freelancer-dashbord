import { WorkColumn } from "./WorkColumn";

const tasks = [
  { id: 1, client: "MrBeast Gaming", title: "GTA 5 Mod Thumbnail", status: "In Progress", deadline: "Today, 5:00 PM", priority: "High" },
  { id: 2, client: "TechLead", title: "Why I quit Google", status: "Review", deadline: "Tomorrow, 10:00 AM", priority: "Medium" },
  { id: 3, client: "Ali Abdaal", title: "Notion Setup 2024", status: "To Do", deadline: "Oct 15", priority: "Low" },
  { id: 4, client: "Marques Brownlee", title: "iPhone 16 Review", status: "Completed", deadline: "Oct 10", priority: "High" },
];

export function WorkBoard() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start pb-8">
      <WorkColumn title="To Do" count={1} tasks={tasks.filter(t => t.status === "To Do")} />
      <WorkColumn title="In Progress" count={1} tasks={tasks.filter(t => t.status === "In Progress")} />
      <WorkColumn title="Review/Revision" count={1} tasks={tasks.filter(t => t.status === "Review")} alert />
      <WorkColumn title="Completed" count={1} tasks={tasks.filter(t => t.status === "Completed")} />
    </div>
  );
}
