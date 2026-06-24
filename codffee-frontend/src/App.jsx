import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { obtenerUsuario } from './services/authService'
import AppNavbar from './components/AppNavbar'
import StaffSidebar from './components/StaffSidebar'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import MenuPage from './pages/MenuPage'
import CartPage from './pages/CartPage'
import OrdersPage from './pages/OrdersPage'
import StaffOrdersPage from './pages/StaffOrdersPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import AdminUsersPage from './pages/AdminUsersPage'
import ReportsPage from './pages/ReportsPage'
import ProfilePage from './pages/ProfilePage'

function ProtectedRoute() {
  const usuario = obtenerUsuario()
  if (!usuario) return <Navigate to="/login" replace />
  return <Outlet />
}

function RoleRoute({ roles }) {
  const usuario = obtenerUsuario()
  if (!usuario) return <Navigate to="/login" replace />
  if (!roles.includes(usuario.rol)) return <Navigate to="/menu" replace />
  return <Outlet />
}

function PublicRoute() {
  const usuario = obtenerUsuario()
  if (usuario) {
    const routes = { CLIENTE: '/menu', PERSONAL: '/staff/pedidos', ADMIN: '/admin' }
    return <Navigate to={routes[usuario.rol] || '/menu'} replace />
  }
  return <Outlet />
}

function ClientLayout() {
  return (
    <>
      <AppNavbar />
      <Outlet />
    </>
  )
}

function StaffLayout() {
  return (
    <div className="staff-layout">
      <StaffSidebar />
      <div className="staff-main">
        <Outlet />
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
        </Route>

        {/* Rutas de cliente */}
        <Route element={<ProtectedRoute />}>
          <Route element={<ClientLayout />}>
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/carrito" element={<CartPage />} />
            <Route path="/mis-pedidos" element={<OrdersPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>
        </Route>

        {/* Rutas de personal */}
        <Route element={<RoleRoute roles={['PERSONAL', 'ADMIN']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/staff/pedidos" element={<StaffOrdersPage />} />
          </Route>
        </Route>

        {/* Rutas de admin */}
        <Route element={<RoleRoute roles={['ADMIN']} />}>
          <Route element={<StaffLayout />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            <Route path="/admin/reportes" element={<ReportsPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/menu" replace />} />
        <Route path="*" element={<Navigate to="/menu" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App