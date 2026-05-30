'use client'

import React from 'react';
import { ChevronRight, LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface FeatureSidebarButtonProps {
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export default function FeatureSidebarButton({
  title,
  description,
  badge,
  icon: Icon,
  isActive,
  onClick
}: FeatureSidebarButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover="hover"
      className="w-full text-left p-5 rounded-[1.8rem] border border-transparent transition-all duration-300 flex items-start gap-4 cursor-pointer group outline-none focus:ring-1 focus:ring-indigo-500/50 relative overflow-hidden"
    >
      {/* Framer Motion Shared Active Background */}
      {isActive && (
        <motion.div
          layoutId="activeFeatureBg"
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-lg border border-slate-800/80 rounded-[1.8rem] -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      
      {/* Light glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-305 pointer-events-none -z-10" />

      {/* Button content */}
      <div className="relative z-10 flex items-start gap-4 w-full">
        <div className={`h-11 w-11 shrink-0 rounded-2xl flex items-center justify-center border transition-all duration-300 ${
          isActive 
            ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/30 scale-105' 
            : 'bg-slate-950/80 border-slate-850 text-slate-500 group-hover:text-slate-200 group-hover:border-slate-700'
        }`}>
          <motion.div
            variants={{
              hover: { rotate: 8, scale: 1.15 }
            }}
            whileHover="hover"
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="flex items-center justify-center"
          >
            <Icon className="h-5 w-5" />
          </motion.div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1 gap-2">
            <h3 className={`text-sm font-black tracking-tight transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
              {title}
            </h3>
            <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border transition-colors shrink-0 ${
              isActive 
                ? 'bg-indigo-950/40 border-indigo-900/40 text-indigo-400' 
                : 'bg-slate-950/80 border-slate-850 text-slate-500'
            }`}>
              {badge}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide leading-relaxed group-hover:text-slate-300 transition-colors">
            {description}
          </p>
        </div>
        
        <ChevronRight className={`h-4 w-4 shrink-0 self-center text-slate-500 transition-transform ${
          isActive ? 'translate-x-0.5 text-indigo-400' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
        }`} />
      </div>
    </motion.button>
  );
}
