'use client'

import React, { useState } from 'react';
import { LayoutDashboard, Users, Kanban, CreditCard, Compass } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import ConsoleWindow from '../shared/ConsoleWindow';
import FeatureSidebarButton from '../shared/FeatureSidebarButton';

const screenshots = [
  {
    title: 'Dashboard Overview',
    description: 'Get a clear view of your revenue, active clients, and monthly goals in one gorgeous interface.',
    path: '/dashbord pics/maindashbord.png',
    icon: LayoutDashboard,
    badge: 'Consolidated Metrics'
  },
  {
    title: 'Client CRM',
    description: 'Keep your client details, contracts, and custom rates organized in one secure database.',
    path: '/dashbord pics/Clients-mannagement.png',
    icon: Users,
    badge: 'Client CRM'
  },
  {
    title: 'Visual Workboards',
    description: 'Manage deadlines, tasks, and deliverables with a beautifully simple progress board.',
    path: '/dashbord pics/Monthly-Work.png',
    icon: Kanban,
    badge: 'Visual Kanban'
  },
  {
    title: 'Invoices & Payouts',
    description: 'Log payments, track invoice statuses, and generate professional PDF reports with one click.',
    path: '/dashbord pics/Monthly-Payout-Summary.png',
    icon: CreditCard,
    badge: 'Smart Invoicing'
  }
];

export default function FeatureTour() {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <section className="py-28 px-6 sm:px-12 max-w-7xl mx-auto bg-slate-50/50">
      
      {/* Standardized Section Header */}
      <SectionHeader 
        badge="Platform Tour"
        badgeIcon={Compass}
        title="Designed for modern freelancers"
        description="A simple, powerful set of tools designed to help you run a highly professional business."
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
