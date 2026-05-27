// Central source of truth for all plan definitions and limits
export type PlanId = 'hobby' | 'pro' | 'agency';

export interface PlanLimits {
  maxClients: number;
  maxTasksPerMonth: number;
  csvExport: boolean;
  revisionHistory: boolean;
  customEmailTemplates: boolean;
  teamSeats: number;
  whitelabelPortals: boolean;
}

export interface PlanDefinition {
  id: PlanId;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  description: string;
  color: string;
  badge: string;
  limits: PlanLimits;
}

export const PLANS: Record<PlanId, PlanDefinition> = {
  hobby: {
    id: 'hobby',
    name: 'Hobby',
    priceMonthly: 0,
    priceYearly: 0,
    description: 'Perfect for independent creators just starting out.',
    color: 'slate',
    badge: 'Free',
    limits: {
      maxClients: 2,
      maxTasksPerMonth: 5,
      csvExport: false,
      revisionHistory: false,
      customEmailTemplates: false,
      teamSeats: 1,
      whitelabelPortals: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 2499,
    priceYearly: 1999,
    description: 'Designed for active freelancers scaling their client load.',
    color: 'indigo',
    badge: '₹2,499/mo',
    limits: {
      maxClients: 15,
      maxTasksPerMonth: Infinity,
      csvExport: true,
      revisionHistory: true,
      customEmailTemplates: true,
      teamSeats: 3,
      whitelabelPortals: false,
    },
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    priceMonthly: 7499,
    priceYearly: 5999,
    description: 'Built for elite production agencies and growing teams.',
    color: 'purple',
    badge: '₹7,499/mo',
    limits: {
      maxClients: Infinity,
      maxTasksPerMonth: Infinity,
      csvExport: true,
      revisionHistory: true,
      customEmailTemplates: true,
      teamSeats: 10,
      whitelabelPortals: true,
    },
  },
};

export function getPlanConfig(planId: string): PlanDefinition {
  return PLANS[(planId as PlanId)] ?? PLANS.hobby;
}

export function getPlanLimits(planId: string): PlanLimits {
  return getPlanConfig(planId).limits;
}
