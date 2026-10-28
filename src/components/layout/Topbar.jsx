import { Menu, Moon, Sun, Bell, ChevronDown, CalendarDays } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function Topbar({ onMenuClick, pageName }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-[64px] items-center justify-between border-b border-[#dce7df] bg-white/90 px-4 backdrop-blur-xl sm:h-[68px] sm:px-8 dark:border-[#34443a] dark:bg-[#18211b]/94">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="rounded-[10px] p-2 text-[#516457] hover:bg-[#edf4ef] lg:hidden dark:text-[#d0dcd3] dark:hover:bg-[#293b30]"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-[12px] text-[#687b6d] dark:text-[#b6c6ba]">Workspace</span><span className="text-[#99aa9e] dark:text-[#718478]">/</span><h2 className="text-[13px] font-semibold text-[#243a2b] dark:text-[#f0f7f1]">{pageName}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden items-center gap-2 rounded-[10px] border border-[#dfe9e1] bg-[#f7faf7] px-2.5 py-2 text-[11px] font-medium text-[#52675a] sm:flex dark:border-[#3b4d40] dark:bg-[#222e26] dark:text-[#d0dcd3]"><CalendarDays className="h-[14px] w-[14px]" />{new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date())}</div>
        <button type="button" aria-label="Notifications" className="relative rounded-[10px] p-2 text-[#54685b] transition hover:bg-[#edf4ef] dark:text-[#c7d5cb] dark:hover:bg-[#293b30]"><Bell className="h-[17px] w-[17px]" /><span className="absolute right-[7px] top-[7px] h-1.5 w-1.5 rounded-full bg-[#ed9a59] ring-2 ring-white dark:ring-[#18211b]" /></button>
        <span className="hidden h-7 w-px bg-[#e9eeea] sm:block dark:bg-[#29332d]" />
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-[10px] p-2 text-[#54685b] transition hover:bg-[#edf4ef] dark:text-[#c7d5cb] dark:hover:bg-[#293b30]"
          aria-label="Toggle light and dark theme"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button type="button" aria-label="Account menu" className="flex items-center gap-2 rounded-full py-1 pl-1 pr-0.5 hover:bg-[#edf4ef] dark:hover:bg-[#293b30]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#dff0e5] text-[11px] font-bold text-[#286540] ring-2 ring-white dark:bg-[#31503a] dark:text-[#c2ebca] dark:ring-[#18211b]">MM</span><ChevronDown className="hidden h-3.5 w-3.5 text-[#61776a] dark:text-[#b0c2b5] sm:block" /></button>
      </div>
    </header>
  )
}

