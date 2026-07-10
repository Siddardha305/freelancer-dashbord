'use client'

import React from 'react';
import { WorkColumn } from "./WorkColumn";
import { Work } from "@/types/work";
import { Client } from "@/types/client";

interface WorkBoardViewProps {
  filteredTasks: Work[];
  clients: Client[];
  teamMembers?: any[];
  onStatusChange: (taskId: string, newStatus: string) => void;
  onDelete: (taskId: string) => void;
  isEditor?: boolean;
  isViewer?: boolean;
  onEditClick?: (task: any) => void;
  onPaymentStatusChange?: (taskId: string, isPaid: boolean) => void;
}

export function WorkBoardView({
  filteredTasks,
  clients,
  teamMembers = [],
  onStatusChange,
  onDelete,
  isEditor = false,
  isViewer = false,
  onEditClick,
  onPaymentStatusChange
}: WorkBoardViewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 items-start pb-12">
      <WorkColumn 
        title="To Do" 
        count={filteredTasks.filter((t: Work) => t.status === "To Do").length} 
        tasks={filteredTasks.filter((t: Work) => t.status === "To Do")} 
        clients={clients}
        teamMembers={teamMembers}
        onStatusChange={onStatusChange} 
        onDelete={onDelete} 
        color="slate" 
        isEditor={isEditor}
        isViewer={isViewer}
        onEditClick={onEditClick}
        onPaymentStatusChange={onPaymentStatusChange}
      />
      <WorkColumn 
        title="In Progress" 
        count={filteredTasks.filter((t: Work) => t.status === "In Progress").length} 
        tasks={filteredTasks.filter((t: Work) => t.status === "In Progress")} 
        clients={clients}
        teamMembers={teamMembers}
        onStatusChange={onStatusChange} 
        onDelete={onDelete} 
        color="indigo" 
        isEditor={isEditor}
        isViewer={isViewer}
        onEditClick={onEditClick}
        onPaymentStatusChange={onPaymentStatusChange}
      />
      <WorkColumn 
        title="Review" 
        count={filteredTasks.filter((t: Work) => t.status === "Review").length} 
        tasks={filteredTasks.filter((t: Work) => t.status === "Review")} 
        clients={clients}
        teamMembers={teamMembers}
        onStatusChange={onStatusChange} 
        onDelete={onDelete} 
        color="amber" 
        alert 
        isEditor={isEditor}
        isViewer={isViewer}
        onEditClick={onEditClick}
        onPaymentStatusChange={onPaymentStatusChange}
      />
      <WorkColumn 
        title="Completed" 
        count={filteredTasks.filter((t: Work) => (t.status as string) === "Completed" || t.status === "Done").length} 
        tasks={filteredTasks.filter((t: Work) => (t.status as string) === "Completed" || t.status === "Done")} 
        clients={clients}
        teamMembers={teamMembers}
        onStatusChange={onStatusChange} 
        onDelete={onDelete} 
        color="emerald" 
        isEditor={isEditor}
        isViewer={isViewer}
        onEditClick={onEditClick}
        onPaymentStatusChange={onPaymentStatusChange}
      />
    </div>
  );
}
