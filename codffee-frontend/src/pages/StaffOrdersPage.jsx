import { useState, useEffect, useCallback } from 'react'
import Swal from 'sweetalert2'
import { obtenerPedidos, cambiarEstadoPedido, cancelarPedido } from '../services/pedidoService'
import StatusBadge from '../components/StatusBadge'
import Loading from '../components/Loading'

function StaffOrdersPage() {
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [contadores, setContadores] = useState({ pendientes: 0, preparacion: 0 })

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
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los pedidos' })
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    cargarPedidos()
  }, [cargarPedidos])

  const handleCambiarEstado = async (pedidoId, estado) => {
    const labels = { EN_PREPARACION: 'En preparación', LISTO: 'Listo', ENTREGADO: 'Entregado' }
    const result = await Swal.fire({
      title: '¿Cambiar estado?',
      text: `Marcar como "${labels[estado] || estado}"`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, cambiar',
      cancelButtonText: 'Cancelar',
    })
    if (!result.isConfirmed) return

    try {
      await cambiarEstadoPedido(pedidoId, estado)
      Swal.fire({ icon: 'success', title: 'Estado actualizado', timer: 1000, showConfirmButton: false })
      cargarPedidos()
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cambiar el estado' })
    }
  }

  const handleCancelar = async (pedidoId) => {
    const result = await Swal.fire({
      title: '¿Cancelar pedido?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ba1a1a',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'No',
    })
    if (!result.isConfirmed) return

    try {
      await cancelarPedido(pedidoId)
      Swal.fire({ icon: 'success', title: 'Pedido cancelado', timer: 1000, showConfirmButton: false })
      cargarPedidos()
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo cancelar el pedido' })
    }
  }

  const pedidosFiltrados = pedidos.filter((p) => {
    if (!busqueda) return true
    const q = busqueda.toLowerCase()
    return (
      String(p.id).includes(q) ||
      (p.usuario?.nombre || '').toLowerCase().includes(q)
    )
  })

  if (cargando) return <Loading />

  return (
    <main className="staff-orders-page">
      <header className="staff-orders-header">
        <div>
          <h1 className="staff-orders-title">Pedidos Activos</h1>
          <p className="staff-orders-subtitle">Gestiona los pedidos entrantes de Codffee.</p>
        </div>
        <div className="staff-orders-stats">
          <div className="staff-orders-stat">
            <span className="material-symbols-outlined">pending_actions</span>
            <div>
              <p className="staff-orders-stat-label">Pendientes</p>
              <p className="staff-orders-stat-value">{contadores.pendientes}</p>
            </div>
          </div>
          <div className="staff-orders-stat">
            <span className="material-symbols-outlined">local_fire_department</span>
            <div>
              <p className="staff-orders-stat-label">Preparando</p>
              <p className="staff-orders-stat-value">{contadores.preparacion}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="staff-orders-table-container">
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
          <button className="staff-orders-refresh" onClick={cargarPedidos}>
            <span className="material-symbols-outlined">refresh</span>
            Refrescar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="staff-orders-table">
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Hora</th>
                <th>Estado</th>
                <th>Total</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pedidosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-lg">
                    <div className="empty-state">
                      <span className="material-symbols-outlined empty-state-icon">search_off</span>
                      <p>No hay pedidos que coincidan</p>
                    </div>
                  </td>
                </tr>
              ) : (
                pedidosFiltrados.map((pedido) => (
                  <tr key={pedido.id}>
                    <td className="staff-order-id">#{pedido.id}</td>
                    <td>
                      <div className="staff-order-cliente">
                        {pedido.usuario?.nombre || pedido.cliente || '—'}
                      </div>
                    </td>
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
                            <span className="accion-label">Prep</span>
                          </button>
                        )}
                        {pedido.estado === 'EN_PREPARACION' && (
                          <button className="accion-btn" onClick={() => handleCambiarEstado(pedido.id, 'LISTO')} title="Listo">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span className="accion-label">Listo</span>
                          </button>
                        )}
                        {pedido.estado === 'LISTO' && (
                          <button className="accion-btn" onClick={() => handleCambiarEstado(pedido.id, 'ENTREGADO')} title="Entregado">
                            <span className="material-symbols-outlined">done_all</span>
                            <span className="accion-label">Entregar</span>
                          </button>
                        )}
                        {!['ENTREGADO', 'CANCELADO'].includes(pedido.estado) && (
                          <button className="accion-btn accion-btn-danger" onClick={() => handleCancelar(pedido.id)} title="Cancelar">
                            <span className="material-symbols-outlined">cancel</span>
                            <span className="accion-label">Cancelar</span>
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
