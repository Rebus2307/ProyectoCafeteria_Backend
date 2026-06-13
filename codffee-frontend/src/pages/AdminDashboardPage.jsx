import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { obtenerPedidos } from '../services/pedidoService'
import DashboardCard from '../components/DashboardCard'
import StatusBadge from '../components/StatusBadge'
import Loading from '../components/Loading'

function AdminDashboardPage() {
  const navigate = useNavigate()
  const [pedidos, setPedidos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const cargar = async () => {
      try {
        const res = await obtenerPedidos()
        setPedidos(Array.isArray(res.data) ? res.data : [])
      } catch {
        Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudieron cargar los datos' })
      } finally {
        setCargando(false)
      }
    }
    cargar()
  }, [])

  const stats = {
    total: pedidos.length,
    pendientes: pedidos.filter((p) => p.estado === 'PENDIENTE').length,
    preparacion: pedidos.filter((p) => p.estado === 'EN_PREPARACION').length,
    listos: pedidos.filter((p) => p.estado === 'LISTO').length,
    entregados: pedidos.filter((p) => p.estado === 'ENTREGADO').length,
    cancelados: pedidos.filter((p) => p.estado === 'CANCELADO').length,
    totalVendido: pedidos
      .filter((p) => p.estado === 'ENTREGADO')
      .reduce((sum, p) => sum + Number(p.total || p.totalPedido || 0), 0),
  }

  const ultimosPedidos = [...pedidos]
    .sort((a, b) => new Date(b.fechaHora || b.fecha || 0) - new Date(a.fechaHora || a.fecha || 0))
    .slice(0, 5)

  if (cargando) return <Loading />

  return (
    <main className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Panel de Administración</h1>
        <p className="admin-dashboard-subtitle">Bienvenido. Resumen general de Codffee.</p>
      </div>

      <div className="dashboard-cards">
        <DashboardCard
          icon="receipt_long"
          label="Pedidos Totales"
          value={stats.total}
          sublabel={`+${stats.pendientes + stats.preparacion} activos`}
          onClick={() => navigate('/staff/pedidos')}
        />
        <DashboardCard
          icon="schedule"
          label="Pendientes"
          value={stats.pendientes}
          colorClass="dashboard-card-warning"
        />
        <DashboardCard
          icon="local_fire_department"
          label="En preparación"
          value={stats.preparacion}
          colorClass="dashboard-card-info"
        />
        <DashboardCard
          icon="done_all"
          label="Entregados"
          value={stats.entregados}
          colorClass="dashboard-card-success"
        />
        <DashboardCard
          icon="monetization_on"
          label="Total Vendido"
          value={`$${stats.totalVendido.toFixed(2)}`}
          colorClass="dashboard-card-primary"
        />
      </div>

      <div className="admin-dashboard-bottom">
        <div className="admin-recent-orders">
          <div className="admin-recent-header">
            <h2>Pedidos Recientes</h2>
            <button className="btn-link" onClick={() => navigate('/staff/pedidos')}>Ver todos</button>
          </div>
          <div className="admin-recent-list">
            {ultimosPedidos.map((p) => (
              <div key={p.id} className="admin-recent-item">
                <div className="admin-recent-item-left">
                  <div className="admin-recent-id">#{p.id}</div>
                  <div>
                    <p className="admin-recent-name">{p.usuario?.nombre || '—'}</p>
                      <p className="admin-recent-time">
                      {p.fechaHora || p.fecha ? new Date(p.fechaHora || p.fecha).toLocaleString('es-MX', {
                        hour: '2-digit', minute: '2-digit'
                      }) : '—'}
                    </p>
                  </div>
                </div>
                <div className="admin-recent-item-right">
                  <StatusBadge estado={p.estado} />
                  <span className="admin-recent-total">${Number(p.total).toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="admin-quick-actions">
          <div className="admin-quick-card">
            <h3>Accesos Rápidos</h3>
            <div className="admin-quick-grid">
              <button className="admin-quick-btn" onClick={() => navigate('/staff/pedidos')}>
                <span className="material-symbols-outlined">assignment</span>
                <span>Ver pedidos</span>
              </button>
              <button className="admin-quick-btn" onClick={() => navigate('/admin/reportes')}>
                <span className="material-symbols-outlined">analytics</span>
                <span>Ver reportes</span>
              </button>
              <button className="admin-quick-btn" onClick={() => navigate('/menu')}>
                <span className="material-symbols-outlined">local_cafe</span>
                <span>Ir al menú</span>
              </button>
            </div>
          </div>
          <div className="admin-system-health">
            <span className="material-symbols-outlined admin-health-icon">check_circle</span>
            <div>
              <h4>Sistema saludable</h4>
              <p>Todos los servicios están operativos.</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

export default AdminDashboardPage
