import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../services/usuarioService'
import Loading from '../components/Loading'

const roles = ['CLIENTE', 'PERSONAL', 'ADMIN']
const swalDark = { background: '#221e1a', color: '#f5efe8' }

function AdminUsersPage() {
  const [usuarios, setUsuarios] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => { cargarUsuarios() }, [])

  const cargarUsuarios = async () => {
    try {
      const res = await obtenerUsuarios()
      setUsuarios(Array.isArray(res.data) ? res.data : [])
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los usuarios', ...swalDark })
    } finally {
      setCargando(false)
    }
  }

  const handleCrear = async () => {
    const { value: form } = await Swal.fire({
      title: 'Crear nuevo usuario',
      html: `
        <input id="swal-nombre" class="swal2-input" placeholder="Nombre completo" style="background:#1a1714;color:#f5efe8;border-color:rgba(200,149,108,0.2)">
        <input id="swal-correo" class="swal2-input" placeholder="Correo electrónico" type="email" style="background:#1a1714;color:#f5efe8;border-color:rgba(200,149,108,0.2)">
        <input id="swal-contrasena" class="swal2-input" placeholder="Contraseña" type="password" style="background:#1a1714;color:#f5efe8;border-color:rgba(200,149,108,0.2)">
        <select id="swal-rol" class="swal2-input" style="background:#1a1714;color:#f5efe8;border-color:rgba(200,149,108,0.2)">
          <option value="CLIENTE">Cliente</option>
          <option value="PERSONAL">Personal</option>
          <option value="ADMIN">Admin</option>
        </select>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear', cancelButtonText: 'Cancelar',
      ...swalDark,
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
      Swal.fire({ icon: 'success', title: 'Usuario creado', timer: 1500, showConfirmButton: false, ...swalDark })
      cargarUsuarios()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.mensaje || 'No se pudo crear el usuario', ...swalDark })
    }
  }

  const handleEditarRol = async (usuario) => {
    const { value: nuevoRol } = await Swal.fire({
      title: `Cambiar rol de ${usuario.nombre}`,
      input: 'select',
      inputOptions: roles.reduce((acc, r) => ({ ...acc, [r]: r }), {}),
      inputValue: usuario.rol,
      showCancelButton: true, confirmButtonText: 'Guardar', cancelButtonText: 'Cancelar',
      ...swalDark,
    })
    if (!nuevoRol || nuevoRol === usuario.rol) return
    try {
      const { id, nombre, correo, activo } = usuario
      await actualizarUsuario(id, { nombre, correo, rol: nuevoRol, activo, contrasena: '' })
      Swal.fire({ icon: 'success', title: 'Rol actualizado', timer: 1500, showConfirmButton: false, ...swalDark })
      cargarUsuarios()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.mensaje || 'No se pudo actualizar el rol', ...swalDark })
    }
  }

  const handleToggleActivo = async (usuario) => {
    const action = usuario.activo ? 'desactivar' : 'activar'
    const result = await Swal.fire({
      title: `¿${action === 'activar' ? 'Activar' : 'Desactivar'} usuario?`,
      text: `${usuario.nombre} será ${action}ado`,
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sí', cancelButtonText: 'Cancelar', ...swalDark,
    })
    if (!result.isConfirmed) return
    try {
      const { id, nombre, correo, rol, activo } = usuario
      await actualizarUsuario(id, { nombre, correo, rol, activo: !activo, contrasena: '' })
      Swal.fire({ icon: 'success', title: `Usuario ${action}ado`, timer: 1500, showConfirmButton: false, ...swalDark })
      cargarUsuarios()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.mensaje || `No se pudo ${action} el usuario`, ...swalDark })
    }
  }

  const handleEliminar = async (usuario) => {
    const result = await Swal.fire({
      title: '¿Eliminar usuario?',
      text: `¿Eliminar permanentemente a ${usuario.nombre}? Esta acción no se puede deshacer.`,
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sí, eliminar', cancelButtonText: 'Cancelar',
      confirmButtonColor: '#e85d5d', ...swalDark,
    })
    if (!result.isConfirmed) return
    try {
      await eliminarUsuario(usuario.id)
      Swal.fire({ icon: 'success', title: 'Usuario eliminado', timer: 1500, showConfirmButton: false, ...swalDark })
      cargarUsuarios()
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Error', text: error.response?.data?.mensaje || 'No se pudo eliminar el usuario (puede tener pedidos asociados)', ...swalDark })
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
        <button className="btn btn-primary" onClick={handleCrear}>
          <span className="material-symbols-outlined">person_add</span>
          Nuevo usuario
        </button>
      </header>

      <div className="staff-orders-table-wrap">
        <div style={{ overflowX: 'auto' }}>
          <table className="staff-orders-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Correo</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Registro</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: 40 }}>
                    <div className="empty-state">
                      <span className="material-symbols-outlined">group_off</span>
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
                      <span className={`badge ${u.rol === 'ADMIN' ? 'badge-preparacion' : u.rol === 'PERSONAL' ? 'badge-listo' : 'badge-pendiente'}`}>
                        {u.rol}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${u.activo ? 'badge-listo' : 'badge-cancelado'}`}>
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
                          <span>Rol</span>
                        </button>
                        <button
                          className={`accion-btn ${u.activo ? 'accion-btn-danger' : ''}`}
                          onClick={() => handleToggleActivo(u)}
                          title={u.activo ? 'Desactivar' : 'Activar'}
                        >
                          <span className="material-symbols-outlined">{u.activo ? 'block' : 'check_circle'}</span>
                          <span>{u.activo ? 'Desactivar' : 'Activar'}</span>
                        </button>
                        <button className="accion-btn accion-btn-danger" onClick={() => handleEliminar(u)} title="Eliminar permanentemente">
                          <span className="material-symbols-outlined">delete</span>
                          <span>Eliminar</span>
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