import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import {
  getMonthKey,
  getCurrentMonthKey,
  getTotalMeals,
  getTotalExpenses,
  getMealRate,
  getMonthlyMemberSummary,
  formatCurrency,
} from '../utils/accounting'

export default function Reports() {
  const { members, meals, expenses, deposits, settings } = useAppContext()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey())

  const totalMeals = useMemo(() => getTotalMeals(meals, selectedMonth), [meals, selectedMonth])
  const totalExpenses = useMemo(() => getTotalExpenses(expenses, selectedMonth), [expenses, selectedMonth])
  const totalDeposits = useMemo(
    () => deposits.filter((d) => getMonthKey(d.date) === selectedMonth).reduce((s, d) => s + (Number(d.amount) || 0), 0),
    [deposits, selectedMonth],
  )
  const mealRate = useMemo(() => getMealRate(expenses, meals, selectedMonth), [expenses, meals, selectedMonth])
  const memberSummary = useMemo(
    () => getMonthlyMemberSummary(members, meals, deposits, expenses, selectedMonth),
    [members, meals, deposits, expenses, selectedMonth],
  )

  const expenseByCategory = useMemo(() => {
    const map = new Map()
    expenses
      .filter((e) => getMonthKey(e.date) === selectedMonth)
      .forEach((e) => {
        const key = e.category || 'general'
        map.set(key, (map.get(key) || 0) + (Number(e.amount) || 0))
      })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [expenses, selectedMonth])

  const handleExportCsv = () => {
    const rows = []
    rows.push(['MessMate Monthly Report', selectedMonth])
    rows.push([])
    rows.push(['Summary'])
    rows.push(['Total Meals', totalMeals])
    rows.push(['Total Meal-Related Expenses', totalExpenses.toFixed(2)])
    rows.push(['Total Deposits', totalDeposits.toFixed(2)])
    rows.push(['Meal Rate', mealRate.toFixed(2)])
    rows.push([])
    rows.push(['Member', 'Meals', 'Meal Cost', 'Deposits', 'Balance'])
    memberSummary.forEach((item) => {
      rows.push([
        item.memberName,
        item.meals,
        item.mealCost.toFixed(2),
        item.deposits.toFixed(2),
        item.balance.toFixed(2),
      ])
    })
    rows.push([])
    rows.push(['Expense Category', 'Amount'])
    expenseByCategory.forEach((item) => {
      rows.push([item.name, item.value.toFixed(2)])
    })

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `messmate-report-${selectedMonth}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Monthly financial and meal report." />

      <Card className="bg-gradient-to-r from-[#f1f8f3] via-white to-[#f3f7ff] dark:from-[#1e2a22] dark:via-[#171f1a] dark:to-[#1e2230]">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-slate-700 ">Month</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(event) => setSelectedMonth(event.target.value)}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
            />
          </div>
          <button
            type="button"
            onClick={handleExportCsv}
          className="inline-flex min-h-10 items-center justify-center rounded-[10px] bg-[#32866a] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_4px_10px_rgb(39_134_106/16%)] transition hover:bg-[#24775c]"
          >
            Export CSV
          </button>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-[#d8e8dc] bg-gradient-to-br from-[#edf8ef] to-[#f7fbf7] dark:border-[#3b5640] dark:from-[#263d2a] dark:to-[#1c261f]">
          <p className="text-[11px] font-bold text-[#3e6949] dark:text-[#c3e6c8]">Total meals</p>
          <p className="mt-2 text-[24px] font-bold tracking-[-.04em] text-[#225936] dark:text-[#f0fff1]">{totalMeals}</p>
        </Card>
        <Card className="border-[#e4d9f0] bg-gradient-to-br from-[#f3ebfb] to-[#fbf8fd] dark:border-[#504062] dark:from-[#352943] dark:to-[#211b29]">
          <p className="text-[11px] font-bold text-[#684b8b] dark:text-[#ddc2f6]">Meal-related expenses</p>
          <p className="mt-2 text-[22px] font-bold tracking-[-.04em] text-[#4d326c] dark:text-[#f5eaff]">
            {formatCurrency(totalExpenses, settings.currency)}
          </p>
        </Card>
        <Card className="border-[#d6e6f0] bg-gradient-to-br from-[#eaf5fb] to-[#f7fbfd] dark:border-[#3c5666] dark:from-[#253b49] dark:to-[#1b252c]">
          <p className="text-[11px] font-bold text-[#416982] dark:text-[#b8dbee]">Total deposits</p>
          <p className="mt-2 text-[22px] font-bold tracking-[-.04em] text-[#294e66] dark:text-[#ecf9ff]">
            {formatCurrency(totalDeposits, settings.currency)}
          </p>
        </Card>
        <Card className="border-[#efdfc4] bg-gradient-to-br from-[#fff4df] to-[#fffaf0] dark:border-[#5a492a] dark:from-[#3b301b] dark:to-[#252014]">
          <p className="text-[11px] font-bold text-[#805c25] dark:text-[#f0d59d]">Meal rate</p>
          <p className="mt-2 text-[22px] font-bold tracking-[-.04em] text-[#674718] dark:text-[#fff4d8]">
            {formatCurrency(mealRate, settings.currency)}
          </p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <h3 className="text-base font-semibold text-foreground ">Member Summary</h3>
        {memberSummary.length === 0 ? (
          <p className="mt-4 text-sm text-subtle ">No members available.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-surface-elevated /50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-subtle ">
                    Member
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-subtle ">
                    Meals
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-subtle ">
                    Meal Cost
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-subtle ">
                    Deposits
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-subtle ">
                    Balance
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-surface dark:divide-slate-800 dark:bg-brand">
                {memberSummary.map((item) => (
                  <tr key={item.memberId}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground ">
                      {item.memberName}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-muted ">
                      {item.meals}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-muted ">
                      {formatCurrency(item.mealCost, settings.currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-muted ">
                      {formatCurrency(item.deposits, settings.currency)}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right text-sm font-medium ${
                        item.balance < 0
                          ? 'text-danger '
                          : 'text-success dark:text-green-400'
                      }`}
                    >
                      {formatCurrency(item.balance, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="overflow-hidden">
        <h3 className="text-base font-semibold text-foreground ">Expense Category Summary</h3>
        {expenseByCategory.length === 0 ? (
          <p className="mt-4 text-sm text-subtle ">No expenses for this month.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
              <thead className="bg-surface-elevated /50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-subtle ">
                    Category
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-subtle ">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-surface dark:divide-slate-800 dark:bg-brand">
                {expenseByCategory.map((item) => (
                  <tr key={item.name}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground ">
                      {item.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-muted ">
                      {formatCurrency(item.value, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}



