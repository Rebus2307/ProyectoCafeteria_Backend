const statusConfig = {
  PENDIENTE: { class: 'badge-pendiente', icon: 'schedule', label: 'Pendiente' },
  EN_PREPARACION: { class: 'badge-preparacion', icon: 'local_cafe', label: 'En preparación' },
  LISTO: { class: 'badge-listo', icon: 'check_circle', label: 'Listo' },
  ENTREGADO: { class: 'badge-entregado', icon: 'done_all', label: 'Entregado' },
  CANCELADO: { class: 'badge-cancelado', icon: 'cancel', label: 'Cancelado' },
}

function StatusBadge({ estado }) {
  const config = statusConfig[estado] || { class: '', icon: 'help', label: estado }

  return (
    <span className={`badge ${config.class}`}>
      <span className="material-symbols-outlined">{config.icon}</span>
      {config.label}
    </span>
  )
}

export default StatusBadge