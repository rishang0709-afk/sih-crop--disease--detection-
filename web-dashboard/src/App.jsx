import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login         from './pages/Login'
import Register      from './pages/Register'
import Unauthorized  from './pages/Unauthorized'
import BDODashboard      from './pages/dashboards/BDODashboard'
import OfficerDashboard  from './pages/dashboards/OfficerDashboard'
import ExpertDashboard   from './pages/dashboards/ExpertDashboard'
import DistrictDashboard from './pages/dashboards/DistrictDashboard'

/**
 * Root redirect: sends authenticated users to their role dashboard,
 * unauthenticated users to /login.
 */
function RootRedirect() {
  const { token, role, loading, ROLE_ROUTES } = useAuth()
  if (loading) return null
  if (!token) return <Navigate to="/login" replace />
  const route = ROLE_ROUTES[role]
  return <Navigate to={route || '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"        element={<Login />} />
      <Route path="/register"     element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected — BDO */}
      <Route
        path="/dashboard/bdo"
        element={
          <ProtectedRoute allowedRoles={['BDO']}>
            <BDODashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected — Agriculture & Horticulture Officers */}
      <Route
        path="/dashboard/officer"
        element={
          <ProtectedRoute allowedRoles={['AGRICULTURE_OFFICER', 'HORTICULTURE_OFFICER']}>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected — District / State Officials */}
      <Route
        path="/dashboard/district"
        element={
          <ProtectedRoute allowedRoles={['DISTRICT_STATE_OFFICIAL']}>
            <DistrictDashboard />
          </ProtectedRoute>
        }
      />

      {/* Protected — KVK / Lab Expert */}
      <Route
        path="/dashboard/expert"
        element={
          <ProtectedRoute allowedRoles={['KVK_LAB_EXPERT']}>
            <ExpertDashboard />
          </ProtectedRoute>
        }
      />

      {/* Root — smart redirect */}
      <Route path="/"  element={<RootRedirect />} />
      <Route path="*"  element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
