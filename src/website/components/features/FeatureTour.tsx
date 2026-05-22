'use client'

import React, { useState } from 'react';
import { LayoutDashboard, Users, Kanban, CreditCard, Compass } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import ConsoleWindow from '../shared/ConsoleWindow';
import FeatureSidebarButton from '../shared/FeatureSidebarButton';

const screenshots = [
  {
    title: 'Dashboard Overview',
    description: 'Track your total revenue, client health, and delivery metrics in one unified dashboard.',
    path: '/dashbord pics/maindashbord.png',
    icon: LayoutDashboard,
    badge: 'Consolidated Metrics'
  },
  {
    title: 'Client Management CRM',
    description: 'Monitor active contracts, pricing plans, and client communication priorities in detail.',
    path: '/dashbord pics/Clients-mannagement.png',
    icon: Users,
    badge: 'CRM Pipeline'
  },
  {
    title: 'Visual Workboards',
    description: 'Track visual progress, attachments, deadlines, and revisions for monthly work outputs.',
    path: '/dashbord pics/Monthly-Work.png',
    icon: Kanban,
    badge: 'Visual Kanban'
  },
  {
    title: 'Invoices & Payouts',
    description: 'Automate billing cycles, send professional PDF reports, and log bank or PayPal payments.',
    path: '/dashbord pics/Monthly-Payout-Summary.png',
    icon: CreditCard,
    badge: 'Ledger Settlement'
  }
];

export default function FeatureTour() {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="py-28 px-6 sm:px-12 max-w-7xl mx-auto bg-slate-50/50">
      
      {/* Standardized Section Header */}
      <SectionHeader 
        badge="Console Walkthrough"
        badgeIcon={Compass}
        title="Explore the Workspace Modules"
        description="Toggle between the live modules of FreelanceOS. Engineered for design elegance and modular telemetry."
        centered={true}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left side console sidebar list controller utilizing shared subcomponent */}
        <div className="lg:col-span-5 space-y-3">
          {screenshots.map((s, idx) => (
            <FeatureSidebarButton
              key={idx}
              title={s.title}
              description={s.description}
              badge={s.badge}
              icon={s.icon}
              isActive={activeSlide === idx}
              onClick={() => setActiveSlide(idx)}
            />
          ))}
        </div>

        {/* Right side live screenshot console window utilizing shared subcomponent */}
        <div className="lg:col-span-7">
          <ConsoleWindow 
            title={`${screenshots[activeSlide].title.toLowerCase().replace(/ /g, '_')}_view`}
            imageSrc={screenshots[activeSlide].path}
            imageAlt={screenshots[activeSlide].title}
          />
        </div>

      </div>
    </section>
  );
}
