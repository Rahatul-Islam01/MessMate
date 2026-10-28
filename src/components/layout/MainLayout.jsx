import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import { useLocation } from 'react-router-dom'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const pageNames = { '/dashboard': 'Overview', '/members': 'Members', '/meals': 'Meals', '/expenses': 'Expenses', '/deposits': 'Deposits', '/reports': 'Reports', '/settings': 'Settings' }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_92%_0%,_#e5f4eb_0%,_transparent_33%),linear-gradient(180deg,#f8faf8_0%,#f4f7f4_100%)] text-[#18231f] dark:bg-[radial-gradient(ellipse_at_92%_0%,_#182a20_0%,_transparent_36%),linear-gradient(180deg,#111914_0%,#101713_100%)] dark:text-[#e7eee9]">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-[#14231a]/45 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="min-h-screen lg:pl-[264px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} pageName={pageNames[location.pathname] || 'Overview'} />
        <main className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-8 sm:py-9 xl:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

