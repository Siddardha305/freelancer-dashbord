'use client'

import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import FaqAccordionItem from '../shared/FaqAccordionItem';

export default function FaqSection() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How does account and data isolation work?',
      a: 'Every user in FreelanceOS has a strictly private account container in the MongoDB database. When you register, a User schema is initialized, and all clients, tasks, and payments you create are bound by your unique userId. Other registered users cannot see, wipe, or modify your workspaces.'
    },
    {
      q: 'Will I lose my existing demo data after signing up?',
      a: 'No! If you are the first user to register an account on the database, FreelanceOS will automatically detect it and securely adopt all existing legacy mock clients, work tasks, and payout logs to your new account. Subsequent users register into a clean, empty workspace.'
    },
    {
      q: 'What makes FreelanceOS secure?',
      a: 'Instead of relying on heavy third-party providers, we built a zero-dependency session system utilizing Node.js native crypto modules. Passwords are hashed with PBKDF2 + SHA-512 (100,000 iterations), and cookie sessions are securely encrypted using AES-256-GCM. Decryption tags prevent session tampering.'
    },
    {
      q: 'Can I choose different pricing plans for different clients?',
      a: 'Yes. Within the CRM pipeline, you can define a flat-rate monthly retainer plan, or transactional per-unit plans. For example, if you are a video editor or thumbnail designer, you can charge per thumbnail and log tasks against that rate automatically.'
    },
    {
      q: 'What admin diagnostic tools do you offer?',
      a: 'FreelanceOS includes an administrative Developer Tools panel. This displays MongoDB cluster connectivity status, storage quotas, average collection schema sizes, and lets you safely run an isolated context wipe of your tasks or ledger bills without affecting your clients list.'
    }
  ];

  return (
    <section id="faq" className="py-32 border-t border-slate-200 px-6 sm:px-12 max-w-5xl mx-auto">
      {/* Dynamic standardized header */}
      <SectionHeader 
        badge="Faq & Architecture"
        badgeIcon={HelpCircle}
        title="Frequently Asked Questions"
        description="Technical specifications, security defaults, and workspace operational mechanics."
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
