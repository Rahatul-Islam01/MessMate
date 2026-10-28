import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAppContext } from '../context/AppContext'
import { useTheme } from '../context/ThemeContext'
import Card from '../components/ui/Card'
import PageHeader from '../components/ui/PageHeader'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import {
  getMonthKey,
  getCurrentMonthKey,
  getTotalMeals,
  getTotalExpenses,
  getMealRate,
  getMonthlyMemberSummary,
  getOutstandingBalance,
  formatCurrency,
} from '../utils/accounting'
import { Users, Utensils, Receipt, Wallet, TrendingUp, CircleDollarSign, Plus } from 'lucide-react'

const CHART_COLORS = ['#39a875', '#659de0', '#efac62', '#a17ad5', '#e27e86', '#54bac0']
const statTones = [
  'bg-[#e9efff] text-[#526bb5] dark:bg-[#303b58] dark:text-[#bdcaff]', 'bg-[#e5f4e9] text-[#367d4e] dark:bg-[#294c32] dark:text-[#a9e8b5]',
  'bg-[#fff0e3] text-[#ae6338] dark:bg-[#553824] dark:text-[#ffd0a9]', 'bg-[#e7f2fa] text-[#447795] dark:bg-[#293f50] dark:text-[#acd6ef]',
  'bg-[#f2eafd] text-[#7653a0] dark:bg-[#433357] dark:text-[#d6baff]', 'bg-[#fff2d9] text-[#946a20] dark:bg-[#4f4023] dark:text-[#ffda91]',
]

