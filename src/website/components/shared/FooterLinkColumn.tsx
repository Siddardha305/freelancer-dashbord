'use client'

import React from 'react';

interface FooterLinkColumnProps {
  title: string;
  links: Array<{ label: string; href: string }>;
}

export default function FooterLinkColumn({
  title,
  links
}: FooterLinkColumnProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
        {title}
      </h4>
      <ul className="space-y-2.5">
        {links.map((link, idx) => (
          <li key={idx}>
            <a 
              href={link.href} 
              className="text-[10px] font-black text-slate-500 hover:text-indigo-400 transition-colors uppercase tracking-widest"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
