import { useState, useEffect } from 'react'
import { obtenerUsuario } from '../services/authService'
import { obtenerPedidosPorUsuario } from '../services/pedidoService'
import StatusBadge from '../components/StatusBadge'
import Loading from '../components/Loading'

function OrdersPage() {
  const usuario = obtenerUsuario()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        const res = await obtenerPedidosPorUsuario(usuario.id)
        setPedidos(Array.isArray(res.data) ? res.data : [])
      } catch (err) {
        setError('No se pudieron cargar tus pedidos')
      } finally {
        setCargando(false)
      }
    }
    cargarPedidos()
  }, [usuario.id])

  if (cargando) return <Loading />

  return (
    <main className="orders-page">
      <div className="orders-page-header">
        <h1 className="orders-page-title">Mis Pedidos</h1>
        <p className="orders-page-subtitle">Revisa el estado de tus pedidos</p>
      </div>

      {error ? (
        <div className="empty-state">
          <span className="material-symbols-outlined">error</span>
          <p>{error}</p>
        </div>
      ) : pedidos.length === 0 ? (
        <div className="empty-state">
          <span className="material-symbols-outlined">receipt_long</span>
          <p>Aún no tienes pedidos</p>
        </div>
      ) : (
        <div className="orders-list">
          {pedidos.map((pedido) => (
            <div key={pedido.id} className={`order-card ${pedido.estado === 'CANCELADO' ? 'order-card-cancelled' : ''}`}>
              <div className="order-card-top">
                <div className="order-card-info">
                  <h3 className="order-card-id">Pedido #{pedido.id}</h3>
                  <StatusBadge estado={pedido.estado} />
                </div>
                <span className="order-card-date">
                  {pedido.fechaHora || pedido.fecha ? new Date(pedido.fechaHora || pedido.fecha).toLocaleString('es-MX', {
                    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  }) : '—'}
                </span>
              </div>
              <div className="order-card-bottom">
                <div className="order-card-payment">
                  <span className="material-symbols-outlined">{
                    pedido.metodoPago === 'EFECTIVO' ? 'payments'
                    : pedido.metodoPago === 'TARJETA' ? 'credit_card'
                    : 'account_balance'
                  }</span>
                  <span>{pedido.metodoPago || 'No especificado'}</span>
                </div>
                <span className={`order-card-total ${pedido.estado === 'CANCELADO' ? 'order-card-total-cancelled' : ''}`}>
                  ${Number(pedido.total).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}

export default OrdersPage