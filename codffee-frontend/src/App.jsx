import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
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
import ProtectedRoute from './routes/ProtectedRoute'
import RoleRoute from './routes/RoleRoute'
import AppNavbar from './components/AppNavbar'
import StaffSidebar from './components/StaffSidebar'
import { Outlet } from 'react-router-dom'
import { obtenerUsuario } from './services/authService'

function HomeRedirect() {
  const usuario = obtenerUsuario()
  if (!usuario) return <Navigate to="/login" replace />
  const routes = { CLIENTE: '/menu', PERSONAL: '/staff/pedidos', ADMIN: '/admin' }
  return <Navigate to={routes[usuario.rol] || '/menu'} replace />
}

function ClientLayout() {
  return (
    <>
      <AppNavbar />
      <main className="main-content">
        <Outlet />
      </main>
    </>
  )
}

function StaffLayout() {
  return (
    <div className="staff-layout">
      <StaffSidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<ProtectedRoute />}>
          {/* Perfil - cualquier rol autenticado */}
          <Route path="/perfil" element={<ClientLayout />}>
            <Route index element={<ProfilePage />} />
          </Route>

          {/* CLIENTE routes */}
          <Route element={<RoleRoute roles={['CLIENTE']} />}>
            <Route element={<ClientLayout />}>
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/carrito" element={<CartPage />} />
              <Route path="/mis-pedidos" element={<OrdersPage />} />
            </Route>
          </Route>

          {/* PERSONAL + ADMIN routes (staff sidebar) */}
          <Route element={<RoleRoute roles={['PERSONAL', 'ADMIN']} />}>
            <Route element={<StaffLayout />}>
              <Route path="/staff/pedidos" element={<StaffOrdersPage />} />
            </Route>
          </Route>

          {/* ADMIN only routes */}
          <Route element={<RoleRoute roles={['ADMIN']} />}>
            <Route element={<StaffLayout />}>
              <Route path="/admin" element={<AdminDashboardPage />} />
              <Route path="/admin/reportes" element={<ReportsPage />} />
              <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
