export type WorkStatus = "To Do" | "In Progress" | "Review" | "Done";
export type WorkPriority = "Urgent" | "High" | "Normal" | "Low";

export interface Work {
  id: string;
  client: string;
  title: string;
  description?: string;
  deadline: string;
  status: WorkStatus;
  priority: WorkPriority;
  attachments: string[];
  estimatedHours: number;
  actualHours: number;
  revisions: number;
  approvedByClient: boolean;
  completedAt?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
