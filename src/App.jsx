import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AppProvider } from './context/AppContext'
import MainLayout from './components/layout/MainLayout'
import Dashboard from './pages/Dashboard'
import Members from './pages/Members'
import Meals from './pages/Meals'
import Expenses from './pages/Expenses'
import Deposits from './pages/Deposits'
import Reports from './pages/Reports'
import Settings from './pages/Settings'

export default function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/members" element={<Members />} />
            <Route path="/meals" element={<Meals />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/deposits" element={<Deposits />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  )
}

