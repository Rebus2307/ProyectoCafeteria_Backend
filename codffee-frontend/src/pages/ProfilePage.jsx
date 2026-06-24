import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { obtenerUsuario, logout, actualizarPerfil } from '../services/authService'

const swalDark = { background: '#221e1a', color: '#f5efe8' }

function ProfilePage() {
  const navigate = useNavigate()
  const usuario = obtenerUsuario()
  const getFotoKey = () => usuario ? `codffee_foto_perfil_${usuario.id}` : 'codffee_foto_perfil'

  const [form, setForm] = useState({
    nombre: usuario?.nombre || '',
    correo: usuario?.correo || '',
    contrasena: '',
    confirmarContrasena: '',
  })
  const [foto, setFoto] = useState(localStorage.getItem(getFotoKey()) || '')
  const [cargando, setCargando] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleFotoUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target.result
      setFoto(base64)
      localStorage.setItem(getFotoKey(), base64)
    }
    reader.readAsDataURL(file)
  }

  const handleQuitarFoto = () => {
    setFoto('')
    localStorage.removeItem(getFotoKey())
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (form.contrasena && form.contrasena !== form.confirmarContrasena) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Las contraseñas no coinciden', ...swalDark })
      return
    }

    setCargando(true)
    const payload = { nombre: form.nombre, contrasena: form.contrasena || undefined }

    try {
      await actualizarPerfil(payload)
      const usuarioActualizado = { ...usuario, nombre: form.nombre }
      localStorage.setItem('usuario', JSON.stringify(usuarioActualizado))

      Swal.fire({ icon: 'success', title: 'Perfil actualizado', text: 'Los cambios se guardaron correctamente', timer: 1500, showConfirmButton: false, ...swalDark })
    } catch (error) {
      const errData = error.response?.data
      const msg = errData?.mensaje || errData?.message || 'No se pudo actualizar el perfil'
      Swal.fire({ icon: 'error', title: 'Error', text: msg, ...swalDark })
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="profile-page">
      <h1 className="profile-title">Mi Perfil</h1>

      <div className="profile-photo-section">
        <div className="profile-photo">
          {foto ? (
            <img src={foto} alt="Foto de perfil" className="profile-photo-img" />
          ) : (
            <span className="material-symbols-outlined">person</span>
          )}
        </div>
        <div className="profile-photo-actions">
          <label className="btn btn-secondary" style={{ cursor: 'pointer' }}>
            <span className="material-symbols-outlined">camera_alt</span>
            Subir foto
            <input type="file" accept="image/*" onChange={handleFotoUpload} style={{ display: 'none' }} />
          </label>
          {foto && (
            <button className="btn btn-danger" onClick={handleQuitarFoto}>
              <span className="material-symbols-outlined">delete</span>
              Quitar
            </button>
          )}
        </div>
      </div>

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label className="input-label" htmlFor="nombre">Nombre</label>
          <input id="nombre" name="nombre" type="text" className="input-field" style={{ paddingLeft: 16 }} value={form.nombre} onChange={handleChange} required />
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="correo">Correo electrónico</label>
          <input id="correo" name="correo" type="email" className="input-field" style={{ paddingLeft: 16, opacity: 0.7, cursor: 'not-allowed' }} value={form.correo} readOnly />
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="contrasena">Nueva contraseña (dejar vacío para mantener)</label>
          <input id="contrasena" name="contrasena" type="password" className="input-field" style={{ paddingLeft: 16 }} value={form.contrasena} onChange={handleChange} placeholder="••••••••" minLength={6} />
        </div>
        <div className="input-group">
          <label className="input-label" htmlFor="confirmarContrasena">Confirmar nueva contraseña</label>
          <input id="confirmarContrasena" name="confirmarContrasena" type="password" className="input-field" style={{ paddingLeft: 16 }} value={form.confirmarContrasena} onChange={handleChange} placeholder="••••••••" />
        </div>
        <button className="btn btn-primary" type="submit" disabled={cargando} style={{ width: 'auto' }}>
          {cargando ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </form>
    </main>
  )
}

export default ProfilePage