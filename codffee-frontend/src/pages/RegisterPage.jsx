import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { registrarCliente } from '../services/authService'

function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nombre: '', correo: '', contrasena: '', confirmarContrasena: '' })
  const [cargando, setCargando] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.contrasena !== form.confirmarContrasena) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden' })
      return
    }

    setCargando(true)

    try {
      await registrarCliente({
        nombre: form.nombre,
        correo: form.correo,
        contrasena: form.contrasena,
      })
      Swal.fire({
        icon: 'success',
        title: 'Cuenta creada',
        text: 'Ahora puedes iniciar sesión',
        timer: 2000,
        showConfirmButton: false,
      })
      navigate('/login')
    } catch (error) {
      const errData = error.response?.data
      const msg = errData?.mensaje || errData?.message || 'No se pudo crear la cuenta'
      Swal.fire({ icon: 'error', title: 'Error', text: msg })
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
            <p className="login-subtitle">Crear cuenta de cliente</p>
          </div>
          <div className="login-card-body">
            <form onSubmit={handleSubmit}>
              <div className="login-field">
                <label className="login-label" htmlFor="nombre">Nombre completo</label>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined login-input-icon">person</span>
                  <input
                    id="nombre"
                    type="text"
                    name="nombre"
                    className="login-input"
                    value={form.nombre}
                    onChange={handleChange}
                    placeholder="Tu nombre"
                    required
                  />
                </div>
              </div>
              <div className="login-field">
                <label className="login-label" htmlFor="correo">Correo electrónico</label>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined login-input-icon">mail</span>
                  <input
                    id="correo"
                    type="email"
                    name="correo"
                    className="login-input"
                    value={form.correo}
                    onChange={handleChange}
                    placeholder="correo@ejemplo.com"
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
                    minLength={6}
                  />
                </div>
              </div>
              <div className="login-field">
                <label className="login-label" htmlFor="confirmarContrasena">Confirmar contraseña</label>
                <div className="login-input-wrapper">
                  <span className="material-symbols-outlined login-input-icon">lock</span>
                  <input
                    id="confirmarContrasena"
                    type="password"
                    name="confirmarContrasena"
                    className="login-input"
                    value={form.confirmarContrasena}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button className="login-btn" type="submit" disabled={cargando}>
                {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
            <div className="register-login-link">
              <p className="font-body-sm text-center mt-md">
                ¿Ya tienes cuenta?{' '}
                <Link to="/login" className="login-register-link">Inicia sesión</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RegisterPage
