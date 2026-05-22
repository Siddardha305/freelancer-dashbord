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
    <section id="contact" className="py-32 border-t border-slate-200 px-6 sm:px-12 max-w-5xl mx-auto">
      <div className="bg-white rounded-[2rem] border border-slate-200/80 p-8 sm:p-12 shadow-xl shadow-slate-100 relative overflow-hidden">
        {/* Subtle decorative elements for professional dev-vibe */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-slate-100 rounded-full blur-[60px] pointer-events-none" />

        {/* Reusable Section Header inside card */}
        <SectionHeader 
          badge="Preflight Console"
          badgeIcon={Cpu}
          title="Preflight Workspace Registry"
          description="Transmit telemetry pings directly to system diagnostics logs."
          centered={true}
          className="!mb-12"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Side */}
          <form onSubmit={handleContactSubmit} className="space-y-5 lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Workspace Operator</label>
                <input 
                  type="text" 
                  required
                  disabled={isSubmitted}
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Siddardha Chitturi"
                  className="w-full bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-all font-medium shadow-inner" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Telemetry Destination</label>
                <input 
                  type="email" 
                  required
                  disabled={isSubmitted}
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="sid@freelanceos.com"
                  className="w-full bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 transition-all font-medium shadow-inner" 
                />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Payload Data (Message Details)</label>
              <textarea 
                rows={4}
                disabled={isSubmitted}
                value={contactMsg}
                onChange={(e) => setContactMsg(e.target.value)}
                placeholder="Ask about data isolation, session encryption protocols, or MongoDB configuration details..."
                className="w-full bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 resize-none transition-all font-medium shadow-inner"
              />
            </div>

            {!isSubmitted ? (
              <ActionButton
                type="submit"
                variant="primary"
                icon={Mail}
                iconPosition="left"
                className="w-full py-4 text-[10px] rounded-xl"
              >
                Transmit Inquiries to Workspace Logs
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
                Transmit Complete. Reset Preflight Form
              </ActionButton>
            )}
          </form>

          {/* Reusable ConsoleWindow rendered as standard shell screen */}
          <ConsoleWindow 
            title="preflight_telemetry.log"
            isTerminal={true}
            aspectRatio="auto"
            className="lg:col-span-5 border border-slate-200"
          >
            <div className="p-5 font-mono text-[10px] leading-relaxed min-h-[220px] text-slate-350 space-y-2 select-all selection:bg-indigo-650 selection:text-white">
              {!isSubmitted ? (
                <>
                  <p className="text-slate-600">// Standing by for preflight handshake...</p>
                  <p className="text-slate-550">&gt; waiting_for_inputs: TRUE</p>
                  <p className="text-slate-550">&gt; ready_for_transmission: FALSE</p>
                  <p className="text-slate-450 animate-pulse text-[9px]">▋ LINE ACTIVE</p>
                </>
              ) : (
                <>
                  <p className="text-indigo-400">// Telemetry handshake initialized...</p>
                  <p className="text-slate-500">[{logTime}] CONNECTIVITY PREFLIGHT CHECK: OK</p>
                  <p className="text-slate-400">&gt; target_payload: REGISTER_REQUEST</p>
                  <p className="text-slate-400">&gt; name_length: {contactName.length} chars</p>
                  <p className="text-slate-400">&gt; source: {contactEmail}</p>
                  <p className="text-indigo-300">&gt; transport_sec: AES-256-GCM</p>
                  {contactMsg ? (
                    <p className="text-indigo-400/80">&gt; payload_body: &quot;{contactMsg.slice(0, 32)}...&quot;</p>
                  ) : (
                    <p className="text-slate-650">&gt; payload_body: EMPTY</p>
                  )}
                  <p className="text-emerald-400 font-bold flex items-center gap-1 mt-3">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    &gt; STABLE TRANSMISSION DISPATCH: SUCCESS [202]
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
