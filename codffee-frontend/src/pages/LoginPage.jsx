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
        title: 'Bienvenido',
        text: data.mensaje || 'Inicio de sesión exitoso',
        timer: 1500,
        showConfirmButton: false,
      })

      redirectByRole(data.rol)
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error al iniciar sesión',
        text: error.response?.data?.mensaje || 'Credenciales incorrectas',
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
            <h1 className="login-title">Codffee</h1>
            <p className="login-subtitle">Sistema de pedidos para cafetería</p>
          </div>
          <div className="login-card-body">
            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label" htmlFor="correo">Correo Electrónico</label>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined login-input-icon">mail</span>
                  <input
                    id="correo"
                    type="email"
                    name="correo"
                    className="login-input"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="estudiante@universidad.edu"
                    required
                  />
                </div>
              </div>
              <div className="login-field">
                <label className="login-label" htmlFor="contrasena">Contraseña</label>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined login-input-icon">lock</span>
                  <input
                    id="contrasena"
                    type="password"
                    name="contrasena"
                    className="login-input"
                    value={form.contrasena}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button className="login-btn" type="submit" disabled={cargando}>
                {cargando ? 'Ingresando...' : 'Iniciar sesión'}
              </button>
            </form>
            <div className="login-card-footer-row mt-lg">
              <button className="login-btn login-register-btn" onClick={() => navigate('/registro')}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person_add</span>
                Crear cuenta nueva (Cliente)
              </button>
            </div>
          </div>
          <div className="login-card-footer">
            <div className="login-card-footer-row mb-3">
              <p className="font-body-sm text-center">
                ¿No tienes cuenta?{' '}
                <a href="/registro" className="login-register-link" onClick={(e) => { e.preventDefault(); navigate('/registro') }}>
                  Regístrate aquí
                </a>
              </p>
            </div>
          </div>
        </div>
        <p className="login-footer-note">Acceso exclusivo para personal y estudiantes autorizados.</p>
      </main>
    </div>
  )
}

export default LoginPage
