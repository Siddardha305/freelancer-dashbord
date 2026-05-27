'use client';

import React, { createContext, useContext } from 'react';
import { PlanId, PlanLimits, getPlanConfig, getPlanLimits, PLANS } from '@/lib/plans';

interface PlanContextType {
  plan: PlanId;
  planName: string;
  planBadge: string;
  limits: PlanLimits;
  /** Returns true if user can add more clients */
  canAddClient: (currentCount: number) => boolean;
  /** Returns true if user can add more tasks this month */
  canAddTask: (currentMonthlyCount: number) => boolean;
  /** Returns true if the named feature is available on this plan */
  isFeatureUnlocked: (feature: keyof PlanLimits) => boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export function PlanProvider({
  children,
  plan = 'hobby',
}: {
  children: React.ReactNode;
  plan?: string;
}) {
  const planId = (plan as PlanId) in PLANS ? (plan as PlanId) : 'hobby';
  const config = getPlanConfig(planId);
  const limits = getPlanLimits(planId);

  const canAddClient = (currentCount: number): boolean => {
    if (limits.maxClients === Infinity) return true;
    return currentCount < limits.maxClients;
  };

  const canAddTask = (currentMonthlyCount: number): boolean => {
    if (limits.maxTasksPerMonth === Infinity) return true;
    return currentMonthlyCount < limits.maxTasksPerMonth;
  };

  const isFeatureUnlocked = (feature: keyof PlanLimits): boolean => {
    const val = limits[feature];
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val > 0;
    return false;
  };

  return (
    <PlanContext.Provider
      value={{
        plan: planId,
        planName: config.name,
        planBadge: config.badge,
        limits,
        canAddClient,
        canAddTask,
        isFeatureUnlocked,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan(): PlanContextType {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    // Safe fallback — defaults to hobby plan if context not mounted
    const planId: PlanId = 'hobby';
    const config = getPlanConfig(planId);
    const limits = getPlanLimits(planId);
    return {
      plan: planId,
      planName: config.name,
      planBadge: config.badge,
      limits,
      canAddClient: (n) => n < 2,
      canAddTask: (n) => n < 5,
      isFeatureUnlocked: () => false,
    };
  }
  return ctx;
}
