import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const emptyForm = {
  memberId: '',
  amount: '',
  date: new Date().toISOString().slice(0, 10),
  note: '',
}

export default function Deposits() {
  const { members, deposits, addDeposit, updateDeposit, deleteDeposit } = useAppContext()

  const [memberFilter, setMemberFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingDeposit, setEditingDeposit] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [confirmState, setConfirmState] = useState({ open: false, deposit: null })

  const activeMembers = useMemo(
    () => members.filter((member) => member.isActive !== false),
    [members],
  )

  const memberName = (memberId) =>
    members.find((member) => member.id === memberId)?.name || 'Unknown member'

  const filteredDeposits = useMemo(() => {
    return deposits
      .filter((deposit) => {
        const matchesMember = memberFilter === 'all' || deposit.memberId === memberFilter
        const matchesDate = !dateFilter || deposit.date === dateFilter
        return matchesMember && matchesDate
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  }, [deposits, memberFilter, dateFilter])

  const today = new Date().toISOString().slice(0, 10)
  const currentMonth = today.slice(0, 7)

  const monthTotal = useMemo(
    () =>
      deposits
        .filter((deposit) => deposit.date.startsWith(currentMonth))
        .reduce((sum, deposit) => sum + (Number(deposit.amount) || 0), 0),
    [deposits, currentMonth],
  )

  const allTotal = useMemo(
    () => deposits.reduce((sum, deposit) => sum + (Number(deposit.amount) || 0), 0),
    [deposits],
  )

  const resetForm = () => {
    setFormData({ ...emptyForm, date: new Date().toISOString().slice(0, 10) })
    setFormErrors({})
    setEditingDeposit(null)
  }

  const openAddForm = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const openEditForm = (deposit) => {
    setEditingDeposit(deposit)
    setFormData({
      memberId: deposit.memberId,
      amount: deposit.amount ?? '',
      date: deposit.date || new Date().toISOString().slice(0, 10),
      note: deposit.note || '',
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
    if (!formData.memberId) errors.memberId = 'Please select a member.'
    const amount = Number(formData.amount)
    if (!formData.amount || Number.isNaN(amount) || amount <= 0) {
      errors.amount = 'Amount must be a positive number.'
    }
    if (!formData.date) errors.date = 'Date is required.'
    const memberExists = members.some((member) => member.id === formData.memberId)
    if (formData.memberId && !memberExists) errors.memberId = 'Selected member is invalid.'
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
      memberId: formData.memberId,
      amount: Number(formData.amount),
      date: formData.date,
      note: formData.note.trim(),
    }

    if (editingDeposit) {
      updateDeposit(editingDeposit.id, payload)
      setMessage({ type: 'success', text: 'Deposit updated successfully.' })
    } else {
      addDeposit(payload)
      setMessage({ type: 'success', text: 'Deposit added successfully.' })
    }

    closeForm()
  }

  const handleDeleteRequest = (deposit) => {
    setConfirmState({ open: true, deposit })
  }

  const handleConfirmDelete = () => {
    if (confirmState.deposit) {
      deleteDeposit(confirmState.deposit.id)
      setMessage({ type: 'success', text: 'Deposit deleted successfully.' })
    }
    setConfirmState({ open: false, deposit: null })
  }

  const handleCancelDelete = () => {
    setConfirmState({ open: false, deposit: null })
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Deposits" description="Track member deposits." />

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
        <Card className="relative overflow-hidden border-[#d2e8d7] bg-gradient-to-br from-[#e5f7e9] via-[#f2faf3] to-[#fbfdfb] dark:border-[#3c5b42] dark:from-[#253d2a] dark:via-[#202d23] dark:to-[#1d241e]">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#55bd84] to-[#54abb5]" /><p className="text-[11px] font-bold text-[#367348] dark:text-[#c1eaca]">This month's deposits</p>
          <p className="mt-2 text-[25px] font-bold tracking-[-.04em] text-[#245a35] dark:text-[#effff1]">
            {monthTotal.toFixed(2)}
          </p>
        </Card>
        <Card className="relative overflow-hidden border-[#d1e2ee] bg-gradient-to-br from-[#e4f2fb] via-[#f3f8fc] to-[#fbfcff] dark:border-[#3b5665] dark:from-[#243b49] dark:via-[#202b31] dark:to-[#1d222b]">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#62a9d5] to-[#658be0]" /><p className="text-[11px] font-bold text-[#3e6c89] dark:text-[#c2e1f3]">Total deposits</p>
          <p className="mt-2 text-[25px] font-bold tracking-[-.04em] text-[#264c64] dark:text-[#eff9ff]">
            {allTotal.toFixed(2)}
          </p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <select
              value={memberFilter}
              onChange={(event) => setMemberFilter(event.target.value)}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
            >
              <option value="all">All members</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
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
            Add Deposit
          </button>
        </div>
      </Card>

      {isFormOpen && (
        <Card>
          <h3 className="text-lg font-semibold text-foreground ">
            {editingDeposit ? 'Edit Deposit' : 'Add Deposit'}
          </h3>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Member *
              </label>
              <select
                value={formData.memberId}
                onChange={(event) => setFormData((prev) => ({ ...prev, memberId: event.target.value }))}
                disabled={Boolean(editingDeposit)}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60  dark:bg-brand "
              >
                <option value="">Select a member</option>
                {(editingDeposit ? members : activeMembers).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
              {formErrors.memberId && (
                <p className="mt-1 text-xs text-danger ">{formErrors.memberId}</p>
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
                {editingDeposit ? 'Save Changes' : 'Add Deposit'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {filteredDeposits.length === 0 ? (
          <p className="text-sm text-subtle ">
            {deposits.length === 0
              ? 'No deposits yet. Add your first deposit.'
              : 'No deposits match the selected filters.'}
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
                      Member
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-subtle ">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-subtle ">
                      Note
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-subtle ">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-surface dark:divide-slate-800 dark:bg-brand">
                  {filteredDeposits.map((deposit) => (
                    <tr key={deposit.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted ">
                        {deposit.date}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground ">
                        {memberName(deposit.memberId)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm font-medium text-foreground ">
                        {Number(deposit.amount).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted ">
                        {deposit.note || 'â€”'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(deposit)}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-surface-elevated dark:text-slate-200 dark:hover:bg-brand-hover"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(deposit)}
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
              {filteredDeposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="rounded-[14px] border border-[#d2e8d7] bg-gradient-to-br from-[#e9f7ec] to-[#fbfdfb] p-4 shadow-[0_3px_12px_rgb(38_108_61/6%)] dark:border-[#3c5b42] dark:from-[#253d2a] dark:to-[#1d251f]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#245a35] dark:text-[#effff1]">
                        {memberName(deposit.memberId)}
                      </p>
                      <p className="text-sm text-[#536e5a] dark:text-[#c0d1c3]">{deposit.date}</p>
                    </div>
                    <span className="text-sm font-bold text-[#287146] dark:text-[#9ce4ae]">
                      {Number(deposit.amount).toFixed(2)}
                    </span>
                  </div>
                  {deposit.note && (
                    <p className="mt-2 text-xs text-[#536e5a] dark:text-[#c0d1c3]">{deposit.note}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(deposit)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-slate-700  dark:text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(deposit)}
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
        title="Delete Deposit"
        message="Are you sure you want to delete this deposit? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}


