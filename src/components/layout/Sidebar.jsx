import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Utensils,
  Receipt,
  Wallet,
  FileBarChart,
  Settings,
  X,
  Sparkles,
} from 'lucide-react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/members', label: 'Members', icon: Users },
  { to: '/meals', label: 'Meals', icon: Utensils },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/deposits', label: 'Deposits', icon: Wallet },
  { to: '/reports', label: 'Reports', icon: FileBarChart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex w-[264px] flex-col border-r border-[#dce7df] bg-white transition-transform duration-200 ease-in-out dark:border-[#34443a] dark:bg-[#18211b] ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <div className="flex h-[76px] shrink-0 items-center justify-between border-b border-[#e5ede7] bg-gradient-to-r from-white via-[#fbfefc] to-[#edf7f0] px-6 dark:border-[#34443a] dark:from-[#18211b] dark:via-[#1b271f] dark:to-[#20352a]">
        <NavLink to="/dashboard" onClick={onClose} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-[#45aa79] to-[#247b65] text-white shadow-[0_5px_12px_rgb(39_134_106/24%)]">
            <Utensils className="h-[19px] w-[19px] stroke-[2.2]" />
          </div>
          <div><span className="block text-[15px] font-bold tracking-[-.035em] text-[#1d3525] dark:text-[#f0f7f1]">MessMate</span><span className="mt-0.5 block text-[10px] font-semibold tracking-[.03em] text-[#65796a] dark:text-[#b0c1b4]">SMART MESS MANAGEMENT</span></div>
        </NavLink>
        <button type="button" onClick={onClose} aria-label="Close navigation" className="rounded-md p-2 text-subtle hover:bg-surface-elevated lg:hidden dark:hover:bg-brand-hover"><X className="h-[18px] w-[18px]" /></button>
      </div>

      <div className="px-5 pb-2 pt-7 text-[10px] font-bold uppercase tracking-[.14em] text-[#667d6d] dark:text-[#afc2b3]">Workspace</div>
      <nav aria-label="Main navigation" className="flex-1 space-y-1 px-3.5">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `group relative flex items-center gap-3 rounded-[11px] px-3 py-[11px] text-[13px] font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-[#e5f3e8] to-[#e7eefb] text-[#205c38] shadow-[inset_3px_0_0_#49a879] dark:from-[#294735] dark:to-[#2a3545] dark:text-[#c0ebca]'
                    : 'text-[#4e6254] hover:bg-[#edf4ef] hover:text-[#1f3928] dark:text-[#c4d1c7] dark:hover:bg-[#26352b]'
                }`
              }
            >
              <Icon className="h-[18px] w-[18px] stroke-[1.8] transition-transform group-hover:scale-105" />
              {item.label}
            </NavLink>
          )
        })}
      </nav>
      <div className="mx-4 mb-4 rounded-[14px] border border-[#d9e7dd] bg-gradient-to-br from-[#eef8f0] via-[#f7fbf7] to-[#eff3fc] p-4 dark:border-[#3a5040] dark:bg-gradient-to-br dark:from-[#22362a] dark:via-[#202923] dark:to-[#252b3c]">
        <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#ecf6f0] to-[#edf1ff] text-[#4289a1] dark:from-[#293c30] dark:to-[#28273a] dark:text-[#83c9c0]"><Sparkles className="h-4 w-4" /></div>
        <p className="text-[12px] font-semibold text-[#284332] dark:text-[#edf5ef]">Everything in balance.</p>
        <p className="mt-1 text-[11px] leading-[1.6] text-[#536b59] dark:text-[#c1d0c4]">Your meals, expenses, and accounts in one peaceful place.</p>
      </div>
      <div className="border-t border-[#e5ede7] px-5 py-4 text-[10px] font-medium text-[#617769] dark:border-[#34443a] dark:text-[#aec0b3]">Made for better living together.</div>
    </aside>
  )
}

