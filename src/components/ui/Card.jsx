export default function Card({ children, className = '' }) {
  return (
    <div className={`rounded-[17px] border border-[#dfe8e2] bg-[#fff] p-4 shadow-[0_3px_14px_rgb(27_52_37/4%)] transition-all duration-200 hover:shadow-[0_8px_22px_rgb(27_52_37/7%)] sm:p-5 lg:p-6 dark:border-[#34443a] dark:bg-[#18211b] dark:shadow-[0_5px_20px_rgb(0_0_0/14%)] ${className}`}>
      {children}
    </div>
  )
}
