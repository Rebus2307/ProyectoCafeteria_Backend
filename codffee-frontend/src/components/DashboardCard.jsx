function DashboardCard({ icon, label, value, sublabel, colorClass = '', onClick }) {
  return (
    <div className={`dash-card ${colorClass}`} onClick={onClick} role={onClick ? 'button' : undefined}>
      <div className="dash-card-header">
        <span className="material-symbols-outlined dash-card-icon">{icon}</span>
        {sublabel && <span className="dash-card-sublabel">{sublabel}</span>}
      </div>
      <div className="dash-card-body">
        <p className="dash-card-label">{label}</p>
        <p className="dash-card-value">{value}</p>
      </div>
    </div>
  )
}

export default DashboardCard