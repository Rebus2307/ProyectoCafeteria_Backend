import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Swal from 'sweetalert2'
import { registrarCliente } from '../services/authService'

const swalDark = {
  background: '#221e1a',
  color: '#f5efe8',
}

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
      Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden', ...swalDark })
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
        icon: 'success', title: 'Cuenta creada', text: 'Ahora puedes iniciar sesión',
        timer: 2000, showConfirmButton: false, ...swalDark,
      })
      navigate('/login')
    } catch (error) {
      const errData = error.response?.data
      const msg = errData?.mensaje || errData?.message || 'No se pudo crear la cuenta'
      Swal.fire({ icon: 'error', title: 'Error', text: msg, ...swalDark })
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
            <p className="login-subtitle">Crear cuenta de cliente</p>
          </div>
          <div className="login-card-body">
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label className="input-label" htmlFor="nombre">Nombre completo</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">person</span>
                  <input id="nombre" type="text" name="nombre" className="input-field" value={form.nombre} onChange={handleChange} placeholder="Tu nombre" required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="correo">Correo electrónico</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">mail</span>
                  <input id="correo" type="email" name="correo" className="input-field" value={form.correo} onChange={handleChange} placeholder="correo@ejemplo.com" required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="contrasena">Contraseña</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input id="contrasena" type="password" name="contrasena" className="input-field" value={form.contrasena} onChange={handleChange} placeholder="••••••••" required minLength={6} />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label" htmlFor="confirmarContrasena">Confirmar contraseña</label>
                <div className="input-wrapper">
                  <span className="material-symbols-outlined input-icon">lock</span>
                  <input id="confirmarContrasena" type="password" name="confirmarContrasena" className="input-field" value={form.confirmarContrasena} onChange={handleChange} placeholder="••••••••" required />
                </div>
              </div>
              <button className="btn btn-primary btn-full" type="submit" disabled={cargando}>
                <span className="material-symbols-outlined">person_add</span>
                {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
              </button>
            </form>
            <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-muted)', marginTop: 20 }}>
              ¿Ya tienes cuenta? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Inicia sesión</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RegisterPage