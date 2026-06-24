import { Link, useLocation, useNavigate } from 'react-router-dom'
import { obtenerUsuario, logout } from '../services/authService'

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard', roles: ['ADMIN'] },
  { path: '/staff/pedidos', label: 'Pedidos', icon: 'assignment', roles: ['ADMIN', 'PERSONAL'] },
  { path: '/admin/reportes', label: 'Reportes', icon: 'analytics', roles: ['ADMIN'] },
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
      <header className="navbar d-md-none">
        <div className="navbar-inner">
          <span className="navbar-brand"><span className="brand-emoji">☕</span> Codffee</span>
          <div className="navbar-user">
            {fotoPerfil ? (
               <img src={fotoPerfil} alt="Foto" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', marginRight: 8 }} />
             ) : (
               <span className="material-symbols-outlined" style={{ color: 'var(--accent)', fontSize: 24 }}>account_circle</span>
            )}
            <span className="navbar-user-name" style={{ marginRight: 8 }}>{usuario?.nombre}</span>
            <button className="navbar-btn" onClick={handleLogout}>
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar - desktop */}
      <nav className="sidebar">
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">☕</div>
          <div className="sidebar-brand-text">
            <h2>Codffee</h2>
            <p>Panel de gestión</p>
          </div>
        </div>

        <div className="sidebar-section-title">Navegación</div>
        <div className="sidebar-nav">
          {visibleItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-link ${isActive(item.path) ? 'sidebar-link-active' : ''}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {fotoPerfil ? (
                <img src={fotoPerfil} alt="Foto de perfil" />
              ) : (
                <span className="material-symbols-outlined">person</span>
              )}
            </div>
            <div>
              <div className="sidebar-user-name">{usuario?.nombre}</div>
              <div className="sidebar-user-role">{usuario?.rol}</div>
            </div>
          </div>
          <button className="sidebar-link" style={{ marginTop: 4 }} onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesión
          </button>
        </div>
      </nav>
    </>
  )
}

export default StaffSidebar