import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { obtenerPedidos, cambiarEstadoPedido, cancelarPedido } from '../services/pedidoService'
import { obtenerUsuario } from '../services/authService'
import StatusBadge from '../components/StatusBadge'
import Loading from '../components/Loading'

const swalDark = { background: '#221e1a', color: '#f5efe8' }

function StaffOrdersPage() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [contadores, setContadores] = useState({ pendientes: 0, preparacion: 0 })

  const usuario = obtenerUsuario()
  const fotoPerfil = usuario ? localStorage.getItem(`codffee_foto_perfil_${usuario.id}`) : null

  const cargarPedidos = useCallback(async () => {
    try {
      const res = await obtenerPedidos()
      const data = Array.isArray(res.data) ? res.data : []
      setPedidos(data)
      setContadores({
        pendientes: data.filter((p) => p.estado === 'PENDIENTE').length,
        preparacion: data.filter((p) => p.estado === 'EN_PREPARACION').length,
      })
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los pedidos', ...swalDark })
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarPedidos() }, [cargarPedidos])

  const handleCambiarEstado = async (pedidoId, estado) => {
    const labels = { EN_PREPARACION: 'En preparación', LISTO: 'Listo', ENTREGADO: 'Entregado' }
    const result = await Swal.fire({
      title: '¿Cambiar estado?', text: `Marcar como "${labels[estado] || estado}"`,
      icon: 'question', showCancelButton: true,
      confirmButtonText: 'Sí, cambiar', cancelButtonText: 'Cancelar', ...swalDark,
    })
    if (!result.isConfirmed) return
    try {
      await cambiarEstadoPedido(pedidoId, estado)
      Swal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1000, showConfirmButton: false, ...swalDark })
      cargarPedidos()
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado', ...swalDark })
    }
  }

  const handleCancelar = async (pedidoId) => {
    const result = await Swal.fire({
      title: '¿Cancelar pedido?', text: 'Esta acción no se puede deshacer',
      icon: 'warning', showCancelButton: true,
      confirmButtonColor: '#e85d5d', confirmButtonText: 'Sí, cancelar', cancelButtonText: 'No', ...swalDark,
    })
    if (!result.isConfirmed) return
    try {
      await cancelarPedido(pedidoId)
      Swal.fire({ icon: 'success', title: 'Pedido cancelado', timer: 1000, showConfirmButton: false, ...swalDark })
      cargarPedidos()
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar el pedido', ...swalDark })
    }
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return String(p.id).includes(q) || (p.usuario?.nombre || '').toLowerCase().includes(q)
  })

  if (cargando) return <Loading />

  return (
    <main className="staff-orders-page">
      <header className="staff-orders-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {fotoPerfil ? (
            <img src={fotoPerfil} alt="Perfil" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border)' }} />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '52px', color: 'var(--accent)' }}>account_circle</span>
          )}
          <div>
            <h1 className="staff-orders-title">Pedidos Activos</h1>
            <p className="staff-orders-subtitle">Gestiona los pedidos entrantes de Codffee.</p>
          </div>
        </div>
        <div className="staff-orders-stats">
          <div className="stat-chip">
            <span className="material-symbols-outlined">pending_actions</span>
            <div>
              <p className="stat-chip-label">Pendientes</p>
              <p className="stat-chip-value">{contadores.pendientes}</p>
            </div>
          </div>
          <div className="stat-chip">
            <span className="material-symbols-outlined">local_fire_department</span>
            <div>
              <p className="stat-chip-label">Preparando</p>
              <p className="stat-chip-value">{contadores.preparacion}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="staff-orders-table-wrap">
        <div className="staff-orders-toolbar">
          <div className="staff-orders-search">
            <span className="material-symbols-outlined">search</span>
            <input
              type="text"
              placeholder="Buscar por ID o nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </div>
          <button className="btn btn-ghost" onClick={cargarPedidos}>
            <span className="material-symbols-outlined">refresh</span>
            Refrescar
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="staff-orders-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Total</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>
                    <div className="empty-state">
                      <span className="material-symbols-outlined">search_off</span>
                      <p>No hay pedidos que coincidan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="staff-order-id">#{pedido.id}</td>
                    <td><div className="staff-order-cliente">{pedido.usuario?.nombre || pedido.cliente || '—'}</div></td>
                    <td className="staff-order-fecha">
                      {pedido.fechaHora || pedido.fecha ? new Date(pedido.fechaHora || pedido.fecha).toLocaleTimeString('es-MX', {
                        hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </td>
                    <td><StatusBadge estado={pedido.estado} /></td>
                    <td className="staff-order-total">${Number(pedido.total).toFixed(2)}</td>
                    <td>
                      <div className="staff-order-acciones">
                        {pedido.estado === 'PENDIENTE' && (
                          <button className="accion-btn" onClick={() => handleCambiarEstado(pedido.id, 'EN_PREPARACION')} title="En preparación">
                            <span className="material-symbols-outlined">local_cafe</span>
                            <span>Prep</span>
                          </button>
                        )}
                        {pedido.estado === 'EN_PREPARACION' && (
                          <button className="accion-btn" onClick={() => handleCambiarEstado(pedido.id, 'LISTO')} title="Listo">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span>Listo</span>
                          </button>
                        )}
                        {pedido.estado === 'LISTO' && (
                          <button className="accion-btn" onClick={() => handleCambiarEstado(pedido.id, 'ENTREGADO')} title="Entregado">
                            <span className="material-symbols-outlined">done_all</span>
                            <span>Entregar</span>
                          </button>
                        )}
                        {!['ENTREGADO', 'CANCELADO'].includes(pedido.estado) && (
                          <button className="accion-btn accion-btn-danger" onClick={() => handleCancelar(pedido.id)} title="Cancelar">
                            <span className="material-symbols-outlined">cancel</span>
                            <span>Cancelar</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="staff-orders-footer">
          <span>Mostrando {pedidosFiltrados.length} de {pedidos.length} pedidos</span>
        </div>
      </div>
    </main>
  )
}

export default StaffOrdersPage