import { Routes, Route, Navigate } from "react-router";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import BinNew from "./pages/BinNew";
import BinDetail from "./pages/BinDetail";
import BinEdit from "./pages/BinEdit";
import BinLabel from "./pages/BinLabel";
import Search from "./pages/Search";
import AdminDashboard from "./pages/AdminDashboard";
import Scanner from "./pages/Scanner";

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bins/new"
        element={
          <ProtectedRoute>
            <BinNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bins/:id"
        element={
          <ProtectedRoute>
            <BinDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bins/:id/edit"
        element={
          <ProtectedRoute>
            <BinEdit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/bins/:id/label"
        element={
          <ProtectedRoute>
            <BinLabel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <Search />
          </ProtectedRoute>
        }
      />

      {/* Admin only */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAdmin>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/scan"
        element={
          <ProtectedRoute>
            <Scanner />
          </ProtectedRoute>
        }
      />

      {/* Default */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
