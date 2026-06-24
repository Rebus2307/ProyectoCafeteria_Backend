function Loading() {
  return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Cargando...</p>
    </div>
  )
}

export default Loading