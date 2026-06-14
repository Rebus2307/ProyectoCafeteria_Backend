import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../services/usuarioService'
import Loading from '../components/Loading'

const roles = ['CLIENTE', 'PERSONAL', 'ADMIN']

function AdminUsersPage() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)
  const [editando, setEditando] = useState(null)

  useEffect(() => {
    cargarUsuarios()
  }, [])

  const cargarUsuarios = async () => {
    try {
      const res = await obtenerUsuarios()
      setUsuarios(Array.isArray(res.data) ? res.data : [])
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los usuarios' })
    } finally {
      setCargando(false)
    }
  }

  const handleCrear = async () => {
    const { value: form } = await Swal.fire({
      title: 'Crear nuevo usuario',
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre completo">
        <input id="swal-correo" class="swal2-input" placeholder="Correo electrónico" type="email">
        <input id="swal-contrasena" class="swal2-input" placeholder="Contraseña" type="password">
        <select id="swal-rol" class="swal2-input">
          <option value="CLIENTE">Cliente</option>
          <option value="PERSONAL">Personal</option>
          <option value="ADMIN">Admin</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-nombre').value
        const correo = document.getElementById('swal-correo').value
        const contrasena = document.getElementById('swal-contrasena').value
        const rol = document.getElementById('swal-rol').value
        if (!nombre || !correo || !contrasena) {
          Swal.showValidationMessage('Todos los campos son obligatorios')
          return
        }
        return { nombre, correo, contrasena, rol }
      },
    })

    if (!form) return

    try {
      await crearUsuario(form)
      Swal.fire({ icon: 'success', title: 'Usuario creado', timer: 1500, showConfirmButton: false })
      cargarUsuarios()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.mensaje || 'No se pudo crear el usuario' })
    }
  }

  const handleEditarRol = async (usuario) => {
    const { value: nuevoRol } = await Swal.fire({
      title: `Cambiar rol de ${usuario.nombre}`,
      input: 'select',
      inputOptions: roles.reduce((acc, r) => ({ ...acc, [r]: r }), {}),
      inputValue: usuario.rol,
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    })

    if (!nuevoRol || nuevoRol === usuario.rol) return

    try {
      await actualizarUsuario(usuario.id, { ...usuario, rol: nuevoRol, contrasena: '' })
      Swal.fire({ icon: 'success', title: 'Rol actualizado', timer: 1500, showConfirmButton: false })
      cargarUsuarios()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.mensaje || 'No se pudo actualizar el rol' })
    }
  }

  const handleToggleActivo = async (usuario) => {
    const action = usuario.activo ? 'desactivar' : 'activar'
    const result = await Swal.fire({
      title: `¿${action === 'activar' ? 'Activar' : 'Desactivar'} usuario?`,
      text: `${usuario.nombre} será ${action}ado`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    try {
      await actualizarUsuario(usuario.id, { ...usuario, activo: !usuario.activo, contrasena: '' })
      Swal.fire({ icon: 'success', title: `Usuario ${action}ado`, timer: 1500, showConfirmButton: false })
      cargarUsuarios()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.mensaje || `No se pudo ${action} el usuario` })
    }
  }

  const handleEliminar = async (usuario) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Estás seguro de eliminar permanentemente a ${usuario.nombre} de la base de datos? Esta acción no se puede deshacer.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#ba1a1a',
    })
    if (!result.isConfirmed) return

    try {
      await eliminarUsuario(usuario.id)
      Swal.fire({ icon: 'success', title: 'Usuario eliminado', timer: 1500, showConfirmButton: false })
      cargarUsuarios()
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.mensaje || 'No se pudo eliminar el usuario (puede tener pedidos asociados)'
      })
    }
  }

  if (cargando) return <Loading />

  return (
    <main className="admin-users-page">
      <header className="admin-users-header">
        <div>
          <h1 className="admin-users-title">Gestión de Usuarios</h1>
          <p className="admin-users-subtitle">Administra los perfiles y roles del sistema.</p>
        </div>
        <button className="btn-codffee-primary admin-users-add-btn" onClick={handleCrear} style={{ width: 'auto' }}>
          <span className="material-symbols-outlined">person_add</span>
          Nuevo usuario
        </button>
      </header>

      <div className="staff-orders-table-container">
        <div className="overflow-x-auto">
          <table className="staff-orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-lg">
                    <div className="empty-state">
                      <span className="material-symbols-outlined empty-state-icon">group_off</span>
                      <p>No hay usuarios registrados</p>
                    </div>
                  </td>
                </tr>
              ) : (
                usuarios.map((u) => (
                  <tr key={u.id}>
                    <td className="staff-order-id">#{u.id}</td>
                    <td><span className="staff-order-cliente">{u.nombre}</span></td>
                    <td className="staff-order-fecha">{u.correo}</td>
                    <td>
                      <span className={`status-badge ${u.rol === 'ADMIN' ? 'badge-preparacion' : u.rol === 'PERSONAL' ? 'badge-listo' : 'badge-pendiente'}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${u.activo ? 'badge-listo' : 'badge-cancelado'}`}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="staff-order-fecha">
                      {u.fechaRegistro ? new Date(u.fechaRegistro).toLocaleDateString('es-MX') : '—'}
                    </td>
                    <td>
                      <div className="staff-order-acciones">
                        <button className="accion-btn" onClick={() => handleEditarRol(u)} title="Cambiar rol">
                          <span className="material-symbols-outlined">manage_accounts</span>
                          <span className="accion-label">Rol</span>
                        </button>
                        <button
                          className={`accion-btn ${u.activo ? 'accion-btn-danger' : ''}`}
                          onClick={() => handleToggleActivo(u)}
                          title={u.activo ? 'Desactivar' : 'Activar'}
                        >
                          <span className="material-symbols-outlined">{u.activo ? 'block' : 'check_circle'}</span>
                          <span className="accion-label">{u.activo ? 'Desactivar' : 'Activar'}</span>
                        </button>
                        <button className="accion-btn accion-btn-danger" onClick={() => handleEliminar(u)} title="Eliminar permanentemente">
                          <span className="material-symbols-outlined">delete</span>
                          <span className="accion-label">Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}

export default AdminUsersPage
