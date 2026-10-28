/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer } from 'react'
import { readStorage, writeStorage, removeStorage, STORAGE_KEYS } from '../utils/storage'
import { createId } from '../utils/ids'
import { DEFAULT_SETTINGS, DEFAULT_MEMBER, DEFAULT_MEAL, DEFAULT_EXPENSE, DEFAULT_DEPOSIT } from '../data/defaults'

const AppContext = createContext(null)

const initialState = {
  members: [],
  meals: [],
  expenses: [],
  deposits: [],
  settings: { ...DEFAULT_SETTINGS },
}

function loadInitialState() {
  const members = readStorage(STORAGE_KEYS.members, [])
  const meals = readStorage(STORAGE_KEYS.meals, [])
  const expenses = readStorage(STORAGE_KEYS.expenses, [])
  const deposits = readStorage(STORAGE_KEYS.deposits, [])
  const storedSettings = readStorage(STORAGE_KEYS.settings, {})

  return {
    members: Array.isArray(members) ? members : [],
    meals: Array.isArray(meals) ? meals : [],
    expenses: Array.isArray(expenses) ? expenses : [],
    deposits: Array.isArray(deposits) ? deposits : [],
    settings:
      storedSettings && typeof storedSettings === 'object' && !Array.isArray(storedSettings)
        ? { ...DEFAULT_SETTINGS, ...storedSettings }
        : { ...DEFAULT_SETTINGS },
  }
}

function appReducer(state, action) {
  switch (action.type) {
    case 'ADD_MEMBER':
      return { ...state, members: [...state.members, action.payload] }
    case 'UPDATE_MEMBER':
      return {
        ...state,
        members: state.members.map((member) =>
          member.id === action.payload.id ? { ...member, ...action.payload.changes } : member,
        ),
      }
    case 'DELETE_MEMBER':
      return { ...state, members: state.members.filter((member) => member.id !== action.payload) }

    case 'ADD_MEAL':
      return { ...state, meals: [...state.meals, action.payload] }
    case 'UPDATE_MEAL':
      return {
        ...state,
        meals: state.meals.map((meal) =>
          meal.id === action.payload.id ? { ...meal, ...action.payload.changes } : meal,
        ),
      }
    case 'DELETE_MEAL':
      return { ...state, meals: state.meals.filter((meal) => meal.id !== action.payload) }

    case 'ADD_EXPENSE':
      return { ...state, expenses: [...state.expenses, action.payload] }
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id ? { ...expense, ...action.payload.changes } : expense,
        ),
      }
    case 'DELETE_EXPENSE':
      return { ...state, expenses: state.expenses.filter((expense) => expense.id !== action.payload) }

    case 'ADD_DEPOSIT':
      return { ...state, deposits: [...state.deposits, action.payload] }
    case 'UPDATE_DEPOSIT':
      return {
        ...state,
        deposits: state.deposits.map((deposit) =>
          deposit.id === action.payload.id ? { ...deposit, ...action.payload.changes } : deposit,
        ),
      }
    case 'DELETE_DEPOSIT':
      return { ...state, deposits: state.deposits.filter((deposit) => deposit.id !== action.payload) }

    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } }

    case 'IMPORT_DATA':
      return {
        members: Array.isArray(action.payload.members) ? action.payload.members : state.members,
        meals: Array.isArray(action.payload.meals) ? action.payload.meals : state.meals,
        expenses: Array.isArray(action.payload.expenses) ? action.payload.expenses : state.expenses,
        deposits: Array.isArray(action.payload.deposits) ? action.payload.deposits : state.deposits,
        settings:
          action.payload.settings && typeof action.payload.settings === 'object' && !Array.isArray(action.payload.settings)
            ? { ...DEFAULT_SETTINGS, ...action.payload.settings }
            : state.settings,
      }
    case 'RESET_DATA':
      Object.values(STORAGE_KEYS).forEach((key) => removeStorage(key))
      return { ...initialState, settings: { ...DEFAULT_SETTINGS } }

    default:
      return state
  }
}
export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, undefined, loadInitialState)

  useEffect(() => {
    writeStorage(STORAGE_KEYS.members, state.members)
    writeStorage(STORAGE_KEYS.meals, state.meals)
    writeStorage(STORAGE_KEYS.expenses, state.expenses)
    writeStorage(STORAGE_KEYS.deposits, state.deposits)
    writeStorage(STORAGE_KEYS.settings, state.settings)
  }, [state])

  const value = useMemo(() => {
    const addMember = (data = {}) => {
      const member = {
        ...DEFAULT_MEMBER,
        ...data,
        id: createId('member'),
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_MEMBER', payload: member })
      return member
    }

    const updateMember = (id, changes = {}) => {
      const safeChanges = { ...changes }
      delete safeChanges.id
      dispatch({ type: 'UPDATE_MEMBER', payload: { id, changes: safeChanges } })
    }

    const deleteMember = (id) => dispatch({ type: 'DELETE_MEMBER', payload: id })

    const addMeal = (data = {}) => {
      const meal = {
        ...DEFAULT_MEAL,
        ...data,
        id: createId('meal'),
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_MEAL', payload: meal })
      return meal
    }

    const updateMeal = (id, changes = {}) => {
      const safeChanges = { ...changes }
      delete safeChanges.id
      dispatch({ type: 'UPDATE_MEAL', payload: { id, changes: safeChanges } })
    }

    const deleteMeal = (id) => dispatch({ type: 'DELETE_MEAL', payload: id })

    const addExpense = (data = {}) => {
      const expense = {
        ...DEFAULT_EXPENSE,
        ...data,
        id: createId('expense'),
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_EXPENSE', payload: expense })
      return expense
    }

    const updateExpense = (id, changes = {}) => {
      const safeChanges = { ...changes }
      delete safeChanges.id
      dispatch({ type: 'UPDATE_EXPENSE', payload: { id, changes: safeChanges } })
    }

    const deleteExpense = (id) => dispatch({ type: 'DELETE_EXPENSE', payload: id })

    const addDeposit = (data = {}) => {
      const deposit = {
        ...DEFAULT_DEPOSIT,
        ...data,
        id: createId('deposit'),
        createdAt: new Date().toISOString(),
      }
      dispatch({ type: 'ADD_DEPOSIT', payload: deposit })
      return deposit
    }

    const updateDeposit = (id, changes = {}) => {
      const safeChanges = { ...changes }
      delete safeChanges.id
      dispatch({ type: 'UPDATE_DEPOSIT', payload: { id, changes: safeChanges } })
    }

    const deleteDeposit = (id) => dispatch({ type: 'DELETE_DEPOSIT', payload: id })

    const updateSettings = (changes = {}) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: changes })
    }

    const resetData = () => dispatch({ type: 'RESET_DATA' })

    const importData = (payload) => dispatch({ type: 'IMPORT_DATA', payload })

    return {
      ...state,
      addMember,
      updateMember,
      deleteMember,
      addMeal,
      updateMeal,
      deleteMeal,
      addExpense,
      updateExpense,
      deleteExpense,
      addDeposit,
      updateDeposit,
      deleteDeposit,
      updateSettings,
      resetData,
      importData,
    }
  }, [state])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useAppContext() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useAppContext must be used within AppProvider')
  return ctx
}





