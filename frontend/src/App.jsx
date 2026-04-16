import { Routes, Route, Navigate } from 'react-router-dom'
import useAuthStore from './store/authStore'

// Pages
import Home         from './pages/Home'
import Gallery      from './pages/Gallery'
import Exhibition   from './pages/Exhibition'
import Login        from './pages/Login'
import Register     from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword  from './pages/ResetPassword'
import Dashboard    from './pages/Dashboard'
import Profile      from './pages/Profile'
import UploadArtwork from './pages/UploadArtwork'
import ArtworkDetail from './pages/ArtworkDetail'

// Admin
import AdminPanel    from './pages/admin/AdminPanel'
import ManageArtworks from './pages/admin/ManageArtworks'
import ManageUsers   from './pages/admin/ManageUsers'
import ManageRooms   from './pages/admin/ManageRooms'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"              element={<Home />} />
      <Route path="/gallery"       element={<Gallery />} />
      <Route path="/exhibition"    element={<Exhibition />} />
      <Route path="/artworks/:id"  element={<ArtworkDetail />} />
      <Route path="/login"         element={<Login />} />
      <Route path="/register"      element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password"  element={<ResetPassword />} />

      {/* Protected */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/upload"    element={<ProtectedRoute><UploadArtwork /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin"              element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
      <Route path="/admin/artworks"     element={<ProtectedRoute adminOnly><ManageArtworks /></ProtectedRoute>} />
      <Route path="/admin/users"        element={<ProtectedRoute adminOnly><ManageUsers /></ProtectedRoute>} />
      <Route path="/admin/rooms"        element={<ProtectedRoute adminOnly><ManageRooms /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
