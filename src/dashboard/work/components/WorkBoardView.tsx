'use client'

import React from 'react';
import { WorkColumn } from "./WorkColumn";
import { Work } from "@/types/work";
import { Client } from "@/types/client";

interface WorkBoardViewProps {
  filteredTasks: Work[];
  clients: Client[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
}

export function WorkBoardView({
  filteredTasks,
  clients,
  onStatusChange,
  onDelete
}: WorkBoardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-start pb-12">
      <WorkColumn 
        title="To Do" 
        count={filteredTasks.filter((t: Work) => t.status === "To Do").length} 
        tasks={filteredTasks.filter((t: Work) => t.status === "To Do")} 
        clients={clients}
        onStatusChange={onStatusChange} 
        onDelete={onDelete} 
        color="slate" 
      />
      <WorkColumn 
        title="In Progress" 
        count={filteredTasks.filter((t: Work) => t.status === "In Progress").length} 
        tasks={filteredTasks.filter((t: Work) => t.status === "In Progress")} 
        clients={clients}
        onStatusChange={onStatusChange} 
        onDelete={onDelete} 
        color="indigo" 
      />
      <WorkColumn 
        title="Review" 
        count={filteredTasks.filter((t: Work) => t.status === "Review").length} 
        tasks={filteredTasks.filter((t: Work) => t.status === "Review")} 
        clients={clients}
        onStatusChange={onStatusChange} 
        onDelete={onDelete} 
        color="amber" 
        alert 
      />
      <WorkColumn 
        title="Completed" 
        count={filteredTasks.filter((t: Work) => (t.status as string) === "Completed" || t.status === "Done").length} 
        tasks={filteredTasks.filter((t: Work) => (t.status as string) === "Completed" || t.status === "Done")} 
        clients={clients}
        onStatusChange={onStatusChange} 
        onDelete={onDelete} 
        color="emerald" 
      />
    </div>
  );
}
