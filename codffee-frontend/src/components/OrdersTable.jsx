import StatusBadge from './StatusBadge'

function OrdersTable({ pedidos, acciones }) {
  if (!pedidos || pedidos.length === 0) {
    return (
      <div className="empty-state">
        <span className="material-symbols-outlined">receipt_long</span>
        <p>No hay pedidos registrados</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="staff-orders-table">
        <thead>
          <tr>
            <th>Pedido</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Estado</th>
            <th>Total</th>
            <th style={{ textAlign: 'center' }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => (
            <tr key={pedido.id}>
              <td className="staff-order-id">#{pedido.id}</td>
              <td>
                <div className="staff-order-cliente">
                  {pedido.usuario?.nombre || pedido.cliente || '—'}
                </div>
              </td>
              <td className="staff-order-fecha">
                {pedido.fecha ? new Date(pedido.fecha).toLocaleString('es-MX', {
                  day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                }) : '—'}
              </td>
              <td><StatusBadge estado={pedido.estado} /></td>
              <td className="staff-order-total">${Number(pedido.total).toFixed(2)}</td>
              <td className="staff-order-acciones">
                {acciones ? acciones(pedido) : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default OrdersTable