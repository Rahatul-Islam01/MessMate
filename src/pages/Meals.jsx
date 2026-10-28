import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const emptyForm = {
  memberId: '',
  date: new Date().toISOString().slice(0, 10),
  breakfast: 0,
  lunch: 0,
  dinner: 0,
}

function mealTotal(meal) {
  return (Number(meal.breakfast) || 0) + (Number(meal.lunch) || 0) + (Number(meal.dinner) || 0)
}

export default function Meals() {
  const { members, meals, addMeal, updateMeal, deleteMeal } = useAppContext()

  const [memberFilter, setMemberFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMeal, setEditingMeal] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [confirmState, setConfirmState] = useState({ open: false, meal: null })

  const activeMembers = useMemo(
    () => members.filter((member) => member.isActive !== false),
    [members],
  )

  const memberName = (memberId) =>
    members.find((member) => member.id === memberId)?.name || 'Unknown member'

  const filteredMeals = useMemo(() => {
    return meals
      .filter((meal) => {
        const matchesMember = memberFilter === 'all' || meal.memberId === memberFilter
        const matchesDate = !dateFilter || meal.date === dateFilter
        return matchesMember && matchesDate
      })
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date)
        const nameA = members.find((member) => member.id === a.memberId)?.name || 'Unknown member'
        const nameB = members.find((member) => member.id === b.memberId)?.name || 'Unknown member'
        return nameA.localeCompare(nameB)
      })
  }, [meals, memberFilter, dateFilter, members])

  const today = new Date().toISOString().slice(0, 10)
  const currentMonth = today.slice(0, 7)

  const todayTotal = useMemo(
    () => meals.filter((meal) => meal.date === today).reduce((sum, meal) => sum + mealTotal(meal), 0),
    [meals, today],
  )

  const monthTotal = useMemo(
    () => meals.filter((meal) => meal.date.startsWith(currentMonth)).reduce((sum, meal) => sum + mealTotal(meal), 0),
    [meals, currentMonth],
  )

  const resetForm = () => {
    setFormData({ ...emptyForm, date: new Date().toISOString().slice(0, 10) })
    setFormErrors({})
    setEditingMeal(null)
  }

  const openAddForm = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const openEditForm = (meal) => {
    setEditingMeal(meal)
    setFormData({
      memberId: meal.memberId,
      date: meal.date,
      breakfast: meal.breakfast ?? 0,
      lunch: meal.lunch ?? 0,
      dinner: meal.dinner ?? 0,
    })
    setFormErrors({})
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    resetForm()
  }

  const validateCounts = (value) => {
    const number = Number(value)
    return Number.isInteger(number) && number >= 0
  }

  const validateForm = () => {
    const errors = {}
    if (!formData.memberId) errors.memberId = 'Please select a member.'
    if (!formData.date) errors.date = 'Date is required.'
    if (!validateCounts(formData.breakfast)) errors.breakfast = 'Use a non-negative whole number.'
    if (!validateCounts(formData.lunch)) errors.lunch = 'Use a non-negative whole number.'
    if (!validateCounts(formData.dinner)) errors.dinner = 'Use a non-negative whole number.'

    const total = (Number(formData.breakfast) || 0) + (Number(formData.lunch) || 0) + (Number(formData.dinner) || 0)
    if (total === 0) errors.total = 'At least one meal count must be greater than zero.'

    if (editingMeal) {
      const duplicate = meals.find(
        (meal) => meal.id !== editingMeal.id && meal.memberId === formData.memberId && meal.date === formData.date,
      )
      if (duplicate) errors.duplicate = 'A meal record already exists for this member and date.'
    }

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
      date: formData.date,
      breakfast: Number(formData.breakfast),
      lunch: Number(formData.lunch),
      dinner: Number(formData.dinner),
    }

    if (editingMeal) {
      updateMeal(editingMeal.id, payload)
      setMessage({ type: 'success', text: 'Meal record updated successfully.' })
    } else {
      const existing = meals.find(
        (meal) => meal.memberId === payload.memberId && meal.date === payload.date,
      )
      if (existing) {
        updateMeal(existing.id, payload)
        setMessage({ type: 'success', text: 'Existing meal record updated.' })
      } else {
        addMeal(payload)
        setMessage({ type: 'success', text: 'Meal record added successfully.' })
      }
    }

    closeForm()
  }

  const handleDeleteRequest = (meal) => {
    setConfirmState({ open: true, meal })
  }

  const handleConfirmDelete = () => {
    if (confirmState.meal) {
      deleteMeal(confirmState.meal.id)
      setMessage({ type: 'success', text: 'Meal record deleted successfully.' })
    }
    setConfirmState({ open: false, meal: null })
  }

  const handleCancelDelete = () => {
    setConfirmState({ open: false, meal: null })
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Meals" description="Record and review daily meal counts." />

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

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="relative overflow-hidden border-[#f0dcc3] bg-gradient-to-br from-[#fff0dc] via-[#fff7eb] to-[#fffdf9] dark:border-[#5b462b] dark:from-[#3c2e1c] dark:via-[#29231a] dark:to-[#211e19]">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#f2b66e] to-[#e88c68]" /><p className="text-[11px] font-bold text-[#815b2c] dark:text-[#f1d29e]">Today's meals</p>
          <p className="mt-2 text-[25px] font-bold tracking-[-.04em] text-[#59401f] dark:text-[#fff5de]">{todayTotal}</p>
        </Card>
        <Card className="relative overflow-hidden border-[#d1e8d6] bg-gradient-to-br from-[#e4f6e8] via-[#f2faf3] to-[#fbfdfb] dark:border-[#3b5940] dark:from-[#253e2a] dark:via-[#202d23] dark:to-[#1d241e]">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#55bd84] to-[#60a8a1]" /><p className="text-[11px] font-bold text-[#3b7149] dark:text-[#bde8c4]">This month's meals</p>
          <p className="mt-2 text-[25px] font-bold tracking-[-.04em] text-[#285c37] dark:text-[#f0fff1]">{monthTotal}</p>
        </Card>
        <Card className="relative overflow-hidden border-[#d9def1] bg-gradient-to-br from-[#ecefff] via-[#f6f6ff] to-[#fdfcff] dark:border-[#424767] dark:from-[#2a334d] dark:via-[#242437] dark:to-[#211e28]">
          <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#809ce5] to-[#aa85df]" /><p className="text-[11px] font-bold text-[#526293] dark:text-[#cbd4ff]">Total records</p>
          <p className="mt-2 text-[25px] font-bold tracking-[-.04em] text-[#344274] dark:text-[#f1f0ff]">{meals.length}</p>
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
            Add Meal
          </button>
        </div>
      </Card>

      {isFormOpen && (
        <Card>
          <h3 className="text-lg font-semibold text-foreground ">
            {editingMeal ? 'Edit Meal Record' : 'Add Meal Record'}
          </h3>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Member *
              </label>
              <select
                value={formData.memberId}
                onChange={(event) => setFormData((prev) => ({ ...prev, memberId: event.target.value }))}
                disabled={Boolean(editingMeal)}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:cursor-not-allowed disabled:opacity-60  dark:bg-brand "
              >
                <option value="">Select a member</option>
                {(editingMeal ? members : activeMembers).map((member) => (
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

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Breakfast
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.breakfast}
                onChange={(event) => setFormData((prev) => ({ ...prev, breakfast: event.target.value }))}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
              />
              {formErrors.breakfast && (
                <p className="mt-1 text-xs text-danger ">{formErrors.breakfast}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Lunch
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.lunch}
                onChange={(event) => setFormData((prev) => ({ ...prev, lunch: event.target.value }))}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
              />
              {formErrors.lunch && (
                <p className="mt-1 text-xs text-danger ">{formErrors.lunch}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Dinner
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.dinner}
                onChange={(event) => setFormData((prev) => ({ ...prev, dinner: event.target.value }))}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
              />
              {formErrors.dinner && (
                <p className="mt-1 text-xs text-danger ">{formErrors.dinner}</p>
              )}
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <p className="text-sm text-muted ">
                Total:{' '}
                {(Number(formData.breakfast) || 0) +
                  (Number(formData.lunch) || 0) +
                  (Number(formData.dinner) || 0)}
              </p>
              {formErrors.total && (
                <p className="mt-1 text-xs text-danger ">{formErrors.total}</p>
              )}
              {formErrors.duplicate && (
                <p className="mt-1 text-xs text-danger ">{formErrors.duplicate}</p>
              )}
            </div>

            <div className="sm:col-span-2 lg:col-span-4 flex justify-end gap-3">
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
                {editingMeal ? 'Save Changes' : 'Add Meal'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {filteredMeals.length === 0 ? (
          <p className="text-sm text-subtle ">
            {meals.length === 0
              ? 'No meal records yet. Add your first meal entry.'
              : 'No meal records match the selected filters.'}
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
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-subtle ">
                      B
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-subtle ">
                      L
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-subtle ">
                      D
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-subtle ">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-subtle ">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-surface dark:divide-slate-800 dark:bg-brand">
                  {filteredMeals.map((meal) => (
                    <tr key={meal.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted ">
                        {meal.date}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground ">
                        {memberName(meal.memberId)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-muted ">
                        {meal.breakfast}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-muted ">
                        {meal.lunch}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm text-muted ">
                        {meal.dinner}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-center text-sm font-medium text-foreground ">
                        {mealTotal(meal)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(meal)}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-surface-elevated dark:text-slate-200 dark:hover:bg-brand-hover"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(meal)}
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
              {filteredMeals.map((meal) => (
                <div
                  key={meal.id}
                  className="rounded-[14px] border border-[#d8e8dc] bg-gradient-to-br from-[#edf8ef] to-[#fbfdfb] p-4 shadow-[0_3px_12px_rgb(31_61_43/5%)] dark:border-[#3b5540] dark:from-[#243a28] dark:to-[#1b241e]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground ">
                        {memberName(meal.memberId)}
                      </p>
                      <p className="text-sm text-subtle ">{meal.date}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground ">
                      Total: {mealTotal(meal)}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-muted ">
                    <div className="rounded-[9px] bg-[#fff4e7] px-2 py-2 text-[#a07848] dark:bg-[#382c1d] dark:text-[#dfbc83]">B: {meal.breakfast}</div>
                    <div className="rounded-[9px] bg-[#eef6ff] px-2 py-2 text-[#6484ac] dark:bg-[#253142] dark:text-[#a4c0e5]">L: {meal.lunch}</div>
                    <div className="rounded-[9px] bg-[#f4effb] px-2 py-2 text-[#8266a8] dark:bg-[#30283b] dark:text-[#c0a7e3]">D: {meal.dinner}</div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(meal)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-slate-700  dark:text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(meal)}
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
        title="Delete Meal Record"
        message="Are you sure you want to delete this meal record? This cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </div>
  )
}


