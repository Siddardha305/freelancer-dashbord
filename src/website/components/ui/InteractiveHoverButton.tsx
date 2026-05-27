'use client'

import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface InteractiveHoverButtonProps {
  children: React.ReactNode
  className?: string
  href?: string
  onClick?: () => void
}

export function InteractiveHoverButton({
  children,
  className = "",
  href,
  onClick,
}: InteractiveHoverButtonProps) {
  const baseClasses = `group relative inline-flex cursor-pointer overflow-hidden rounded-full border border-white/10 bg-indigo-600 px-6 py-3 text-center font-semibold text-white shadow-lg shadow-indigo-600/20 transition-all duration-300 hover:shadow-indigo-600/40 hover:shadow-xl items-center justify-center ${className}`

  const content = (
    <>
      {/* Expanding dot background */}
      <span className="absolute inset-0 flex items-center justify-start pl-4 pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-white/80 transition-all duration-300 group-hover:scale-[100.8]" />
      </span>

      {/* Label — slides right and fades out on hover */}
      <span className="relative z-10 inline-block transition-all duration-300 group-hover:translate-x-6 group-hover:opacity-0 text-xs font-black uppercase tracking-widest">
        {children}
      </span>

      {/* Hover state — label + arrow slides in from right */}
      <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 translate-x-8 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span className="text-xs font-black uppercase tracking-widest">{children}</span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return (
    <button className={baseClasses} onClick={onClick}>
      {content}
    </button>
  )
}

// Secondary/ghost variant for "Explore Plans" style
export function InteractiveHoverButtonOutline({
  children,
  className = "",
  href,
  onClick,
}: InteractiveHoverButtonProps) {
  const baseClasses = `group relative inline-flex cursor-pointer overflow-hidden rounded-full border border-slate-700/80 bg-slate-900/60 px-6 py-3 text-center font-semibold text-slate-300 backdrop-blur-sm transition-all duration-300 hover:border-indigo-500/60 hover:text-white items-center justify-center ${className}`

  const content = (
    <>
      {/* Expanding dot */}
      <span className="absolute inset-0 flex items-center justify-start pl-4 pointer-events-none">
        <span className="h-2 w-2 rounded-full bg-slate-400 transition-all duration-300 group-hover:scale-[100.8] group-hover:bg-indigo-400" />
      </span>

      {/* Label */}
      <span className="relative z-10 inline-block transition-all duration-300 group-hover:translate-x-6 group-hover:opacity-0 text-xs font-black uppercase tracking-widest">
        {children}
      </span>

      {/* Hover state */}
      <span className="absolute inset-0 z-10 flex items-center justify-center gap-2 translate-x-8 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
        <span className="text-xs font-black uppercase tracking-widest">{children}</span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={baseClasses} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return (
    <button className={baseClasses} onClick={onClick}>
      {content}
    </button>
  )
}
