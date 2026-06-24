import { Link, useLocation, useNavigate } from 'react-router-dom'
import { obtenerUsuario, logout } from '../services/authService'

const clientLinks = [
  { path: '/menu', label: 'Menú', icon: 'local_cafe' },
  { path: '/carrito', label: 'Carrito', icon: 'shopping_cart' },
  { path: '/mis-pedidos', label: 'Mis pedidos', icon: 'receipt_long' },
]

const adminLinks = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { path: '/staff/pedidos', label: 'Pedidos', icon: 'assignment' },
  { path: '/admin/reportes', label: 'Reportes', icon: 'analytics' },
  { path: '/admin/usuarios', label: 'Usuarios', icon: 'group' },
]

const staffLinks = [
  { path: '/staff/pedidos', label: 'Pedidos', icon: 'assignment' },
]

function AppNavbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const usuario = obtenerUsuario()
  const fotoPerfil = usuario ? localStorage.getItem(`codffee_foto_perfil_${usuario.id}`) : null

  const links = usuario?.rol === 'ADMIN' ? adminLinks
    : usuario?.rol === 'PERSONAL' ? staffLinks
    : clientLinks

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => location.pathname === path

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to={usuario?.rol === 'ADMIN' ? '/admin' : usuario?.rol === 'PERSONAL' ? '/staff/pedidos' : '/menu'} className="navbar-brand">
          <span className="brand-emoji">☕</span> Codffee
        </Link>
        <nav className="navbar-links">
          {links.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${isActive(link.path) ? 'navbar-link-active' : ''}`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>
        <div className="navbar-user">
          <Link to="/perfil" className="navbar-user-avatar" title="Mi perfil">
            {fotoPerfil ? (
              <img src={fotoPerfil} alt="Foto" />
            ) : (
              <span className="material-symbols-outlined">account_circle</span>
            )}
          </Link>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{usuario?.nombre}</span>
            <span className="navbar-user-role">{usuario?.rol}</span>
          </div>
          <button className="navbar-btn" onClick={handleLogout} title="Cerrar sesión">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </header>
  )
}

export default AppNavbar