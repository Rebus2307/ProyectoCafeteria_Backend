function CartItem({ item, onAumentar, onDisminuir, onEliminar }) {
  const subtotal = item.producto.precio * item.cantidad

  return (
    <div className="cart-item">
      <div className="cart-item-img">
        {item.producto.imagenUrl ? (
          <img src={item.producto.imagenUrl} alt={item.producto.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
        ) : (
          <span className="material-symbols-outlined">local_cafe</span>
        )}
      </div>
      <div className="cart-item-info">
        <h3 className="cart-item-title">{item.producto.nombre}</h3>
        {item.producto.descripcion && <p className="cart-item-desc">{item.producto.descripcion}</p>}
      </div>
      <div className="cart-item-qty">
        <button className="qty-btn" onClick={onDisminuir} disabled={item.cantidad <= 1}>
          <span className="material-symbols-outlined">remove</span>
        </button>
        <span className="qty-value">{item.cantidad}</span>
        <button className="qty-btn" onClick={onAumentar}>
          <span className="material-symbols-outlined">add</span>
        </button>
      </div>
      <div className="cart-item-total">
        <span className="cart-item-price">${subtotal.toFixed(2)}</span>
        <button className="cart-item-delete" onClick={onEliminar}>
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  )
}

export default CartItem