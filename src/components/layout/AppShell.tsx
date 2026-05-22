import React from 'react'
import { Sidebar } from './Sidebar'
import { CurrencyProvider } from '@/context/CurrencyContext'

interface AppShellProps {
  children: React.ReactNode
  user?: any
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <CurrencyProvider initialCurrency={user?.currency}>
      <div className="flex h-screen w-full bg-gray-50/50 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full">
          <Sidebar user={user} />
        </div>

        <div className="flex flex-col flex-1 h-full min-w-0">
          <main className="flex-1 overflow-y-auto relative h-full">
            {children}
          </main>
        </div>
      </div>
    </CurrencyProvider>
  )
}

