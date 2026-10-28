import { useMemo, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import ConfirmDialog from '../components/ui/ConfirmDialog'

const emptyForm = {
  name: '',
  phone: '',
  joinDate: new Date().toISOString().slice(0, 10),
  isActive: true,
}

export default function Members() {
  const {
    members,
    meals,
    deposits,
    addMember,
    updateMember,
    deleteMember,
  } = useAppContext()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [formErrors, setFormErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [confirmState, setConfirmState] = useState({ open: false, member: null, action: null })

  const hasRelatedRecords = (memberId) =>
    meals.some((meal) => meal.memberId === memberId) ||
    deposits.some((deposit) => deposit.memberId === memberId)

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return members.filter((member) => {
      const matchesSearch = !query || member.name.toLowerCase().includes(query)
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' ? member.isActive !== false : member.isActive === false)
      return matchesSearch && matchesStatus
    })
  }, [members, searchQuery, statusFilter])

  const resetForm = () => {
    setFormData({ ...emptyForm, joinDate: new Date().toISOString().slice(0, 10) })
    setFormErrors({})
    setEditingMember(null)
  }

  const openAddForm = () => {
    resetForm()
    setIsFormOpen(true)
  }

  const openEditForm = (member) => {
    setEditingMember(member)
    setFormData({
      name: member.name || '',
      phone: member.phone || '',
      joinDate: member.joinDate || new Date().toISOString().slice(0, 10),
      isActive: member.isActive !== false,
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
    if (!formData.name.trim()) errors.name = 'Full name is required.'
    if (formData.phone && !/^[0-9+\-\s()]{7,20}$/.test(formData.phone.trim())) {
      errors.phone = 'Enter a valid phone number.'
    }
    if (!formData.joinDate) errors.joinDate = 'Join date is required.'
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
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      joinDate: formData.joinDate,
      isActive: formData.isActive,
    }

    if (editingMember) {
      updateMember(editingMember.id, payload)
      setMessage({ type: 'success', text: 'Member updated successfully.' })
    } else {
      addMember(payload)
      setMessage({ type: 'success', text: 'Member added successfully.' })
    }

    closeForm()
  }

  const handleArchiveToggle = (member) => {
    updateMember(member.id, { isActive: member.isActive === false })
    setMessage({
      type: 'success',
      text: member.isActive === false ? 'Member reactivated.' : 'Member archived.',
    })
  }

  const handleDeleteRequest = (member) => {
    setConfirmState({
      open: true,
      member,
      action: hasRelatedRecords(member.id) ? 'archive' : 'delete',
    })
  }

  const handleConfirm = () => {
    const { member, action } = confirmState
    if (!member) return

    if (action === 'delete') {
      deleteMember(member.id)
      setMessage({ type: 'success', text: 'Member deleted successfully.' })
    } else {
      updateMember(member.id, { isActive: false })
      setMessage({
        type: 'success',
        text: 'Member has related records and was archived instead of deleted.',
      })
    }

    setConfirmState({ open: false, member: null, action: null })
  }

  const handleCancelConfirm = () => {
    setConfirmState({ open: false, member: null, action: null })
  }
  return (
    <div className="space-y-6">
      <PageHeader title="Members" description="Manage mess members, status, and contact details." />

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

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by member name..."
              className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand  dark:placeholder:text-subtle"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <button
            type="button"
            onClick={openAddForm}
            className="rounded-md bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-hover dark:bg-surface-elevated dark:text-foreground "
          >
            Add Member
          </button>
        </div>
      </Card>

      {isFormOpen && (
        <Card>
          <h3 className="text-lg font-semibold text-foreground ">
            {editingMember ? 'Edit Member' : 'Add Member'}
          </h3>
          <form onSubmit={handleSubmit} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
              />
              {formErrors.name && (
                <p className="mt-1 text-xs text-danger ">{formErrors.name}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
              />
              {formErrors.phone && (
                <p className="mt-1 text-xs text-danger ">{formErrors.phone}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 ">
                Join Date *
              </label>
              <input
                type="date"
                value={formData.joinDate}
                onChange={(event) => setFormData((prev) => ({ ...prev, joinDate: event.target.value }))}
                className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-slate-400  dark:bg-brand "
              />
              {formErrors.joinDate && (
                <p className="mt-1 text-xs text-danger ">{formErrors.joinDate}</p>
              )}
            </div>

            {editingMember && (
              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 ">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, isActive: event.target.checked }))
                    }
                    className="h-4 w-4 rounded border-slate-300 text-foreground focus:ring-slate-400 dark:border-slate-600"
                  />
                  Active member
                </label>
              </div>
            )}

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
                {editingMember ? 'Save Changes' : 'Add Member'}
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        {filteredMembers.length === 0 ? (
          <p className="text-sm text-subtle ">
            {members.length === 0
              ? 'No members yet. Add your first member to get started.'
              : 'No members match your search or filter.'}
          </p>
        ) : (
          <>
            <div className="hidden overflow-x-auto rounded-[14px] border border-[#e9eeea] md:block dark:border-[#2b3830]">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
                <thead className="bg-surface-elevated /50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-subtle ">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-subtle ">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-subtle ">
                      Join Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-subtle ">
                      Status
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-subtle ">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-surface dark:divide-slate-800 dark:bg-brand">
                  {filteredMembers.map((member) => (
                    <tr key={member.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-foreground ">
                        {member.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted ">
                        {member.phone || 'â€”'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-muted ">
                        {member.joinDate || 'â€”'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            member.isActive !== false
                              ? 'bg-success/10 text-success  '
                              : 'bg-surface-elevated text-muted  '
                          }`}
                        >
                          {member.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(member)}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-surface-elevated dark:text-slate-200 dark:hover:bg-brand-hover"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleArchiveToggle(member)}
                            className="rounded-md px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-surface-elevated dark:text-slate-200 dark:hover:bg-brand-hover"
                          >
                            {member.isActive !== false ? 'Archive' : 'Reactivate'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRequest(member)}
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
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                    className="rounded-[14px] border border-[#d8e8dc] bg-gradient-to-br from-[#edf8ef] to-[#fbfdfb] p-4 shadow-[0_3px_12px_rgb(31_61_43/5%)] dark:border-[#3b5540] dark:from-[#243a28] dark:to-[#1b241e]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-[#26392c] dark:text-[#f0f7f1]">{member.name}</p>
                      <p className="text-sm text-[#53685a] dark:text-[#bfcec2]">
                        {member.phone || 'No phone'}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        member.isActive !== false
                          ? 'bg-success/10 text-success  '
                          : 'bg-surface-elevated text-muted  '
                      }`}
                    >
                      {member.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-[#53685a] dark:text-[#bfcec2]">
                    Joined: {member.joinDate || 'â€”'}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                          <button
                      type="button"
                      onClick={() => openEditForm(member)}
                            className="min-h-9 rounded-[9px] border border-[#dcebe0] bg-[#f2f9f4] px-3 py-1.5 text-xs font-semibold text-[#367452]  dark:bg-[#1e2c22] dark:text-slate-200"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleArchiveToggle(member)}
                      className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-slate-700  dark:text-slate-200"
                    >
                      {member.isActive !== false ? 'Archive' : 'Reactivate'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(member)}
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
        title={confirmState.action === 'delete' ? 'Delete Member' : 'Archive Member'}
        message={
          confirmState.action === 'delete'
            ? `Are you sure you want to permanently delete ${confirmState.member?.name}? This cannot be undone.`
            : `${confirmState.member?.name} has related meals or deposits. To preserve history, this member will be archived instead of deleted.`
        }
        confirmLabel={confirmState.action === 'delete' ? 'Delete' : 'Archive'}
        danger={confirmState.action === 'delete'}
        onConfirm={handleConfirm}
        onCancel={handleCancelConfirm}
      />
    </div>
  )
}


