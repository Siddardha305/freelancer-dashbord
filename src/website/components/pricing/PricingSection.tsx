'use client'

import React, { useState } from 'react';
import { Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import SectionHeader from '../shared/SectionHeader';
import { InteractiveHoverButton, InteractiveHoverButtonOutline } from '../ui/InteractiveHoverButton';

export default function PricingSection() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // INR Prices
  const prices = {
    pro:    { monthly: 2499,  yearly: 1999  },
    agency: { monthly: 7499,  yearly: 5999  },
  };

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
      glow: "from-purple-500/5",
      badgeColor: "bg-purple-500/10 border-purple-500/20 text-purple-400",
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
      glow: "from-indigo-500/10",
      badgeColor: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
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
      glow: "from-emerald-500/5",
      badgeColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      href: "/signup?plan=agency"
    }
  ];

  return (
    <section id="pricing" className="py-32 border-t border-slate-900/60 max-w-7xl mx-auto px-6 sm:px-12 relative overflow-hidden">
      {/* Glow flares */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px] pointer-events-none" />

      <SectionHeader
        badge="SaaS Pricing"
        badgeIcon={Sparkles}
        title="Flexible, value-driven plans"
        description="Choose the tier that scales with your freelance business. Save up to 20% on yearly billing. All prices in Indian Rupees (₹)."
        centered={true}
      />

      {/* Monthly/Yearly sliding toggle */}
      <div className="flex justify-center items-center gap-4 mb-20 z-10 relative">
        <div className="bg-slate-950/80 backdrop-blur-md p-1.5 rounded-full border border-slate-800/80 flex items-center relative">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest relative transition-colors duration-300 cursor-pointer ${
              billingCycle === 'monthly' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {billingCycle === 'monthly' && (
              <motion.div
                layoutId="activeBillingCycle"
                className="absolute inset-0 bg-indigo-500 rounded-full -z-10 shadow-lg shadow-indigo-500/25"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest relative transition-colors duration-300 cursor-pointer flex items-center gap-1.5 ${
              billingCycle === 'yearly' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {billingCycle === 'yearly' && (
              <motion.div
                layoutId="activeBillingCycle"
                className="absolute inset-0 bg-indigo-500 rounded-full -z-10 shadow-lg shadow-indigo-500/25"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Yearly
            <span className={`px-2 py-0.5 rounded-md text-[8px] font-black tracking-normal transition-colors ${
              billingCycle === 'yearly' ? 'bg-indigo-950 text-indigo-300 border border-indigo-900/30' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
            }`}>
              SAVE 20%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {plans.map((plan, idx) => (
          <div
            key={idx}
            className={`rounded-[2.5rem] p-8 sm:p-10 border transition-all duration-500 flex flex-col justify-between relative overflow-hidden group ${
              plan.popular
                ? 'bg-slate-950/90 border-indigo-500/70 shadow-2xl shadow-indigo-500/5 md:-translate-y-2'
                : 'bg-slate-900/30 border-slate-800/80 shadow-lg hover:border-indigo-500/30 hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/5'
            }`}
          >
            {/* Glowing background accent on hover */}
            <div className={`absolute inset-0 bg-gradient-to-br ${plan.glow} via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10`} />

            {plan.popular && (
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[9px] font-black tracking-widest uppercase px-5 py-1.5 rounded-full shadow-lg shadow-indigo-500/10 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 fill-white" /> Recommended Tier
              </span>
            )}

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-black text-white uppercase tracking-wider">{plan.name}</h4>
                <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors shrink-0 ${plan.badgeColor}`}>
                  {plan.name === 'Hobby' ? 'Hobbyist' : plan.name === 'Pro' ? 'Freelancer' : 'Agency'}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-400 leading-relaxed">{plan.description}</p>

              <div className="flex items-baseline gap-1 pt-2 h-14">
                {plan.price === 0 ? (
                  <span className="text-4xl font-black text-white tracking-tighter">Free</span>
                ) : (
                  <>
                    <span className="text-xl font-black text-slate-400 self-start mt-1">₹</span>
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={plan.price}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="text-4xl font-black text-white tracking-tighter inline-block"
                      >
                        {formatINR(plan.price)}
                      </motion.span>
                    </AnimatePresence>
                    <span className="text-xs font-bold text-slate-500 ml-1">/ month</span>
                  </>
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
                  <li key={fIdx} className="flex items-center gap-3 text-xs text-slate-350 font-semibold leading-normal group-hover:text-slate-200 transition-colors">
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
    </section>
  );
}
