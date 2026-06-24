import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { login, guardarSesion, obtenerUsuario } from '../services/authService'

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ correo: '', contrasena: '' })
  const [cargando, setCargando] = useState(false)

  useEffect(() => {
    const usuario = obtenerUsuario()
    if (usuario) {
      const routes = { CLIENTE: '/menu', PERSONAL: '/staff/pedidos', ADMIN: '/admin' }
      navigate(routes[usuario.rol] || '/menu', { replace: true })
    }
  }, [navigate])

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const redirectByRole = (rol) => {
    const routes = { CLIENTE: '/menu', PERSONAL: '/staff/pedidos', ADMIN: '/admin' }
    navigate(routes[rol] || '/menu')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)

    try {
      const data = await login(form)
      guardarSesion(data)

      Swal.fire({
        icon: 'success',
        title: '¡Bienvenido!',
        text: data.mensaje || 'Inicio de sesión exitoso',
        timer: 1500,
        showConfirmButton: false,
        background: '#221e1a',
        color: '#f5efe8',
      })

      redirectByRole(data.rol)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: error.response?.data?.mensaje || 'Credenciales incorrectas',
        background: '#221e1a',
        color: '#f5efe8',
      })
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg"></div>
      <main className="login-container">
        <div className="login-card">
          <div className="login-card-header">
            <h1 className="login-logo">☕ Codffee</h1>
            <p className="login-subtitle">Sistema de pedidos para cafetería</p>
          </div>
          <div className="login-card-body">
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label" htmlFor="correo">Correo Electrónico</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input
                    id="correo"
                    type="email"
                    name="correo"
                    className="input-field"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="estudiante@universidad.edu"
                    required
                  />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="contrasena">Contraseña</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input
                    id="contrasena"
                    type="password"
                    name="contrasena"
                    className="input-field"
                    value={form.contrasena}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={cargando} style={{ marginTop: 8 }}>
                <span className="material-symbols-outlined">login</span>
                {cargando ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
            <div style={{ marginTop: 20 }}>
              <button className="btn btn-secondary btn-full" onClick={() => navigate('/registro')}>
                <span className="material-symbols-outlined">person_add</span>
                Crear cuenta nueva
              </button>
            </div>
          </div>
          <div className="login-card-footer">
            <p className="login-footer-text">
              ¿No tienes cuenta? <a href="/registro" onClick={(e) => { e.preventDefault(); navigate('/registro') }} style={{ color: 'var(--accent)', fontWeight: 600 }}>Regístrate aquí</a>
            </p>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>Acceso exclusivo para personal y estudiantes autorizados.</p>
      </main>
    </div>
  )
}

export default LoginPage