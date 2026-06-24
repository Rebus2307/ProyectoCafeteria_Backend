import { useState } from 'react'
import Swal from 'sweetalert2'
import { descargarReporteGeneral, descargarReporteFiltrado } from '../services/reporteService'

const swalDark = { background: '#221e1a', color: '#f5efe8' }

const downloadBlob = (blob, filename) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', filename)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function ReportsPage() {
  const [fechaInicio, setFechaInicio] = useState('')
  const [fechaFin, setFechaFin] = useState('')
  const [estado, setEstado] = useState('')

  const handleDescargarGeneral = async () => {
    try {
      const res = await descargarReporteGeneral()
      downloadBlob(res.data, `reporte-general-${new Date().toISOString().slice(0, 10)}.pdf`)
      Swal.fire({ icon: 'success', title: 'Reporte descargado', timer: 1500, showConfirmButton: false, ...swalDark })
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo descargar el reporte', ...swalDark })
    }
  }

  const handleDescargarFiltrado = async () => {
    if (!fechaInicio || !fechaFin) {
      Swal.fire({ icon: 'warning', title: 'Campos requeridos', text: 'Selecciona fecha inicio y fecha fin', ...swalDark })
      return
    }
    try {
      const res = await descargarReporteFiltrado(fechaInicio, fechaFin, estado)
      downloadBlob(res.data, `reporte-filtrado-${fechaInicio}-a-${fechaFin}.pdf`)
      Swal.fire({ icon: 'success', title: 'Reporte descargado', timer: 1500, showConfirmButton: false, ...swalDark })
    } catch {
      Swal.fire({ icon: 'error', title: 'Error', text: 'No se pudo descargar el reporte filtrado', ...swalDark })
    }
  }

  return (
    <main className="reports-page">
      <header className="reports-header">
        <div>
          <h1 className="reports-title">Reportes Analíticos</h1>
          <p className="reports-subtitle">Genera y exporta datos de rendimiento de Codffee.</p>
        </div>
        <button className="btn btn-secondary" onClick={handleDescargarGeneral}>
          <span className="material-symbols-outlined">download</span>
          Reporte PDF General
        </button>
      </header>

      <section className="reports-filters">
        <div className="reports-filters-card">
          <h3 className="reports-filters-title">Parámetros del reporte</h3>
          <div className="reports-filters-grid">
            <div className="reports-field">
              <label className="reports-label" htmlFor="fechaInicio">Fecha inicio</label>
              <div className="reports-input-wrapper">
                <span className="material-symbols-outlined reports-input-icon">calendar_today</span>
                <input id="fechaInicio" type="date" className="reports-input" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} />
              </div>
            </div>
            <div className="reports-field">
              <label className="reports-label" htmlFor="fechaFin">Fecha fin</label>
              <div className="reports-input-wrapper">
                <span className="material-symbols-outlined reports-input-icon">event</span>
                <input id="fechaFin" type="date" className="reports-input" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} />
              </div>
            </div>
            <div className="reports-field">
              <label className="reports-label" htmlFor="estado">Estado</label>
              <div className="reports-input-wrapper">
                <span className="material-symbols-outlined reports-input-icon">filter_list</span>
                <select id="estado" className="reports-input reports-select" value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="">Todos los estados</option>
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="EN_PREPARACION">En preparación</option>
                  <option value="LISTO">Listo</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="CANCELADO">Cancelado</option>
                </select>
                <span className="material-symbols-outlined reports-select-arrow">expand_more</span>
              </div>
            </div>
          </div>
        </div>
        <div className="reports-action-card">
          <span className="material-symbols-outlined" style={{ fontSize: 40, color: 'var(--accent)' }}>picture_as_pdf</span>
          <p className="reports-action-text">Exportar vista filtrada</p>
          <button className="btn btn-primary" onClick={handleDescargarFiltrado} style={{ marginTop: 8 }}>
            Descargar Reporte PDF Filtrado
          </button>
        </div>
      </section>
    </main>
  )
}

export default ReportsPage