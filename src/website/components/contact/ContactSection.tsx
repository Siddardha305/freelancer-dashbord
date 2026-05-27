'use client'

import React, { useState } from 'react';
import { Mail, Check, Cpu } from 'lucide-react';
import SectionHeader from '../shared/SectionHeader';
import ConsoleWindow from '../shared/ConsoleWindow';
import ActionButton from '../shared/ActionButton';

export default function ContactSection() {
  const [contactEmail, setContactEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [logTime, setLogTime] = useState('');

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactEmail && contactName) {
      setLogTime(new Date().toLocaleTimeString());
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setContactEmail('');
    setContactName('');
    setContactMsg('');
  };

  return (
    <section id="contact" className="py-32 border-t border-slate-900/60 px-6 sm:px-12 max-w-5xl mx-auto">
      <div className="bg-slate-900/40 rounded-[2rem] border border-slate-800/60 p-8 sm:p-12 shadow-2xl shadow-slate-950/50 relative overflow-hidden">
        {/* Subtle decorative elements for professional dev-vibe */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-slate-950/20 rounded-full blur-[60px] pointer-events-none" />

        {/* Reusable Section Header inside card */}
        <SectionHeader 
          badge="Contact Us"
          badgeIcon={Cpu}
          title="Have questions? Let's connect"
          description="Reach out to learn more about how FreelanceOS can elevate your freelance business."
          centered={true}
          className="!mb-12"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <form onSubmit={handleContactSubmit} className="space-y-5 lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Your Name</label>
                <input 
                  type="text" 
                  required
                  disabled={isSubmitted}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Siddardha Chitturi"
                  className="w-full bg-slate-950/60 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium shadow-md shadow-slate-950/50" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Your Email</label>
                <input 
                  type="email" 
                  required
                  disabled={isSubmitted}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="sid@freelanceos.com"
                  className="w-full bg-slate-950/60 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium shadow-md shadow-slate-950/50" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Your Message</label>
              <textarea 
                rows={4}
                disabled={isSubmitted}
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                placeholder="Tell us about your freelance business and what you're looking for..."
                className="w-full bg-slate-950/60 hover:bg-slate-950/80 focus:bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-550 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 resize-none transition-all font-medium shadow-md shadow-slate-950/50"
              />
            </div>

            {!isSubmitted ? (
              <ActionButton
                type="submit"
                variant="primary"
                icon={Mail}
                iconPosition="left"
                className="w-full py-4 text-[10px] rounded-xl shadow-lg shadow-indigo-600/15"
              >
                Send Message
              </ActionButton>
            ) : (
              <ActionButton
                type="button"
                variant="emerald"
                icon={Check}
                iconPosition="left"
                onClick={handleReset}
                className="w-full py-4 text-[10px] rounded-xl"
              >
                Message Sent! Send Another
              </ActionButton>
            )}
          </form>

          {/* Reusable ConsoleWindow rendered as standard shell screen */}
          <ConsoleWindow 
            title="message_delivery.log"
            isTerminal={true}
            aspectRatio="auto"
            className="lg:col-span-5 border border-slate-800/80 shadow-2xl"
          >
            <div className="p-5 font-mono text-[10px] leading-relaxed min-h-[220px] text-slate-350 space-y-2 select-all selection:bg-indigo-650 selection:text-white">
              {!isSubmitted ? (
                <>
                  <p className="text-slate-600">{"// Ready to receive message..."}</p>
                  <p className="text-slate-550">&gt; system_status: ACTIVE</p>
                  <p className="text-slate-550">&gt; secure_connection: READY</p>
                  <p className="text-slate-450 animate-pulse text-[9px]">▋ LINE OPEN</p>
                </>
              ) : (
                <>
                  <p className="text-indigo-400">{"// Dispatching message..."}</p>
                  <p className="text-slate-500">[{logTime}] MESSAGE PIPELINE: CONNECTED</p>
                  <p className="text-slate-400">&gt; sender_name: {contactName}</p>
                  <p className="text-slate-400">&gt; contact_email: {contactEmail}</p>
                  {contactMsg ? (
                    <p className="text-indigo-300">&gt; message_preview: &quot;{contactMsg.slice(0, 32)}...&quot;</p>
                  ) : (
                    <p className="text-slate-650">&gt; message_preview: NONE</p>
                  )}
                  <p className="text-emerald-400 font-bold flex items-center gap-1 mt-3">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    &gt; STATUS: SENT SUCCESSFULLY [200]
                  </p>
                </>
              )}
            </div>
          </ConsoleWindow>
        </div>
      </div>
    </section>
  );
}
