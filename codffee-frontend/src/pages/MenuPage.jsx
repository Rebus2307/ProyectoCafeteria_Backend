import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Swal from 'sweetalert2'
import { obtenerProductosDisponibles } from '../services/productoService'
import { obtenerCategoriasActivas } from '../services/categoriaService'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'

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

function MenuPage() {
  const navigate = useNavigate()
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          obtenerProductosDisponibles(),
          obtenerCategoriasActivas(),
        ])
        setProductos(prodRes.data || [])
        setCategorias(catRes.data || [])
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los productos',
        })
      } finally {
        setCargando(false)
      }
    }
    cargarDatos()
  }, [])

  const getCantidadEnCarrito = (productoId) => {
    const cart = getCart()
    const item = cart.find((i) => i.producto.id === productoId)
    return item ? item.cantidad : 0
  }

  const getStockDisponible = (producto) => {
    const enCarrito = getCantidadEnCarrito(producto.id)
    return Math.max(0, producto.stock - enCarrito)
  }

  const agregarAlCarrito = (producto) => {
    const stockDisp = getStockDisponible(producto)
    if (stockDisp === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Stock insuficiente',
        text: `No hay más unidades disponibles de ${producto.nombre}`,
      })
      return
    }

    const cart = getCart()
    const existente = cart.find((item) => item.producto.id === producto.id)

    if (existente) {
      existente.cantidad += 1
    } else {
      cart.push({ producto, cantidad: 1 })
    }

    saveCart(cart)
    Swal.fire({
      icon: 'success',
      title: 'Agregado',
      text: `${producto.nombre} agregado al carrito`,
      timer: 1000,
      showConfirmButton: false,
    })
  }

  const productosFiltrados = productos.filter((p) => {
    if (categoriaActiva && p.categoria?.id !== categoriaActiva && p.categoria?.nombre !== categoriaActiva) {
      const cat = categorias.find((c) => c.id === categoriaActiva || c.nombre === categoriaActiva)
      if (!cat) return true
      if (p.categoria?.id !== cat.id && p.categoria?.nombre !== cat.nombre) return false
    }
    if (busqueda) {
      const term = busqueda.toLowerCase()
      const matchNombre = p.nombre?.toLowerCase().includes(term)
      const matchDesc = p.descripcion?.toLowerCase().includes(term)
      if (!matchNombre && !matchDesc) return false
    }
    return true
  })

  if (cargando) return <Loading />

  return (
    <main className="menu-page">
      <div className="menu-layout">
        <aside className="menu-sidebar">
          <div className="menu-sidebar-sticky">
            <h2 className="menu-sidebar-title">Categorías</h2>
            <div className="menu-categorias">
              <button
                className={`menu-categoria-btn ${categoriaActiva === null ? 'menu-categoria-active' : ''}`}
                onClick={() => setCategoriaActiva(null)}
              >
                <span className="material-symbols-outlined">menu_book</span>
                Todas
              </button>
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  className={`menu-categoria-btn ${categoriaActiva === cat.id || categoriaActiva === cat.nombre ? 'menu-categoria-active' : ''}`}
                  onClick={() => setCategoriaActiva(cat.id || cat.nombre)}
                >
                  <span className="material-symbols-outlined">local_cafe</span>
                  {cat.nombre}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <section className="menu-content">
          <div className="menu-header">
            <div>
              <h2 className="menu-title">Menú Principal</h2>
              <p className="menu-subtitle">Selecciona tus favoritos para empezar el día.</p>
            </div>
            <div className="menu-search">
              <span className="material-symbols-outlined menu-search-icon">search</span>
              <input
                type="text"
                className="menu-search-input"
                placeholder="Buscar en el menú..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
          </div>

          {productosFiltrados.length === 0 ? (
            <div className="empty-state">
              <span className="material-symbols-outlined empty-state-icon">search_off</span>
              <p className="font-body-md">No hay productos disponibles</p>
            </div>
          ) : (
            <div className="productos-grid">
              {productosFiltrados.map((producto) => (
                <ProductCard
                  key={producto.id}
                  producto={producto}
                  stockDisponible={getStockDisponible(producto)}
                  onAgregar={agregarAlCarrito}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

export default MenuPage
