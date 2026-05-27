'use client'

import React from 'react';
import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface ActionButtonProps {
  href?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => void;
  variant?: 'primary' | 'secondary' | 'emerald';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export default function ActionButton({
  href,
  onClick,
  variant = 'primary',
  icon: Icon,
  iconPosition = 'right',
  type = 'button',
  disabled = false,
  children,
  className = ''
}: ActionButtonProps) {
  const variantStyles = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100/50 focus:ring-indigo-500',
    secondary: 'bg-slate-900/60 border border-slate-800/80 text-slate-300 hover:bg-slate-800/60 hover:text-white shadow-md shadow-slate-950/20 focus:ring-slate-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-100/50 focus:ring-emerald-500'
  }[variant];

  const commonClasses = `inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest active:scale-95 transition-all outline-none focus:ring-2 focus:ring-offset-2 ${variantStyles} ${disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer'} ${className}`;

  const renderContent = () => (
    <>
      {Icon && iconPosition === 'left' && <Icon className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />}
      {children}
      {Icon && iconPosition === 'right' && <Icon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
    </>
  );

  if (href) {
    if (href.startsWith('#')) {
      return (
        <a 
          href={href} 
          onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>} 
          className={`${commonClasses} group`}
        >
          {renderContent()}
        </a>
      );
    }
    return (
      <Link 
        href={href} 
        onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>} 
        className={`${commonClasses} group`}
      >
        {renderContent()}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
      className={`${commonClasses} group`}
    >
      {renderContent()}
    </button>
  );
}
