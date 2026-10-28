const DEFAULT_CURRENCY = 'BDT'

export function getMonthKey(date) {
  if (!date) return ''
  const value = new Date(date)
  if (Number.isNaN(value.getTime())) return ''
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`
}

export function getCurrentMonthKey() {
  return getMonthKey(new Date())
}

export function filterByMonth(records, month, dateField = 'date') {
  if (!Array.isArray(records)) return []
  if (!month) return records
  return records.filter((record) => getMonthKey(record?.[dateField]) === month)
}

export function mealCount(meal) {
  return (Number(meal?.breakfast) || 0) + (Number(meal?.lunch) || 0) + (Number(meal?.dinner) || 0)
}

export function getTotalMeals(meals, month) {
  const scoped = month ? filterByMonth(meals, month) : meals
  if (!Array.isArray(scoped)) return 0
  return scoped.reduce((sum, meal) => sum + mealCount(meal), 0)
}

export function getTotalExpenses(expenses, month) {
  const scoped = month ? filterByMonth(expenses, month) : expenses
  if (!Array.isArray(scoped)) return 0
  return scoped.reduce((sum, expense) => sum + (Number(expense?.amount) || 0), 0)
}

export function getMealRate(expenses, meals, month) {
  const totalMeals = getTotalMeals(meals, month)
  if (totalMeals <= 0) return 0
  const totalExpenses = getTotalExpenses(expenses, month)
  return totalExpenses / totalMeals
}

export function getMemberMeals(meals, memberId, month) {
  const scoped = month ? filterByMonth(meals, month) : meals
  if (!Array.isArray(scoped)) return 0
  return scoped
    .filter((meal) => meal?.memberId === memberId)
    .reduce((sum, meal) => sum + mealCount(meal), 0)
}

export function getMemberDeposits(deposits, memberId, month) {
  const scoped = month ? filterByMonth(deposits, month) : deposits
  if (!Array.isArray(scoped)) return 0
  return scoped
    .filter((deposit) => deposit?.memberId === memberId)
    .reduce((sum, deposit) => sum + (Number(deposit?.amount) || 0), 0)
}

export function getMemberMealCost(meals, memberId, month, rate) {
  const memberMeals = getMemberMeals(meals, memberId, month)
  const mealRate = typeof rate === 'number' ? rate : getMealRate([], meals, month)
  return memberMeals * mealRate
}

export function getMemberBalance({ meals, deposits, memberId, month, rate, additionalCharges = 0 }) {
  const mealCost = getMemberMealCost(meals, memberId, month, rate)
  const memberDeposits = getMemberDeposits(deposits, memberId, month)
  return memberDeposits - mealCost - (Number(additionalCharges) || 0)
}

export function getMonthlyMemberSummary(members, meals, deposits, expenses, month) {
  const rate = getMealRate(expenses, meals, month)
  if (!Array.isArray(members)) return []
  return members.map((member) => {
    const memberMeals = getMemberMeals(meals, member.id, month)
    const mealCost = memberMeals * rate
    const memberDeposits = getMemberDeposits(deposits, member.id, month)
    const balance = memberDeposits - mealCost
    return {
      memberId: member.id,
      memberName: member.name,
      isActive: member.isActive !== false,
      meals: memberMeals,
      mealCost,
      deposits: memberDeposits,
      balance,
    }
  })
}

export function getOutstandingBalance(summary) {
  if (!Array.isArray(summary)) return 0
  return summary.reduce((sum, item) => (item.balance < 0 ? sum + Math.abs(item.balance) : sum), 0)
}

export function getTotalCredit(summary) {
  if (!Array.isArray(summary)) return 0
  return summary.reduce((sum, item) => (item.balance > 0 ? sum + item.balance : sum), 0)
}

export function formatCurrency(amount, currency = DEFAULT_CURRENCY) {
  const value = Number(amount) || 0
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currency}`
  }
}

