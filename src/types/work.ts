export type WorkStatus = "To Do" | "In Progress" | "Review" | "Done" | "Completed";
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
  videoLink?: string;
  estimatedHours: number;
  actualHours: number;
  revisions: number;
  approvedByClient: boolean;
  completedAt?: string;
  tags: string[];
  assignedTo?: string;
  reviewerId?: string;
  isPaid?: boolean;
  createdAt: string;
  updatedAt: string;
}
