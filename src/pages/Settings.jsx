import { useEffect, useRef, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { createId } from '../utils/ids'

const CURRENCIES = ['BDT', 'USD', 'EUR', 'GBP', 'INR']

function validateBackup(parsed) {
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { ok: false, error: 'Backup file must contain a JSON object.' }
  }

  const container = parsed.data && typeof parsed.data === 'object' ? parsed.data : parsed
  if (!container || typeof container !== 'object' || Array.isArray(container)) {
    return { ok: false, error: 'Backup data is missing or invalid.' }
  }

  const members = Array.isArray(container.members) ? container.members : null
  const meals = Array.isArray(container.meals) ? container.meals : null
  const expenses = Array.isArray(container.expenses) ? container.expenses : null
  const deposits = Array.isArray(container.deposits) ? container.deposits : null

  if (!members || !meals || !expenses || !deposits) {
    return { ok: false, error: 'Backup must include members, meals, expenses, and deposits arrays.' }
  }
  const normalizeMembers = members.map((member, index) => {
    if (!member || typeof member !== 'object' || Array.isArray(member)) {
      throw new Error(`Invalid member at index ${index}.`)
    }
    return {
      id: typeof member.id === 'string' && member.id ? member.id : createId('member'),
      name: typeof member.name === 'string' ? member.name : '',
      phone: typeof member.phone === 'string' ? member.phone : '',
      joinDate: typeof member.joinDate === 'string' ? member.joinDate : '',
      isActive: member.isActive !== false,
      email: typeof member.email === 'string' ? member.email : '',
      role: typeof member.role === 'string' ? member.role : 'member',
      createdAt: typeof member.createdAt === 'string' ? member.createdAt : new Date().toISOString(),
    }
  })

  const normalizeMeals = meals.map((meal, index) => {
    if (!meal || typeof meal !== 'object' || Array.isArray(meal)) {
      throw new Error(`Invalid meal at index ${index}.`)
    }
    const breakfast = Number(meal.breakfast)
    const lunch = Number(meal.lunch)
    const dinner = Number(meal.dinner)
    if (!Number.isFinite(breakfast) || breakfast < 0) throw new Error(`Invalid breakfast value at meal ${index}.`)
    if (!Number.isFinite(lunch) || lunch < 0) throw new Error(`Invalid lunch value at meal ${index}.`)
    if (!Number.isFinite(dinner) || dinner < 0) throw new Error(`Invalid dinner value at meal ${index}.`)
    return {
      id: typeof meal.id === 'string' && meal.id ? meal.id : createId('meal'),
      memberId: typeof meal.memberId === 'string' ? meal.memberId : '',
      date: typeof meal.date === 'string' ? meal.date : '',
      breakfast,
      lunch,
      dinner,
      createdAt: typeof meal.createdAt === 'string' ? meal.createdAt : new Date().toISOString(),
    }
  })

  const normalizeExpenses = expenses.map((expense, index) => {
    if (!expense || typeof expense !== 'object' || Array.isArray(expense)) {
      throw new Error(`Invalid expense at index ${index}.`)
    }
    const amount = Number(expense.amount)
    if (!Number.isFinite(amount) || amount < 0) throw new Error(`Invalid amount at expense ${index}.`)
    return {
      id: typeof expense.id === 'string' && expense.id ? expense.id : createId('expense'),
      title: typeof expense.title === 'string' ? expense.title : '',
      amount,
      category: typeof expense.category === 'string' ? expense.category : 'general',
      date: typeof expense.date === 'string' ? expense.date : '',
      note: typeof expense.note === 'string' ? expense.note : '',
      createdAt: typeof expense.createdAt === 'string' ? expense.createdAt : new Date().toISOString(),
    }
  })

  const normalizeDeposits = deposits.map((deposit, index) => {
    if (!deposit || typeof deposit !== 'object' || Array.isArray(deposit)) {
      throw new Error(`Invalid deposit at index ${index}.`)
    }
    const amount = Number(deposit.amount)
    if (!Number.isFinite(amount) || amount < 0) throw new Error(`Invalid amount at deposit ${index}.`)
    return {
      id: typeof deposit.id === 'string' && deposit.id ? deposit.id : createId('deposit'),
      memberId: typeof deposit.memberId === 'string' ? deposit.memberId : '',
      amount,
      date: typeof deposit.date === 'string' ? deposit.date : '',
      note: typeof deposit.note === 'string' ? deposit.note : '',
      createdAt: typeof deposit.createdAt === 'string' ? deposit.createdAt : new Date().toISOString(),
    }
  })

  const settings =
    container.settings && typeof container.settings === 'object' && !Array.isArray(container.settings)
      ? container.settings
      : {}

  const theme = parsed.theme === 'light' || parsed.theme === 'dark' ? parsed.theme : null

  try {
    return {
      ok: true,
      data: {
        members: normalizeMembers,
        meals: normalizeMeals,
        expenses: normalizeExpenses,
        deposits: normalizeDeposits,
        settings: {
          messName: typeof settings.messName === 'string' ? settings.messName : 'MessMate',
          currency: typeof settings.currency === 'string' ? settings.currency : 'BDT',
          defaultMealRate: Number.isFinite(Number(settings.defaultMealRate)) ? Number(settings.defaultMealRate) : 0,
        },
      },
      theme,
    }
  } catch (error) {
    return { ok: false, error: error.message || 'Invalid backup file.' }
  }
}

