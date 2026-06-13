import { useState, useRef } from 'react'

function ProductCard({ producto, onAgregar, stockDisponible }) {
  const [agregando, setAgregando] = useState(false)
  const [cantidad, setCantidad] = useState(1)
  const [imgError, setImgError] = useState(false)
  const sinStock = stockDisponible === 0
  const hayImagen = producto.imagenUrl && producto.imagenUrl.trim() !== '' && !imgError

  const handleAgregar = () => {
    setAgregando(true)
    onAgregar(producto, cantidad)
    setCantidad(1)
    setTimeout(() => setAgregando(false), 500)
  }

  return (
    <article className="product-card">
      <div className="product-card-image">
        {hayImagen && (
          <img
            src={producto.imagenUrl}
            alt={producto.nombre}
            className="product-card-img"
            onError={() => setImgError(true)}
          />
        )}
        <div className="product-card-img-placeholder" style={{ display: hayImagen ? 'none' : 'flex' }}>
          <span className="material-symbols-outlined">local_cafe</span>
        </div>
        {sinStock ? (
          <span className="product-card-stock product-card-stock-out">Agotado</span>
        ) : stockDisponible <= 5 ? (
          <span className="product-card-stock product-card-stock-low">Solo {stockDisponible}!</span>
        ) : (
          <span className="product-card-stock product-card-stock-ok">{stockDisponible} disp.</span>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-header">
          <h3 className="product-card-title">{producto.nombre}</h3>
          <span className="product-card-price">${Number(producto.precio).toFixed(2)}</span>
        </div>
        {producto.descripcion && (
          <p className="product-card-desc">{producto.descripcion}</p>
        )}
        {producto.categoria && (
          <span className="product-card-categoria">{producto.categoria.nombre || producto.categoria}</span>
        )}
        {!sinStock && (
          <div className="product-card-qty">
            <button className="product-card-qty-btn" onClick={() => setCantidad((c) => Math.max(1, c - 1))} disabled={cantidad <= 1}>
              <span className="material-symbols-outlined">remove</span>
            </button>
            <span className="product-card-qty-value">{cantidad}</span>
            <button className="product-card-qty-btn" onClick={() => setCantidad((c) => Math.min(stockDisponible, c + 1))} disabled={cantidad >= stockDisponible}>
              <span className="material-symbols-outlined">add</span>
            </button>
          </div>
        )}
        <button
          className="btn-codffee-primary product-card-btn"
          onClick={handleAgregar}
          disabled={sinStock || agregando}
        >
          <span className="material-symbols-outlined">add_shopping_cart</span>
          {agregando ? 'Agregado' : 'Agregar al carrito'}
        </button>
      </div>
    </article>
  )
}

export default ProductCard
