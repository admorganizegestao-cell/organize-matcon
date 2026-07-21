import React from 'react'
import { Outlet } from 'react-router-dom'
import SalaoSidebar from './SalaoSidebar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-[hsl(var(--background))]">
      <SalaoSidebar />
      <div className="flex-1 lg:ml-60 min-w-0 flex flex-col overflow-hidden">
        <main className="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
