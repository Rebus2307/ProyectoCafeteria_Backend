import api from './api'

export const login = async (credenciales) => {
  const response = await api.post('/auth/login', credenciales)
  return response.data
}

export const registrarCliente = async (datos) => {
  const response = await api.post('/auth/register', datos)
  return response.data
}

export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')
}

export const guardarSesion = (data) => {
  localStorage.setItem('token', data.token)

  const usuario = {
    id: data.id,
    nombre: data.nombre,
    correo: data.correo,
    rol: data.rol,
  }

  localStorage.setItem('usuario', JSON.stringify(usuario))
}

export const obtenerUsuario = () => {
  const usuario = localStorage.getItem('usuario')
  return usuario ? JSON.parse(usuario) : null
}

export const obtenerToken = () => {
  return localStorage.getItem('token')
}

export const actualizarPerfil = async (datos) => {
  const response = await api.put('/perfil', datos)
  return response.data
}