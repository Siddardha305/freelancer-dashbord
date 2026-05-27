'use client'

import React, { useState } from 'react';
import { Check, Sparkles } from "lucide-react";
import SectionHeader from '../shared/SectionHeader';
import { InteractiveHoverButton, InteractiveHoverButtonOutline } from '../ui/InteractiveHoverButton';

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [deliveriesCount, setDeliveriesCount] = useState<number>(20);

  // INR Prices
  const prices = {
    pro:    { monthly: 2499,  yearly: 1999  },
    agency: { monthly: 7499,  yearly: 5999  },
  };

  // Estimate monthly value based on slider
  const getEstimatedPlan = (count: number) => {
    if (count <= 5)  return { name: "Hobby",  price: 0 };
    if (count <= 30) return { name: "Pro",    price: prices.pro[billingCycle] };
    return              { name: "Agency", price: prices.agency[billingCycle] };
  };

  const currentPlanEstimate = getEstimatedPlan(deliveriesCount);

  // Format INR with Indian comma grouping (e.g. 2,499 / 7,499)
  const formatINR = (amount: number) =>
    amount === 0 ? '0' : amount.toLocaleString('en-IN');

  const plans = [
    {
      name: "Hobby",
      price: 0,
      description: "Perfect for independent creators just starting out.",
      features: [
        "Up to 2 active clients",
        "5 thumbnail deliveries / mo",
        "1 visual Kanban workboard",
        "Single-user private workspace",
        "Standard ledger tracking"
      ],
      cta: "Get Started Free",
      popular: false,
      href: "/signup?plan=hobby"
    },
    {
      name: "Pro",
      price: prices.pro[billingCycle],
      description: "Designed for active freelancers scaling their client load.",
      features: [
        "Up to 15 active clients",
        "Unlimited task deliveries",
        "Dedicated revision history trackers",
        "3 collaborative team seats",
        "Custom welcome email templates",
        "Direct CSV ledger exports"
      ],
      cta: "Start 14-Day Free Trial",
      popular: true,
      href: "/signup?plan=pro"
    },
    {
      name: "Agency",
      price: prices.agency[billingCycle],
      description: "Built for elite production agencies and growing teams.",
      features: [
        "Unlimited active clients",
        "Unlimited task deliveries",
        "10 collaborative team seats",
        "Role-based workspace permissions",
        "White-label client access portals",
        "Custom domain sending verified",
        "Priority Slack integrations"
      ],
      cta: "Upgrade to Agency",
      popular: false,
      href: "/signup?plan=agency"
    }
  ];

  return (
    <section id="pricing" className="py-32 border-t border-slate-900/60 max-w-7xl mx-auto px-6 sm:px-12 relative overflow-hidden">
      {/* Glow flares */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

      <SectionHeader
        badge="SaaS Pricing"
        badgeIcon={Sparkles}
        title="Flexible, value-driven plans"
        description="Choose the tier that scales with your freelance business. Save up to 20% on yearly billing. All prices in Indian Rupees (₹)."
        centered={true}
      />

      {/* Monthly/Yearly Toggle */}
      <div className="flex justify-center items-center gap-4 mb-16 z-10 relative">
        <span className={`text-xs font-black uppercase tracking-widest ${billingCycle === 'monthly' ? 'text-indigo-400' : 'text-slate-400'}`}>Monthly</span>
        <button
          onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
          className="w-14 h-8 bg-slate-800 rounded-full p-1 transition-all duration-300 relative focus:outline-none border border-slate-700/60"
        >
          <div className={`w-5 h-5 rounded-full bg-indigo-500 transition-all duration-300 ${billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
        <span className={`text-xs font-black uppercase tracking-widest ${billingCycle === 'yearly' ? 'text-indigo-400' : 'text-slate-400'} flex items-center gap-1.5`}>
          Yearly <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[8px] font-bold tracking-normal">SAVE 20%</span>
        </span>
      </div>

      {/* Plan Value Calculator */}
      <div className="max-w-3xl mx-auto bg-slate-900/40 backdrop-blur-xl border border-slate-800/80 rounded-[2rem] p-8 sm:p-10 mb-20 shadow-xl relative z-10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-2 flex-1 w-full min-w-0">
            <h4 className="text-sm font-bold text-slate-100 uppercase tracking-wider">Dynamic Plan Estimator</h4>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">Drag the slider to input your typical monthly deliveries count:</p>

            <div className="pt-4 flex items-center gap-4">
              <input
                type="range"
                min="2"
                max="80"
                value={deliveriesCount}
                onChange={(e) => setDeliveriesCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-sm font-black text-slate-100 shrink-0 select-none bg-slate-800 px-3.5 py-1.5 rounded-xl border border-slate-700/40">
                {deliveriesCount} Deliveries
              </span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800/85 p-6 rounded-2xl text-center shrink-0 w-full md:w-56 space-y-2">
            <span className="text-[9px] font-extrabold text-indigo-400 uppercase tracking-widest">Recommended Plan</span>
            <h5 className="text-xl font-black text-white">{currentPlanEstimate.name}</h5>
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-xs font-black text-slate-400">₹</span>
              <span className="text-2xl font-black text-white">{formatINR(currentPlanEstimate.price)}</span>
              <span className="text-[10px] text-slate-500 font-bold">/ mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-[2.5rem] p-8 sm:p-10 border transition-all duration-300 flex flex-col justify-between relative group ${
              plan.popular
                ? 'bg-slate-950/90 border-indigo-500/80 shadow-2xl shadow-indigo-500/5 -translate-y-2'
                : 'bg-slate-900/30 border-slate-800/80 shadow-lg hover:border-slate-700/60'
            }`}
          >
            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-black tracking-widest uppercase px-5 py-1.5 rounded-full shadow-lg shadow-indigo-500/10 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 fill-white" /> Recommended Tier
              </span>
            )}

            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-black text-white uppercase tracking-wider">{plan.name}</h4>
                <p className="text-xs font-semibold text-slate-400 leading-relaxed mt-2">{plan.description}</p>
              </div>

              <div className="flex items-baseline gap-1 pt-2">
                {plan.price === 0 ? (
                  <span className="text-4xl font-black text-white tracking-tighter">Free</span>
                ) : (
                  <>
                    <span className="text-xl font-black text-slate-400 self-start mt-1">₹</span>
                    <span className="text-4xl font-black text-white tracking-tighter">{formatINR(plan.price)}</span>
                  </>
                )}
                {plan.price > 0 && (
                  <span className="text-xs font-bold text-slate-500">/ month</span>
                )}
              </div>

              {/* Yearly savings callout */}
              {plan.price > 0 && billingCycle === 'yearly' && (
                <div className="text-[10px] font-black text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-3 py-1.5 rounded-lg w-fit">
                  Save ₹{formatINR(
                    plan.name === 'Pro'
                      ? (prices.pro.monthly - prices.pro.yearly) * 12
                      : (prices.agency.monthly - prices.agency.yearly) * 12
                  )} / year
                </div>
              )}

              <hr className="border-slate-800/80" />

              <ul className="space-y-3.5">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-center gap-3 text-xs text-slate-300 font-semibold leading-normal">
                    <div className="h-4.5 w-4.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 text-indigo-400" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              {plan.popular ? (
                <InteractiveHoverButton href={plan.href} className="w-full py-4">
                  {plan.cta}
                </InteractiveHoverButton>
              ) : (
                <InteractiveHoverButtonOutline href={plan.href} className="w-full py-4">
                  {plan.cta}
                </InteractiveHoverButtonOutline>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* INR note */}
      <p className="text-center text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-12">
        All prices in Indian Rupees (₹) · GST applicable as per Indian tax regulations · Cancel anytime
      </p>
    </section>
  );
}
