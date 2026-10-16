// src/services/api.js
import axios from 'axios'

// Endereço do backend. Ajuste para o da sua API (ou defina VITE_API_URL em um arquivo .env)
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000'
})

// Antes de cada requisição, envia o token do login (se existir) para o backend identificar quem chamou
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export default api