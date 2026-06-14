import { Link, useLocation, useNavigate } from 'react-router-dom'
import { obtenerUsuario, logout } from '../services/authService'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard', roles: ['ADMIN'] },
  { path: '/staff/pedidos', label: 'Order Queue', icon: 'assignment', roles: ['ADMIN', 'PERSONAL'] },
  { path: '/admin/reportes', label: 'Reports', icon: 'analytics', roles: ['ADMIN'] },
  { path: '/admin/usuarios', label: 'Usuarios', icon: 'group', roles: ['ADMIN'] },
  { path: '/perfil', label: 'Mi Perfil', icon: 'account_circle', roles: ['ADMIN', 'PERSONAL'] },
]

function StaffSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const usuario = obtenerUsuario()
  const fotoPerfil = usuario ? localStorage.getItem(`codffee_foto_perfil_${usuario.id}`) : null

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(usuario?.rol)
  )

  return (
    <>
      {/* Mobile top bar */}
      <header className="navbar-codffee d-md-none">
        <div className="navbar-codffee-inner">
          <span className="navbar-brand">Codffee</span>
          <div className="navbar-user">
            {fotoPerfil ? (
               <img src={fotoPerfil} alt="Foto" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginRight: 8 }} />
             ) : (
               <span className="material-symbols-outlined me-2" style={{ color: 'var(--primary)', fontSize: 24 }}>account_circle</span>
             )}
             <span className="navbar-user-name me-2">{usuario?.nombre}</span>
             <button className="navbar-user-btn" onClick={handleLogout}>
               <span className="material-symbols-outlined">logout</span>
             </button>
          </div>
        </div>
      </header>

      {/* Sidebar - desktop */}
      <nav className="staff-sidebar">
        <div className="staff-sidebar-header">
          <div className="staff-sidebar-avatar">
            <span className="material-symbols-outlined">person</span>
          </div>
          <div>
            <h2 className="staff-sidebar-title">Staff Portal</h2>
            <p className="staff-sidebar-subtitle">Cafeteria Management</p>
          </div>
        </div>

        <div className="staff-sidebar-nav">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`staff-sidebar-link ${isActive(item.path) ? 'staff-sidebar-link-active' : ''}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="staff-sidebar-footer">
          <div className="staff-sidebar-user" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="staff-sidebar-avatar staff-sidebar-avatar-sm" style={{ overflow: 'hidden' }}>
                {fotoPerfil ? (
                  <img src={fotoPerfil} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span className="material-symbols-outlined">person</span>
                )}
              </div>
              <div>
                <p className="staff-sidebar-user-name">{usuario?.nombre}</p>
                <p className="staff-sidebar-user-role">{usuario?.rol}</p>
              </div>
            </div>
            <button className="navbar-user-btn" onClick={handleLogout} title="Cerrar sesión">
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

export default StaffSidebar
