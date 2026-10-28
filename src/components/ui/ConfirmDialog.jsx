export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = false }) {
  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#14231a]/45 p-4 backdrop-blur-sm"
    >
      <div className="w-full max-w-md rounded-[18px] border border-[#e4ece6] bg-surface p-5 shadow-[0_24px_80px_rgb(15_35_24/20%)] sm:p-6 dark:border-[#303d34] dark:bg-[#171f1a]">
        <h3 id="confirm-dialog-title" className="text-lg font-semibold text-foreground ">
          {title}
        </h3>
        <p className="mt-2 text-sm text-muted ">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-slate-700 hover:bg-surface-elevated  dark:text-slate-200 dark:hover:bg-brand-hover"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'bg-brand hover:bg-brand-hover dark:bg-surface-elevated dark:text-foreground'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

