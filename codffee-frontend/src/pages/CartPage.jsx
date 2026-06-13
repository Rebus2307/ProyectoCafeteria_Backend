import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { obtenerUsuario } from '../services/authService'
import { crearPedido } from '../services/pedidoService'
import CartItem from '../components/CartItem'

const CART_KEY = 'codffee_carrito'

const getCart = () => {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || []
  } catch {
    return []
  }
}

const saveCart = (cart) => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart))
}

function CartPage() {
  const navigate = useNavigate()
  const usuario = obtenerUsuario()
  const [cart, setCart] = useState([])
  const [metodoPago, setMetodoPago] = useState('EFECTIVO')
  const [observaciones, setObservaciones] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    setCart(getCart())
  }, [])

  const actualizarCart = (nuevoCart) => {
    setCart(nuevoCart)
    saveCart(nuevoCart)
  }

  const aumentar = (index) => {
    const nuevo = [...cart]
    const item = nuevo[index]
    if (item.cantidad < item.producto.stock) {
      item.cantidad += 1
      actualizarCart(nuevo)
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Stock máximo',
        text: `Solo hay ${item.producto.stock} unidades disponibles de ${item.producto.nombre}`,
      })
    }
  }

  const disminuir = (index) => {
    const nuevo = [...cart]
    if (nuevo[index].cantidad > 1) {
      nuevo[index].cantidad -= 1
      actualizarCart(nuevo)
    }
  }

  const eliminar = (index) => {
    Swal.fire({
      title: '¿Eliminar producto?',
      text: `Quitar ${cart[index].producto.nombre} del carrito`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const nuevo = cart.filter((_, i) => i !== index)
        actualizarCart(nuevo)
      }
    })
  }

  const vaciarCarrito = () => {
    setCart([])
    saveCart([])
  }

  const subtotal = cart.reduce((sum, item) => sum + item.producto.precio * item.cantidad, 0)
  const total = subtotal

  const handleConfirmar = async () => {
    if (cart.length === 0) return
    setEnviando(true)

    const payload = {
      usuarioId: usuario.id,
      metodoPago,
      observaciones,
      productos: cart.map((item) => ({
        productoId: item.producto.id,
        cantidad: item.cantidad,
      })),
    }

    try {
      await crearPedido(payload)
      Swal.fire({
        icon: 'success',
        title: 'Pedido creado',
        text: 'Tu pedido ha sido registrado exitosamente',
        timer: 2000,
        showConfirmButton: false,
      })
      vaciarCarrito()
      navigate('/mis-pedidos')
    } catch (error) {
      const errData = error.response?.data
      const msg = errData?.mensaje || errData?.message || errData?.error || JSON.stringify(errData) || 'No se pudo crear el pedido'
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
      })
    } finally {
      setEnviando(false)
    }
  }

  if (cart.length === 0) {
    return (
      <main className="cart-page">
        <div className="cart-empty">
          <span className="material-symbols-outlined cart-empty-icon">shopping_cart</span>
          <h2 className="cart-empty-title">Tu carrito está vacío</h2>
          <p className="cart-empty-desc">Agrega productos desde el menú</p>
          <button className="btn-codffee-primary" onClick={() => navigate('/menu')}>
            Ir al menú
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="cart-page">
      <div className="cart-layout">
        <section className="cart-items-section">
          <h1 className="cart-title">Tu Carrito</h1>
          <div className="cart-items-list">
            {cart.map((item, index) => (
              <CartItem
                key={item.producto.id}
                item={item}
                onAumentar={() => aumentar(index)}
                onDisminuir={() => disminuir(index)}
                onEliminar={() => eliminar(index)}
              />
            ))}
          </div>
          <div className="cart-observaciones">
            <label className="cart-obs-label" htmlFor="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              className="cart-obs-input"
              rows="3"
              placeholder="Ej: Sin hielo, alergia a lácteos..."
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
            ></textarea>
          </div>
        </section>

        <section className="cart-summary-section">
          <div className="cart-summary">
            <h2 className="cart-summary-title">Resumen del pedido</h2>
            <div className="cart-summary-rows">
              <div className="cart-summary-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="cart-payment">
              <h3 className="cart-payment-title">Método de pago</h3>
              <div className="cart-payment-options">
                {[
                  { value: 'EFECTIVO', icon: 'payments', label: 'EFECTIVO' },
                  { value: 'TARJETA', icon: 'credit_card', label: 'TARJETA' },
                  { value: 'TRANSFERENCIA', icon: 'account_balance', label: 'TRANSFERENCIA' },
                ].map((op) => (
                  <label key={op.value} className={`cart-payment-option ${metodoPago === op.value ? 'cart-payment-option-active' : ''}`}>
                    <input
                      type="radio"
                      name="metodoPago"
                      value={op.value}
                      checked={metodoPago === op.value}
                      onChange={(e) => setMetodoPago(e.target.value)}
                      className="cart-payment-radio"
                    />
                    <span className="material-symbols-outlined">{op.icon}</span>
                    <span className="cart-payment-label">{op.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              className="btn-codffee-primary cart-confirm-btn"
              onClick={handleConfirmar}
              disabled={enviando}
            >
              <span className="material-symbols-outlined">check_circle</span>
              {enviando ? 'Enviando...' : 'Confirmar pedido'}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}

export default CartPage
