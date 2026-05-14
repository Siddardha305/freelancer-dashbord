'use client'

import React, { useEffect, useState } from 'react';
import { StatCard } from "@/components/shared/StatCard";
import { WorkManager } from "@/features/work/components/WorkManager";
import { WorkHeader } from "@/features/work/components/WorkHeader";
import { getWorksAction } from '@/features/work/actions/work-actions';

export default function WorkPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTasks() {
      try {
        const data = await getWorksAction();
        setTasks(data);
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadTasks();
    // Enable 5-second live polling for real-time synchronization
    const interval = setInterval(loadTasks, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50/50">
        <div className="h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50">
      <WorkHeader />

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <WorkManager initialTasks={tasks} />
        </div>
      </main>
    </div>
  );
}

