'use client'

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import FaqAccordionItem from '../shared/FaqAccordionItem';

export default function FaqSection() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Is my freelance data secure and private?',
      a: 'Yes, absolutely. FreelanceOS uses secure database isolation and bank-grade session protection, ensuring your client details, financials, and project logs are visible only to you.'
    },
    {
      q: 'Can I configure different rates for different clients?',
      a: 'Yes! You can define custom flat-rate monthly retainers or project-based per-unit rates (like per design, per hour, or per project) and log tasks against them effortlessly.'
    },
    {
      q: 'Can I export reports and invoices?',
      a: 'Yes, you can generate and download beautiful, clean PDF summaries of client payouts, work summaries, and invoices with a single click.'
    },
    {
      q: 'Is there a limit on clients or active projects?',
      a: 'No. FreelanceOS is built to grow with your business. You can add unlimited clients, projects, tasks, and payout history without any restrictions.'
    }
  ];

  return (
    <section id="faq" className="py-32 border-t border-slate-200 px-6 sm:px-12 max-w-5xl mx-auto">
      {/* Dynamic standardized header */}
      <SectionHeader 
        badge="FAQ"
        badgeIcon={HelpCircle}
        title="Frequently Asked Questions"
        description="Everything you need to know about setting up your workspace."
        centered={true}
      />

      {/* Accordion container utilizing shared subcomponents */}
      <div className="space-y-4 max-w-4xl mx-auto">
        {faqs.map((item, idx) => (
          <FaqAccordionItem 
            key={idx}
            question={item.q}
            answer={item.a}
            isOpen={expandedFaq === idx}
            onToggle={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
          />
        ))}
      </div>
    </section>
  );
}
