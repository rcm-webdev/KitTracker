import { Routes, Route, Navigate } from "react-router"
import ProtectedRoute from "./components/ProtectedRoute"
import AppLayout from "./components/AppLayout"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import BinNew from "./pages/BinNew"
import BinDetail from "./pages/BinDetail"
import BinEdit from "./pages/BinEdit"
import BinLabel from "./pages/BinLabel"
import Search from "./pages/Search"
import AdminDashboard from "./pages/AdminDashboard"
import Scanner from "./pages/Scanner"
import PublicKit from "./pages/PublicKit"

function ProtectedShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

function ProtectedAdminShell({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAdmin>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/register"
        element={
          import.meta.env.VITE_REGISTRATION_ENABLED === "false"
            ? <Navigate to="/login" replace />
            : <Register />
        }
      />
      <Route path="/k/:id" element={<PublicKit />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedShell>
            <Dashboard />
          </ProtectedShell>
        }
      />
      <Route
        path="/bins/new"
        element={
          <ProtectedShell>
            <BinNew />
          </ProtectedShell>
        }
      />
      <Route
        path="/bins/:id"
        element={
          <ProtectedShell>
            <BinDetail />
          </ProtectedShell>
        }
      />
      <Route
        path="/bins/:id/edit"
        element={
          <ProtectedShell>
            <BinEdit />
          </ProtectedShell>
        }
      />
      <Route
        path="/bins/:id/label"
        element={
          <ProtectedShell>
            <BinLabel />
          </ProtectedShell>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedShell>
            <Search />
          </ProtectedShell>
        }
      />
      <Route
        path="/scan"
        element={
          <ProtectedShell>
            <Scanner />
          </ProtectedShell>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedAdminShell>
            <AdminDashboard />
          </ProtectedAdminShell>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}
