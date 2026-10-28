import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const EXPENSE_CATEGORIES = [
  'general',
  'groceries',
  'utilities',
  'rent',
  'maintenance',
  'other',
]

const emptyForm = {
  title: '',
  amount: '',
  category: 'general',
  date: new Date().toISOString().slice(0, 10),
  note: '',
}

export default function Expenses() {
  const { expenses, addExpense, updateExpense, deleteExpense } = useAppContext()

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [confirmState, setConfirmState] = useState({ open: false, expense: null })

  const filteredExpenses = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return expenses
      .filter((expense) => {
        const matchesSearch = !query || expense.title.toLowerCase().includes(query)
        const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter
        const matchesDate = !dateFilter || expense.date === dateFilter
        return matchesSearch && matchesCategory && matchesDate
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [expenses, searchQuery, categoryFilter, dateFilter])

  const today = new Date().toISOString().slice(0, 10)
  const currentMonth = today.slice(0, 7)

  const monthTotal = useMemo(
    () =>
      expenses
        .filter((expense) => expense.date.startsWith(currentMonth))
        .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0),
    [expenses, currentMonth],
  )

  const allTotal = useMemo(
    () => expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0),
    [expenses],
  )

  const resetForm = () => {
    setFormData({ ...emptyForm, date: new Date().toISOString().slice(0, 10) })
    setFormErrors({})
    setEditingExpense(null)
  }

  const openAddForm = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const openEditForm = (expense) => {
    setEditingExpense(expense)
    setFormData({
      title: expense.title || '',
      amount: expense.amount ?? '',
      category: expense.category || 'general',
      date: expense.date || new Date().toISOString().slice(0, 10),
      note: expense.note || '',
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    resetForm()
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.title.trim()) errors.title = 'Description is required.'
    const amount = Number(formData.amount)
    if (!formData.amount || Number.isNaN(amount) || amount <= 0) {
      errors.amount = 'Amount must be a positive number.'
    }
    if (!formData.date) errors.date = 'Date is required.'
    if (!formData.category) errors.category = 'Category is required.'
    return errors
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const errors = validateForm()
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    const payload = {
      title: formData.title.trim(),
      amount: Number(formData.amount),
      category: formData.category,
      date: formData.date,
      note: formData.note.trim(),
    }

    if (editingExpense) {
      updateExpense(editingExpense.id, payload)
      setMessage({ type: 'success', text: 'Expense updated successfully.' })
    } else {
      addExpense(payload)
      setMessage({ type: 'success', text: 'Expense added successfully.' })
    }

    closeForm()
  }

  const handleDeleteRequest = (expense) => {
    setConfirmState({ open: true, expense })
  }

  const handleConfirmDelete = () => {
    if (confirmState.expense) {
      deleteExpense(confirmState.expense.id)
      setMessage({ type: 'success', text: 'Expense deleted successfully.' })
    }
    setConfirmState({ open: false, expense: null })
  }

  const handleCancelDelete = () => {
    setConfirmState({ open: false, expense: null })
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Expenses" description="Track and review mess expenses." />

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

      <div className="grid gap-3 sm:grid-cols-2">
        <Card className="relative overflow-hidden border-[#efd9c9] bg-gradient-to-br from-[#ffefe2] via-[#fff7f0] to-[#fffdfb] dark:border-[#604530] dark:from-[#3b291f] dark:via-[#2a211b] dark:to-[#211d19]">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#f1ac75] to-[#e88766]" /><p className="text-[11px] font-bold text-[#87512e] dark:text-[#f3c39f]">This month's expenses</p>
          <p className="mt-2 text-[25px] font-bold tracking-[-.04em] text-[#55351f] dark:text-[#fff0e2]">
            {monthTotal.toFixed(2)}
          </p>
        </Card>
        <Card className="relative overflow-hidden border-[#d7dff2] bg-gradient-to-br from-[#e9efff] via-[#f5f5ff] to-[#fdfbff] dark:border-[#414766] dark:from-[#29334c] dark:via-[#242438] dark:to-[#201d27]">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#819ce5] to-[#aa85df]" /><p className="text-[11px] font-bold text-[#4e5f98] dark:text-[#c8d0ff]">Total expenses</p>
          <p className="mt-2 text-[25px] font-bold tracking-[-.04em] text-[#303c72] dark:text-[#f0eeff]">
            {allTotal.toFixed(2)}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by description..."
              className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand  dark:placeholder:text-subtle"
            />
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
            >
              <option value="all">All categories</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter('')}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-surface-elevated  dark:text-slate-200 dark:hover:bg-brand-hover"
              >
                Clear date
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={openAddForm}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover dark:bg-surface-elevated dark:text-foreground "
          >
            Add Expense
          </button>
        </div>
      </Card>

      {isFormOpen && (
        <Card>
          <h3 className="text-lg font-semibold text-foreground ">
            {editingExpense ? 'Edit Expense' : 'Add Expense'}
          </h3>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Description *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
              />
              {formErrors.title && (
                <p className="mt-1 text-xs text-danger ">{formErrors.title}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Amount *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(event) => setFormData((prev) => ({ ...prev, amount: event.target.value }))}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
              />
              {formErrors.amount && (
                <p className="mt-1 text-xs text-danger ">{formErrors.amount}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
              {formErrors.category && (
                <p className="mt-1 text-xs text-danger ">{formErrors.category}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Date *
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(event) => setFormData((prev) => ({ ...prev, date: event.target.value }))}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
              />
              {formErrors.date && (
                <p className="mt-1 text-xs text-danger ">{formErrors.date}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Note
              </label>
              <textarea
                value={formData.note}
                onChange={(event) => setFormData((prev) => ({ ...prev, note: event.target.value }))}
                rows={3}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
              />
            </div>

            <div className="sm:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-md border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-surface-elevated  dark:text-slate-200 dark:hover:bg-brand-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover dark:bg-surface-elevated dark:text-foreground "
              >
                {editingExpense ? 'Save Changes' : 'Add Expense'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {filteredExpenses.length === 0 ? (
          <p className="text-sm text-subtle ">
            {expenses.length === 0
              ? 'No expenses yet. Add your first expense.'
              : 'No expenses match the selected filters.'}
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-[14px] border border-[#e9eeea] md:block dark:border-[#2b3830]">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-surface-elevated /50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-subtle ">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-subtle ">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-subtle ">
                      Category
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-subtle ">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-subtle ">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-surface dark:divide-slate-800 dark:bg-brand">
                  {filteredExpenses.map((expense) => (
                    <tr key={expense.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted ">
                        {expense.date}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground ">
                        {expense.title}
                        {expense.note && (
                          <p className="text-xs font-normal text-subtle ">
                            {expense.note}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted ">
                        {expense.category}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-foreground ">
                        {Number(expense.amount).toFixed(2)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(expense)}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-surface-elevated dark:text-slate-200 dark:hover:bg-brand-hover"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(expense)}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-danger hover:bg-danger/10  dark:hover:bg-red-900/20"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {filteredExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className="rounded-[14px] border border-[#efd9c9] bg-gradient-to-br from-[#ffefe2] to-[#fffdfb] p-4 shadow-[0_3px_12px_rgb(122_77_47/7%)] dark:border-[#604530] dark:from-[#3b291f] dark:to-[#211d19]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#55351f] dark:text-[#fff0e2]">{expense.title}</p>
                      <p className="text-sm text-[#755a48] dark:text-[#d8bda9]">{expense.date}</p>
                    </div>
                    <span className="text-sm font-bold text-[#a35735] dark:text-[#ffc49e]">
                      {Number(expense.amount).toFixed(2)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#755a48] dark:text-[#d8bda9]">
                    Category: {expense.category}
                  </p>
                  {expense.note && (
                    <p className="mt-1 text-xs text-[#755a48] dark:text-[#d8bda9]">{expense.note}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(expense)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-slate-700  dark:text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(expense)}
                      className="rounded-md border border-danger/30 px-3 py-1.5 text-xs font-medium text-danger  "
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <ConfirmDialog
        open={confirmState.open}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}


