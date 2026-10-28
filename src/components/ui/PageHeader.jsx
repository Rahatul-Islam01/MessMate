export default function PageHeader({ title, description }) {
  return (
    <div className="mb-7">
      <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.13em] text-[#657b6b] dark:text-[#b3c9b8]"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-[#49b47c] to-[#5b9ad1]" />MessMate workspace</div>
      <h1 className="page-title !m-0 !border-0 !bg-none !p-0 text-[26px] font-bold leading-tight tracking-[-.045em] text-[#245e3e] sm:text-[30px] dark:!bg-none dark:text-[#e6f3e9]">
        {title}
      </h1>
      {description && (
        <p className="mt-2 text-[13px] leading-6 text-[#53685a] dark:text-[#c0cec3]">{description}</p>
      )}
    </div>
  )
}

