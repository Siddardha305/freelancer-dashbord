import { redirect } from 'next/navigation';

export default function DashboardPricingRedirectPage() {
  redirect('/dashboard/settings?tab=pricing');
}