export default function Dashboard() {
  const { members, meals, expenses, deposits, settings } = useAppContext()
  const { theme } = useTheme()
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey())

  const axisColor = theme === 'dark' ? '#c5d1c8' : '#596b5e'

  const monthMeals = useMemo(() => getTotalMeals(meals, selectedMonth), [meals, selectedMonth])
  const monthExpenses = useMemo(() => getTotalExpenses(expenses, selectedMonth), [expenses, selectedMonth])
  const monthDeposits = useMemo(
    () => deposits.filter((d) => getMonthKey(d.date) === selectedMonth).reduce((s, d) => s + (Number(d.amount) || 0), 0),
    [deposits, selectedMonth],
  )
  const mealRate = useMemo(() => getMealRate(expenses, meals, selectedMonth), [expenses, meals, selectedMonth])
  const memberSummary = useMemo(
    () => getMonthlyMemberSummary(members, meals, deposits, expenses, selectedMonth),
    [members, meals, deposits, expenses, selectedMonth],
  )
  const outstanding = useMemo(() => getOutstandingBalance(memberSummary), [memberSummary])

  const activeMembers = useMemo(() => members.filter((m) => m.isActive !== false).length, [members])
  const monthLabel = useMemo(() => {
    if (!selectedMonth) return 'All months'
    const parts = selectedMonth.split('-')
    if (parts.length < 2) return selectedMonth
    const [year, month] = parts.map(Number)
    if (!year || !month) return selectedMonth
    return new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }, [selectedMonth])

  const monthlyExpenseData = useMemo(() => {
    const months = new Set()
    expenses.forEach((e) => months.add(getMonthKey(e.date)))
    deposits.forEach((d) => months.add(getMonthKey(d.date)))
    meals.forEach((m) => months.add(getMonthKey(m.date)))
    const sorted = Array.from(months).filter(Boolean).sort().slice(-6)
    return sorted.map((month) => ({
      month,
      expenses: getTotalExpenses(expenses, month),
    }))
  }, [expenses, deposits, meals])

  const mealByMemberData = useMemo(() => {
    return memberSummary
      .filter((item) => item.meals > 0)
      .map((item) => ({ name: item.memberName, meals: item.meals }))
  }, [memberSummary])

  const expenseByCategoryData = useMemo(() => {
    const map = new Map()
    expenses
      .filter((e) => getMonthKey(e.date) === selectedMonth)
      .forEach((e) => {
        const key = e.category || 'general'
        map.set(key, (map.get(key) || 0) + (Number(e.amount) || 0))
      })
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }))
  }, [expenses, selectedMonth])

  const recentActivity = useMemo(() => {
    const items = []
    expenses.forEach((e) => items.push({ type: 'Expense', title: e.title, amount: -Number(e.amount), date: e.date, createdAt: e.createdAt }))
    deposits.forEach((d) => items.push({ type: 'Deposit', title: members.find((m) => m.id === d.memberId)?.name || 'Unknown member', amount: Number(d.amount), date: d.date, createdAt: d.createdAt }))
    meals.forEach((m) => items.push({ type: 'Meal', title: members.find((member) => member.id === m.memberId)?.name || 'Unknown member', amount: null, date: m.date, createdAt: m.createdAt, total: (Number(m.breakfast)||0)+(Number(m.lunch)||0)+(Number(m.dinner)||0) }))
    return items
      .sort((a, b) => (b.createdAt || b.date).localeCompare(a.createdAt || a.date))
      .slice(0, 8)
  }, [expenses, deposits, meals, members])
  return (
    <div className="space-y-6 sm:space-y-7">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div className="min-w-0"><PageHeader title="Welcome back" description="Here's what's happening in your mess today." /><div className="-mt-4 flex items-center gap-2 text-[11px] font-semibold text-[#4d6e58] dark:text-[#c1dbc8]"><span className="h-2 w-2 rounded-full bg-gradient-to-r from-[#43ba7b] to-[#64a9dc] ring-4 ring-[#e6f3eb] dark:ring-[#20372b]" />Everything is looking balanced</div></div>
        <Link to="/expenses" className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 self-start rounded-[11px] bg-gradient-to-r from-[#30a473] to-[#348c86] px-4 text-[12px] font-semibold text-white shadow-[0_5px_15px_rgb(39_134_106/23%)] transition hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgb(39_134_106/25%)] sm:self-auto"><Plus className="h-4 w-4" />Add transaction</Link>
      </div>

      <section className="relative overflow-hidden rounded-[18px] border border-[#cedfd3] bg-[linear-gradient(112deg,#e2f3e8_0%,#f7faf6_44%,#e7eefb_100%)] p-4 shadow-[0_7px_25px_rgb(53_100_71/9%)] sm:flex sm:items-center sm:justify-between sm:px-5 dark:border-[#3c5845] dark:bg-[linear-gradient(112deg,#20392a_0%,#202822_48%,#252d41_100%)]" aria-label="Monthly summary controls">
        <span aria-hidden="true" className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full bg-[#a8d9bd]/20 blur-2xl dark:bg-[#56a77c]/10" />
        <div className="relative mb-3 sm:mb-0"><p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#4b7055] dark:text-[#bad6c1]">Monthly snapshot</p><p className="mt-1 text-[13px] font-semibold text-[#263b2d] dark:text-[#f0f6f1]">{monthLabel}</p></div>
        <div className="relative flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <input
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="!w-full !min-w-0 sm:!w-auto sm:!min-w-[150px]"
          />
        <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap">
          <Link
            to="/members"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#cfe3d5] bg-[#e8f5ec] px-3 text-[11px] font-semibold text-[#286740] transition hover:border-[#a9cfb5] hover:bg-[#dff0e4] dark:border-[#47624f] dark:bg-[#294432] dark:text-[#c5ebcd] dark:hover:bg-[#34543d]"
          >
            <Plus className="h-3.5 w-3.5" /> Member
          </Link>
          <Link
            to="/meals"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#cdddf0] bg-[#eaf2fb] px-3 text-[11px] font-semibold text-[#426c96] transition hover:border-[#aec5e1] hover:bg-[#dfebf9] dark:border-[#40546a] dark:bg-[#28394b] dark:text-[#c5e1fa] dark:hover:bg-[#334961]"
          >
            <Plus className="h-3.5 w-3.5" /> Meal
          </Link>
          <Link
            to="/expenses"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#f0d8c3] bg-[#fff1e3] px-3 text-[11px] font-semibold text-[#a45c30] transition hover:border-[#e5bc97] hover:bg-[#ffe8d4] dark:border-[#62452f] dark:bg-[#432e20] dark:text-[#ffd1ab] dark:hover:bg-[#553925]"
          >
            <Plus className="h-3.5 w-3.5" /> Expense
          </Link>
          <Link
            to="/deposits"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-[10px] border border-[#ddd0ed] bg-[#f0eafb] px-3 text-[11px] font-semibold text-[#73519b] transition hover:border-[#c6b2e0] hover:bg-[#e8def7] dark:border-[#514266] dark:bg-[#352b45] dark:text-[#dfcaff] dark:hover:bg-[#45375a]"
          >
            <Plus className="h-3.5 w-3.5" /> Deposit
          </Link>
        </div>
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <Card className="!border-[#dce8ff] !bg-[linear-gradient(140deg,#eff4ff_0%,#f9fbff_55%,#ffffff_100%)] !p-4 shadow-[0_5px_18px_rgb(91_120_194/8%)] dark:!border-[#354259] dark:!bg-[linear-gradient(140deg,#222d42_0%,#1a202a_60%,#171f1a_100%)] sm:!p-[18px]">
          <div className="flex items-start justify-between"><p className="text-[11px] font-medium text-[#849088]">Total members</p><span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${statTones[0]}`}><Users className="h-4 w-4" /></span></div>
          <p className="mt-3 text-[25px] font-bold leading-none tracking-[-.045em] text-[#26392d] dark:text-[#f0f7f1]">{members.length}</p>
          <p className="mt-2 text-[10px] font-medium text-[#52675a] dark:text-[#b7c7bb]">{activeMembers} active members</p>
        </Card>
        <Card className="!border-[#d9ecdf] !bg-[linear-gradient(140deg,#edfaf0_0%,#f8fcf8_55%,#ffffff_100%)] !p-4 shadow-[0_5px_18px_rgb(76_153_98/8%)] dark:!border-[#304735] dark:!bg-[linear-gradient(140deg,#203827_0%,#1a241e_60%,#171f1a_100%)] sm:!p-[18px]">
          <div className="flex items-start justify-between"><p className="text-[11px] font-semibold text-[#405747] dark:text-[#d2dfd5]">Meals served</p><span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${statTones[1]}`}><Utensils className="h-4 w-4" /></span></div>
          <p className="mt-3 text-[25px] font-bold leading-none tracking-[-.045em] text-[#26392d] dark:text-[#f0f7f1]">{monthMeals}</p>
          <p className="mt-2 text-[10px] font-medium text-[#52675a] dark:text-[#b7c7bb]">Total meals this month</p>
        </Card>
        <Card className="!border-[#f1e0d3] !bg-[linear-gradient(140deg,#fff2e8_0%,#fffaf5_55%,#ffffff_100%)] !p-4 shadow-[0_5px_18px_rgb(206_127_76/8%)] dark:!border-[#47372d] dark:!bg-[linear-gradient(140deg,#35271e_0%,#241f1a_60%,#171f1a_100%)] sm:!p-[18px]">
          <div className="flex items-start justify-between"><p className="text-[11px] font-semibold text-[#73513b] dark:text-[#f2c6a2]">Total expenses</p><span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${statTones[2]}`}><Receipt className="h-4 w-4" /></span></div>
          <p className="mt-3 text-[22px] font-bold leading-none tracking-[-.045em] text-[#573b29] dark:text-[#fff0e5]">
            {formatCurrency(monthExpenses, settings.currency)}
          </p>
          <p className="mt-2 text-[10px] font-medium text-[#755b49] dark:text-[#dbc0aa]">Spending this month</p>
        </Card>
        <Card className="!border-[#dce9f1] !bg-[linear-gradient(140deg,#edf8fc_0%,#f8fcfe_55%,#ffffff_100%)] !p-4 shadow-[0_5px_18px_rgb(89_151_182/8%)] dark:!border-[#30414a] dark:!bg-[linear-gradient(140deg,#203440_0%,#1a242a_60%,#171f1a_100%)] sm:!p-[18px]">
          <div className="flex items-start justify-between"><p className="text-[11px] font-semibold text-[#426177] dark:text-[#c4d9e7]">Total deposits</p><span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${statTones[3]}`}><Wallet className="h-4 w-4" /></span></div>
          <p className="mt-3 text-[22px] font-bold leading-none tracking-[-.045em] text-[#29485b] dark:text-[#eaf6fc]">
            {formatCurrency(monthDeposits, settings.currency)}
          </p>
          <p className="mt-2 text-[10px] font-medium text-[#536e7e] dark:text-[#bbd0dc]">Contributed this month</p>
        </Card>
        <Card className="!border-[#e7dff1] !bg-[linear-gradient(140deg,#f5effc_0%,#fbf9fd_55%,#ffffff_100%)] !p-4 shadow-[0_5px_18px_rgb(145_112_187/8%)] dark:!border-[#40364d] dark:!bg-[linear-gradient(140deg,#30263a_0%,#231f29_60%,#171f1a_100%)] sm:!p-[18px]">
          <div className="flex items-start justify-between"><p className="text-[11px] font-semibold text-[#604b78] dark:text-[#dfc9f2]">Meal rate</p><span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${statTones[4]}`}><CircleDollarSign className="h-4 w-4" /></span></div>
          <p className="mt-3 text-[22px] font-bold leading-none tracking-[-.045em] text-[#49365f] dark:text-[#f3eaff]">
            {formatCurrency(mealRate, settings.currency)}
          </p>
          <p className="mt-2 text-[10px] font-medium text-[#665772] dark:text-[#cbbbd9]">Average cost per meal</p>
        </Card>
        <Card className="!border-[#f0e5d2] !bg-[linear-gradient(140deg,#fff6e4_0%,#fffbf3_55%,#ffffff_100%)] !p-4 shadow-[0_5px_18px_rgb(194_148_65/8%)] dark:!border-[#453b28] dark:!bg-[linear-gradient(140deg,#342c1b_0%,#241f18_60%,#171f1a_100%)] sm:!p-[18px]">
          <div className="flex items-start justify-between"><p className="text-[11px] font-semibold text-[#71592f] dark:text-[#eddaa9]">Outstanding</p><span className={`flex h-8 w-8 items-center justify-center rounded-[10px] ${statTones[5]}`}><TrendingUp className="h-4 w-4" /></span></div>
          <p className="mt-3 text-[22px] font-bold leading-none tracking-[-.045em] text-[#544324] dark:text-[#fff3d7]">
            {formatCurrency(outstanding, settings.currency)}
          </p>
          <p className="mt-2 text-[10px] font-medium text-[#746345] dark:text-[#d9caa6]">Pending member balance</p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-start justify-between"><div><h3 className="text-[14px] font-semibold text-[#263c2d] dark:text-[#eff7f0]">Monthly expenses</h3><p className="mt-1 text-[11px] text-[#536c5b] dark:text-[#becdc0]">Your spending trend over time</p></div><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#dcefe1] text-[#367e53] dark:bg-[#34543a] dark:text-[#b9e5c2]"><Receipt className="h-4 w-4" /></span></div>
          {monthlyExpenseData.length === 0 ? (
            <p className="mt-4 text-sm text-subtle ">No expense data available.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyExpenseData}>
                  <XAxis axisLine={false} tickLine={false} dataKey="month" tick={{ fill: axisColor, fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} />
                  <CartesianGrid vertical={false} stroke={theme === 'dark' ? '#29332d' : '#edf1ed'} strokeDasharray="4 4" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#202b23' : '#ffffff',
                      border: '1px solid ' + (theme === 'dark' ? '#485b4d' : '#d7e4da'),
                      color: theme === 'dark' ? '#f1f7f2' : '#1c2b22',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(20, 40, 25, .15)',
                    }}
                  />
                  <Bar dataKey="expenses" fill="#5bac83" radius={[6, 6, 0, 0]} maxBarSize={38} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-5 flex items-start justify-between"><div><h3 className="text-[14px] font-semibold text-[#263c2d] dark:text-[#eff7f0]">Meals by member</h3><p className="mt-1 text-[11px] text-[#536c5b] dark:text-[#becdc0]">Monthly consumption overview</p></div><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#deeff7] text-[#477c98] dark:bg-[#30495a] dark:text-[#b8ddf1]"><Utensils className="h-4 w-4" /></span></div>
          {mealByMemberData.length === 0 ? (
            <p className="mt-4 text-sm text-subtle ">No meal data available.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mealByMemberData} layout="vertical">
                  <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: axisColor, fontSize: 10 }} />
                  <YAxis type="category" axisLine={false} tickLine={false} dataKey="name" tick={{ fill: axisColor, fontSize: 10 }} width={100} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#202b23' : '#ffffff',
                      border: '1px solid ' + (theme === 'dark' ? '#485b4d' : '#d7e4da'),
                      color: theme === 'dark' ? '#f1f7f2' : '#1c2b22',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(20, 40, 25, .15)',
                    }}
                  />
                  <Bar dataKey="meals" fill="#80bd96" radius={[0, 6, 6, 0]} maxBarSize={25} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-start justify-between"><div><h3 className="text-[14px] font-semibold text-[#263c2d] dark:text-[#eff7f0]">Spending by category</h3><p className="mt-1 text-[11px] text-[#536c5b] dark:text-[#becdc0]">How expenses are distributed</p></div><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#ffebdc] text-[#aa6535] dark:bg-[#553a28] dark:text-[#ffd0aa]"><CircleDollarSign className="h-4 w-4" /></span></div>
          {expenseByCategoryData.length === 0 ? (
            <p className="mt-4 text-sm text-subtle ">No expense data available.</p>
          ) : (
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseByCategoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={88}
                    paddingAngle={4}
                  >
                    {expenseByCategoryData.map((entry, index) => (
                      <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#202b23' : '#ffffff',
                      border: '1px solid ' + (theme === 'dark' ? '#485b4d' : '#d7e4da'),
                      color: theme === 'dark' ? '#f1f7f2' : '#1c2b22',
                      borderRadius: '12px',
                      boxShadow: '0 8px 24px rgba(20, 40, 25, .15)',
                    }}
                  />
                  <Legend iconType="circle" iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-5 flex items-start justify-between"><div><h3 className="text-[14px] font-semibold text-[#263c2d] dark:text-[#eff7f0]">Recent activity</h3><p className="mt-1 text-[11px] text-[#536c5b] dark:text-[#becdc0]">Your latest mess transactions</p></div><span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#eee6fa] text-[#7955a5] dark:bg-[#453456] dark:text-[#d9c2fb]"><TrendingUp className="h-4 w-4" /></span></div>
          {recentActivity.length === 0 ? (
            <p className="mt-4 text-sm text-subtle ">No recent activity.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {recentActivity.map((item, index) => (
                <li
                  key={`${item.type}-${index}`}
                  className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0 "
                >
                  <div>
                    <p className="text-sm font-medium text-foreground ">
                      {item.type}: {item.title}
                    </p>
                    <p className="text-xs text-subtle ">{item.date}</p>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      item.amount === null
                        ? 'text-muted '
                        : item.amount < 0
                          ? 'text-danger '
                          : 'text-success dark:text-green-400'
                    }`}
                  >
                    {item.amount === null ? `${item.total} meals` : formatCurrency(item.amount, settings.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}



