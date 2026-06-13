import api from './api'

export const obtenerUsuarios = () => {
  return api.get('/usuarios')
}

export const obtenerUsuarioPorId = (id) => {
  return api.get(`/usuarios/${id}`)
}

export const crearUsuario = (payload) => {
  return api.post('/usuarios', payload)
}

export const actualizarUsuario = (id, payload) => {
  return api.put(`/usuarios/${id}`, payload)
}

export const eliminarUsuario = (id) => {
  return api.delete(`/usuarios/${id}`)
}
