import React from 'react'
import { Sidebar } from './Sidebar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-full bg-gray-50/50 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex flex-col flex-1 h-full min-w-0">
        <main className="flex-1 overflow-y-auto relative h-full">
          {children}
        </main>
      </div>
    </div>
  )
}
