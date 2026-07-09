import { useState, useEffect } from "react";
import { Plus, Lock } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { AddWorkModal } from "./AddWorkModal";
import { usePlan } from "@/context/PlanContext";
import { useQuery } from "@tanstack/react-query";
import { getWorksAction } from "@/dashboard/work/actions/work-actions";
import { Work } from "@/types/work";
import { UpgradeModal } from "@/components/shared/UpgradeModal";
import { cn } from "@/lib/utils";
import { getCurrentUserAction } from "@/auth/actions/auth-actions";

export function WorkHeader() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const isReadOnly = currentUser?.teamRole === 'editor' || currentUser?.teamRole === 'viewer';

  useEffect(() => {
    async function loadUser() {
      try {
        const user = await getCurrentUserAction();
        setCurrentUser(user);
      } catch (err) {
        console.error("Failed to load user in WorkHeader:", err);
      }
    }
    loadUser();
  }, []);
  
  const { limits, canAddTask } = usePlan();

  const { data: tasks = [] } = useQuery({
    queryKey: ['works'],
    queryFn: getWorksAction,
  });

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  const monthlyTasksCount = (tasks as Work[]).filter((t: Work) => {
    if (!t.createdAt) return false;
    const d = new Date(t.createdAt);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  }).length;

  const atTaskLimit = !canAddTask(monthlyTasksCount);
  const taskLimitText = limits.maxTasksPerMonth === Infinity ? 'Unlimited' : String(limits.maxTasksPerMonth);

  return (
    <>
      <PageHeader
        title="Monthly Work"
        action={
          isReadOnly ? undefined :
          <button 
            onClick={() => {
              if (atTaskLimit) {
                setIsUpgradeModalOpen(true);
              } else {
                setIsModalOpen(true);
              }
            }}
            className={cn(
              "flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-200 shadow-lg active:scale-95",
              atTaskLimit 
                ? "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 hover:shadow-amber-100" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100 dark:shadow-indigo-950/50"
            )}
          >
            {atTaskLimit ? <Lock className="h-4 w-4 text-amber-600" /> : <Plus className="h-4 w-4" />}
            New Task
          </button>
        }
      />
      <AddWorkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
        limitName="Monthly Tasks limit"
        currentLimitText={`${monthlyTasksCount} / ${taskLimitText} tasks used`}
        upgradeToPlanName="Pro"
      />
    </>
  );
}