export default function Settings() {
  const { members, meals, expenses, deposits, settings, updateSettings, resetData, importData } = useAppContext()
  const { theme, setTheme } = useTheme()

  const [messName, setMessName] = useState(settings.messName || 'MessMate')
  const [currency, setCurrency] = useState(settings.currency || 'BDT')
  const [message, setMessage] = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const [confirmImport, setConfirmImport] = useState(false)
  const [pendingImport, setPendingImport] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessName(settings.messName || 'MessMate')
    setCurrency(settings.currency || 'BDT')
  }, [settings])

  const handleSaveSettings = () => {
    const trimmedName = messName.trim()
    if (!trimmedName) {
      setMessage({ type: 'error', text: 'Mess name is required.' })
      return
    }
    updateSettings({ messName: trimmedName, currency })
    setMessage({ type: 'success', text: 'Settings saved successfully.' })
  }

  const handleExportJson = () => {
    const backup = {
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        members,
        meals,
        expenses,
        deposits,
        settings,
      },
      theme,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `messmate-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    setMessage({ type: 'success', text: 'Backup exported successfully.' })
  }

  const handleImportClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result)
        const result = validateBackup(parsed)
        if (!result.ok) {
          setMessage({ type: 'error', text: result.error })
          return
        }
        setPendingImport(result)
        setConfirmImport(true)
      } catch {
        setMessage({ type: 'error', text: 'Invalid JSON file.' })
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleConfirmImport = () => {
    if (!pendingImport) return
    importData(pendingImport.data)
    if (pendingImport.theme) setTheme(pendingImport.theme)
    setMessage({ type: 'success', text: 'Backup imported successfully.' })
    setPendingImport(null)
    setConfirmImport(false)
  }

  const handleCancelImport = () => {
    setPendingImport(null)
    setConfirmImport(false)
  }

  const handleReset = () => {
    setConfirmReset(true)
  }

  const handleConfirmReset = () => {
    resetData()
    setMessage({ type: 'success', text: 'Application data reset successfully.' })
    setConfirmReset(false)
  }

  const handleCancelReset = () => {
    setConfirmReset(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Configure mess preferences, backups, and theme." />

      {message && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            message.type === 'success'
              ? 'border-success/30 bg-success/10 text-success  dark:bg-green-900/20 '
              : 'border-danger/30 bg-danger/10 text-red-700   dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      <Card className="border-[#dceae0] bg-gradient-to-br from-[#f0f8f2] via-white to-[#fbfdfb] dark:border-[#2e4033] dark:from-[#233329] dark:via-[#1c261f] dark:to-[#202b23]">
        <h3 className="text-lg font-semibold text-foreground ">General Settings</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 ">
              Mess Name
            </label>
            <input
              type="text"
              value={messName}
              onChange={(event) => setMessName(event.target.value)}
              className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700 ">
              Currency
            </label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
            >
              {CURRENCIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover dark:bg-surface-elevated dark:text-foreground "
          >
            Save Settings
          </button>
        </div>
      </Card>

      <Card className="border-[#e1e5f2] bg-gradient-to-br from-[#f3f5fd] via-white to-[#fbfaff] dark:border-[#35394b] dark:from-[#292c42] dark:via-[#1e202a] dark:to-[#252133]">
        <h3 className="text-lg font-semibold text-foreground ">Theme Preference</h3>
        <p className="mt-1 text-sm text-subtle ">
          Current theme: {theme}. Toggle to switch between light and dark mode.
        </p>
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="mt-4 rounded-md border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-surface-elevated  dark:text-slate-200 dark:hover:bg-brand-hover"
        >
          Toggle Theme
        </button>
      </Card>

      <Card className="border-[#dde9f1] bg-gradient-to-br from-[#f0f7fb] via-white to-[#fbfdff] dark:border-[#2e3e48] dark:from-[#233541] dark:via-[#1c252a] dark:to-[#20282d]">
        <h3 className="text-lg font-semibold text-foreground ">Backup & Restore</h3>
        <p className="mt-1 text-sm text-subtle ">
          Export all application data to JSON or import a previously exported backup.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportJson}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover dark:bg-surface-elevated dark:text-foreground "
          >
            Export JSON Backup
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-surface-elevated  dark:text-slate-200 dark:hover:bg-brand-hover"
          >
            Import JSON Backup
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </Card>

      <Card className="border-[#f0dcd8] bg-gradient-to-br from-[#fff4f0] to-[#fffdfc] dark:border-[#5b3935] dark:from-[#3b2927] dark:to-[#251f1e]">
        <h3 className="text-lg font-semibold text-danger ">Danger Zone</h3>
        <p className="mt-1 text-sm text-subtle ">
          Reset all application data. This action cannot be undone.
        </p>
        <button
          type="button"
          onClick={handleReset}
          className="mt-4 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Reset Application Data
        </button>
      </Card>

      <ConfirmDialog
        open={confirmReset}
        title="Reset Application Data"
        message="Are you sure you want to reset all application data? This cannot be undone."
        confirmLabel="Reset"
        danger
        onConfirm={handleConfirmReset}
        onCancel={handleCancelReset}
      />

      <ConfirmDialog
        open={confirmImport}
        title="Import Backup"
        message="Importing this backup will replace all current application data. Do you want to continue?"
        confirmLabel="Import"
        onConfirm={handleConfirmImport}
        onCancel={handleCancelImport}
      />
    </div>
  )
}


